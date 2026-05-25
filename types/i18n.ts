export type Language = "en" | "ar";

export interface Translations {
  home: string;
  search: string;
  account: string;
  digital: string;
  physical: string;
  services: string;
  all: string;
  signIn: string;
  createAccount: string;
  email: string;
  password: string;
  businessDashboard: string;
  publishBusiness: string;
  signOut: string;
  welcomeBack: string;
  createAccountTitle: string;
  signInSubtitle: string;
  signUpSubtitle: string;
  signingIn: string;
  creatingAccount: string;
  toggleToSignUp: string;
  toggleToSignIn: string;
  languageToggle: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    home: "Home",
    search: "Search",
    account: "Account",
    digital: "Digital",
    physical: "Physical",
    services: "Services",
    all: "All",
    signIn: "Sign In",
    createAccount: "Create Account",
    email: "Email",
    password: "Password",
    businessDashboard: "Business Dashboard",
    publishBusiness: "Publish Business",
    signOut: "Sign Out",
    welcomeBack: "Welcome back",
    createAccountTitle: "Create account",
    signInSubtitle: "Sign in to manage your orders and profile.",
    signUpSubtitle: "Join Sikka to discover local businesses.",
    signingIn: "Signing in…",
    creatingAccount: "Creating account…",
    toggleToSignUp: "Don't have an account? Sign up",
    toggleToSignIn: "Already have an account? Sign in",
    languageToggle: "Language",
  },
  ar: {
    home: "الرئيسية",
    search: "بحث",
    account: "الحساب",
    digital: "رقمي",
    physical: "مادي",
    services: "خدمات",
    all: "الكل",
    signIn: "تسجيل الدخول",
    createAccount: "إنشاء حساب",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    businessDashboard: "لوحة تحكم الأعمال",
    publishBusiness: "نشر العمل",
    signOut: "تسجيل الخروج",
    welcomeBack: "مرحباً بعودتك",
    createAccountTitle: "إنشاء حساب",
    signInSubtitle: "سجّل الدخول لإدارة طلباتك وملفك الشخصي.",
    signUpSubtitle: "انضم إلى سِكّة لاكتشاف الأعمال المحلية.",
    signingIn: "جارٍ تسجيل الدخول…",
    creatingAccount: "جارٍ إنشاء الحساب…",
    toggleToSignUp: "ليس لديك حساب؟ سجّل الآن",
    toggleToSignIn: "لديك حساب بالفعل؟ سجّل الدخول",
    languageToggle: "اللغة",
  },
};

export function getCategoryLabel(
  id: "all" | "digital" | "physical" | "services",
  t: Translations,
): string {
  if (id === "all") return t.all;
  return t[id];
}
