"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AppHeader } from "@/components/layout/AppHeader";
import { SettingsMenu } from "@/components/settings/SettingsMenu";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { AccountView } from "@/components/account/AccountView";
import { BusinessDetailSheet } from "@/components/business/BusinessDetailSheet";
import { BusinessPreviewSheet } from "@/components/business/BusinessPreviewSheet";
import { HomeView } from "@/components/home/HomeView";
import { SearchView } from "@/components/search/SearchView";
import { BottomTabBar, type TabId } from "@/components/navigation/BottomTabBar";
import { normalizeBusiness, type BusinessRecord } from "@/types/business";
import {
  ALL_MAP_ACTIVITIES_FILTER,
  buildActivitiesPayload,
  buildActivityFilterOptions,
  filterBusinessesForMap,
  getActivitiesForMainCategory,
  getDefaultActivityFilter,
  type CatalogCategoryFilter,
  type MainCategory,
} from "@/types/businessCategories";
import { extractCoordinatesFromMapsUrl } from "@/actions/extract-coordinates";
import { verifyAccessKey } from "@/actions/verify-access-key";
import {
  translateActivityFilterOptions,
  translations,
  type Language,
} from "@/types/i18n";
import type { CurrentUser } from "@/types/user";
import { supabase } from "@/utils/supabase";

const VIEW_TRANSITION = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.22, ease: "easeInOut" as const },
};

export default function HomePage() {
  const router = useRouter();
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
  const [activeCatalogCategory, setActiveCatalogCategory] =
    useState<CatalogCategoryFilter>("All");
  const [activeActivityFilter, setActiveActivityFilter] = useState<string>(
    ALL_MAP_ACTIVITIES_FILTER,
  );
  const [mapPreviewBusiness, setMapPreviewBusiness] = useState<BusinessRecord | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessRecord | null>(null);

  const [newName, setNewName] = useState("");
  const [newMainCategory, setNewMainCategory] = useState<MainCategory>("Food");
  const [selectedActivities, setSelectedActivities] = useState<Record<string, boolean>>(
    {},
  );
  const [otherActivityEnabled, setOtherActivityEnabled] = useState(false);
  const [otherActivityText, setOtherActivityText] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [hasPhysicalLocation, setHasPhysicalLocation] = useState(true);
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

  const applyAuthSession = useCallback((userEmail: string) => {
    setCurrentUser({ email: userEmail, role: "admin" });
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        applyAuthSession(session.user.email ?? "");
      } else {
        setCurrentUser(null);
      }
    });

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        applyAuthSession(session.user.email ?? "");
      }
    });

    return () => subscription.unsubscribe();
  }, [applyAuthSession]);

  const activityFilterOptions = useMemo(
    () =>
      translateActivityFilterOptions(
        buildActivityFilterOptions(activeCatalogCategory, businesses),
        t,
      ),
    [activeCatalogCategory, businesses, t],
  );

  useEffect(() => {
    const isValid = activityFilterOptions.some(
      (option) => option.value === activeActivityFilter,
    );

    if (!isValid) {
      setActiveActivityFilter(getDefaultActivityFilter(activeCatalogCategory));
    }
  }, [activeCatalogCategory, activityFilterOptions, activeActivityFilter]);

  const mapFilteredBusinesses = useMemo(
    () =>
      filterBusinessesForMap(businesses, activeCatalogCategory, activeActivityFilter),
    [businesses, activeCatalogCategory, activeActivityFilter],
  );

  const handleCatalogCategoryChange = (category: CatalogCategoryFilter) => {
    setActiveCatalogCategory(category);
    setActiveActivityFilter(getDefaultActivityFilter(category));
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

    try {
      if (isLoginMode) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setAuthError(error.message);
          return;
        }

        const signedInEmail = data.user?.email ?? email.trim();
        applyAuthSession(signedInEmail);
        setActiveTab("account");
        router.push("/");
        router.refresh();
        return;
      }

      const keyResult = await verifyAccessKey(adminAccessKey, email);

      if (!keyResult.success) {
        setAuthError(keyResult.error);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      if (data.user) {
        applyAuthSession(data.user.email ?? email.trim());
        setActiveTab("account");
        router.push("/");
        router.refresh();
      }
    } catch {
      setAuthError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
    setNewMainCategory("Food");
    setSelectedActivities({});
    setOtherActivityEnabled(false);
    setOtherActivityText("");
    setNewDescription("");
    setHasPhysicalLocation(true);
    setNewGoogleMapsUrl("");
    setNewInstagramUrl("");
    setNewWhatsappNumber("");
    setNewWebsiteUrl("");
  }, [clearLogoSelection]);

  const handleHasPhysicalLocationChange = (value: boolean) => {
    setHasPhysicalLocation(value);
    if (!value) {
      setNewGoogleMapsUrl("");
    }
  };

  const handleAddBusiness = async (e: FormEvent) => {
    e.preventDefault();

    if (!newName.trim() || !newDescription.trim() || isUploadingLogo) {
      return;
    }

    setPublishError(null);
    setSubmitSuccess(false);

    const websiteUrl = newWebsiteUrl.trim();
    const instagramUrl = newInstagramUrl.trim();

    if (!hasPhysicalLocation && !websiteUrl && !instagramUrl) {
      setPublishError(t.publishErrorOnlineLink);
      return;
    }

    if (hasPhysicalLocation && !newGoogleMapsUrl.trim()) {
      setPublishError(t.publishErrorMapsRequired);
      return;
    }

    let latitude: number | null = null;
    let longitude: number | null = null;
    let googleMapsUrl: string | null = null;

    if (hasPhysicalLocation) {
      setIsExtractingLocation(true);

      const extraction = await extractCoordinatesFromMapsUrl(newGoogleMapsUrl.trim());

      setIsExtractingLocation(false);

      if (!extraction.success) {
        setPublishError(extraction.error ?? t.publishErrorMapsExtract);
        return;
      }

      latitude = extraction.latitude;
      longitude = extraction.longitude;
      googleMapsUrl = newGoogleMapsUrl.trim();
    }

    const predefinedActivities = getActivitiesForMainCategory(newMainCategory);
    const activities = buildActivitiesPayload(
      selectedActivities,
      predefinedActivities,
      otherActivityEnabled,
      otherActivityText,
    );

    if (activities.length === 0) {
      setPublishError(t.publishErrorSelectActivity);
      return;
    }

    setIsSubmitting(true);

    const businessType = !hasPhysicalLocation
      ? "digital"
      : newMainCategory === "Services"
        ? "services"
        : "physical";

    const { error } = await supabase.from("businesses").insert({
      name: newName.trim(),
      type: businessType,
      main_category: newMainCategory,
      activities,
      description: newDescription.trim(),
      google_maps_url: googleMapsUrl,
      latitude,
      longitude,
      instagram_url: instagramUrl || null,
      whatsapp_number: newWhatsappNumber.trim() || null,
      website_url: websiteUrl || null,
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
      className={`flex min-h-dvh flex-col bg-white dark:bg-black ${
        language === "ar" ? "font-arabic" : ""
      }`}
    >
      <AppHeader>
        <SettingsMenu
          language={language}
          onLanguageChange={setLanguage}
          labels={t}
        />
      </AppHeader>

      <main
        id="main-content"
        className={`relative flex min-h-0 flex-1 flex-col bg-white dark:bg-black ${
          activeTab === "home" ? "overflow-hidden px-0 pb-0" : "px-6 pb-4"
        }`}
        aria-label={`${tabLabels[activeTab]} view`}
      >
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div
              key="home"
              {...VIEW_TRANSITION}
              className="relative h-full min-h-0 flex-1 overflow-hidden"
            >
              <HomeView
                businesses={mapFilteredBusinesses}
                activeCatalogCategory={activeCatalogCategory}
                onCatalogCategoryChange={handleCatalogCategoryChange}
                activeActivityFilter={activeActivityFilter}
                onActivityFilterChange={setActiveActivityFilter}
                activityFilterOptions={activityFilterOptions}
                mapPreviewBusiness={mapPreviewBusiness}
                onMapPinSelect={handleMapPinSelect}
                labels={t}
              />
            </motion.div>
          )}

          {activeTab === "search" && (
            <motion.div key="search" {...VIEW_TRANSITION} className="h-full">
              <SearchView
                businesses={businesses}
                activeCatalogCategory={activeCatalogCategory}
                onCatalogCategoryChange={handleCatalogCategoryChange}
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
                newMainCategory={newMainCategory}
                onMainCategoryChange={(category: MainCategory) => {
                  setNewMainCategory(category);
                  setSelectedActivities({});
                  setOtherActivityEnabled(false);
                  setOtherActivityText("");
                }}
                selectedActivities={selectedActivities}
                onActivityToggle={(activity: string) => {
                  setSelectedActivities((prev) => ({
                    ...prev,
                    [activity]: !prev[activity],
                  }));
                }}
                otherActivityEnabled={otherActivityEnabled}
                setOtherActivityEnabled={setOtherActivityEnabled}
                otherActivityText={otherActivityText}
                setOtherActivityText={setOtherActivityText}
                newDescription={newDescription}
                setNewDescription={setNewDescription}
                hasPhysicalLocation={hasPhysicalLocation}
                onHasPhysicalLocationChange={handleHasPhysicalLocationChange}
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
