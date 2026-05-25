"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Globe } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { AccountView } from "@/components/account/AccountView";
import { BusinessDetailSheet } from "@/components/business/BusinessDetailSheet";
import { HomeView } from "@/components/home/HomeView";
import { SearchView } from "@/components/search/SearchView";
import { BottomTabBar, type TabId } from "@/components/navigation/BottomTabBar";
import { normalizeBusiness, type BusinessRecord } from "@/types/business";
import type { BusinessType } from "@/types/businessForm";
import {
  categoryMatchesFilter,
  type ActiveCategory,
} from "@/types/category";
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
  const [isOrderActive, setIsOrderActive] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>("all");
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessRecord | null>(null);
  const [activeOrderBusiness, setActiveOrderBusiness] = useState<BusinessRecord | null>(null);

  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<BusinessType>("physical");
  const [newDescription, setNewDescription] = useState("");
  const [newLat, setNewLat] = useState("");
  const [newLng, setNewLng] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const dismissOrder = () => setIsOrderActive(false);

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
        role: "customer",
      });

      if (insertError) {
        console.error("Failed to create profile:", insertError.message);
        return;
      }

      setCurrentUser({ email: userEmail, role: "customer" });
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

  const handlePlaceOrder = () => {
    if (!selectedBusiness) return;

    setActiveOrderBusiness(selectedBusiness);
    setSelectedBusiness(null);
    setActiveTab("home");
    setIsOrderActive(true);
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
    setAuthError(null);
  };

  const handleRoleChange = (role: CurrentUser["role"]) => {
    setCurrentUser((prev) => (prev ? { ...prev, role } : null));
  };

  const handleAddBusiness = async (e: FormEvent) => {
    e.preventDefault();

    const latitude = parseFloat(newLat);
    const longitude = parseFloat(newLng);

    if (!newName.trim() || !newDescription.trim() || Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);

    const { error } = await supabase.from("businesses").insert({
      name: newName.trim(),
      type: newType,
      description: newDescription.trim(),
      latitude,
      longitude,
    });

    setIsSubmitting(false);

    if (error) {
      console.error("Failed to add business:", error.message);
      return;
    }

    setNewName("");
    setNewType("physical");
    setNewDescription("");
    setNewLat("");
    setNewLng("");
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

    if (activeOrderBusiness?.id === id) {
      setActiveOrderBusiness(null);
    }

    await fetchBusinesses();
  };

  return (
    <div
      className={`relative flex min-h-dvh flex-col bg-[#F9F9F9] text-[#222222] ${
        language === "ar" ? "font-arabic" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => setLanguage((prev) => (prev === "en" ? "ar" : "en"))}
        aria-label={t.languageToggle}
        className="absolute end-6 top-6 z-50 flex items-center gap-2 rounded-full bg-white px-4 py-2.5 font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/60 shadow-soft-airy transition-colors hover:bg-[#222222] hover:text-white"
      >
        <Globe size={15} strokeWidth={1.75} aria-hidden />
        {language === "en" ? "AR" : "EN"}
      </button>

      <main
        id="main-content"
        className="flex-1 bg-[#F9F9F9] px-6 pb-4 pt-8"
        aria-label={`${tabLabels[activeTab]} view`}
      >
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div key="home" {...VIEW_TRANSITION} className="h-full">
              <HomeView
                businesses={filteredBusinesses}
                activeCategory={activeCategory}
                onCategoryChange={handleHomeCategoryChange}
                onBusinessSelect={setSelectedBusiness}
                isOrderActive={isOrderActive}
                orderBusinessName={activeOrderBusiness?.name}
                onDismissOrder={dismissOrder}
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
                onBusinessSelect={setSelectedBusiness}
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
                isLoginMode={isLoginMode}
                setIsLoginMode={setIsLoginMode}
                isLoading={isLoading}
                authError={authError}
                onAuth={handleAuth}
                onSignOut={handleSignOut}
                onRoleChange={handleRoleChange}
                onDeleteBusiness={handleDeleteBusiness}
                newName={newName}
                setNewName={setNewName}
                newType={newType}
                setNewType={setNewType}
                newDescription={newDescription}
                setNewDescription={setNewDescription}
                newLat={newLat}
                setNewLat={setNewLat}
                newLng={newLng}
                setNewLng={setNewLng}
                isSubmitting={isSubmitting}
                submitSuccess={submitSuccess}
                onAddBusiness={handleAddBusiness}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BusinessDetailSheet
        business={selectedBusiness}
        onClose={() => setSelectedBusiness(null)}
        onPlaceOrder={handlePlaceOrder}
      />

      <BottomTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabLabels={tabLabels}
      />
    </div>
  );
}
