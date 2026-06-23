"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AccountDashboard } from "@/components/account/AccountDashboard";
import { AuthGateway } from "@/components/account/AuthGateway";
import type { MainCategory } from "@/types/businessCategories";
import type { EventRecord } from "@/types/event";
import type { BusinessRecord } from "@/types/business";
import type { CurrentUser } from "@/types/user";
import type { Translations } from "@/types/i18n";
import type { Dispatch, FormEvent, SetStateAction } from "react";

interface AccountViewProps {
  currentUser: CurrentUser | null;
  businesses: BusinessRecord[];
  events: EventRecord[];
  setEvents: Dispatch<SetStateAction<EventRecord[]>>;
  labels: Translations;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  adminAccessKey: string;
  setAdminAccessKey: (value: string) => void;
  isLoginMode: boolean;
  setIsLoginMode: (value: boolean) => void;
  isLoading: boolean;
  authError: string | null;
  onAuth: (e: FormEvent) => void;
  onSignOut: () => void;
  setBusinesses: Dispatch<SetStateAction<BusinessRecord[]>>;
  onBusinessDeleted?: (id: string) => void;
  newName: string;
  setNewName: (value: string) => void;
  newMainCategory: MainCategory;
  onMainCategoryChange: (category: MainCategory) => void;
  selectedActivities: Record<string, boolean>;
  onActivityToggle: (activity: string) => void;
  otherActivityEnabled: boolean;
  setOtherActivityEnabled: (value: boolean) => void;
  otherActivityText: string;
  setOtherActivityText: (value: string) => void;
  newDescription: string;
  setNewDescription: (value: string) => void;
  hasPhysicalLocation: boolean;
  onHasPhysicalLocationChange: (value: boolean) => void;
  newGoogleMapsUrl: string;
  setNewGoogleMapsUrl: (value: string) => void;
  useManualBusinessCoordinates: boolean;
  onUseManualBusinessCoordinatesChange: (value: boolean) => void;
  manualBusinessLatitude: string;
  onManualBusinessLatitudeChange: (value: string) => void;
  manualBusinessLongitude: string;
  onManualBusinessLongitudeChange: (value: string) => void;
  newInstagramUrl: string;
  setNewInstagramUrl: (value: string) => void;
  newWhatsappNumber: string;
  setNewWhatsappNumber: (value: string) => void;
  newWebsiteUrl: string;
  setNewWebsiteUrl: (value: string) => void;
  logoPreviewUrl: string | null;
  isUploadingLogo: boolean;
  logoReady: boolean;
  onLogoSelect: (file: File) => void;
  isExtractingLocation: boolean;
  isSubmitting: boolean;
  publishError: string | null;
  submitSuccess: boolean;
  onAddBusiness: (e: FormEvent) => void;
  onEventsChanged?: () => void | Promise<void>;
}

const AUTH_TRANSITION = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.28, ease: "easeInOut" as const },
};

export function AccountView({
  currentUser,
  businesses,
  events,
  setEvents,
  labels,
  email,
  setEmail,
  password,
  setPassword,
  adminAccessKey,
  setAdminAccessKey,
  isLoginMode,
  setIsLoginMode,
  isLoading,
  authError,
  onAuth,
  onSignOut,
  setBusinesses,
  onBusinessDeleted,
  newName,
  setNewName,
  newMainCategory,
  onMainCategoryChange,
  selectedActivities,
  onActivityToggle,
  otherActivityEnabled,
  setOtherActivityEnabled,
  otherActivityText,
  setOtherActivityText,
  newDescription,
  setNewDescription,
  hasPhysicalLocation,
  onHasPhysicalLocationChange,
  newGoogleMapsUrl,
  setNewGoogleMapsUrl,
  useManualBusinessCoordinates,
  onUseManualBusinessCoordinatesChange,
  manualBusinessLatitude,
  onManualBusinessLatitudeChange,
  manualBusinessLongitude,
  onManualBusinessLongitudeChange,
  newInstagramUrl,
  setNewInstagramUrl,
  newWhatsappNumber,
  setNewWhatsappNumber,
  newWebsiteUrl,
  setNewWebsiteUrl,
  logoPreviewUrl,
  isUploadingLogo,
  logoReady,
  onLogoSelect,
  isExtractingLocation,
  isSubmitting,
  publishError,
  submitSuccess,
  onAddBusiness,
  onEventsChanged,
}: AccountViewProps) {
  return (
    <AnimatePresence mode="wait">
      {currentUser ? (
        <motion.div key="dashboard" {...AUTH_TRANSITION} className="h-full">
          <AccountDashboard
            user={currentUser}
            businesses={businesses}
            events={events}
            setEvents={setEvents}
            labels={labels}
            onSignOut={onSignOut}
            setBusinesses={setBusinesses}
            onBusinessDeleted={onBusinessDeleted}
            newName={newName}
            setNewName={setNewName}
            newMainCategory={newMainCategory}
            onMainCategoryChange={onMainCategoryChange}
            selectedActivities={selectedActivities}
            onActivityToggle={onActivityToggle}
            otherActivityEnabled={otherActivityEnabled}
            setOtherActivityEnabled={setOtherActivityEnabled}
            otherActivityText={otherActivityText}
            setOtherActivityText={setOtherActivityText}
            newDescription={newDescription}
            setNewDescription={setNewDescription}
            hasPhysicalLocation={hasPhysicalLocation}
            onHasPhysicalLocationChange={onHasPhysicalLocationChange}
            newGoogleMapsUrl={newGoogleMapsUrl}
            setNewGoogleMapsUrl={setNewGoogleMapsUrl}
            useManualBusinessCoordinates={useManualBusinessCoordinates}
            onUseManualBusinessCoordinatesChange={onUseManualBusinessCoordinatesChange}
            manualBusinessLatitude={manualBusinessLatitude}
            onManualBusinessLatitudeChange={onManualBusinessLatitudeChange}
            manualBusinessLongitude={manualBusinessLongitude}
            onManualBusinessLongitudeChange={onManualBusinessLongitudeChange}
            newInstagramUrl={newInstagramUrl}
            setNewInstagramUrl={setNewInstagramUrl}
            newWhatsappNumber={newWhatsappNumber}
            setNewWhatsappNumber={setNewWhatsappNumber}
            newWebsiteUrl={newWebsiteUrl}
            setNewWebsiteUrl={setNewWebsiteUrl}
            logoPreviewUrl={logoPreviewUrl}
            isUploadingLogo={isUploadingLogo}
            logoReady={logoReady}
            onLogoSelect={onLogoSelect}
            isExtractingLocation={isExtractingLocation}
            isSubmitting={isSubmitting}
            publishError={publishError}
            submitSuccess={submitSuccess}
            onAddBusiness={onAddBusiness}
            onEventsChanged={onEventsChanged}
          />
        </motion.div>
      ) : (
        <motion.div key="gateway" {...AUTH_TRANSITION} className="h-full">
          <AuthGateway
            labels={labels}
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
            onAuth={onAuth}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
