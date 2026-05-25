"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AccountDashboard } from "@/components/account/AccountDashboard";
import { AuthGateway } from "@/components/account/AuthGateway";
import type { BusinessType } from "@/types/businessForm";
import type { BusinessRecord } from "@/types/business";
import type { CurrentUser, UserRole } from "@/types/user";
import type { Translations } from "@/types/i18n";
import type { FormEvent } from "react";

interface AccountViewProps {
  currentUser: CurrentUser | null;
  businesses: BusinessRecord[];
  labels: Translations;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  isLoginMode: boolean;
  setIsLoginMode: (value: boolean) => void;
  isLoading: boolean;
  authError: string | null;
  onAuth: (e: FormEvent) => void;
  onSignOut: () => void;
  onRoleChange: (role: UserRole) => void;
  onDeleteBusiness: (id: string) => Promise<void>;
  newName: string;
  setNewName: (value: string) => void;
  newType: BusinessType;
  setNewType: (value: BusinessType) => void;
  newDescription: string;
  setNewDescription: (value: string) => void;
  newLat: string;
  setNewLat: (value: string) => void;
  newLng: string;
  setNewLng: (value: string) => void;
  isSubmitting: boolean;
  submitSuccess: boolean;
  onAddBusiness: (e: FormEvent) => void;
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
  labels,
  email,
  setEmail,
  password,
  setPassword,
  isLoginMode,
  setIsLoginMode,
  isLoading,
  authError,
  onAuth,
  onSignOut,
  onRoleChange,
  onDeleteBusiness,
  newName,
  setNewName,
  newType,
  setNewType,
  newDescription,
  setNewDescription,
  newLat,
  setNewLat,
  newLng,
  setNewLng,
  isSubmitting,
  submitSuccess,
  onAddBusiness,
}: AccountViewProps) {
  return (
    <AnimatePresence mode="wait">
      {currentUser ? (
        <motion.div key="dashboard" {...AUTH_TRANSITION} className="h-full">
          <AccountDashboard
            user={currentUser}
            businesses={businesses}
            labels={labels}
            onSignOut={onSignOut}
            onRoleChange={onRoleChange}
            onDeleteBusiness={onDeleteBusiness}
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
            onAddBusiness={onAddBusiness}
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
