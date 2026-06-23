import {
  ALL_FOOD_FILTER,
  ALL_MAP_ACTIVITIES_FILTER,
  ALL_SERVICES_FILTER,
  type ActivityFilterOption,
  type CatalogCategoryFilter,
  type MainCategory,
  type MapViewDropdownOption,
  type MapViewFilter,
} from "@/types/businessCategories";

export type Language = "en" | "ar";

export interface Translations {
  home: string;
  search: string;
  account: string;
  digital: string;
  physical: string;
  services: string;
  all: string;
  food: string;
  events: string;
  catalogServices: string;
  mapCategoryDropdown: string;
  manageBusinesses: string;
  manageEvents: string;
  manageStores: string;
  manageActivitiesEvents: string;
  directorySearchPlaceholder: string;
  directoryNoResults: string;
  remove: string;
  cancel: string;
  deleteWarningAffected: string;
  confirmDeletionCountdown: string;
  permanentlyDeleteItem: string;
  activityTag: string;
  eventDates: string;
  operatingHours: string;
  addEvent: string;
  addEventSubtitle: string;
  eventName: string;
  startDate: string;
  endDate: string;
  openTime: string;
  closeTime: string;
  publishEvent: string;
  eventPublished: string;
  allFood: string;
  allServices: string;
  allActivities: string;
  activityCoffee: string;
  activityDessert: string;
  activityPastry: string;
  activityLemonade: string;
  activityBeverages: string;
  activityConsulting: string;
  activityMaintenance: string;
  activityTechSupport: string;
  activityDesign: string;
  activityLegal: string;
  activityOther: string;
  signIn: string;
  createAccount: string;
  email: string;
  password: string;
  adminAccessKey: string;
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
  settings: string;
  closeSettings: string;
  language: string;
  theme: string;
  english: string;
  arabic: string;
  lightMode: string;
  darkMode: string;
  businessLogo: string;
  uploadLogoHint: string;
  uploadingLogo: string;
  logoReady: string;
  hasPhysicalLocation: string;
  onlineOnly: string;
  onlineOnlyHint: string;
  primaryCategory: string;
  activities: string;
  activityOtherPlaceholder: string;
  customActivity: string;
  description: string;
  descriptionPlaceholder: string;
  googleMapsLink: string;
  websiteUrl: string;
  websiteUrlOnlineRequired: string;
  instagramUrl: string;
  instagramUrlOnlineRequired: string;
  whatsappNumber: string;
  extractingLocation: string;
  publishing: string;
  businessPublished: string;
  searchPlaceholder: string;
  searchNoResults: string;
  activityFilter: string;
  primaryCategoryFilter: string;
  filterByActivity: string;
  publishErrorOnlineLink: string;
  publishErrorMapsRequired: string;
  publishErrorMapsExtract: string;
  publishErrorSelectActivity: string;
  restrictedAccessBanner: string;
  directoryManagement: string;
  directoryManagementSubtitle: string;
  directoryEmpty: string;
  delete: string;
  deleteConfirm: string;
  deleteErrorAlert: string;
  deleteBusinessAria: string;
  addBusiness: string;
  addBusinessSubtitle: string;
  businessName: string;
  businessNamePlaceholder: string;
  generateInviteKey: string;
  generateInviteKeySubtitle: string;
  inviteeEmail: string;
  inviteeEmailPlaceholder: string;
  generateKey: string;
  generatingKey: string;
  keyErrorInviteeRequired: string;
  keyErrorGenerateFailed: string;
  keyErrorCopyFailed: string;
  generatedInviteKeyTitle: string;
  boundToEmail: string;
  copyToClipboard: string;
  copied: string;
  clear: string;
  placeholderWhatsapp: string;
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
    food: "Food",
    events: "Events",
    catalogServices: "Services",
    mapCategoryDropdown: "Category",
    manageBusinesses: "Manage Businesses",
    manageEvents: "Manage Events",
    manageStores: "Manage Stores",
    manageActivitiesEvents: "Manage Activities & Events",
    directorySearchPlaceholder: "Search directory by name, category, or description…",
    directoryNoResults: "No items match your search.",
    remove: "Remove",
    cancel: "Cancel",
    deleteWarningAffected:
      "Warning: Deleting this item will affect the following {count} stores/events:",
    confirmDeletionCountdown: "Confirm Deletion ({seconds}s)…",
    permanentlyDeleteItem: "Permanently Delete Item",
    activityTag: "Activity",
    eventDates: "Dates",
    operatingHours: "Hours",
    addEvent: "Add Event",
    addEventSubtitle: "Publish a time-bound event to the Sikka map.",
    eventName: "Event Name",
    startDate: "Start Date",
    endDate: "End Date",
    openTime: "Open Time",
    closeTime: "Close Time",
    publishEvent: "Publish Event",
    eventPublished: "Event published — now live on the map.",
    allFood: "All Food",
    allServices: "All Services",
    allActivities: "All Activities",
    activityCoffee: "Coffee",
    activityDessert: "Dessert",
    activityPastry: "Pastry",
    activityLemonade: "Lemonade",
    activityBeverages: "Beverages",
    activityConsulting: "Consulting",
    activityMaintenance: "Maintenance",
    activityTechSupport: "Tech Support",
    activityDesign: "Design",
    activityLegal: "Legal",
    activityOther: "Other",
    signIn: "Sign In",
    createAccount: "Create Account",
    email: "Email",
    password: "Password",
    adminAccessKey: "Admin Access Key",
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
    settings: "Settings",
    closeSettings: "Close settings",
    language: "Language",
    theme: "Theme",
    english: "English",
    arabic: "Arabic",
    lightMode: "Light",
    darkMode: "Dark",
    businessLogo: "Business logo",
    uploadLogoHint: "Tap to upload a logo image",
    uploadingLogo: "Uploading logo…",
    logoReady: "Logo ready",
    hasPhysicalLocation: "Has Physical Location?",
    onlineOnly: "Online Only",
    onlineOnlyHint: "Online-only: provide a website or Instagram link below.",
    primaryCategory: "Primary category",
    activities: "Activities",
    activityOtherPlaceholder: "Describe other activity…",
    customActivity: "Custom activity",
    description: "Description",
    descriptionPlaceholder: "Describe this business…",
    googleMapsLink: "Google Maps Link",
    websiteUrl: "Website URL",
    websiteUrlOnlineRequired: "Website URL (required if no Instagram)",
    instagramUrl: "Instagram URL",
    instagramUrlOnlineRequired: "Instagram URL (required if no website)",
    whatsappNumber: "WhatsApp Number",
    extractingLocation: "Extracting Location…",
    publishing: "Publishing…",
    businessPublished: "Business published — now live on the map.",
    searchPlaceholder: "Search local businesses…",
    searchNoResults: "No businesses found in this category yet.",
    activityFilter: "Activity filter",
    primaryCategoryFilter: "Primary category",
    filterByActivity: "Filter by activity",
    publishErrorOnlineLink:
      "Website or social media link is required for online-only businesses.",
    publishErrorMapsRequired:
      "Google Maps link is required for businesses with a physical location.",
    publishErrorMapsExtract: "Could not extract coordinates from this Google Maps link.",
    publishErrorSelectActivity: "Select at least one activity.",
    restrictedAccessBanner:
      "RESTRICTED ACCESS: SIKKA DIRECTORY MANAGEMENT. This terminal is strictly for authorized administrators.",
    directoryManagement: "Directory Management",
    directoryManagementSubtitle:
      "View, add, and remove businesses on the Sikka map and directory.",
    directoryEmpty: "No businesses in the directory yet.",
    delete: "Delete",
    deleteConfirm: "Are you sure you want to delete this business? This cannot be undone.",
    deleteErrorAlert: "Unable to delete this business. Please try again.",
    deleteBusinessAria: "Delete",
    addBusiness: "Add Business",
    addBusinessSubtitle: "Publish a new listing to the Sikka map and directory.",
    businessName: "Name",
    businessNamePlaceholder: "MADRE Desserts",
    generateInviteKey: "Generate Invite Key",
    generateInviteKeySubtitle:
      "Create a one-time invite key bound to a specific email for administrator sign-up.",
    inviteeEmail: "Invitee Email",
    inviteeEmailPlaceholder: "partner@example.com",
    generateKey: "Generate Key",
    generatingKey: "Generating…",
    keyErrorInviteeRequired: "Invitee email is required.",
    keyErrorGenerateFailed: "Unable to generate invite key. Please try again.",
    keyErrorCopyFailed: "Unable to copy to clipboard.",
    generatedInviteKeyTitle: "Generated invite key",
    boundToEmail: "Bound to:",
    copyToClipboard: "Copy to Clipboard",
    copied: "Copied",
    clear: "Clear",
    placeholderWhatsapp: "+971 50 000 0000",
  },
  ar: {
    home: "الرئيسية",
    search: "بحث",
    account: "الحساب",
    digital: "رقمي",
    physical: "مادي",
    services: "خدمات",
    all: "الكل",
    food: "طعام",
    events: "فعاليات",
    catalogServices: "خدمات",
    mapCategoryDropdown: "الفئة",
    manageBusinesses: "إدارة الأعمال",
    manageEvents: "إدارة الفعاليات",
    manageStores: "إدارة المتاجر",
    manageActivitiesEvents: "إدارة الأنشطة والفعاليات",
    directorySearchPlaceholder: "ابحث في الدليل بالاسم أو الفئة أو الوصف…",
    directoryNoResults: "لا توجد نتائج مطابقة لبحثك.",
    remove: "إزالة",
    cancel: "إلغاء",
    deleteWarningAffected:
      "تحذير: حذف هذا العنصر سيؤثر على {count} من المتاجر/الفعاليات التالية:",
    confirmDeletionCountdown: "تأكيد الحذف ({seconds} ث)…",
    permanentlyDeleteItem: "حذف العنصر نهائياً",
    activityTag: "نشاط",
    eventDates: "التواريخ",
    operatingHours: "الساعات",
    addEvent: "إضافة فعالية",
    addEventSubtitle: "نشر فعالية مؤقتة على خريطة سِكّة.",
    eventName: "اسم الفعالية",
    startDate: "تاريخ البداية",
    endDate: "تاريخ النهاية",
    openTime: "وقت الافتتاح",
    closeTime: "وقت الإغلاق",
    publishEvent: "نشر الفعالية",
    eventPublished: "تم نشر الفعالية — متاحة الآن على الخريطة.",
    allFood: "كل الطعام",
    allServices: "كل الخدمات",
    allActivities: "كل الأنشطة",
    activityCoffee: "قهوة",
    activityDessert: "حلويات",
    activityPastry: "معجنات",
    activityLemonade: "ليمونادة",
    activityBeverages: "مشروبات",
    activityConsulting: "استشارات",
    activityMaintenance: "صيانة",
    activityTechSupport: "دعم تقني",
    activityDesign: "تصميم",
    activityLegal: "قانوني",
    activityOther: "أخرى",
    signIn: "تسجيل الدخول",
    createAccount: "إنشاء حساب",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    adminAccessKey: "مفتاح وصول المسؤول",
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
    settings: "الإعدادات",
    closeSettings: "إغلاق الإعدادات",
    language: "اللغة",
    theme: "المظهر",
    english: "English",
    arabic: "العربية",
    lightMode: "فاتح",
    darkMode: "داكن",
    businessLogo: "شعار العمل",
    uploadLogoHint: "اضغط لرفع صورة الشعار",
    uploadingLogo: "جارٍ رفع الشعار…",
    logoReady: "الشعار جاهز",
    hasPhysicalLocation: "هل يوجد موقع فعلي؟",
    onlineOnly: "عبر الإنترنت فقط",
    onlineOnlyHint: "للأعمال عبر الإنترنت فقط: أضف رابط موقع أو إنستغرام أدناه.",
    primaryCategory: "الفئة الرئيسية",
    activities: "الأنشطة",
    activityOtherPlaceholder: "صف نشاطاً آخر…",
    customActivity: "نشاط مخصص",
    description: "الوصف",
    descriptionPlaceholder: "صف هذا العمل…",
    googleMapsLink: "رابط خرائط جوجل",
    websiteUrl: "رابط الموقع",
    websiteUrlOnlineRequired: "رابط الموقع (مطلوب إن لم يُذكر إنستغرام)",
    instagramUrl: "رابط إنستغرام",
    instagramUrlOnlineRequired: "رابط إنستغرام (مطلوب إن لم يُذكر الموقع)",
    whatsappNumber: "رقم واتساب",
    extractingLocation: "جارٍ استخراج الموقع…",
    publishing: "جارٍ النشر…",
    businessPublished: "تم نشر العمل — متاح الآن على الخريطة.",
    searchPlaceholder: "ابحث عن أعمال محلية…",
    searchNoResults: "لا توجد أعمال في هذه الفئة بعد.",
    activityFilter: "تصفية النشاط",
    primaryCategoryFilter: "الفئة الرئيسية",
    filterByActivity: "تصفية حسب النشاط",
    publishErrorOnlineLink: "رابط الموقع أو وسائل التواصل مطلوب للأعمال عبر الإنترنت فقط.",
    publishErrorMapsRequired: "رابط خرائط جوجل مطلوب للأعمال ذات الموقع الفعلي.",
    publishErrorMapsExtract: "تعذّر استخراج الإحداثيات من رابط خرائط جوجل.",
    publishErrorSelectActivity: "اختر نشاطاً واحداً على الأقل.",
    restrictedAccessBanner:
      "وصول مقيد: إدارة دليل سِكّة. هذه الوحدة مخصصة للمسؤولين المصرّح لهم فقط.",
    directoryManagement: "إدارة الدليل",
    directoryManagementSubtitle: "عرض الأعمال وإضافتها وإزالتها من خريطة ودليل سِكّة.",
    directoryEmpty: "لا توجد أعمال في الدليل بعد.",
    delete: "حذف",
    deleteConfirm: "هل أنت متأكد من حذف هذا العمل؟ لا يمكن التراجع عن هذا الإجراء.",
    deleteErrorAlert: "تعذّر حذف هذا العمل. يُرجى المحاولة مرة أخرى.",
    deleteBusinessAria: "حذف",
    addBusiness: "إضافة عمل",
    addBusinessSubtitle: "نشر قائمة جديدة على خريطة ودليل سِكّة.",
    businessName: "الاسم",
    businessNamePlaceholder: "مثال: حلويات مادري",
    generateInviteKey: "إنشاء مفتاح دعوة",
    generateInviteKeySubtitle:
      "إنشاء مفتاح دعوة لمرة واحدة مرتبط ببريد إلكتروني محدد لتسجيل المسؤولين.",
    inviteeEmail: "بريد المدعو",
    inviteeEmailPlaceholder: "partner@example.com",
    generateKey: "إنشاء المفتاح",
    generatingKey: "جارٍ الإنشاء…",
    keyErrorInviteeRequired: "بريد المدعو مطلوب.",
    keyErrorGenerateFailed: "تعذّر إنشاء مفتاح الدعوة. يُرجى المحاولة مرة أخرى.",
    keyErrorCopyFailed: "تعذّر النسخ إلى الحافظة.",
    generatedInviteKeyTitle: "مفتاح الدعوة المُنشأ",
    boundToEmail: "مرتبط بـ:",
    copyToClipboard: "نسخ إلى الحافظة",
    copied: "تم النسخ",
    clear: "مسح",
    placeholderWhatsapp: "+971 50 000 0000",
  },
};

const ACTIVITY_LABEL_MAP: Record<string, keyof Translations> = {
  Coffee: "activityCoffee",
  Dessert: "activityDessert",
  Pastry: "activityPastry",
  Lemonade: "activityLemonade",
  Beverages: "activityBeverages",
  Consulting: "activityConsulting",
  Maintenance: "activityMaintenance",
  "Tech Support": "activityTechSupport",
  Design: "activityDesign",
  Legal: "activityLegal",
};

export function getCategoryLabel(
  id: "all" | "digital" | "physical" | "services",
  t: Translations,
): string {
  if (id === "all") return t.all;
  return t[id];
}

export function getMapViewFilterLabel(
  filter: MapViewDropdownOption | MapViewFilter,
  t: Translations,
): string {
  if (filter === "All") return t.all;
  if (filter === "Events") return t.events;
  if (filter === "Food") return t.food;
  return t.catalogServices;
}

export function getCatalogCategoryLabel(
  category: CatalogCategoryFilter,
  t: Translations,
): string {
  if (category === "All") return t.all;
  if (category === "Food") return t.food;
  return t.catalogServices;
}

export function getMainCategoryLabel(category: MainCategory, t: Translations): string {
  return category === "Food" ? t.food : t.catalogServices;
}

export function getActivityLabel(activity: string, t: Translations): string {
  const key = ACTIVITY_LABEL_MAP[activity];
  if (key) return t[key];
  return activity;
}

export function getActivityFilterLabel(filterValue: string, t: Translations): string {
  if (filterValue === ALL_FOOD_FILTER) return t.allFood;
  if (filterValue === ALL_SERVICES_FILTER) return t.allServices;
  if (filterValue === ALL_MAP_ACTIVITIES_FILTER) return t.allActivities;
  return getActivityLabel(filterValue, t);
}

export function translateActivityFilterOptions(
  options: ActivityFilterOption[],
  t: Translations,
): ActivityFilterOption[] {
  return options.map((option) => ({
    value: option.value,
    label: getActivityFilterLabel(option.value, t),
  }));
}
