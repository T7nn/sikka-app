import {
  normalizeCategoryRow,
  type CategoryRecord,
  type TaxonomySector,
} from "@/types/taxonomy";
import { supabase } from "@/utils/supabase";

export async function fetchAllCategories(): Promise<CategoryRecord[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch categories:", error.message);
    return [];
  }

  return (data ?? [])
    .map((row) => normalizeCategoryRow(row as Record<string, unknown>))
    .filter((category): category is CategoryRecord => category !== null);
}

export async function fetchCategoriesBySector(
  sector: TaxonomySector,
): Promise<CategoryRecord[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("sector", sector)
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch categories for sector:", error.message);
    return [];
  }

  return (data ?? [])
    .map((row) => normalizeCategoryRow(row as Record<string, unknown>))
    .filter((category): category is CategoryRecord => category !== null);
}

export async function createCategory(
  name: string,
  sector: TaxonomySector,
): Promise<{ category: CategoryRecord | null; error: string | null }> {
  const trimmed = name.trim();
  if (!trimmed) {
    return { category: null, error: "Category name is required." };
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({ name: trimmed, sector })
    .select("*")
    .single();

  if (error) {
    console.error("Failed to create category:", error.message);
    return { category: null, error: error.message };
  }

  const category = normalizeCategoryRow(data as Record<string, unknown>);
  return { category, error: null };
}

async function nullifyCategoryReferencesClient(
  category: CategoryRecord,
): Promise<string | null> {
  if (category.sector === "Events") {
    const { error: categoryError } = await supabase
      .from("events")
      .update({ category: null })
      .eq("category", category.name);

    if (categoryError) {
      return categoryError.message;
    }

    const { error: typeError } = await supabase
      .from("events")
      .update({ event_type: null })
      .eq("event_type", category.name);

    if (typeError) {
      return typeError.message;
    }

    return null;
  }

  const { data: businesses, error: fetchError } = await supabase
    .from("businesses")
    .select("id, activities")
    .eq("main_category", category.sector)
    .contains("activities", [category.name]);

  if (fetchError) {
    return fetchError.message;
  }

  for (const row of businesses ?? []) {
    const activities = Array.isArray(row.activities)
      ? (row.activities as string[])
      : [];
    const nextActivities = activities.filter(
      (activity) => activity.trim().toLowerCase() !== category.name.toLowerCase(),
    );

    const { error: updateError } = await supabase
      .from("businesses")
      .update({ activities: nextActivities })
      .eq("id", row.id);

    if (updateError) {
      return updateError.message;
    }
  }

  return null;
}

export async function deleteCategorySafely(
  category: CategoryRecord,
): Promise<{ success: boolean; error: string | null }> {
  const { error: rpcError } = await supabase.rpc("delete_category_safely", {
    category_id: category.id,
  });

  if (!rpcError) {
    return { success: true, error: null };
  }

  console.warn("delete_category_safely RPC unavailable, using client fallback:", rpcError.message);

  const nullifyError = await nullifyCategoryReferencesClient(category);
  if (nullifyError) {
    return { success: false, error: nullifyError };
  }

  const { error: deleteError } = await supabase
    .from("categories")
    .delete()
    .eq("id", category.id);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  return { success: true, error: null };
}

export async function fetchAffectedCategoryItems(
  category: CategoryRecord,
): Promise<string[]> {
  if (category.sector === "Events") {
    const [byCategory, byType] = await Promise.all([
      supabase.from("events").select("name").eq("category", category.name),
      supabase.from("events").select("name").eq("event_type", category.name),
    ]);

    const names = new Set<string>();
    for (const row of byCategory.data ?? []) {
      if (typeof row.name === "string") names.add(row.name);
    }
    for (const row of byType.data ?? []) {
      if (typeof row.name === "string") names.add(row.name);
    }
    return [...names];
  }

  const { data, error } = await supabase
    .from("businesses")
    .select("name")
    .eq("main_category", category.sector)
    .contains("activities", [category.name]);

  if (error) {
    console.error("Failed to fetch affected businesses:", error.message);
    return [];
  }

  return (data ?? [])
    .map((row) => (typeof row.name === "string" ? row.name : ""))
    .filter(Boolean);
}

export async function countCategoryUsages(category: CategoryRecord): Promise<number> {
  const affected = await fetchAffectedCategoryItems(category);
  return affected.length;
}
