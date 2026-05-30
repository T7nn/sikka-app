"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SettingsMenu } from "@/components/settings/SettingsMenu";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { AccountView } from "@/components/account/AccountView";
import { BusinessDetailSheet } from "@/components/business/BusinessDetailSheet";
import { BusinessPreviewSheet } from "@/components/business/BusinessPreviewSheet";
import { HomeView } from "@/components/home/HomeView";
import { SearchView } from "@/components/search/SearchView";
import { BottomTabBar, type TabId } from "@/components/navigation/BottomTabBar";
import { normalizeBusiness, type BusinessRecord } from "@/types/business";
import type { BusinessType } from "@/types/businessForm";
import {
  categoryMatchesFilter,
  type ActiveCategory,
} from "@/types/category";
import { extractCoordinatesFromMapsUrl } from "@/actions/extract-coordinates";
import { verifyAccessKey } from "@/actions/verify-access-key";
import { translations, type Language } from "@/types/i18n";
import type { CurrentUser } from "@/types/user";
import { parseUserRole } from "@/types/user";
import { supabase } from "@/utils/supabase";

const VIEW_TRANSITION = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.22, ease: "easeInOut" as const },
};

export default function HomePage() {
  const [language, setLanguage] = useState<Language>("en");
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminAccessKey, setAdminAccessKey] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>("all");
  const [mapPreviewBusiness, setMapPreviewBusiness] = useState<BusinessRecord | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessRecord | null>(null);

  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<BusinessType>("physical");
  const [newDescription, setNewDescription] = useState("");
  const [newGoogleMapsUrl, setNewGoogleMapsUrl] = useState("");
  const [newInstagramUrl, setNewInstagramUrl] = useState("");
  const [newWhatsappNumber, setNewWhatsappNumber] = useState("");
  const [newWebsiteUrl, setNewWebsiteUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isExtractingLocation, setIsExtractingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const t = translations[language];

  const tabLabels: Record<TabId, string> = {
    home: t.home,
    search: t.search,
    account: t.account,
  };

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const fetchBusinesses = useCallback(async () => {
    const { data, error } = await supabase.from("businesses").select("*");

    if (error) {
      console.error("Failed to fetch businesses:", error.message);
      return;
    }

    const normalized = (data ?? [])
      .map((row) => normalizeBusiness(row as Record<string, unknown>))
      .filter((business): business is BusinessRecord => business !== null);

    setBusinesses(normalized);
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const syncUserProfile = useCallback(async (userId: string, userEmail: string) => {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("email, role")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch profile:", error.message);
      return;
    }

    if (!profile) {
      const { error: insertError } = await supabase.from("profiles").insert({
        id: userId,
        email: userEmail,
        role: "admin",
      });

      if (insertError) {
        console.error("Failed to create profile:", insertError.message);
        return;
      }

      setCurrentUser({ email: userEmail, role: "admin" });
      return;
    }

    setCurrentUser({
      email: typeof profile.email === "string" ? profile.email : userEmail,
      role: parseUserRole(profile.role),
    });
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void syncUserProfile(session.user.id, session.user.email ?? "");
      } else {
        setCurrentUser(null);
      }
    });

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        void syncUserProfile(session.user.id, session.user.email ?? "");
      }
    });

    return () => subscription.unsubscribe();
  }, [syncUserProfile]);

  const filteredBusinesses = useMemo(
    () =>
      businesses.filter((business) =>
        categoryMatchesFilter(business.type, activeCategory),
      ),
    [businesses, activeCategory],
  );

  const handleCategoryChange = (category: ActiveCategory) => {
    if (category === "all") {
      setActiveCategory("all");
      return;
    }

    setActiveCategory((prev) => (prev === category ? "all" : category));
  };

  const handleHomeCategoryChange = (category: BusinessType) => {
    handleCategoryChange(category);
  };

  const handleMapPinSelect = (business: BusinessRecord) => {
    setMapPreviewBusiness(business);
    setSelectedBusiness(null);
  };

  const handleOpenBusinessDetails = (business: BusinessRecord) => {
    setSelectedBusiness(business);
    setMapPreviewBusiness(null);
  };

  const handleCloseBusinessDetails = () => {
    setSelectedBusiness(null);
  };

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    if (isLoginMode) {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setAuthError(error.message);
      }
    } else {
      const keyResult = await verifyAccessKey(adminAccessKey, email);

      if (!keyResult.success) {
        setAuthError(keyResult.error);
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        setAuthError(error.message);
      }
    }

    setIsLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setEmail("");
    setPassword("");
    setAdminAccessKey("");
    setAuthError(null);
  };

  const clearLogoSelection = useCallback(() => {
    setLogoPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setLogoUrl(null);
  }, []);

  const handleLogoSelect = useCallback(
    async (file: File) => {
      setPublishError(null);
      clearLogoSelection();

      setLogoPreviewUrl(URL.createObjectURL(file));
      setIsUploadingLogo(true);

      const rawExtension = file.name.includes(".")
        ? file.name.split(".").pop()?.toLowerCase()
        : "jpg";
      const allowedExtensions = ["jpg", "jpeg", "png", "webp", "gif"];
      const extension = allowedExtensions.includes(rawExtension ?? "")
        ? rawExtension
        : "jpg";
      const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("business_logos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });

      setIsUploadingLogo(false);

      if (uploadError) {
        setPublishError(uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("business_logos").getPublicUrl(fileName);
      setLogoUrl(data.publicUrl);
    },
    [clearLogoSelection],
  );

  const resetPublishForm = useCallback(() => {
    clearLogoSelection();
    setNewName("");
    setNewType("physical");
    setNewDescription("");
    setNewGoogleMapsUrl("");
    setNewInstagramUrl("");
    setNewWhatsappNumber("");
    setNewWebsiteUrl("");
  }, [clearLogoSelection]);

  const handleAddBusiness = async (e: FormEvent) => {
    e.preventDefault();

    if (
      !newName.trim() ||
      !newDescription.trim() ||
      !newGoogleMapsUrl.trim() ||
      isUploadingLogo
    ) {
      return;
    }

    setPublishError(null);
    setSubmitSuccess(false);
    setIsExtractingLocation(true);

    const extraction = await extractCoordinatesFromMapsUrl(newGoogleMapsUrl.trim());

    setIsExtractingLocation(false);

    if (!extraction.success) {
      setPublishError(
        extraction.error ?? "Could not extract coordinates from this Google Maps link.",
      );
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("businesses").insert({
      name: newName.trim(),
      type: newType,
      description: newDescription.trim(),
      google_maps_url: newGoogleMapsUrl.trim(),
      latitude: extraction.latitude,
      longitude: extraction.longitude,
      instagram_url: newInstagramUrl.trim() || null,
      whatsapp_number: newWhatsappNumber.trim() || null,
      website_url: newWebsiteUrl.trim() || null,
      logo_url: logoUrl,
    });

    setIsSubmitting(false);

    if (error) {
      console.error("Failed to add business:", error.message);
      setPublishError(error.message);
      return;
    }

    resetPublishForm();
    setSubmitSuccess(true);

    await fetchBusinesses();

    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const handleDeleteBusiness = async (id: string) => {
    const { error } = await supabase.from("businesses").delete().eq("id", id);

    if (error) {
      console.error("Failed to delete business:", error.message);
      return;
    }

    if (selectedBusiness?.id === id) {
      setSelectedBusiness(null);
    }

    if (mapPreviewBusiness?.id === id) {
      setMapPreviewBusiness(null);
    }

    await fetchBusinesses();
  };

  return (
    <div
      className={`relative flex min-h-dvh flex-col bg-white dark:bg-black ${
        language === "ar" ? "font-arabic" : ""
      }`}
    >
      <SettingsMenu
        language={language}
        onLanguageChange={setLanguage}
        labels={t}
      />

      <main
        id="main-content"
        className="flex-1 bg-white px-6 pb-4 pt-8 dark:bg-black"
        aria-label={`${tabLabels[activeTab]} view`}
      >
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div key="home" {...VIEW_TRANSITION} className="h-full">
              <HomeView
                businesses={filteredBusinesses}
                activeCategory={activeCategory}
                onCategoryChange={handleHomeCategoryChange}
                mapPreviewBusiness={mapPreviewBusiness}
                onMapPinSelect={handleMapPinSelect}
                labels={t}
              />
            </motion.div>
          )}

          {activeTab === "search" && (
            <motion.div key="search" {...VIEW_TRANSITION} className="h-full">
              <SearchView
                businesses={filteredBusinesses}
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
                onBusinessSelect={handleOpenBusinessDetails}
                labels={t}
              />
            </motion.div>
          )}

          {activeTab === "account" && (
            <motion.div key="account" {...VIEW_TRANSITION} className="h-full">
              <AccountView
                currentUser={currentUser}
                businesses={businesses}
                labels={t}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                adminAccessKey={adminAccessKey}
                setAdminAccessKey={setAdminAccessKey}
                isLoginMode={isLoginMode}
                setIsLoginMode={setIsLoginMode}
                isLoading={isLoading}
                authError={authError}
                onAuth={handleAuth}
                onSignOut={handleSignOut}
                onDeleteBusiness={handleDeleteBusiness}
                newName={newName}
                setNewName={setNewName}
                newType={newType}
                setNewType={setNewType}
                newDescription={newDescription}
                setNewDescription={setNewDescription}
                newGoogleMapsUrl={newGoogleMapsUrl}
                setNewGoogleMapsUrl={setNewGoogleMapsUrl}
                newInstagramUrl={newInstagramUrl}
                setNewInstagramUrl={setNewInstagramUrl}
                newWhatsappNumber={newWhatsappNumber}
                setNewWhatsappNumber={setNewWhatsappNumber}
                newWebsiteUrl={newWebsiteUrl}
                setNewWebsiteUrl={setNewWebsiteUrl}
                logoPreviewUrl={logoPreviewUrl}
                isUploadingLogo={isUploadingLogo}
                logoReady={Boolean(logoUrl)}
                onLogoSelect={handleLogoSelect}
                isExtractingLocation={isExtractingLocation}
                isSubmitting={isSubmitting}
                publishError={publishError}
                submitSuccess={submitSuccess}
                onAddBusiness={handleAddBusiness}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BusinessPreviewSheet
        business={mapPreviewBusiness}
        onClose={() => setMapPreviewBusiness(null)}
      />

      <BusinessDetailSheet
        business={selectedBusiness}
        onClose={handleCloseBusinessDetails}
      />

      <BottomTabBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== "home") {
            setMapPreviewBusiness(null);
          }
        }}
        tabLabels={tabLabels}
      />
    </div>
  );
}
