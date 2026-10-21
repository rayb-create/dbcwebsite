export type AdminLanguage = 'ar' | 'fr' | 'en' | 'es';

export interface AdminTranslations {
  // Languages display names
  langAr: string;
  langFr: string;
  langEn: string;
  langEs: string;

  // Header & Global
  adminHeaderTitle: string;
  adminHeaderBadge: string;
  viewPublicStore: string;
  purgeDemoDataBtn: string;
  logoutBtn: string;
  verifyingSession: string;
  backToStore: string;

  // Nav Items
  navDashboard: string;
  navProducts: string;
  navCategories: string;
  navInventory: string;
  navOrders: string;
  navDelivery: string;
  navContent: string;
  navMedia: string;
  navSectionTitle: string;
  alertBadge: string;

  // Login & Auth
  loginTitle: string;
  loginSubtitle: string;
  loginSecureAuth: string;
  loginCreateAdmin: string;
  loginEmailLabel: string;
  loginEmailPlaceholder: string;
  loginPasswordLabel: string;
  loginPasswordPlaceholder: string;
  loginManagerNameLabel: string;
  loginManagerNamePlaceholder: string;
  loginSubmitBtn: string;
  loginRegisterSubmitBtn: string;
  loginVerifying: string;
  loginSwitchToRegister: string;
  loginSwitchToLogin: string;
  loginPrimaryOwnerNote: string;
  loginSecurityTitle: string;
  loginSecurityDesc: string;
  loginRequiredFieldsError: string;
  loginPasswordLengthError: string;

  // Purge Dialog
  purgeConfirmTitle: string;
  purgeConfirmDesc: string;
  purgeItemProducts: string;
  purgeItemOrders: string;
  purgeItemMedia: string;
  purgeItemInventory: string;
  purgeWarningCleanStart: string;
  purgeCancelBtn: string;
  purgeConfirmBtn: string;
  purgeProcessingBtn: string;
  purgeSuccessToast: (prodCount: number, ordCount: number, medCount: number) => string;

  // Dashboard Overview
  dashExecutiveTitle: string;
  dashMainTitle: string;
  dashSubtitle: string;
  dashAddProductBtn: string;
  dashProcessOrdersBtn: string;
  dashRevenueTitle: string;
  dashRevenueSubtitle: (count: number) => string;
  dashPendingOrdersTitle: string;
  dashPendingOrdersSubtitle: (count: number) => string;
  dashCatalogItemsTitle: string;
  dashCatalogItemsSubtitle: (count: number) => string;
  dashStockAlertsTitle: string;
  dashStockAlertsSubtitle: (count: number) => string;
  dashRecentOrdersTitle: string;
  dashViewAllOrders: string;
  dashNoOrdersYet: string;
  dashShortcutsTitle: string;
  dashShortcutProducts: string;
  dashShortcutInventory: string;
  dashShortcutMedia: string;
  dashShortcutDelivery: string;
  dashShortcutContent: string;
  dashOrderItemsCount: (count: number) => string;
  dashHomeDelivery: string;
  dashDeskDelivery: string;
  dashCodPayment: string;
  dashBaridiMobPayment: string;

  // Product Manager
  prodManagerTitle: string;
  prodManagerSubtitle: string;
  prodNewProductBtn: string;
  prodSearchPlaceholder: string;
  prodCategoryFilterAll: string;
  prodStatusFilterAll: string;
  prodStatusFilterPublished: string;
  prodStatusFilterUnpublished: string;
  prodTableImage: string;
  prodTableProduct: string;
  prodTableCategory: string;
  prodTablePriceB2C: string;
  prodTablePriceB2B: string;
  prodTableStock: string;
  prodTableStatus: string;
  prodTableActions: string;
  prodInStock: string;
  prodOutOfStock: string;
  prodPublished: string;
  prodDraft: string;
  prodFeatured: string;
  prodEditBtn: string;
  prodDeleteBtn: string;
  prodNoProductsFound: string;
  prodNoProductsDesc: string;
  prodCreateNewPrompt: string;
  prodEditTitle: string;
  prodCreateTitle: string;
  prodBackToList: string;
  prodFormName: string;
  prodFormSubtitle: string;
  prodFormCategory: string;
  prodFormB2CPrice: string;
  prodFormB2BPrice: string;
  prodFormStockQuantity: string;
  prodFormFabric: string;
  prodFormFabricWeight: string;
  prodFormDescription: string;
  prodFormSizes: string;
  prodFormColors: string;
  prodFormAddColor: string;
  prodFormColorName: string;
  prodFormColorCode: string;
  prodFormAddColorBtn: string;
  prodFormImages: string;
  prodFormAddImagePrompt: string;
  prodFormPasteImageUrl: string;
  prodFormAddUrlBtn: string;
  prodFormOrPickSample: string;
  prodFormVisibility: string;
  prodFormPublishOnline: string;
  prodFormMarkFeatured: string;
  prodFormMarkNew: string;
  prodFormInStockToggle: string;
  prodFormSaveBtn: string;
  prodFormSavingBtn: string;
  prodFormCancelBtn: string;
  prodDeleteConfirmTitle: string;
  prodDeleteConfirmDesc: (name: string) => string;
  prodDeleteWarning: string;
  prodDeleteCancelBtn: string;
  prodDeleteActionBtn: string;
  prodToastSaved: string;
  prodToastDeleted: string;

  // Category Manager
  catManagerTitle: string;
  catManagerSubtitle: string;
  catItemsCount: (count: number) => string;
  catAudienceLabel: string;
  catFilterProductsBtn: string;

  // Inventory Tab
  invTitle: string;
  invSubtitle: string;
  invSearchPlaceholder: string;
  invFilterAllStocks: string;
  invFilterInStock: string;
  invFilterLowStock: string;
  invFilterOutOfStock: string;
  invTableArticle: string;
  invTableCategory: string;
  invTablePrice: string;
  invTableStockQty: string;
  invTableCustomerStatus: string;
  invTableQuickActions: string;
  invUnits: string;
  invLowStockWarning: string;
  invOutOfStockWarning: string;
  invMarkInStock: string;
  invMarkOutOfStock: string;
  invNoItemsFound: string;
  invNoItemsDesc: string;

  // Order Manager
  orderManagerTitle: string;
  orderManagerSubtitle: string;
  orderSearchPlaceholder: string;
  orderFilterAllStatuses: string;
  orderFilterPending: string;
  orderFilterShipped: string;
  orderFilterDelivered: string;
  orderFilterCancelled: string;
  orderKpiTotalOrders: string;
  orderKpiPending: string;
  orderKpiShipped: string;
  orderKpiDelivered: string;
  orderKpiRevenue: string;
  orderTableOrderNo: string;
  orderTableDate: string;
  orderTableCustomer: string;
  orderTableWilaya: string;
  orderTableItems: string;
  orderTableDelivery: string;
  orderTablePayment: string;
  orderTableTotal: string;
  orderTableStatus: string;
  orderTableAction: string;
  orderDetailTitle: string;
  orderCustomerInfo: string;
  orderCustomerPhone: string;
  orderCustomerAddress: string;
  orderCustomerCity: string;
  orderTrackingNumberLabel: string;
  orderCarrierLabel: string;
  orderEstDeliveryLabel: string;
  orderNotesLabel: string;
  orderSaveTrackingBtn: string;
  orderSavedTrackingSuccess: string;
  orderWhatsAppDispatchBtn: string;
  orderTrackingLinkCustomer: string;
  orderNoOrdersFound: string;
  orderNoOrdersDesc: string;

  // Delivery Manager
  delivTitle: string;
  delivSubtitle: string;
  delivTabRates: string;
  delivTabCompanies: string;
  delivFreeShippingThresholdLabel: string;
  delivFreeShippingHelp: string;
  delivBulkUpdateTitle: string;
  delivBulkUpdateDesc: string;
  delivBulkHomeRate: string;
  delivBulkDeskRate: string;
  delivBulkApplyBtn: string;
  delivSearchWilayaPlaceholder: string;
  delivTableWilaya: string;
  delivTableHomePrice: string;
  delivTableDeskPrice: string;
  delivTableActions: string;
  delivActiveCarrierTitle: string;
  delivAddNewCarrierBtn: string;
  delivCarrierNameLabel: string;
  delivCarrierPhoneLabel: string;
  delivCarrierTrackingUrlLabel: string;
  delivCarrierPrefixLabel: string;
  delivCarrierStopDeskToggle: string;
  delivSaveCarrierBtn: string;
  delivSaveAllRatesBtn: string;
  delivRatesSavedToast: string;

  // Content Manager
  contentTitle: string;
  contentSubtitle: string;
  contentWorkshopIdentity: string;
  contentStoreNameLabel: string;
  contentTaglineLabel: string;
  contentPhoneLabel: string;
  contentWhatsAppLabel: string;
  contentEmailLabel: string;
  contentAddressLabel: string;
  contentOpeningHoursLabel: string;
  contentSocialLinks: string;
  contentFacebookLabel: string;
  contentInstagramLabel: string;
  contentTikTokLabel: string;
  contentB2BSection: string;
  contentB2BMinQtyLabel: string;
  contentSaveBtn: string;
  contentSavingBtn: string;
  contentSavedToast: string;

  // Media Manager
  mediaTitle: string;
  mediaSubtitle: string;
  mediaUploadBtn: string;
  mediaAddUrlBtn: string;
  mediaSearchPlaceholder: string;
  mediaFilterAll: string;
  mediaFilterProducts: string;
  mediaFilterBanners: string;
  mediaFilterWorkshop: string;
  mediaCopyUrl: string;
  mediaCopied: string;
  mediaDeleteConfirmTitle: string;
  mediaDeleteConfirmDesc: string;
  mediaNoMediaTitle: string;
  mediaNoMediaDesc: string;
  mediaUploadPrompt: string;
  mediaProcessing: string;

  // General Statuses
  statusReceived: string;
  statusPreparing: string;
  statusShipped: string;
  statusDelivered: string;
  statusCancelled: string;
}

export const ADMIN_TRANSLATIONS: Record<AdminLanguage, AdminTranslations> = {
  // ==========================================================================
  // ARABIC (العربية) - RTL
  // ==========================================================================
  ar: {
    langAr: 'العربية',
    langFr: 'Français',
    langEn: 'English',
    langEs: 'Español',

    adminHeaderTitle: 'ورشة دي بي سي',
    adminHeaderBadge: 'لوحة إدارة الورشة',
    viewPublicStore: 'معاينة المتجر العام',
    purgeDemoDataBtn: 'تفريغ بيانات العرض التجريبي',
    logoutBtn: 'تسجيل الخروج',
    verifyingSession: 'جارٍ التحقق من جلسة المدير...',
    backToStore: 'العودة للمتجر',

    navDashboard: 'لوحة التحكم',
    navProducts: 'المنتجات والملابس',
    navCategories: 'التصنيفات والأنواع',
    navInventory: 'المخزون والكميات',
    navOrders: 'الطلبيات (69 ولاية)',
    navDelivery: 'الشحن والتسعيرات',
    navContent: 'محتوى المتجر ومعلومات الورشة',
    navMedia: 'مكتبة الصور والوسائط',
    navSectionTitle: 'قائمة إدارة الورشة',
    alertBadge: 'تنبيه',

    loginTitle: 'ورشة DBC للنسيج والملابس',
    loginSubtitle: 'فضاء الإدارة الآمن • المدير العام',
    loginSecureAuth: 'تسجيل دخول آمن',
    loginCreateAdmin: 'إنشاء حساب مدير',
    loginEmailLabel: 'البريد الإلكتروني للإدارة',
    loginEmailPlaceholder: 'admin@dbcworkshop.dz أو البريد المعتمد',
    loginPasswordLabel: 'كلمة المرور',
    loginPasswordPlaceholder: '••••••••••••',
    loginManagerNameLabel: 'اسم المدير / المنصب',
    loginManagerNamePlaceholder: 'مثال: إدارة ورشة دي بي سي',
    loginSubmitBtn: 'الدخول إلى لوحة المدير',
    loginRegisterSubmitBtn: 'إنشاء حساب المدير',
    loginVerifying: 'جارٍ التحقق...',
    loginSwitchToRegister: 'أول تشغيل للمتجر؟ إعداد حساب المدير الأولي ←',
    loginSwitchToLogin: '← لديك حساب بالفعل؟ تسجيل الدخول',
    loginPrimaryOwnerNote: 'الحساب الرئيسي للورشة:',
    loginSecurityTitle: 'الأمان والتحكم بالوصول',
    loginSecurityDesc: 'هذه المنطقة مخصصة حصرياً لفريق إدارة ورشة DBC. تتم حماية كافة البيانات عبر قواعد فايربيس الصارمة.',
    loginRequiredFieldsError: 'يرجى تعبئة جميع الحقول المطلوبة.',
    loginPasswordLengthError: 'يجب ألا تقل كلمة المرور عن 6 أحرف.',

    purgeConfirmTitle: 'هل أنت متأكد من تفريغ كافة البيانات التجريبية؟',
    purgeConfirmDesc: 'سيؤدي هذا الإجراء إلى حذف البيانات التالية نهائياً من قاعدة بيانات Firestore:',
    purgeItemProducts: 'جميع المنتجات التجريبية',
    purgeItemOrders: 'جميع طلبيات الاختبار والتجربة',
    purgeItemMedia: 'جميع الصور من مكتبة الوسائط التجريبية',
    purgeItemInventory: 'جميع كميات المخزون الافتراضية',
    purgeWarningCleanStart: 'ستبدأ قاعدة البيانات فارغة تماماً لتتمكن من إدخال منتجاتك وطلبياتك الحقيقية.',
    purgeCancelBtn: 'إلغاء',
    purgeConfirmBtn: 'تأكيد الحذف والتفريغ',
    purgeProcessingBtn: 'جارٍ الحذف...',
    purgeSuccessToast: (p, o, m) => `تم تفريغ قاعدة البيانات بنجاح: تم حذف ${p} منتج، ${o} طلبية، و ${m} ملف وسائط.`,

    dashExecutiveTitle: 'لوحة التحكم التنفيذية',
    dashMainTitle: 'ورشة خياطة وتصنيع DBC Workshop',
    dashSubtitle: 'أدر كتالوج الأزياء والمخزون، تابع شحنات الـ 69 ولاية، وخصص إعدادات المتجر بدقة.',
    dashAddProductBtn: '+ إضافة منتج جديد',
    dashProcessOrdersBtn: 'معالجة الطلبيات',
    dashRevenueTitle: 'إجمالي المبيعات المحققة',
    dashRevenueSubtitle: (count) => `${count} طلبية مسجلة بالورشة`,
    dashPendingOrdersTitle: 'طلبيات قيد المعالجة والتجهيز',
    dashPendingOrdersSubtitle: (count) => `${count} طرد قيد التوصيل حالياً`,
    dashCatalogItemsTitle: 'القطع بالكتالوج',
    dashCatalogItemsSubtitle: (count) => `${count} منتج معروض للزبائن`,
    dashStockAlertsTitle: 'تنبيهات المخزون',
    dashStockAlertsSubtitle: (count) => `${count} منتج يقترب من النفاد`,
    dashRecentOrdersTitle: 'أحدث طلبيات الزبائن (عبر 69 ولاية)',
    dashViewAllOrders: 'عرض جميع الطلبيات',
    dashNoOrdersYet: 'لا توجد طلبيات زبائن مسجلة حتى الآن.',
    dashShortcutsTitle: 'روابط الإدارة السريعة',
    dashShortcutProducts: 'كتالوج المنتجات',
    dashShortcutInventory: 'المخزون والكميات',
    dashShortcutMedia: 'مكتبة الصور السحابية',
    dashShortcutDelivery: 'شركات الشحن والـ 69 ولاية',
    dashShortcutContent: 'محتوى ومعلومات الموقع',
    dashOrderItemsCount: (count) => `${count} قطعة`,
    dashHomeDelivery: 'توصيل للمنزل',
    dashDeskDelivery: 'استلام من المكتب (StopDesk)',
    dashCodPayment: 'الدفع عند الاستلام',
    dashBaridiMobPayment: 'بريدي موب / CCP',

    prodManagerTitle: 'كتالوج المنتجات وتصاميم الورشة',
    prodManagerSubtitle: 'أنشئ وعدّل الهوديز، السراويل، الأكمام الطويلة والأسعار للمفرد (B2C) والجملة (B2B).',
    prodNewProductBtn: '+ إضافة قطعة جديدة',
    prodSearchPlaceholder: 'ابحث باسم المنتج أو الخامة...',
    prodCategoryFilterAll: 'جميع الأصناف',
    prodStatusFilterAll: 'جميع الحالات',
    prodStatusFilterPublished: 'منشور للعملاء',
    prodStatusFilterUnpublished: 'مسودة غير منشورة',
    prodTableImage: 'الصورة',
    prodTableProduct: 'المنتج والموديل',
    prodTableCategory: 'الصنف',
    prodTablePriceB2C: 'سعر التجزئة',
    prodTablePriceB2B: 'سعر الجملة',
    prodTableStock: 'الكمية بالمخزن',
    prodTableStatus: 'الحالة',
    prodTableActions: 'إجراءات',
    prodInStock: 'متوفر',
    prodOutOfStock: 'نافد',
    prodPublished: 'منشور',
    prodDraft: 'مسودة',
    prodFeatured: 'مميز',
    prodEditBtn: 'تعديل',
    prodDeleteBtn: 'حذف',
    prodNoProductsFound: 'لم يتم العثور على أي منتجات مطابقة',
    prodNoProductsDesc: 'كتالوج الورشة فارغ حالياً. يمكنك إضافة موديلاتك الأولى من الهوديز، السراويل وغيرها.',
    prodCreateNewPrompt: 'أضف أول منتج للورشة',
    prodEditTitle: 'تعديل المنتج والأسعار',
    prodCreateTitle: 'إضافة منتج جديد للكتالوج',
    prodBackToList: 'العودة لقائمة المنتجات',
    prodFormName: 'اسم المنتج التجاري',
    prodFormSubtitle: 'وصف فرعي موجز (نوع القطعة)',
    prodFormCategory: 'تصنيف الموديل',
    prodFormB2CPrice: 'سعر التجزئة (DZD)',
    prodFormB2BPrice: 'سعر الجملة B2B (DZD)',
    prodFormStockQuantity: 'الكمية المتوفرة بالمخزون',
    prodFormFabric: 'نوع القماش والخامة',
    prodFormFabricWeight: 'كثافة القماش والوزن (GSM)',
    prodFormDescription: 'الوصف التفصيلي للمنتج وجودة الحياكة',
    prodFormSizes: 'المقاسات المتوفرة للقطعة',
    prodFormColors: 'الألوان المتاحة',
    prodFormAddColor: 'إضافة لون جديد',
    prodFormColorName: 'اسم اللون',
    prodFormColorCode: 'كود اللون',
    prodFormAddColorBtn: 'إضافة لون',
    prodFormImages: 'صور القطعة والموديل',
    prodFormAddImagePrompt: 'أضف رابط صورة أو اختر من النماذج',
    prodFormPasteImageUrl: 'ألصق رابط الصورة هنا (URL)...',
    prodFormAddUrlBtn: 'إضافة الرابط',
    prodFormOrPickSample: 'أو اختر من صور الورشة الجاهزة:',
    prodFormVisibility: 'خيارات الظهور والترويج',
    prodFormPublishOnline: 'نشر المنتج فوراً في المتجر العام',
    prodFormMarkFeatured: 'تثبيت كمنتج مميز في الواجهة الرئيسية',
    prodFormMarkNew: 'وضع شارة "جديد الورشة"',
    prodFormInStockToggle: 'المنتج متاح للطلب الفوري من الزبائن',
    prodFormSaveBtn: 'حفظ المنتج في قاعدة البيانات',
    prodFormSavingBtn: 'جارٍ الحفظ...',
    prodFormCancelBtn: 'إلغاء والتراجع',
    prodDeleteConfirmTitle: 'تأكيد حذف المنتج',
    prodDeleteConfirmDesc: (name) => `هل أنت متأكد من رغبتك في حذف "${name}" نهائياً من الكتالوج؟`,
    prodDeleteWarning: 'لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.',
    prodDeleteCancelBtn: 'إلغاء',
    prodDeleteActionBtn: 'تأكيد الحذف',
    prodToastSaved: 'تم حفظ المنتج بنجاح في قاعدة البيانات !',
    prodToastDeleted: 'تم حذف المنتج من الكتالوج بنجاح.',

    catManagerTitle: 'أقسام وتصنيفات الورشة',
    catManagerSubtitle: 'تنظيم خطوط الإنتاج: الهوديز، السراويل، الأكمام الطويلة والطلبات الخاصة بالجملة.',
    catItemsCount: (count) => `${count} منتج مسجل`,
    catAudienceLabel: 'الفئة المستهدفة:',
    catFilterProductsBtn: 'عرض منتجات هذا القسم ←',

    invTitle: 'إدارة المخزون والكميات الحقيقية',
    invSubtitle: 'متابعة كميات الملابس المتوفرة في ورشة الحياكة وضبط التنبيهات لتفادي نفاد المنتجات.',
    invSearchPlaceholder: 'ابحث عن قطعة في المخزون...',
    invFilterAllStocks: 'جميع الحالات',
    invFilterInStock: 'متوفر بالمخزن',
    invFilterLowStock: 'مخزون منخفض (≤ 5)',
    invFilterOutOfStock: 'نافد من المخزن (0)',
    invTableArticle: 'المنتج / القطعة',
    invTableCategory: 'الصنف',
    invTablePrice: 'السعر',
    invTableStockQty: 'الكمية في المخزن',
    invTableCustomerStatus: 'حالة العرض للزبون',
    invTableQuickActions: 'إجراء سريع',
    invUnits: 'قطعة',
    invLowStockWarning: 'تنبيه: مخزون منخفض',
    invOutOfStockWarning: 'نافد من المخزن',
    invMarkInStock: 'تفعيل التوفر',
    invMarkOutOfStock: 'تعيين كنافد',
    invNoItemsFound: 'المخزون فارغ أو لا توجد نتائج مطابقة',
    invNoItemsDesc: 'أضف منتجاتك في قسم "المنتجات" لتبدأ في تتبع المخزون بدقة.',

    orderManagerTitle: 'إدارة طلبيات الشحن والتوزيع',
    orderManagerSubtitle: 'تتبع طلبيات الزبائن وتجار الجملة عبر 69 ولاية مع إصدار روابط التتبع وإشعارات واتساب.',
    orderSearchPlaceholder: 'ابحث برقم الطلب، رقم الهاتف، اسم الزبون، أو الولاية...',
    orderFilterAllStatuses: 'جميع الحالات',
    orderFilterPending: 'قيد التجهيز / التحضير',
    orderFilterShipped: 'تم الشحن / مع شركة التوصيل',
    orderFilterDelivered: 'تم التسليم بنجاح',
    orderFilterCancelled: 'ملغاة',
    orderKpiTotalOrders: 'إجمالي الطلبيات',
    orderKpiPending: 'قيد التجهيز',
    orderKpiShipped: 'قيد التوصيل',
    orderKpiDelivered: 'مسلّمة بنجاح',
    orderKpiRevenue: 'إجمالي المداخيل',
    orderTableOrderNo: 'رقم الطلب',
    orderTableDate: 'التاريخ',
    orderTableCustomer: 'الزبون',
    orderTableWilaya: 'الولاية',
    orderTableItems: 'المنتجات',
    orderTableDelivery: 'نوع الشحن',
    orderTablePayment: 'طريقة الدفع',
    orderTableTotal: 'المبلغ الإجمالي',
    orderTableStatus: 'الحالة',
    orderTableAction: 'تحديث الشحنة',
    orderDetailTitle: 'تفاصيل الطلبية ومعلومات الشحن',
    orderCustomerInfo: 'بيانات العميل',
    orderCustomerPhone: 'الهاتف:',
    orderCustomerAddress: 'العنوان:',
    orderCustomerCity: 'البلدية / المدينة:',
    orderTrackingNumberLabel: 'رقم التتبع (Tracking Number)',
    orderCarrierLabel: 'شركة الشحن',
    orderEstDeliveryLabel: 'تاريخ التوصيل المتوقع',
    orderNotesLabel: 'ملاحظات الشحن أو الورشة',
    orderSaveTrackingBtn: 'حفظ بيانات الشحن وتحديث الحالة',
    orderSavedTrackingSuccess: 'تم تحديث بيانات الطلبية بنجاح!',
    orderWhatsAppDispatchBtn: 'إرسال إشعار التتبع للزبون عبر واتساب',
    orderTrackingLinkCustomer: 'رابط تتبع العميل للطلبية',
    orderNoOrdersFound: 'لا توجد طلبيات مطابقة للبحث',
    orderNoOrdersDesc: 'ستظهر هنا كافة طلبيات الزبائن فور تأكيدها في المتجر العام.',

    delivTitle: 'شركات التوصيل وتسعيرات الـ 69 ولاية',
    delivSubtitle: 'تحديد أسعار التوصيل للمنزل والمكتب (StopDesk) وضبط الحد الأدنى للشحن المجاني.',
    delivTabRates: 'تسعيرات الـ 69 ولاية',
    delivTabCompanies: 'شركات الشحن الناقلة',
    delivFreeShippingThresholdLabel: 'الحد الأدنى للشحن المجاني (DZD)',
    delivFreeShippingHelp: 'إذا تجاوزت قيمة السلة هذا المبلغ، يصبح الشحن مجانياً للزبون (0 لتعطيل الميزة).',
    delivBulkUpdateTitle: 'تطبيق تسعيرة جماعية لجميع الولايات',
    delivBulkUpdateDesc: 'تحديد سعر موحد للتوصيل المنزلي والمكتبي لجميع ولايات الوطن دفعة واحدة:',
    delivBulkHomeRate: 'سعر المنزل (DZD)',
    delivBulkDeskRate: 'سعر المكتب (DZD)',
    delivBulkApplyBtn: 'تطبيق على كل الولايات',
    delivSearchWilayaPlaceholder: 'ابحث باسم أو رقم الولاية...',
    delivTableWilaya: 'الولاية (الرمز والاسم)',
    delivTableHomePrice: 'توصيل للمنزل (DZD)',
    delivTableDeskPrice: 'استلام من المكتب (StopDesk)',
    delivTableActions: 'الحالة',
    delivActiveCarrierTitle: 'شركة التوصيل المعتمدة حالياً',
    delivAddNewCarrierBtn: '+ إضافة شركة توصيل',
    delivCarrierNameLabel: 'اسم شركة التوصيل',
    delivCarrierPhoneLabel: 'هاتف خدمة العملاء / الدعم',
    delivCarrierTrackingUrlLabel: 'رابط التتبع العام (مع {TRACKING})',
    delivCarrierPrefixLabel: 'بادئة كود التتبع (Prefix)',
    delivCarrierStopDeskToggle: 'تدعم الاستلام من المكاتب (StopDesk)',
    delivSaveCarrierBtn: 'حفظ شركة التوصيل',
    delivSaveAllRatesBtn: 'حفظ كافة التسعيرات في قاعدة البيانات',
    delivRatesSavedToast: 'تم حفظ أسعار التوصيل لجميع الولايات بنجاح !',

    contentTitle: 'محتوى المتجر وهوية الورشة',
    contentSubtitle: 'تعديل النصوص، أرقام التواصل، روابط السوشيال ميديا وعناوين الورشة بسهولة.',
    contentWorkshopIdentity: 'هوية الورشة ومعلومات التواصل',
    contentStoreNameLabel: 'اسم الورشة / المتجر',
    contentTaglineLabel: 'الشعار الترويجي (Tagline)',
    contentPhoneLabel: 'رقم الهاتف الرئيسي',
    contentWhatsAppLabel: 'رقم الواتساب للطلبيات السريعة',
    contentEmailLabel: 'البريد الإلكتروني التجاري',
    contentAddressLabel: 'عنوان المقر والورشة الفعلي',
    contentOpeningHoursLabel: 'أوقات العمل واستقبال الزبائن',
    contentSocialLinks: 'حسابات التواصل الاجتماعي',
    contentFacebookLabel: 'صفحة فيسبوك',
    contentInstagramLabel: 'حساب إنستغرام',
    contentTikTokLabel: 'حساب تيك توك',
    contentB2BSection: 'إعدادات قسم الجملة (B2B)',
    contentB2BMinQtyLabel: 'الحد الأدنى للكمية بسعر الجملة (قطع)',
    contentSaveBtn: 'حفظ التعديلات في قاعدة البيانات',
    contentSavingBtn: 'جارٍ الحفظ...',
    contentSavedToast: 'تم حفظ محتوى المتجر بنجاح !',

    mediaTitle: 'مكتبة الصور السحابية',
    mediaSubtitle: 'رفع وإدارة صور الهوديز والموديلات لاستخدامها في كتالوج المنتجات.',
    mediaUploadBtn: 'رفع صورة جديدة',
    mediaAddUrlBtn: 'إضافة صورة عبر رابط خارجي',
    mediaSearchPlaceholder: 'ابحث في مكتبة الصور...',
    mediaFilterAll: 'جميع الصور',
    mediaFilterProducts: 'صور المنتجات',
    mediaFilterBanners: 'البانرات والواجهات',
    mediaFilterWorkshop: 'صور الورشة والتفصيل',
    mediaCopyUrl: 'نسخ رابط الصورة',
    mediaCopied: 'تم نسخ الرابط !',
    mediaDeleteConfirmTitle: 'حذف الصورة',
    mediaDeleteConfirmDesc: 'هل أنت متأكد من رغبتك في إزالة هذه الصورة من المكتبة؟',
    mediaNoMediaTitle: 'مكتبة الوسائط فارغة',
    mediaNoMediaDesc: 'قم برفع أول صورة لمنتجاتك للبدء في استخدامها في الكتالوج.',
    mediaUploadPrompt: 'اسحب الصور هنا أو اضغط للاختيار من جهازك',
    mediaProcessing: 'جارٍ المعالجة والرفع...',

    statusReceived: 'تم الاستلام / مؤكد',
    statusPreparing: 'قيد التجهيز في الورشة',
    statusShipped: 'تم الشحن / في الطريق',
    statusDelivered: 'تم التسليم بنجاح',
    statusCancelled: 'ملغاة',
  },

  // ==========================================================================
  // FRENCH (Français) - LTR
  // ==========================================================================
  fr: {
    langAr: 'العربية',
    langFr: 'Français',
    langEn: 'English',
    langEs: 'Español',

    adminHeaderTitle: 'DBC WORKSHOP',
    adminHeaderBadge: 'Atelier Manager',
    viewPublicStore: 'Voir la boutique',
    purgeDemoDataBtn: 'Vider les données démo',
    logoutBtn: 'Déconnexion',
    verifyingSession: 'Vérification de la session administrateur...',
    backToStore: 'Retour au site public',

    navDashboard: 'Tableau de bord',
    navProducts: 'Produits',
    navCategories: 'Catégories',
    navInventory: 'Inventaire & Stock',
    navOrders: 'Commandes (69 Wilayas)',
    navDelivery: 'Livraison & Tarifs',
    navContent: 'Contenu du site',
    navMedia: 'Médiathèque Photos',
    navSectionTitle: 'Navigation Atelier',
    alertBadge: 'Alerte',

    loginTitle: 'DBC WORKSHOP',
    loginSubtitle: "Espace d'Administration Sécurisé • Gérant",
    loginSecureAuth: 'Authentification Sécurisée',
    loginCreateAdmin: 'Création Administrateur',
    loginEmailLabel: 'Adresse Email Administrateur',
    loginEmailPlaceholder: 'admin@dbcworkshop.dz ou dbcworkshop.co@gmail.com',
    loginPasswordLabel: 'Mot de Passe',
    loginPasswordPlaceholder: '••••••••••••',
    loginManagerNameLabel: 'Nom du Gérant / Titre',
    loginManagerNamePlaceholder: 'Ex: Direction Atelier DBC',
    loginSubmitBtn: 'Accéder au Panneau Gérant',
    loginRegisterSubmitBtn: 'Créer le Compte Administrateur',
    loginVerifying: 'Vérification en cours...',
    loginSwitchToRegister: 'Premier démarrage ? Configurer le compte administrateur initial →',
    loginSwitchToLogin: '← Vous avez déjà un compte ? Se connecter',
    loginPrimaryOwnerNote: 'Compte principal propriétaire :',
    loginSecurityTitle: "Sécurité & Contrôle d'Accès",
    loginSecurityDesc: "Cette zone est strictement réservée à l'équipe de direction de l'atelier DBC Workshop. Toutes les requêtes sont protégées par Firestore.",
    loginRequiredFieldsError: 'Veuillez remplir tous les champs obligatoires.',
    loginPasswordLengthError: 'Le mot de passe doit comporter au moins 6 caractères.',

    purgeConfirmTitle: 'Vider toutes les données de démo ?',
    purgeConfirmDesc: 'Cette action supprimera définitivement de la base de données Firestore :',
    purgeItemProducts: 'Tous les produits de démo',
    purgeItemOrders: 'Toutes les commandes de test',
    purgeItemMedia: 'Toutes les photos de la médiathèque',
    purgeItemInventory: 'Tous les stocks et inventaires simulés',
    purgeWarningCleanStart: 'La base démarrera complètement vierge pour que vous puissiez saisir vos vraies données.',
    purgeCancelBtn: 'Annuler',
    purgeConfirmBtn: 'Confirmer la suppression',
    purgeProcessingBtn: 'Suppression en cours...',
    purgeSuccessToast: (p, o, m) => `Base de données vidée : ${p} produits, ${o} commandes et ${m} médias supprimés définitivement.`,

    dashExecutiveTitle: 'Tableau de Bord Exécutif',
    dashMainTitle: 'Atelier de Confection DBC Workshop',
    dashSubtitle: 'Gérez votre catalogue de confection, vos commandes des 69 wilayas et les paramètres de votre boutique.',
    dashAddProductBtn: '+ Ajouter un Produit',
    dashProcessOrdersBtn: 'Traiter les Commandes',
    dashRevenueTitle: "Chiffre d'Affaires",
    dashRevenueSubtitle: (count) => `${count} commandes enregistrées`,
    dashPendingOrdersTitle: 'Commandes à Traiter',
    dashPendingOrdersSubtitle: (count) => `${count} colis en cours d'acheminement`,
    dashCatalogItemsTitle: 'Articles au Catalogue',
    dashCatalogItemsSubtitle: (count) => `${count} publiés en ligne`,
    dashStockAlertsTitle: 'Alertes Stock',
    dashStockAlertsSubtitle: (count) => `${count} article(s) à stock faible`,
    dashRecentOrdersTitle: 'Dernières Commandes Clients (69 Wilayas)',
    dashViewAllOrders: 'Voir toutes les commandes',
    dashNoOrdersYet: 'Aucune commande client pour le moment.',
    dashShortcutsTitle: 'Raccourcis de Gestion',
    dashShortcutProducts: 'Catalogue Produits',
    dashShortcutInventory: 'Inventaire & Stocks',
    dashShortcutMedia: 'Médiathèque Photos',
    dashShortcutDelivery: 'Transporteurs & 69 Wilayas',
    dashShortcutContent: 'Contenus du Site Web',
    dashOrderItemsCount: (count) => `${count} article(s)`,
    dashHomeDelivery: 'À Domicile',
    dashDeskDelivery: 'StopDesk (Bureau)',
    dashCodPayment: 'Paiement à la livraison',
    dashBaridiMobPayment: 'BaridiMob / CCP',

    prodManagerTitle: 'Catalogue des Produits & Confection',
    prodManagerSubtitle: 'Gérez vos hoodies, joggers, t-shirts et tarification unitaire (B2C) et gros (B2B).',
    prodNewProductBtn: '+ Ajouter un Produit',
    prodSearchPlaceholder: 'Rechercher par nom, matière...',
    prodCategoryFilterAll: 'Toutes les catégories',
    prodStatusFilterAll: 'Tous les statuts',
    prodStatusFilterPublished: 'Publié en ligne',
    prodStatusFilterUnpublished: 'Brouillon masqué',
    prodTableImage: 'Visuel',
    prodTableProduct: 'Article & Modèle',
    prodTableCategory: 'Catégorie',
    prodTablePriceB2C: 'Prix Détail',
    prodTablePriceB2B: 'Prix Gros (B2B)',
    prodTableStock: 'Stock Atelier',
    prodTableStatus: 'Statut',
    prodTableActions: 'Actions',
    prodInStock: 'En stock',
    prodOutOfStock: 'Rupture',
    prodPublished: 'Publié',
    prodDraft: 'Brouillon',
    prodFeatured: 'En vedette',
    prodEditBtn: 'Modifier',
    prodDeleteBtn: 'Supprimer',
    prodNoProductsFound: 'Aucun produit trouvé',
    prodNoProductsDesc: "Le catalogue de votre atelier est vide. Ajoutez vos premières pièces de confection.",
    prodCreateNewPrompt: 'Créer le premier article',
    prodEditTitle: "Modifier l'Article",
    prodCreateTitle: 'Ajouter un Nouvel Article de Confection',
    prodBackToList: 'Retour à la liste des produits',
    prodFormName: "Nom de l'article",
    prodFormSubtitle: 'Sous-titre court (type de coupe)',
    prodFormCategory: 'Catégorie de produit',
    prodFormB2CPrice: 'Prix Détail B2C (DZD)',
    prodFormB2BPrice: 'Prix Gros B2B (DZD)',
    prodFormStockQuantity: 'Quantité en Stock Atelier',
    prodFormFabric: 'Composition & Tissu',
    prodFormFabricWeight: 'Grammage du tissu (GSM)',
    prodFormDescription: 'Description détaillée & finitions',
    prodFormSizes: 'Tailles disponibles pour cet article',
    prodFormColors: 'Coloris disponibles',
    prodFormAddColor: 'Ajouter une couleur',
    prodFormColorName: 'Nom du coloris',
    prodFormColorCode: 'Code couleur',
    prodFormAddColorBtn: 'Ajouter le coloris',
    prodFormImages: 'Photos et visuels du produit',
    prodFormAddImagePrompt: 'Ajouter une URL ou sélectionner un exemple',
    prodFormPasteImageUrl: "Coller l'URL de l'image ici...",
    prodFormAddUrlBtn: "Ajouter l'image",
    prodFormOrPickSample: 'Ou choisir parmi les visuels standards de confection :',
    prodFormVisibility: 'Visibilité & Options Boutique',
    prodFormPublishOnline: 'Publier immédiatement sur la boutique publique',
    prodFormMarkFeatured: 'Mettre en avant sur la page d’accueil',
    prodFormMarkNew: 'Afficher le badge "Nouveauté"',
    prodFormInStockToggle: 'Article disponible à la commande',
    prodFormSaveBtn: "Enregistrer l'article dans la base",
    prodFormSavingBtn: 'Enregistrement en cours...',
    prodFormCancelBtn: 'Annuler',
    prodDeleteConfirmTitle: "Confirmer la suppression de l'article",
    prodDeleteConfirmDesc: (name) => `Êtes-vous sûr de vouloir supprimer définitivement "${name}" ?`,
    prodDeleteWarning: 'Cette action est irréversible.',
    prodDeleteCancelBtn: 'Annuler',
    prodDeleteActionBtn: 'Supprimer définitivement',
    prodToastSaved: 'Article enregistré avec succès dans la base Firestore !',
    prodToastDeleted: "L'article a été supprimé avec succès.",

    catManagerTitle: 'Gestion des Catégories & Collections',
    catManagerSubtitle: 'Structurez vos lignes de confection : hoodies molletonnés, joggers, manches longues et B2B.',
    catItemsCount: (count) => `${count} article(s) associé(s)`,
    catAudienceLabel: 'Public cible :',
    catFilterProductsBtn: 'Filtrer les produits de cette catégorie →',

    invTitle: 'Inventaire & Gestion des Stocks Réels',
    invSubtitle: "Suivez les quantités de pièces physiques dans l'atelier et gérez les alertes de réapprovisionnement.",
    invSearchPlaceholder: 'Rechercher un article...',
    invFilterAllStocks: 'Tous les niveaux de stock',
    invFilterInStock: 'En stock disponible',
    invFilterLowStock: 'Stock faible (≤ 5)',
    invFilterOutOfStock: 'En rupture (0)',
    invTableArticle: 'Article',
    invTableCategory: 'Catégorie',
    invTablePrice: 'Prix',
    invTableStockQty: 'Quantité en Stock',
    invTableCustomerStatus: 'Statut Client',
    invTableQuickActions: 'Action Rapide',
    invUnits: 'unités',
    invLowStockWarning: 'Alerte stock faible',
    invOutOfStockWarning: 'Rupture de stock',
    invMarkInStock: 'Marquer En Stock',
    invMarkOutOfStock: 'Marquer Épuisé',
    invNoItemsFound: 'Aucun article dans l’inventaire',
    invNoItemsDesc: "L'inventaire est vide. Créez vos articles dans l'onglet Produits pour suivre vos stocks réels.",

    orderManagerTitle: 'Gestion des Commandes & Expéditions',
    orderManagerSubtitle: 'Traitez les commandes clients et grossistes sur les 69 wilayas, mettez à jour les suivis et notifiez via WhatsApp.',
    orderSearchPlaceholder: 'Rechercher par n° de commande, client, téléphone ou wilaya...',
    orderFilterAllStatuses: 'Tous les statuts',
    orderFilterPending: 'En Préparation / Atelier',
    orderFilterShipped: 'Expédié / En Livraison',
    orderFilterDelivered: 'Livré / Clôturé',
    orderFilterCancelled: 'Annulé',
    orderKpiTotalOrders: 'Total Commandes',
    orderKpiPending: 'En Préparation',
    orderKpiShipped: 'En Livraison',
    orderKpiDelivered: 'Livrées',
    orderKpiRevenue: "Chiffre d'Affaires",
    orderTableOrderNo: 'N° Commande',
    orderTableDate: 'Date',
    orderTableCustomer: 'Client',
    orderTableWilaya: 'Wilaya',
    orderTableItems: 'Articles',
    orderTableDelivery: 'Mode Livraison',
    orderTablePayment: 'Paiement',
    orderTableTotal: 'Total',
    orderTableStatus: 'Statut',
    orderTableAction: 'Mettre à jour',
    orderDetailTitle: "Détails de la Commande & Expédition",
    orderCustomerInfo: 'Coordonnées du Destinataire',
    orderCustomerPhone: 'Téléphone :',
    orderCustomerAddress: 'Adresse :',
    orderCustomerCity: 'Commune / Ville :',
    orderTrackingNumberLabel: 'Numéro de Suivi Colis (Tracking)',
    orderCarrierLabel: 'Transporteur Associé',
    orderEstDeliveryLabel: 'Date Estimée de Livraison',
    orderNotesLabel: 'Notes internes / instructions pour livreur',
    orderSaveTrackingBtn: 'Mettre à jour le suivi et le statut',
    orderSavedTrackingSuccess: 'Informations de suivi enregistrées avec succès !',
    orderWhatsAppDispatchBtn: "Notifier le client par WhatsApp avec le numéro de suivi",
    orderTrackingLinkCustomer: 'Lien direct de suivi client',
    orderNoOrdersFound: 'Aucune commande trouvée',
    orderNoOrdersDesc: 'Les commandes passées par vos clients apparaîtront ici en temps réel.',

    delivTitle: 'Transporteurs & Grille Tarifaire 69 Wilayas',
    delivSubtitle: 'Configurez vos tarifs de livraison à domicile et StopDesk ainsi que vos prestataires logistiques.',
    delivTabRates: 'Grille Tarifaire 69 Wilayas',
    delivTabCompanies: 'Sociétés de Livraison',
    delivFreeShippingThresholdLabel: 'Seuil de Livraison Gratuite (DZD)',
    delivFreeShippingHelp: 'Si le panier dépasse ce montant, les frais de port sont offerts au client (0 pour désactiver).',
    delivBulkUpdateTitle: 'Mise à Jour Groupée des Tarifs',
    delivBulkUpdateDesc: 'Appliquer un tarif standard à l’ensemble des 69 wilayas en une seule opération :',
    delivBulkHomeRate: 'Tarif Domicile (DZD)',
    delivBulkDeskRate: 'Tarif StopDesk (DZD)',
    delivBulkApplyBtn: 'Appliquer à toutes les wilayas',
    delivSearchWilayaPlaceholder: 'Rechercher par numéro ou nom de wilaya...',
    delivTableWilaya: 'Wilaya (Code & Nom)',
    delivTableHomePrice: 'Livraison Domicile (DZD)',
    delivTableDeskPrice: 'StopDesk Bureau (DZD)',
    delivTableActions: 'Statut',
    delivActiveCarrierTitle: 'Société de Livraison Active',
    delivAddNewCarrierBtn: '+ Ajouter un Transporteur',
    delivCarrierNameLabel: 'Nom du Transporteur',
    delivCarrierPhoneLabel: 'Téléphone du Service Client',
    delivCarrierTrackingUrlLabel: 'URL du Suivi Web (avec {TRACKING})',
    delivCarrierPrefixLabel: 'Préfixe habituel des colis',
    delivCarrierStopDeskToggle: 'Propose le service StopDesk (Bureau)',
    delivSaveCarrierBtn: 'Enregistrer le transporteur',
    delivSaveAllRatesBtn: 'Enregistrer la grille tarifaire dans Firestore',
    delivRatesSavedToast: 'Grille tarifaire enregistrée avec succès !',

    contentTitle: 'Contenus du Site Web & Vitrine Atelier',
    contentSubtitle: 'Personnalisez les coordonnées, coordonnées WhatsApp, bannières et réseaux sociaux sans toucher au code.',
    contentWorkshopIdentity: "Identité de l'Atelier & Contact",
    contentStoreNameLabel: "Nom de l'enseigne",
    contentTaglineLabel: 'Slogan / Accroche',
    contentPhoneLabel: 'Numéro de Téléphone Principal',
    contentWhatsAppLabel: 'Numéro WhatsApp pour commandes rapides',
    contentEmailLabel: 'Email Professionnel',
    contentAddressLabel: "Adresse Physique de l'Atelier",
    contentOpeningHoursLabel: "Horaires d'Ouverture",
    contentSocialLinks: 'Réseaux Sociaux',
    contentFacebookLabel: 'Lien Facebook',
    contentInstagramLabel: 'Lien Instagram',
    contentTikTokLabel: 'Lien TikTok',
    contentB2BSection: 'Paramètres Section Vente en Gros (B2B)',
    contentB2BMinQtyLabel: 'Quantité minimale tarif grossiste (pièces)',
    contentSaveBtn: 'Enregistrer dans la base Firestore',
    contentSavingBtn: 'Enregistrement en cours...',
    contentSavedToast: 'Contenu du site et coordonnées enregistrés !',

    mediaTitle: 'Médiathèque Photos Séquentielles',
    mediaSubtitle: "Gérez les photos d'atelier, modèles portés et visuels pour vos fiches produits.",
    mediaUploadBtn: 'Uploader une image',
    mediaAddUrlBtn: 'Ajouter par URL externe',
    mediaSearchPlaceholder: 'Rechercher dans les photos...',
    mediaFilterAll: 'Tous les fichiers',
    mediaFilterProducts: 'Photos Produits',
    mediaFilterBanners: 'Bannières & Accueil',
    mediaFilterWorkshop: 'Atelier & Confection',
    mediaCopyUrl: "Copier l'URL",
    mediaCopied: 'Lien copié !',
    mediaDeleteConfirmTitle: "Supprimer l'image",
    mediaDeleteConfirmDesc: 'Êtes-vous sûr de vouloir supprimer cette image de la médiathèque ?',
    mediaNoMediaTitle: 'Médiathèque vide',
    mediaNoMediaDesc: 'Téléversez vos photos pour les associer à vos fiches produits.',
    mediaUploadPrompt: 'Glissez des photos ici ou cliquez pour parcourir vos fichiers',
    mediaProcessing: 'Traitement et optimisation en cours...',

    statusReceived: 'Reçu / Confirmé',
    statusPreparing: 'En Préparation / Atelier',
    statusShipped: 'Expédié / En Livraison',
    statusDelivered: 'Livré / Completed',
    statusCancelled: 'Annulé',
  },

  // ==========================================================================
  // ENGLISH - LTR
  // ==========================================================================
  en: {
    langAr: 'العربية',
    langFr: 'Français',
    langEn: 'English',
    langEs: 'Español',

    adminHeaderTitle: 'DBC WORKSHOP',
    adminHeaderBadge: 'Workshop Manager',
    viewPublicStore: 'View Store',
    purgeDemoDataBtn: 'Purge Demo Data',
    logoutBtn: 'Logout',
    verifyingSession: 'Verifying administrator session...',
    backToStore: 'Back to public store',

    navDashboard: 'Dashboard',
    navProducts: 'Products',
    navCategories: 'Categories',
    navInventory: 'Inventory & Stock',
    navOrders: 'Orders (69 Wilayas)',
    navDelivery: 'Delivery & Rates',
    navContent: 'Site Content',
    navMedia: 'Photo Library',
    navSectionTitle: 'Workshop Navigation',
    alertBadge: 'Alert',

    loginTitle: 'DBC WORKSHOP',
    loginSubtitle: 'Secure Administration Area • Workshop Manager',
    loginSecureAuth: 'Secure Authentication',
    loginCreateAdmin: 'Create Admin Account',
    loginEmailLabel: 'Administrator Email Address',
    loginEmailPlaceholder: 'admin@dbcworkshop.dz or dbcworkshop.co@gmail.com',
    loginPasswordLabel: 'Password',
    loginPasswordPlaceholder: '••••••••••••',
    loginManagerNameLabel: 'Manager Name / Title',
    loginManagerNamePlaceholder: 'E.g., DBC Workshop Lead',
    loginSubmitBtn: 'Sign In to Manager Panel',
    loginRegisterSubmitBtn: 'Create Administrator Account',
    loginVerifying: 'Verifying...',
    loginSwitchToRegister: 'First launch? Set up the initial administrator account →',
    loginSwitchToLogin: '← Already have an account? Sign in',
    loginPrimaryOwnerNote: 'Primary owner account:',
    loginSecurityTitle: 'Security & Access Control',
    loginSecurityDesc: 'This area is strictly reserved for the DBC Workshop management team. All requests are protected by Firestore security rules.',
    loginRequiredFieldsError: 'Please fill in all required fields.',
    loginPasswordLengthError: 'Password must be at least 6 characters.',

    purgeConfirmTitle: 'Purge all demo data?',
    purgeConfirmDesc: 'This action will permanently delete from the Firestore database:',
    purgeItemProducts: 'All demo products',
    purgeItemOrders: 'All sample/test orders',
    purgeItemMedia: 'All demo media library photos',
    purgeItemInventory: 'All simulated stock quantities',
    purgeWarningCleanStart: 'The database will start completely empty so you can input your real workshop inventory and orders.',
    purgeCancelBtn: 'Cancel',
    purgeConfirmBtn: 'Confirm Purge',
    purgeProcessingBtn: 'Purging in progress...',
    purgeSuccessToast: (p, o, m) => `Database cleared: ${p} products, ${o} orders, and ${m} media files permanently deleted.`,

    dashExecutiveTitle: 'Executive Dashboard',
    dashMainTitle: 'DBC Apparel Manufacturing Workshop',
    dashSubtitle: 'Manage your apparel catalog, monitor nationwide 69 wilaya deliveries, and customize workshop settings.',
    dashAddProductBtn: '+ Add Product',
    dashProcessOrdersBtn: 'Process Orders',
    dashRevenueTitle: 'Total Revenue',
    dashRevenueSubtitle: (count) => `${count} registered orders`,
    dashPendingOrdersTitle: 'Pending Orders',
    dashPendingOrdersSubtitle: (count) => `${count} packages in transit`,
    dashCatalogItemsTitle: 'Catalog Articles',
    dashCatalogItemsSubtitle: (count) => `${count} published online`,
    dashStockAlertsTitle: 'Stock Alerts',
    dashStockAlertsSubtitle: (count) => `${count} item(s) running low`,
    dashRecentOrdersTitle: 'Recent Customer Orders (69 Wilayas)',
    dashViewAllOrders: 'View all orders',
    dashNoOrdersYet: 'No customer orders placed yet.',
    dashShortcutsTitle: 'Quick Management Shortcuts',
    dashShortcutProducts: 'Product Catalog',
    dashShortcutInventory: 'Inventory & Stocks',
    dashShortcutMedia: 'Photo Library',
    dashShortcutDelivery: 'Carriers & 69 Wilayas',
    dashShortcutContent: 'Website Content',
    dashOrderItemsCount: (count) => `${count} item(s)`,
    dashHomeDelivery: 'Home Delivery',
    dashDeskDelivery: 'StopDesk (Office Pickup)',
    dashCodPayment: 'Cash on Delivery',
    dashBaridiMobPayment: 'BaridiMob / CCP',

    prodManagerTitle: 'Product Catalog & Workshop Lines',
    prodManagerSubtitle: 'Manage heavyweight hoodies, joggers, tees, and retail (B2C) & wholesale (B2B) pricing.',
    prodNewProductBtn: '+ Add Product',
    prodSearchPlaceholder: 'Search by title, fabric...',
    prodCategoryFilterAll: 'All Categories',
    prodStatusFilterAll: 'All Statuses',
    prodStatusFilterPublished: 'Published Online',
    prodStatusFilterUnpublished: 'Draft (Hidden)',
    prodTableImage: 'Photo',
    prodTableProduct: 'Article & Model',
    prodTableCategory: 'Category',
    prodTablePriceB2C: 'Retail Price',
    prodTablePriceB2B: 'Wholesale (B2B)',
    prodTableStock: 'Workshop Stock',
    prodTableStatus: 'Status',
    prodTableActions: 'Actions',
    prodInStock: 'In Stock',
    prodOutOfStock: 'Out of Stock',
    prodPublished: 'Published',
    prodDraft: 'Draft',
    prodFeatured: 'Featured',
    prodEditBtn: 'Edit',
    prodDeleteBtn: 'Delete',
    prodNoProductsFound: 'No matching products found',
    prodNoProductsDesc: 'Your workshop catalog is currently empty. Add your first crafted garments.',
    prodCreateNewPrompt: 'Create First Garment',
    prodEditTitle: 'Edit Garment & Prices',
    prodCreateTitle: 'Add New Workshop Garment',
    prodBackToList: 'Back to products list',
    prodFormName: 'Garment Title',
    prodFormSubtitle: 'Short subtitle (fit style)',
    prodFormCategory: 'Product Category',
    prodFormB2CPrice: 'Retail Price B2C (DZD)',
    prodFormB2BPrice: 'Wholesale Price B2B (DZD)',
    prodFormStockQuantity: 'Workshop Stock Quantity',
    prodFormFabric: 'Fabric Composition',
    prodFormFabricWeight: 'Fabric Weight (GSM)',
    prodFormDescription: 'Detailed description & craftsmanship',
    prodFormSizes: 'Available Sizes for this article',
    prodFormColors: 'Available Colors',
    prodFormAddColor: 'Add new color',
    prodFormColorName: 'Color name',
    prodFormColorCode: 'Color hex code',
    prodFormAddColorBtn: 'Add Color',
    prodFormImages: 'Product Photos & Visuals',
    prodFormAddImagePrompt: 'Add an image URL or choose a sample',
    prodFormPasteImageUrl: 'Paste image URL here...',
    prodFormAddUrlBtn: 'Add URL',
    prodFormOrPickSample: 'Or choose from workshop presets:',
    prodFormVisibility: 'Store Visibility & Badges',
    prodFormPublishOnline: 'Publish immediately to public store',
    prodFormMarkFeatured: 'Feature on store homepage',
    prodFormMarkNew: 'Display "New Arrival" badge',
    prodFormInStockToggle: 'Item available for immediate customer orders',
    prodFormSaveBtn: 'Save Garment to Database',
    prodFormSavingBtn: 'Saving...',
    prodFormCancelBtn: 'Cancel',
    prodDeleteConfirmTitle: 'Confirm Garment Deletion',
    prodDeleteConfirmDesc: (name) => `Are you sure you want to permanently delete "${name}"?`,
    prodDeleteWarning: 'This action cannot be undone.',
    prodDeleteCancelBtn: 'Cancel',
    prodDeleteActionBtn: 'Permanently Delete',
    prodToastSaved: 'Garment saved successfully to Firestore database!',
    prodToastDeleted: 'Garment deleted successfully.',

    catManagerTitle: 'Categories & Collection Lines',
    catManagerSubtitle: 'Organize workshop manufacturing lines: Heavyweight hoodies, joggers, thermal waffle longsleeves, and B2B wholesale.',
    catItemsCount: (count) => `${count} linked item(s)`,
    catAudienceLabel: 'Target Audience:',
    catFilterProductsBtn: 'Filter products in this category →',

    invTitle: 'Inventory & Real Workshop Stocks',
    invSubtitle: 'Track real inventory levels in the atelier and manage replenishment alerts to prevent stockouts.',
    invSearchPlaceholder: 'Search inventory items...',
    invFilterAllStocks: 'All Stock Levels',
    invFilterInStock: 'In Stock',
    invFilterLowStock: 'Low Stock (≤ 5)',
    invFilterOutOfStock: 'Out of Stock (0)',
    invTableArticle: 'Article',
    invTableCategory: 'Category',
    invTablePrice: 'Price',
    invTableStockQty: 'Stock Quantity',
    invTableCustomerStatus: 'Customer Status',
    invTableQuickActions: 'Quick Action',
    invUnits: 'units',
    invLowStockWarning: 'Low stock alert',
    invOutOfStockWarning: 'Out of stock',
    invMarkInStock: 'Mark In Stock',
    invMarkOutOfStock: 'Mark Out of Stock',
    invNoItemsFound: 'Inventory is empty or no match found',
    invNoItemsDesc: 'Add articles in the Products tab to begin monitoring your real workshop inventory.',

    orderManagerTitle: 'Orders & Dispatch Management',
    orderManagerSubtitle: 'Fulfill customer and wholesale orders across all 69 wilayas, issue tracking links, and dispatch WhatsApp updates.',
    orderSearchPlaceholder: 'Search by order #, customer name, phone, or wilaya...',
    orderFilterAllStatuses: 'All Statuses',
    orderFilterPending: 'In Preparation / Workshop',
    orderFilterShipped: 'Shipped / In Transit',
    orderFilterDelivered: 'Delivered / Completed',
    orderFilterCancelled: 'Cancelled',
    orderKpiTotalOrders: 'Total Orders',
    orderKpiPending: 'In Prep',
    orderKpiShipped: 'In Transit',
    orderKpiDelivered: 'Delivered',
    orderKpiRevenue: 'Total Revenue',
    orderTableOrderNo: 'Order #',
    orderTableDate: 'Date',
    orderTableCustomer: 'Customer',
    orderTableWilaya: 'Wilaya',
    orderTableItems: 'Items',
    orderTableDelivery: 'Delivery',
    orderTablePayment: 'Payment',
    orderTableTotal: 'Total',
    orderTableStatus: 'Status',
    orderTableAction: 'Update',
    orderDetailTitle: 'Order Details & Shipping Dispatch',
    orderCustomerInfo: 'Customer Contact Details',
    orderCustomerPhone: 'Phone:',
    orderCustomerAddress: 'Address:',
    orderCustomerCity: 'City / Commune:',
    orderTrackingNumberLabel: 'Carrier Tracking Number',
    orderCarrierLabel: 'Assigned Carrier',
    orderEstDeliveryLabel: 'Estimated Delivery Date',
    orderNotesLabel: 'Internal workshop & driver notes',
    orderSaveTrackingBtn: 'Save Tracking & Update Status',
    orderSavedTrackingSuccess: 'Tracking and order details updated successfully!',
    orderWhatsAppDispatchBtn: 'Notify customer via WhatsApp with tracking details',
    orderTrackingLinkCustomer: 'Direct customer tracking link',
    orderNoOrdersFound: 'No matching orders found',
    orderNoOrdersDesc: 'Customer orders will appear here in real-time as they are placed.',

    delivTitle: 'Carriers & 69 Wilayas Delivery Rates',
    delivSubtitle: 'Configure Home and StopDesk delivery tariffs, manage delivery partners, and set free shipping thresholds.',
    delivTabRates: '69 Wilayas Rates',
    delivTabCompanies: 'Delivery Partners',
    delivFreeShippingThresholdLabel: 'Free Shipping Threshold (DZD)',
    delivFreeShippingHelp: 'When cart total exceeds this value, delivery becomes free for the customer (0 to disable).',
    delivBulkUpdateTitle: 'Bulk Update All 69 Wilayas',
    delivBulkUpdateDesc: 'Apply a standard flat rate across all 69 Algerian wilayas in a single click:',
    delivBulkHomeRate: 'Home Delivery Rate (DZD)',
    delivBulkDeskRate: 'StopDesk Rate (DZD)',
    delivBulkApplyBtn: 'Apply to All Wilayas',
    delivSearchWilayaPlaceholder: 'Search by wilaya code or name...',
    delivTableWilaya: 'Wilaya (Code & Name)',
    delivTableHomePrice: 'Home Delivery (DZD)',
    delivTableDeskPrice: 'StopDesk Pickup (DZD)',
    delivTableActions: 'Status',
    delivActiveCarrierTitle: 'Currently Active Delivery Partner',
    delivAddNewCarrierBtn: '+ Add Carrier Partner',
    delivCarrierNameLabel: 'Carrier Name',
    delivCarrierPhoneLabel: 'Customer Support Phone',
    delivCarrierTrackingUrlLabel: 'Online Tracking URL (with {TRACKING})',
    delivCarrierPrefixLabel: 'Standard parcel prefix',
    delivCarrierStopDeskToggle: 'Supports StopDesk (Office Pickup)',
    delivSaveCarrierBtn: 'Save Carrier Partner',
    delivSaveAllRatesBtn: 'Save All Rates to Firestore Database',
    delivRatesSavedToast: 'Delivery tariffs saved successfully!',

    contentTitle: 'Website Content & Storefront Profile',
    contentSubtitle: 'Edit brand tagline, contact phone numbers, WhatsApp, opening hours, and social media channels.',
    contentWorkshopIdentity: 'Workshop Identity & Contacts',
    contentStoreNameLabel: 'Workshop Name',
    contentTaglineLabel: 'Tagline / Slogan',
    contentPhoneLabel: 'Primary Phone Number',
    contentWhatsAppLabel: 'WhatsApp Number for Quick Orders',
    contentEmailLabel: 'Business Email',
    contentAddressLabel: 'Workshop Physical Address',
    contentOpeningHoursLabel: 'Opening Hours',
    contentSocialLinks: 'Social Media Channels',
    contentFacebookLabel: 'Facebook Page',
    contentInstagramLabel: 'Instagram Account',
    contentTikTokLabel: 'TikTok Profile',
    contentB2BSection: 'Wholesale (B2B) Settings',
    contentB2BMinQtyLabel: 'Minimum quantity for wholesale price (units)',
    contentSaveBtn: 'Save to Firestore Database',
    contentSavingBtn: 'Saving...',
    contentSavedToast: 'Website content and contact information saved!',

    mediaTitle: 'Cloud Media & Photo Library',
    mediaSubtitle: 'Upload and organize workshop photos, product shots, and banner visuals.',
    mediaUploadBtn: 'Upload New Photo',
    mediaAddUrlBtn: 'Add Photo via URL',
    mediaSearchPlaceholder: 'Search media files...',
    mediaFilterAll: 'All Media',
    mediaFilterProducts: 'Product Visuals',
    mediaFilterBanners: 'Banners & Hero',
    mediaFilterWorkshop: 'Workshop & Craft',
    mediaCopyUrl: 'Copy Image URL',
    mediaCopied: 'URL Copied!',
    mediaDeleteConfirmTitle: 'Delete Photo',
    mediaDeleteConfirmDesc: 'Are you sure you want to delete this photo from your media library?',
    mediaNoMediaTitle: 'Media library is empty',
    mediaNoMediaDesc: 'Upload your photos to attach them to garments in the catalog.',
    mediaUploadPrompt: 'Drag & drop photos here or click to browse files',
    mediaProcessing: 'Processing and optimizing image...',

    statusReceived: 'Received / Confirmed',
    statusPreparing: 'In Preparation / Workshop',
    statusShipped: 'Shipped / In Transit',
    statusDelivered: 'Delivered / Completed',
    statusCancelled: 'Cancelled',
  },

  // ==========================================================================
  // SPANISH (Español) - LTR
  // ==========================================================================
  es: {
    langAr: 'العربية',
    langFr: 'Français',
    langEn: 'English',
    langEs: 'Español',

    adminHeaderTitle: 'DBC WORKSHOP',
    adminHeaderBadge: 'Administración Taller',
    viewPublicStore: 'Ver Tienda',
    purgeDemoDataBtn: 'Vaciar Datos Demo',
    logoutBtn: 'Cerrar Sesión',
    verifyingSession: 'Verificando sesión de administrador...',
    backToStore: 'Volver a la tienda pública',

    navDashboard: 'Panel de Control',
    navProducts: 'Productos',
    navCategories: 'Categorías',
    navInventory: 'Inventario y Stock',
    navOrders: 'Pedidos (69 Wilayas)',
    navDelivery: 'Envíos y Tarifas',
    navContent: 'Contenido Web',
    navMedia: 'Fototeca y Medios',
    navSectionTitle: 'Navegación del Taller',
    alertBadge: 'Alerta',

    loginTitle: 'DBC WORKSHOP',
    loginSubtitle: 'Área de Administración Segura • Gerencia',
    loginSecureAuth: 'Autenticación Segura',
    loginCreateAdmin: 'Crear Cuenta de Administrador',
    loginEmailLabel: 'Correo Electrónico de Administración',
    loginEmailPlaceholder: 'admin@dbcworkshop.dz o dbcworkshop.co@gmail.com',
    loginPasswordLabel: 'Contraseña',
    loginPasswordPlaceholder: '••••••••••••',
    loginManagerNameLabel: 'Nombre del Gerente / Cargo',
    loginManagerNamePlaceholder: 'Ej: Dirección Taller DBC',
    loginSubmitBtn: 'Acceder al Panel de Control',
    loginRegisterSubmitBtn: 'Crear Cuenta de Administrador',
    loginVerifying: 'Verificando...',
    loginSwitchToRegister: '¿Primer inicio? Configurar la cuenta inicial de administrador →',
    loginSwitchToLogin: '← ¿Ya tienes una cuenta? Iniciar sesión',
    loginPrimaryOwnerNote: 'Cuenta principal de propietario:',
    loginSecurityTitle: 'Seguridad y Control de Acceso',
    loginSecurityDesc: 'Área estrictamente reservada al equipo de dirección de DBC Workshop. Todas las operaciones están protegidas por reglas Firestore.',
    loginRequiredFieldsError: 'Por favor, rellene todos los campos obligatorios.',
    loginPasswordLengthError: 'La contraseña debe contener al menos 6 caracteres.',

    purgeConfirmTitle: '¿Vaciar todos los datos de demostración?',
    purgeConfirmDesc: 'Esta acción eliminará de forma permanente de la base de datos Firestore:',
    purgeItemProducts: 'Todos los productos de muestra',
    purgeItemOrders: 'Todos los pedidos de prueba',
    purgeItemMedia: 'Todas las imágenes de la fototeca',
    purgeItemInventory: 'Todas las existencias e inventarios simulados',
    purgeWarningCleanStart: 'La base de datos quedará completamente limpia para registrar sus productos y pedidos reales.',
    purgeCancelBtn: 'Cancelar',
    purgeConfirmBtn: 'Confirmar Eliminación',
    purgeProcessingBtn: 'Eliminando datos...',
    purgeSuccessToast: (p, o, m) => `Base de datos vaciada: ${p} productos, ${o} pedidos y ${m} archivos multimedia eliminados.`,

    dashExecutiveTitle: 'Panel Ejecutivo del Taller',
    dashMainTitle: 'Taller de Confección Textil DBC Workshop',
    dashSubtitle: 'Gestione su catálogo de prendas, supervise envíos a las 69 wilayas y configure su tienda.',
    dashAddProductBtn: '+ Añadir Producto',
    dashProcessOrdersBtn: 'Procesar Pedidos',
    dashRevenueTitle: 'Ingresos Totales',
    dashRevenueSubtitle: (count) => `${count} pedidos registrados`,
    dashPendingOrdersTitle: 'Pedidos por Gestionar',
    dashPendingOrdersSubtitle: (count) => `${count} paquetes en camino`,
    dashCatalogItemsTitle: 'Artículos en Catálogo',
    dashCatalogItemsSubtitle: (count) => `${count} publicados en la tienda`,
    dashStockAlertsTitle: 'Alertas de Stock',
    dashStockAlertsSubtitle: (count) => `${count} artículo(s) con stock bajo`,
    dashRecentOrdersTitle: 'Últimos Pedidos de Clientes (69 Wilayas)',
    dashViewAllOrders: 'Ver todos los pedidos',
    dashNoOrdersYet: 'No hay pedidos de clientes registrados por el momento.',
    dashShortcutsTitle: 'Accesos Rápidos de Gestión',
    dashShortcutProducts: 'Catálogo de Productos',
    dashShortcutInventory: 'Inventario y Existencias',
    dashShortcutMedia: 'Fototeca y Medios',
    dashShortcutDelivery: 'Empresas de Envío y Tarifas',
    dashShortcutContent: 'Contenidos del Sitio Web',
    dashOrderItemsCount: (count) => `${count} artículo(s)`,
    dashHomeDelivery: 'A Domicilio',
    dashDeskDelivery: 'Recogida en Oficina (StopDesk)',
    dashCodPayment: 'Contra Reembolso',
    dashBaridiMobPayment: 'BaridiMob / CCP',

    prodManagerTitle: 'Catálogo de Prendas y Confección',
    prodManagerSubtitle: 'Gestione hoodies gruesos, joggers, camisetas y tarifas para particulares (B2C) y mayoristas (B2B).',
    prodNewProductBtn: '+ Añadir Producto',
    prodSearchPlaceholder: 'Buscar por nombre, tejido...',
    prodCategoryFilterAll: 'Todas las categorías',
    prodStatusFilterAll: 'Todos los estados',
    prodStatusFilterPublished: 'Publicado en línea',
    prodStatusFilterUnpublished: 'Borrador oculto',
    prodTableImage: 'Foto',
    prodTableProduct: 'Artículo y Modelo',
    prodTableCategory: 'Categoría',
    prodTablePriceB2C: 'Precio Detalle',
    prodTablePriceB2B: 'Precio Mayorista',
    prodTableStock: 'Stock Taller',
    prodTableStatus: 'Estado',
    prodTableActions: 'Acciones',
    prodInStock: 'En stock',
    prodOutOfStock: 'Agotado',
    prodPublished: 'Publicado',
    prodDraft: 'Borrador',
    prodFeatured: 'Destacado',
    prodEditBtn: 'Modificar',
    prodDeleteBtn: 'Eliminar',
    prodNoProductsFound: 'No se encontraron productos',
    prodNoProductsDesc: 'El catálogo del taller está vacío. Añada sus primeras creaciones textiles.',
    prodCreateNewPrompt: 'Crear Primera Prenda',
    prodEditTitle: 'Modificar Prenda y Precios',
    prodCreateTitle: 'Añadir Nueva Prenda al Catálogo',
    prodBackToList: 'Volver al catálogo',
    prodFormName: 'Nombre de la prenda',
    prodFormSubtitle: 'Subtítulo breve (tipo de corte)',
    prodFormCategory: 'Categoría de producto',
    prodFormB2CPrice: 'Precio Minorista B2C (DZD)',
    prodFormB2BPrice: 'Precio Mayorista B2B (DZD)',
    prodFormStockQuantity: 'Cantidad en Stock del Taller',
    prodFormFabric: 'Composición y Tejido',
    prodFormFabricWeight: 'Gramaje del tejido (GSM)',
    prodFormDescription: 'Descripción detallada y acabados',
    prodFormSizes: 'Tallas disponibles para esta prenda',
    prodFormColors: 'Colores disponibles',
    prodFormAddColor: 'Añadir nuevo color',
    prodFormColorName: 'Nombre del color',
    prodFormColorCode: 'Código de color',
    prodFormAddColorBtn: 'Añadir Color',
    prodFormImages: 'Fotos y visuales de la prenda',
    prodFormAddImagePrompt: 'Añada una URL de imagen o seleccione una muestra',
    prodFormPasteImageUrl: 'Pegue la URL de la imagen aquí...',
    prodFormAddUrlBtn: 'Añadir URL',
    prodFormOrPickSample: 'O seleccione entre las muestras del taller:',
    prodFormVisibility: 'Visibilidad y Opciones de Tienda',
    prodFormPublishOnline: 'Publicar inmediatamente en la tienda pública',
    prodFormMarkFeatured: 'Destacar en la página de inicio',
    prodFormMarkNew: 'Mostrar etiqueta "Novedad"',
    prodFormInStockToggle: 'Prenda disponible para pedidos inmediatos',
    prodFormSaveBtn: 'Guardar Prenda en la Base de Datos',
    prodFormSavingBtn: 'Guardando...',
    prodFormCancelBtn: 'Cancelar',
    prodDeleteConfirmTitle: 'Confirmar Eliminación de la Prenda',
    prodDeleteConfirmDesc: (name) => `¿Está seguro de que desea eliminar definitivamente "${name}"?`,
    prodDeleteWarning: 'Esta acción no se puede deshacer.',
    prodDeleteCancelBtn: 'Cancelar',
    prodDeleteActionBtn: 'Eliminar Definitivamente',
    prodToastSaved: '¡Prenda guardada con éxito en la base Firestore!',
    prodToastDeleted: 'La prenda ha sido eliminada con éxito.',

    catManagerTitle: 'Categorías y Líneas de Confección',
    catManagerSubtitle: 'Organice sus líneas de producción: Hoodies de felpa gruesa, joggers, camisetas térmicas y pedidos B2B.',
    catItemsCount: (count) => `${count} prenda(s) asociada(s)`,
    catAudienceLabel: 'Público objetivo:',
    catFilterProductsBtn: 'Filtrar productos de esta categoría →',

    invTitle: 'Inventario y Existencias Reales',
    invSubtitle: 'Supervise las existencias de prendas en el taller y configure alertas para evitar roturas de stock.',
    invSearchPlaceholder: 'Buscar un artículo en el inventario...',
    invFilterAllStocks: 'Todos los niveles',
    invFilterInStock: 'En stock disponible',
    invFilterLowStock: 'Stock bajo (≤ 5)',
    invFilterOutOfStock: 'Agotado (0)',
    invTableArticle: 'Artículo',
    invTableCategory: 'Categoría',
    invTablePrice: 'Precio',
    invTableStockQty: 'Cantidad en Stock',
    invTableCustomerStatus: 'Estado Tienda',
    invTableQuickActions: 'Acción Rápida',
    invUnits: 'unidades',
    invLowStockWarning: 'Alerta de stock bajo',
    invOutOfStockWarning: 'Agotado',
    invMarkInStock: 'Marcar Disponible',
    invMarkOutOfStock: 'Marcar Agotado',
    invNoItemsFound: 'El inventario está vacío o sin coincidencias',
    invNoItemsDesc: 'Añada productos en la pestaña correspondiente para gestionar sus existencias reales.',

    orderManagerTitle: 'Gestión de Pedidos y Envíos',
    orderManagerSubtitle: 'Tramite pedidos de particulares y mayoristas en las 69 wilayas, asigne seguimiento y notifique por WhatsApp.',
    orderSearchPlaceholder: 'Buscar por n° de pedido, cliente, teléfono o wilaya...',
    orderFilterAllStatuses: 'Todos los estados',
    orderFilterPending: 'En Preparación / Taller',
    orderFilterShipped: 'Enviado / En Reparto',
    orderFilterDelivered: 'Entregado / Completado',
    orderFilterCancelled: 'Cancelado',
    orderKpiTotalOrders: 'Total Pedidos',
    orderKpiPending: 'En Preparación',
    orderKpiShipped: 'En Reparto',
    orderKpiDelivered: 'Entregados',
    orderKpiRevenue: 'Ingresos Totales',
    orderTableOrderNo: 'N° Pedido',
    orderTableDate: 'Fecha',
    orderTableCustomer: 'Cliente',
    orderTableWilaya: 'Wilaya',
    orderTableItems: 'Artículos',
    orderTableDelivery: 'Envío',
    orderTablePayment: 'Pago',
    orderTableTotal: 'Total',
    orderTableStatus: 'Estado',
    orderTableAction: 'Actualizar',
    orderDetailTitle: 'Detalles del Pedido y Envío',
    orderCustomerInfo: 'Datos del Destinatario',
    orderCustomerPhone: 'Teléfono:',
    orderCustomerAddress: 'Dirección:',
    orderCustomerCity: 'Ciudad / Municipio:',
    orderTrackingNumberLabel: 'Número de Seguimiento (Tracking)',
    orderCarrierLabel: 'Empresa de Transporte',
    orderEstDeliveryLabel: 'Fecha Estimada de Entrega',
    orderNotesLabel: 'Notas internas del taller / repartidor',
    orderSaveTrackingBtn: 'Guardar Seguimiento y Actualizar Estado',
    orderSavedTrackingSuccess: '¡Información de envío actualizada con éxito!',
    orderWhatsAppDispatchBtn: 'Notificar al cliente por WhatsApp con el n° de seguimiento',
    orderTrackingLinkCustomer: 'Enlace directo de seguimiento del cliente',
    orderNoOrdersFound: 'No se encontraron pedidos',
    orderNoOrdersDesc: 'Los pedidos realizados por los clientes se mostrarán aquí en tiempo real.',

    delivTitle: 'Empresas de Envío y Tarifas para 69 Wilayas',
    delivSubtitle: 'Configure las tarifas de entrega a domicilio y StopDesk, y fije el umbral de envío gratuito.',
    delivTabRates: 'Tarifas 69 Wilayas',
    delivTabCompanies: 'Empresas de Envío',
    delivFreeShippingThresholdLabel: 'Umbral de Envío Gratuito (DZD)',
    delivFreeShippingHelp: 'Si el pedido supera esta cantidad, el envío será gratuito para el cliente (0 para desactivar).',
    delivBulkUpdateTitle: 'Actualización Masiva de Tarifas',
    delivBulkUpdateDesc: 'Aplique una tarifa uniforme para las 69 wilayas en una sola operación:',
    delivBulkHomeRate: 'Tarifa Domicilio (DZD)',
    delivBulkDeskRate: 'Tarifa StopDesk (DZD)',
    delivBulkApplyBtn: 'Aplicar a todas las wilayas',
    delivSearchWilayaPlaceholder: 'Buscar por código o nombre de wilaya...',
    delivTableWilaya: 'Wilaya (Código y Nombre)',
    delivTableHomePrice: 'A Domicilio (DZD)',
    delivTableDeskPrice: 'StopDesk Oficina (DZD)',
    delivTableActions: 'Estado',
    delivActiveCarrierTitle: 'Empresa de Envío Activa',
    delivAddNewCarrierBtn: '+ Añadir Empresa de Envío',
    delivCarrierNameLabel: 'Nombre del Transportista',
    delivCarrierPhoneLabel: 'Teléfono de Atención al Cliente',
    delivCarrierTrackingUrlLabel: 'URL de Seguimiento Web (con {TRACKING})',
    delivCarrierPrefixLabel: 'Prefijo habitual de paquetes',
    delivCarrierStopDeskToggle: 'Ofrece servicio StopDesk (Oficina)',
    delivSaveCarrierBtn: 'Guardar Transportista',
    delivSaveAllRatesBtn: 'Guardar Tarifas en la Base Firestore',
    delivRatesSavedToast: '¡Tarifas de envío guardadas con éxito!',

    contentTitle: 'Contenidos de la Web y Datos del Taller',
    contentSubtitle: 'Modifique datos de contacto, números de WhatsApp, enlaces sociales y señas del taller.',
    contentWorkshopIdentity: 'Identidad del Taller y Contacto',
    contentStoreNameLabel: 'Nombre de la Marca / Taller',
    contentTaglineLabel: 'Eslogan / Lema Comercial',
    contentPhoneLabel: 'Teléfono Principal',
    contentWhatsAppLabel: 'Número de WhatsApp para Pedidos Rápidos',
    contentEmailLabel: 'Correo Electrónico Comercial',
    contentAddressLabel: 'Dirección Física del Taller',
    contentOpeningHoursLabel: 'Horario de Atención',
    contentSocialLinks: 'Redes Sociales',
    contentFacebookLabel: 'Enlace Facebook',
    contentInstagramLabel: 'Enlace Instagram',
    contentTikTokLabel: 'Enlace TikTok',
    contentB2BSection: 'Configuración de Venta Mayorista (B2B)',
    contentB2BMinQtyLabel: 'Cantidad mínima para tarifa mayorista (unidades)',
    contentSaveBtn: 'Guardar en la Base Firestore',
    contentSavingBtn: 'Guardando...',
    contentSavedToast: '¡Contenidos de la tienda guardados correctamente!',

    mediaTitle: 'Fototeca de Medios en la Nube',
    mediaSubtitle: 'Gestione fotos del taller, modelos y visuales para los artículos del catálogo.',
    mediaUploadBtn: 'Subir Nueva Imagen',
    mediaAddUrlBtn: 'Añadir por URL externa',
    mediaSearchPlaceholder: 'Buscar en la fototeca...',
    mediaFilterAll: 'Todos los archivos',
    mediaFilterProducts: 'Fotos de Productos',
    mediaFilterBanners: 'Banners y Portada',
    mediaFilterWorkshop: 'Taller y Confección',
    mediaCopyUrl: 'Copiar Enlace de Imagen',
    mediaCopied: '¡Enlace copiado!',
    mediaDeleteConfirmTitle: 'Eliminar Imagen',
    mediaDeleteConfirmDesc: '¿Está seguro de que desea eliminar esta imagen de la fototeca?',
    mediaNoMediaTitle: 'La fototeca está vacía',
    mediaNoMediaDesc: 'Suba fotos para asociarlas a las fichas de sus prendas.',
    mediaUploadPrompt: 'Arrastre imágenes aquí o haga clic para examinar archivos',
    mediaProcessing: 'Optimizando y subiendo imagen...',

    statusReceived: 'Recibido / Confirmado',
    statusPreparing: 'En Preparación / Taller',
    statusShipped: 'Enviado / En Reparto',
    statusDelivered: 'Entregado / Completado',
    statusCancelled: 'Cancelado',
  },
};
