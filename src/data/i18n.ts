export type Language = 'ar' | 'en' | 'fr' | 'es';

export interface Translations {
  siteTitle: string;
  tagline: string;
  subTagline: string;
  b2bB2cBadge: string;
  topbarDelivery: string;
  topbarContact: string;
  navAll: string;
  navHoodies: string;
  navJoggers: string;
  navLongSleeves: string;
  navTees: string;
  navTracksuits: string;
  navOuterwear: string;
  navB2B: string;
  navAdmin: string;
  navContact: string;
  searchPlaceholder: string;
  heroTitle: string;
  heroSubtitle: string;
  heroExploreBtn: string;
  heroB2BBtn: string;
  heroContactBtn: string;
  metricB2B: string;
  metricB2BSub: string;
  metricWilayas: string;
  metricWilayasSub: string;
  metricQuality: string;
  metricQualitySub: string;
  catalogTitle: string;
  catalogSubtitle: string;
  winterCollectionHeader: string;
  filterAll: string;
  sortBy: string;
  sortFeatured: string;
  sortPriceAsc: string;
  sortPriceDesc: string;
  sortNewest: string;
  b2cPrice: string;
  b2bWholesalePrice: string;
  minWholesaleQty: string;
  addToCart: string;
  addedSuccess: string;
  selectSize: string;
  selectColor: string;
  orderViaWhatsApp: string;
  cartTitle: string;
  cartEmpty: string;
  cartSubtotal: string;
  checkoutBtn: string;
  delivery58Wilayas: string;
  wilayaLabel: string;
  selectWilaya: string;
  cityCommuneLabel: string;
  fullNameLabel: string;
  phoneLabel: string;
  addressLabel: string;
  emailOptionalLabel: string;
  deliveryMethod: string;
  homeDelivery: string;
  deskDelivery: string;
  paymentMethod: string;
  cashOnDelivery: string;
  baridiMob: string;
  orderSummary: string;
  confirmOrderBtn: string;
  orderSuccessTitle: string;
  orderSuccessMsg: string;
  b2bSectionTitle: string;
  b2bSectionSubtitle: string;
  b2bSectionDesc?: string;
  b2bInquiryBtn: string;
  continueShopping?: string;
  adminTitle: string;
  adminAddProduct: string;
  adminEditProduct: string;
  adminContactSettings: string;
  adminSave: string;
  adminDelete: string;
  close: string;
  currencyDzd: string;
  navOrderLookup: string;
  orderLookupTitle: string;
  orderLookupPlaceholder: string;

  // Additional comprehensive UI translations
  viewDetails: string;
  wholesaleBadge: string;
  algeriaMade: string;
  sizeGuideTitle: string;
  sizeGuideSubtitle: string;
  fabricLabel: string;
  tailoringLabel: string;
  quantityLabel: string;
  totalLabel: string;
  techSheetTab: string;
  b2bRatesTab: string;
  reviewsTab: string;
  noReviewsYet: string;
  customWhatsappBtn: string;
  customWhatsappTitle: string;
  customWhatsappSub: string;
  applyPromoBtn: string;
  promoCodePlaceholder: string;
  promoInvalidMsg: string;
  deleteItemTitle: string;
  shippingLabel: string;
  freeShippingTag: string;
  netTotalToPay: string;
  qualityPromiseTitle: string;
  qualityPromisePoint1: string;
  qualityPromisePoint2: string;
  qualityPromisePoint3: string;
  orderNumberLabel: string;
  destinationLabel: string;
  recipientLabel: string;
  trackShipmentBtn: string;
  printReceiptBtn: string;
  returnToShopBtn: string;
  receiptTitle: string;
  receiptSubtitle: string;

  // Footer translations
  footerAboutText: string;
  footerShowroomLabel: string;
  footerCityLabel: string;
  footerDirectEmail: string;
  footerPhoneLabel: string;
  footerCollectionTitle: string;
  footerServicesTitle: string;
  footerClientCareTitle: string;
  footerHomeDeskDelivery: string;
  footerCodText: string;
  footerBaridiMobText: string;
  footerSizeGuideLink: string;
  footerContactAtelier: string;
  footerWhatsappCareText: string;
  footerAllRightsReserved: string;
  footerAlgerianCraft: string;
  footerWilayasExpress: string;
  footerManagerAccess: string;

  // B2B & Contact Modal translations
  b2bModalSubtitle: string;
  b2bAdvantage1Title: string;
  b2bAdvantage1Desc: string;
  b2bAdvantage2Title: string;
  b2bAdvantage2Desc: string;
  b2bAdvantage3Title: string;
  b2bAdvantage3Desc: string;
  b2bStoreNameLabel: string;
  b2bManagerNameLabel: string;
  b2bTargetQuantityLabel: string;
  b2bProductInterestLabel: string;
  b2bSendInquiryBtn: string;
  contactDirectWhatsappTitle: string;
  contactDirectWhatsappDesc: string;
  contactCopyRip: string;
  contactCopied: string;
  contactCcpLabel: string;

  // Sizing & Wishlist
  sizeGuideInches: string;
  sizeGuideCm: string;
  sizeGuideAdvisorTitle: string;
  sizeGuideChestLabel: string;
  sizeGuideWaistLabel: string;
  sizeGuideRecommended: string;
  wishlistTitle: string;
  wishlistEmptyTitle: string;
  wishlistEmptyDesc: string;
  wishlistSelectBtn: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  ar: {
    siteTitle: 'RENASC',
    tagline: 'دار أزياء وتصميم • الجزائر',
    subTagline: 'RENASC • الجزائر',
    b2bB2cBadge: 'RENASC • صناعة راقية (69 ولاية)',
    topbarDelivery: '🚚 توصيل متوفر لجميع الـ 69 ولاية • الدفع عند الاستلام متوفر',
    topbarContact: '📞 خدمة العملاء والطلبيات عبر واتساب',
    navAll: 'كل المنتجات',
    navHoodies: 'هوديز (Hoodies)',
    navJoggers: 'سراويل جوجينج (Joggers)',
    navLongSleeves: 'أكمام طويلة (Long Sleeves)',
    navTees: 'تيشيرتات (Tees)',
    navTracksuits: 'أطقم كاملة (Tracksuits)',
    navOuterwear: 'سترات ومعاطف (Outerwear)',
    navB2B: 'طلبات الجملة (B2B)',
    navAdmin: 'إدارة الورشة',
    navContact: 'تواصل معنا',
    navOrderLookup: 'تتبع طلبيتك',
    orderLookupTitle: 'تتبع الطلبية والشحن عبر 69 ولاية',
    orderLookupPlaceholder: 'أدخل رقم الطلب أو رقم الهاتف...',
    searchPlaceholder: 'ابحث في تشكيلة RENASC...',
    heroTitle: 'أزياء راقية مصممة بدقة متناهية وحضور أصيل',
    heroSubtitle: 'تصميم وحياكة أرقى الملابس والأطقم في الجزائر بمقاييس عالمية للأفراد والمتاجر.',
    heroExploreBtn: 'استكشف التشكيلة',
    heroB2BBtn: 'عروض الجملة (B2B)',
    heroContactBtn: 'تواصل مباشر عبر واتساب',
    metricB2B: 'B2B & B2C',
    metricB2BSub: 'تجزئة وجملة للمحلات',
    metricWilayas: '69 ولاية',
    metricWilayasSub: 'توصيل سريع لباب المنزل',
    metricQuality: 'جودة أقمشة فائقة',
    metricQualitySub: 'قطن ناعم ومريح',
    catalogTitle: 'تشكيلة RENASC',
    catalogSubtitle: 'قصات دقيقة، أقمشة ذات كثافة عالية وخياطة نقية تعكس التميز',
    winterCollectionHeader: 'تشكيلة RENASC',
    filterAll: 'الكل',
    sortBy: 'ترتيب حسب',
    sortFeatured: 'المميز',
    sortPriceAsc: 'السعر: من الأقل للأعلى',
    sortPriceDesc: 'السعر: من الأعلى للأقل',
    sortNewest: 'وصل حديثاً',
    b2cPrice: 'سعر التجزئة',
    b2bWholesalePrice: 'سعر الجملة (B2B)',
    minWholesaleQty: 'يبدأ سعر الجملة من 6 قطع',
    addToCart: 'إضافة إلى السلة',
    addedSuccess: 'تمت الإضافة بنجاح!',
    selectSize: 'اختر المقاس',
    selectColor: 'اختر اللون',
    orderViaWhatsApp: 'طلب سريع عبر واتساب',
    cartTitle: 'سلة المشتريات',
    cartEmpty: 'السلة فارغة حالياً',
    cartSubtotal: 'المجموع الفرعي',
    checkoutBtn: 'إتمام الطلب الآن',
    delivery58Wilayas: 'التوصيل متوفر لجميع الـ 69 ولاية جزائرية',
    wilayaLabel: 'الولاية (69 ولاية)',
    selectWilaya: 'اختر ولايتك من القائمة...',
    cityCommuneLabel: 'البلدية / الدائرة',
    fullNameLabel: 'الاسم واللقب بالكامل',
    phoneLabel: 'رقم الهاتف (ضروري لتأكيد التوصيل)',
    addressLabel: 'العنوان بالتفصيل',
    emailOptionalLabel: 'البريد الإلكتروني (اختياري)',
    deliveryMethod: 'طريقة التوصيل',
    homeDelivery: 'توصيل للمنزل (StopDesk / Domicile)',
    deskDelivery: 'استلام من المكتب (StopDesk)',
    paymentMethod: 'طريقة الدفع',
    cashOnDelivery: 'الدفع عند الاستلام (Main à main)',
    baridiMob: 'تحويل بريدي موب / CCP (BaridiMob)',
    orderSummary: 'ملخص الطلب',
    confirmOrderBtn: 'تأكيد الطلب الآن',
    orderSuccessTitle: 'تم استلام طلبكم بنجاح!',
    orderSuccessMsg: 'شكراً لثقتكم في DBC Workshop. سنتصل بكم هاتفياً لتأكيد الشحن إلى ولايتكم.',
    b2bSectionTitle: 'مخصص للمحلات والتجار (خدمة B2B بالجملة)',
    b2bSectionSubtitle: 'هل تمتلك متجراً أو علامة تجارية؟ نوفر تصنيع وتوريد كميات كبيرة بأسعار مصنع تنافسية مع إمكانية طباعة أو تطريز شعارك.',
    b2bInquiryBtn: 'طلب تسعيرة جملة للمحلات',
    continueShopping: 'مواصلة التسوق',
    adminTitle: 'لوحة تحكم صاحب الورشة',
    adminAddProduct: 'إضافة منتج جديد',
    adminEditProduct: 'تعديل المنتجات والأسعار',
    adminContactSettings: 'إعدادات الاتصال ومعلومات المتجر',
    adminSave: 'حفظ التعديلات',
    adminDelete: 'حذف المنتج',
    close: 'إغلاق',
    currencyDzd: 'د.ج',

    viewDetails: 'عرض التفاصيل',
    wholesaleBadge: 'جملة',
    algeriaMade: 'صنع في الجزائر 🇩🇿',
    sizeGuideTitle: 'دليل المقاسات في الورشة',
    sizeGuideSubtitle: 'المقاسات الحقيقية للملابس كما يتم تفصيلها في ورشة DBC',
    fabricLabel: 'نوع القماش والنسيج :',
    tailoringLabel: 'مكان التصنيع والحياكة :',
    quantityLabel: 'الكمية :',
    totalLabel: 'المجموع :',
    techSheetTab: 'البطاقة التقنية',
    b2bRatesTab: 'أسعار الجملة B2B',
    reviewsTab: 'التقييمات',
    noReviewsYet: 'لا توجد تقييمات مسجلة بعد لهذا الموديل.',
    customWhatsappBtn: 'طلب عبر واتساب',
    customWhatsappTitle: 'رسالة واتساب جاهزة ومخصصة',
    customWhatsappSub: 'مجهزة تلقائياً بالموديل، المقاس، اللون، والولاية',
    applyPromoBtn: 'تطبيق',
    promoCodePlaceholder: 'كود التخفيض',
    promoInvalidMsg: 'كود التخفيض غير صالح',
    deleteItemTitle: 'حذف من السلة',
    shippingLabel: 'مصاريف التوصيل',
    freeShippingTag: '🎉 توصيل مجاني (0 د.ج)',
    netTotalToPay: 'المبلغ الإجمالي للدفع',
    qualityPromiseTitle: 'ضمانات الجودة من دار RENASC',
    qualityPromisePoint1: '• فحص دقيق لكل قطعة قبل التغليف والشحن',
    qualityPromisePoint2: '• إمكانية استبدال المقاس في غضون 48 ساعة',
    qualityPromisePoint3: '• اتصال هاتفي للتأكيد المسبق قبل مغادرة الطرد',
    orderNumberLabel: 'رقم الطلب :',
    destinationLabel: 'الولاية ومدينة التوصيل :',
    recipientLabel: 'المستلم :',
    trackShipmentBtn: '🚚 تتبع مسار الشحنة في الجزائر',
    printReceiptBtn: '🖨️ طباعة وصل الطلب',
    returnToShopBtn: 'العودة للكتالوج الرئيسي',
    receiptTitle: 'RENASC',
    receiptSubtitle: 'وصل استلام طلبية وتأكيد حجز',

    footerAboutText: 'تصميم وحياكة أرقى الملابس في الجزائر: هوديز ثقيلة، سراويل جوجينج مريحة، وأقمصة أكمام طويلة وأطقم متكاملة للأفراد ومحلات إعادة البيع.',
    footerShowroomLabel: 'الورشة ومقر العرض :',
    footerCityLabel: 'المدينة :',
    footerDirectEmail: 'البريد المباشر :',
    footerPhoneLabel: 'الهاتف :',
    footerCollectionTitle: 'تشكيلة ورشة DBC',
    footerServicesTitle: 'الخدمات والتوصيل',
    footerClientCareTitle: 'الطلبات وخدمة الزبائن',
    footerHomeDeskDelivery: 'توصيل للمنزل أو استلام من المكتب',
    footerCodText: 'الدفع نقداً عند استلام الطرد',
    footerBaridiMobText: 'تحويل بنكي بريدي موب / CCP',
    footerSizeGuideLink: 'دليل المقاسات والتفصيل',
    footerContactAtelier: 'الاتصال المباشر بالورشة',
    footerWhatsappCareText: 'اطلب مباشرة عبر واتساب مع خدمة تأكيد فورية للمقاسات والألوان.',
    footerAllRightsReserved: 'جميع الحقوق محفوظة.',
    footerAlgerianCraft: '🇩🇿 صُمم وخيط بأيادٍ جزائرية',
    footerWilayasExpress: 'توصيل لـ 69 ولاية',
    footerManagerAccess: 'إدارة الورشة',

    b2bModalSubtitle: 'بيع بالجملة لمحلات الملابس والموزعين في كامل أنحاء الجزائر',
    b2bAdvantage1Title: 'أسعار مصنع مباشرة',
    b2bAdvantage1Desc: 'أسعار جملة تنافسية تنطبق ابتداءً من 6 قطع لكل موديل.',
    b2bAdvantage2Title: 'إمكانية تنويع المقاسات والألوان',
    b2bAdvantage2Desc: 'اختر مزيج المقاسات (S حتى 3XL) والألوان المتناسبة مع جمهورك.',
    b2bAdvantage3Title: 'توصيل تجاري لـ 69 ولاية',
    b2bAdvantage3Desc: 'شحن سريع ومؤمن لكافة محلات الملابس في كامل التراب الوطني.',
    b2bStoreNameLabel: 'اسم المحل أو العلامة التجارية *',
    b2bManagerNameLabel: 'اسم المسؤول / التاجر *',
    b2bTargetQuantityLabel: 'الكمية التقريبية المطلوبة',
    b2bProductInterestLabel: 'نوع الملابس المطلوبة',
    b2bSendInquiryBtn: 'إرسال طلب التسعيرة عبر واتساب',
    contactDirectWhatsappTitle: 'طلبيات مباشرة وخدمة الزبائن عبر واتساب',
    contactDirectWhatsappDesc: 'فريق الورشة يجيبكم يومياً لتأكيد المقاسات وتنسيق الشحن.',
    contactCopyRip: 'نسخ رقم RIP',
    contactCopied: 'تم النسخ!',
    contactCcpLabel: 'حساب البريد CCP :',

    sizeGuideInches: 'بوصة (Inches)',
    sizeGuideCm: 'سنتيمتر (cm)',
    sizeGuideAdvisorTitle: 'مستشار المقاس الذكي',
    sizeGuideChestLabel: 'محيط الصدر :',
    sizeGuideWaistLabel: 'محيط الخصر :',
    sizeGuideRecommended: 'المقاس الموصى به لقصاتنا الحرفية :',
    wishlistTitle: 'الملابس المحفوظة للمفضلة',
    wishlistEmptyTitle: 'لا توجد قطع محفوظة حالياً',
    wishlistEmptyDesc: 'اضغط على أيقونة القلب على أي قطعة لإضافتها هنا ومراجعتها لاحقاً.',
    wishlistSelectBtn: 'عرض / تفصيل'
  },

  en: {
    siteTitle: 'RENASC',
    tagline: 'Minimalist Fashion Brand • Algeria',
    subTagline: 'Maison RENASC',
    b2bB2cBadge: 'RENASC • Crafted in Algeria (69 Wilayas)',
    topbarDelivery: '🚚 Delivery available to all 69 Wilayas • Cash on Delivery accepted',
    topbarContact: '📞 Customer service & direct orders via WhatsApp',
    navAll: 'All Garments',
    navHoodies: 'Hoodies',
    navJoggers: 'Joggers',
    navLongSleeves: 'Long Sleeves',
    navTees: 'T-Shirts',
    navTracksuits: 'Tracksuits',
    navOuterwear: 'Jackets & Outerwear',
    navB2B: 'Wholesale (B2B)',
    navAdmin: 'Manager Panel',
    navContact: 'Contact Us',
    navOrderLookup: 'Track Order',
    orderLookupTitle: 'Order Tracking & 69 Wilayas Shipping',
    orderLookupPlaceholder: 'Enter order number or phone...',
    searchPlaceholder: 'Search RENASC collection...',
    heroTitle: 'Distinctive Silhouette & Uncompromising Restraint',
    heroSubtitle: 'Design and garment manufacturing in Algeria crafted for individuals and wholesale partners.',
    heroExploreBtn: 'Explore the Collection',
    heroB2BBtn: 'Discover the Atelier',
    heroContactBtn: 'Direct WhatsApp Contact',
    metricB2B: 'B2B & B2C',
    metricB2BSub: 'Retail & Wholesale',
    metricWilayas: '69 Wilayas',
    metricWilayasSub: 'Express Doorstep Delivery',
    metricQuality: 'Heavyweight Fabrics',
    metricQualitySub: 'Premium French Terry Fleece',
    catalogTitle: 'RENASC Collection',
    catalogSubtitle: 'Crafted with premium cotton, tailored proportions, and resilient stitching',
    winterCollectionHeader: 'RENASC Collection',
    filterAll: 'All',
    sortBy: 'Sort by',
    sortFeatured: 'Featured',
    sortPriceAsc: 'Price: Low to High',
    sortPriceDesc: 'Price: High to Low',
    sortNewest: 'New Arrivals',
    b2cPrice: 'Retail Price',
    b2bWholesalePrice: 'Wholesale Price (B2B)',
    minWholesaleQty: 'Wholesale rate available from 6 units',
    addToCart: 'Add to Cart',
    addedSuccess: 'Added to Cart!',
    selectSize: 'Select Size',
    selectColor: 'Select Color',
    orderViaWhatsApp: 'Fast Order via WhatsApp',
    cartTitle: 'Shopping Cart',
    cartEmpty: 'Your cart is currently empty',
    cartSubtotal: 'Subtotal',
    checkoutBtn: 'Proceed to Checkout',
    delivery58Wilayas: 'Fast shipping across all 69 Wilayas of Algeria',
    wilayaLabel: 'Province / Wilaya (69 Wilayas)',
    selectWilaya: 'Select your wilaya...',
    cityCommuneLabel: 'City / Municipality',
    fullNameLabel: 'Full Name',
    phoneLabel: 'Phone Number (Required for courier)',
    addressLabel: 'Street Address',
    emailOptionalLabel: 'Email Address (Optional)',
    deliveryMethod: 'Delivery Method',
    homeDelivery: 'Home Delivery (Doorstep)',
    deskDelivery: 'Pick-up at Office (StopDesk)',
    paymentMethod: 'Payment Method',
    cashOnDelivery: 'Cash on Delivery (COD)',
    baridiMob: 'BaridiMob / CCP Transfer',
    orderSummary: 'Order Summary',
    confirmOrderBtn: 'Confirm Order Now',
    orderSuccessTitle: 'Order Successfully Placed!',
    orderSuccessMsg: 'Thank you for choosing DBC Workshop. Our delivery team will call you to confirm dispatch to your wilaya.',
    b2bSectionTitle: 'Wholesale Solutions for Boutiques (B2B)',
    b2bSectionSubtitle: 'Do you own a retail store or clothing brand? We provide factory-direct wholesale apparel with optional custom embroidery and labeling.',
    b2bInquiryBtn: 'Request Wholesale Price List',
    continueShopping: 'Continue Shopping',
    adminTitle: 'Atelier Management Portal',
    adminAddProduct: 'Add New Product',
    adminEditProduct: 'Edit Products & Prices',
    adminContactSettings: 'Contact Settings',
    adminSave: 'Save Changes',
    adminDelete: 'Delete Product',
    close: 'Close',
    currencyDzd: 'DZD',

    viewDetails: 'View Details',
    wholesaleBadge: 'Wholesale',
    algeriaMade: 'Crafted in Algeria 🇩🇿',
    sizeGuideTitle: 'Workshop Tailoring & Fit Guide',
    sizeGuideSubtitle: 'Garment measurements drafted on our workshop cutting tables',
    fabricLabel: 'Material & Fabric:',
    tailoringLabel: 'Craftsmanship & Origin:',
    quantityLabel: 'Quantity:',
    totalLabel: 'Total:',
    techSheetTab: 'Specifications',
    b2bRatesTab: 'B2B Wholesale',
    reviewsTab: 'Reviews',
    noReviewsYet: 'No customer reviews recorded yet for this piece.',
    customWhatsappBtn: 'Order on WhatsApp',
    customWhatsappTitle: 'Custom WhatsApp Order Link',
    customWhatsappSub: 'Pre-filled with product name, size, color, and destination wilaya',
    applyPromoBtn: 'Apply',
    promoCodePlaceholder: 'Promotion code',
    promoInvalidMsg: 'Invalid promotion code',
    deleteItemTitle: 'Remove item',
    shippingLabel: 'Delivery Fee',
    freeShippingTag: '🎉 FREE SHIPPING (0 DZD)',
    netTotalToPay: 'Total Net to Pay',
    qualityPromiseTitle: 'RENASC Quality Commitments',
    qualityPromisePoint1: '• Meticulously inspected before packing',
    qualityPromisePoint2: '• Size exchange supported within 48h',
    qualityPromisePoint3: '• Phone call confirmation before dispatch',
    orderNumberLabel: 'Order Number:',
    destinationLabel: 'Destination:',
    recipientLabel: 'Recipient:',
    trackShipmentBtn: '🚚 Track Shipment in Algeria',
    printReceiptBtn: '🖨️ Print Receipt',
    returnToShopBtn: 'Return to Shop',
    receiptTitle: 'RENASC',
    receiptSubtitle: 'Purchase Confirmation Receipt',

    footerAboutText: 'Design and manufacturing of premium garments in Algeria: heavyweight fleece hoodies, tailored joggers, waffle long sleeves, and full tracksuits for individuals and clothing boutiques.',
    footerShowroomLabel: 'Atelier & Showroom:',
    footerCityLabel: 'City:',
    footerDirectEmail: 'Direct Email:',
    footerPhoneLabel: 'Phone:',
    footerCollectionTitle: 'DBC Workshop Collection',
    footerServicesTitle: 'Logistics & Shipping',
    footerClientCareTitle: 'Customer Care & Orders',
    footerHomeDeskDelivery: 'Doorstep or StopDesk agency pickup',
    footerCodText: 'Cash on Delivery payment',
    footerBaridiMobText: 'BaridiMob / CCP bank transfer',
    footerSizeGuideLink: 'Size & Fit Guide',
    footerContactAtelier: 'Contact the Atelier',
    footerWhatsappCareText: 'Order directly on WhatsApp with instant confirmation of sizes, colors, and parcel dispatch.',
    footerAllRightsReserved: 'All rights reserved.',
    footerAlgerianCraft: '🇩🇿 Designed & Crafted in Algeria',
    footerWilayasExpress: '69 Wilayas Express',
    footerManagerAccess: 'Atelier Access',

    b2bModalSubtitle: 'Direct factory supply for clothing stores and apparel boutiques across Algeria',
    b2bAdvantage1Title: 'Direct Factory Pricing',
    b2bAdvantage1Desc: 'Tiered wholesale discounts starting at 6 pieces per style.',
    b2bAdvantage2Title: 'Mix Sizes & Colors',
    b2bAdvantage2Desc: 'Mix sizes from S to 3XL and all available colorways.',
    b2bAdvantage3Title: 'Nationwide Delivery',
    b2bAdvantage3Desc: 'Secured logistics covering all 69 Wilayas with reliable carriers.',
    b2bStoreNameLabel: 'Store or Brand Name *',
    b2bManagerNameLabel: 'Contact Person *',
    b2bTargetQuantityLabel: 'Target Quantity',
    b2bProductInterestLabel: 'Apparel Categories of Interest',
    b2bSendInquiryBtn: 'Send Wholesale Inquiry via WhatsApp',
    contactDirectWhatsappTitle: 'Direct WhatsApp Customer Service & Orders',
    contactDirectWhatsappDesc: 'Our workshop team is available daily to confirm sizes and shipping logistics.',
    contactCopyRip: 'Copy RIP',
    contactCopied: 'Copied!',
    contactCcpLabel: 'CCP Account:',

    sizeGuideInches: 'Inches (in)',
    sizeGuideCm: 'Centimeters (cm)',
    sizeGuideAdvisorTitle: 'Interactive Fit Advisor',
    sizeGuideChestLabel: 'Chest Circumference:',
    sizeGuideWaistLabel: 'Waist Circumference:',
    sizeGuideRecommended: 'Recommended Size for Our Cuts:',
    wishlistTitle: 'Saved Workshop Pieces',
    wishlistEmptyTitle: 'No saved garments yet',
    wishlistEmptyDesc: 'Click the heart icon on any garment in our workshop collection to save it for later review.',
    wishlistSelectBtn: 'Select / View'
  },

  fr: {
    siteTitle: 'RENASC',
    tagline: 'Maison de Mode • Algérie',
    subTagline: 'Maison RENASC',
    b2bB2cBadge: 'RENASC • Confection Haut de Gamme (69 Wilayas)',
    topbarDelivery: '🚚 Livraison disponible dans les 69 Wilayas • Paiement à la livraison accepté',
    topbarContact: '📞 Service client et commandes directes par WhatsApp',
    navAll: 'Toute la Collection',
    navHoodies: 'Hoodies Molleton',
    navJoggers: 'Pantalons Jogging',
    navLongSleeves: 'Manches Longues',
    navTees: 'T-shirts Épais',
    navTracksuits: 'Tracksuits Complets',
    navOuterwear: 'Vestes & Outerwear',
    navB2B: 'Partenaires & Gros (B2B)',
    navAdmin: 'Espace Gérant',
    navContact: 'Contactez-nous',
    navOrderLookup: 'Suivi de Commande',
    orderLookupTitle: 'Suivi de Commande & Livraison 69 Wilayas',
    orderLookupPlaceholder: 'Numéro de commande ou téléphone...',
    searchPlaceholder: 'Rechercher dans la collection RENASC...',
    heroTitle: 'Ligne Épure & Confection Haute Précision',
    heroSubtitle: 'Conception et confection de vêtements haut de gamme en Algérie pour particuliers et boutiques revendeurs.',
    heroExploreBtn: 'Explorer la Collection',
    heroB2BBtn: 'Découvrir l’Atelier',
    heroContactBtn: 'Contact Direct par WhatsApp',
    metricB2B: 'B2B & B2C',
    metricB2BSub: 'Détail & Partenaires',
    metricWilayas: '69 Wilayas',
    metricWilayasSub: 'Livraison Rapide à Domicile',
    metricQuality: 'Molleton Lourd',
    metricQualitySub: 'Coton Épais et Confortable',
    catalogTitle: 'Collection RENASC',
    catalogSubtitle: 'Fabriqué avec soin, finitions soignées et matières sélectionnées',
    winterCollectionHeader: 'Collection RENASC',
    filterAll: 'Tous',
    sortBy: 'Trier par',
    sortFeatured: 'Mis en avant',
    sortPriceAsc: 'Prix : Croissant',
    sortPriceDesc: 'Prix : Décroissant',
    sortNewest: 'Nouveautés',
    b2cPrice: 'Prix Détail',
    b2bWholesalePrice: 'Prix de Gros (B2B)',
    minWholesaleQty: 'Tarif de gros dès 6 pièces',
    addToCart: 'Ajouter au Panier',
    addedSuccess: 'Ajouté au panier !',
    selectSize: 'Sélectionner la Taille',
    selectColor: 'Sélectionner la Couleur',
    orderViaWhatsApp: 'Commande Express sur WhatsApp',
    cartTitle: 'Mon Panier',
    cartEmpty: 'Votre panier est actuellement vide',
    cartSubtotal: 'Sous-total',
    checkoutBtn: 'Passer la Commande',
    delivery58Wilayas: 'Expédition rapide vers toutes les 69 wilayas d’Algérie',
    wilayaLabel: 'Province / Wilaya (69 Wilayas)',
    selectWilaya: 'Sélectionnez votre wilaya...',
    cityCommuneLabel: 'Commune / Ville',
    fullNameLabel: 'Nom & Prénom',
    phoneLabel: 'Numéro de Téléphone (Requis pour la livraison)',
    addressLabel: 'Adresse de livraison',
    emailOptionalLabel: 'Adresse Email (Optionnel)',
    deliveryMethod: 'Mode de Livraison',
    homeDelivery: 'Livraison à Domicile',
    deskDelivery: 'Retrait en Agence (StopDesk)',
    paymentMethod: 'Mode de Paiement',
    cashOnDelivery: 'Paiement à la Livraison (Espèces)',
    baridiMob: 'Virement BaridiMob / CCP',
    orderSummary: 'Récapitulatif de Commande',
    confirmOrderBtn: 'Confirmer la Commande',
    orderSuccessTitle: 'Commande Confirmée avec Succès !',
    orderSuccessMsg: 'Merci de votre confiance en DBC Workshop. Notre équipe logistique vous appellera avant la livraison.',
    b2bSectionTitle: 'Offre Spéciale Magasins & Boutiques (B2B)',
    b2bSectionSubtitle: 'Vous possédez un magasin de vêtements ou une marque ? Nous proposons la confection en gros avec tarifs directs d’usine et personnalisation.',
    b2bInquiryBtn: 'Demander le Catalogue de Gros',
    continueShopping: 'Continuer mes achats',
    adminTitle: 'Tableau de Bord Atelier',
    adminAddProduct: 'Ajouter un Produit',
    adminEditProduct: 'Modifier Produits & Prix',
    adminContactSettings: 'Paramètres & Contacts',
    adminSave: 'Enregistrer',
    adminDelete: 'Supprimer',
    close: 'Fermer',
    currencyDzd: 'DZD',

    viewDetails: 'Voir Détails',
    wholesaleBadge: 'Gros',
    algeriaMade: 'Confectionné en Algérie 🇩🇿',
    sizeGuideTitle: 'Guide des Tailles de l’Atelier',
    sizeGuideSubtitle: 'Dimensions exactes des vêtements d’après nos tables de coupe',
    fabricLabel: 'Matière & Tissu :',
    tailoringLabel: 'Confection & Origine :',
    quantityLabel: 'Quantité :',
    totalLabel: 'Total :',
    techSheetTab: 'Fiche Technique',
    b2bRatesTab: 'Tarifs Gros B2B',
    reviewsTab: 'Avis Clients',
    noReviewsYet: 'Aucun avis enregistré pour l’instant pour ce modèle.',
    customWhatsappBtn: 'Commander via WhatsApp',
    customWhatsappTitle: 'Lien WhatsApp personnalisé',
    customWhatsappSub: 'Modèle auto-rempli avec taille, couleur, réf et wilaya',
    applyPromoBtn: 'Appliquer',
    promoCodePlaceholder: 'Code promotionnel',
    promoInvalidMsg: 'Code promotionnel non valide',
    deleteItemTitle: 'Supprimer du panier',
    shippingLabel: 'Frais de livraison',
    freeShippingTag: '🎉 LIVRAISON GRATUITE (0 DZD)',
    netTotalToPay: 'Total Net à Payer',
    qualityPromiseTitle: 'Engagements Qualité RENASC',
    qualityPromisePoint1: '• Produits minutieusement vérifiés avant envoi',
    qualityPromisePoint2: '• Échange de taille possible sous 48h',
    qualityPromisePoint3: '• Confirmation téléphonique avant expédition',
    orderNumberLabel: 'Numéro de commande :',
    destinationLabel: 'Destination de livraison :',
    recipientLabel: 'Destinataire :',
    trackShipmentBtn: '🚚 Suivre le colis en Algérie',
    printReceiptBtn: '🖨️ Imprimer le reçu',
    returnToShopBtn: 'Retour à la boutique',
    receiptTitle: 'RENASC',
    receiptSubtitle: 'Reçu d’Achat et Confirmation',

    footerAboutText: 'Conception et confection de vêtements de qualité en Algérie : Hoodies épais, pantalons de jogging confortables, t-shirts manches longues et ensembles complets pour particuliers et magasins revendeurs.',
    footerShowroomLabel: 'Atelier & Showroom :',
    footerCityLabel: 'Ville :',
    footerDirectEmail: 'Email direct :',
    footerPhoneLabel: 'Téléphone :',
    footerCollectionTitle: 'Collection DBC Workshop',
    footerServicesTitle: 'Service & Livraison',
    footerClientCareTitle: 'Commandes & Service Client',
    footerHomeDeskDelivery: 'À domicile ou retrait StopDesk',
    footerCodText: 'Paiement en espèces à la livraison',
    footerBaridiMobText: 'Virement BaridiMob / CCP',
    footerSizeGuideLink: 'Guide des Tailles',
    footerContactAtelier: 'Contacter l’Atelier',
    footerWhatsappCareText: 'Passez vos commandes directement par WhatsApp avec confirmation immédiate des tailles et couleurs.',
    footerAllRightsReserved: 'Tous droits réservés.',
    footerAlgerianCraft: '🇩🇿 Conçu & Confectionné en Algérie',
    footerWilayasExpress: '69 Wilayas Express',
    footerManagerAccess: 'Accès Atelier',

    b2bModalSubtitle: 'Vente en gros pour magasins de vêtements & revendeurs à travers l’Algérie',
    b2bAdvantage1Title: 'Prix Usine Directs',
    b2bAdvantage1Desc: 'Tarifs de gros dégressifs applicables à partir de 6 pièces par modèle.',
    b2bAdvantage2Title: 'Mix Tailles & Couleurs',
    b2bAdvantage2Desc: 'Possibilité de panacher les tailles (du S au 3XL) et coloris disponibles.',
    b2bAdvantage3Title: 'Livraison 69 Wilayas',
    b2bAdvantage3Desc: 'Acheminement sécurisé vers toutes les boutiques du territoire national.',
    b2bStoreNameLabel: 'Nom du Magasin ou Marque *',
    b2bManagerNameLabel: 'Nom du Responsable *',
    b2bTargetQuantityLabel: 'Quantité estimée',
    b2bProductInterestLabel: 'Articles recherchés',
    b2bSendInquiryBtn: 'Envoyer la demande de devis sur WhatsApp',
    contactDirectWhatsappTitle: 'Commandes Directes & Service Client WhatsApp',
    contactDirectWhatsappDesc: 'L’équipe de l’atelier vous répond tous les jours pour vous conseiller et organiser vos livraisons.',
    contactCopyRip: 'Copier RIP',
    contactCopied: 'Copié !',
    contactCcpLabel: 'Compte CCP :',

    sizeGuideInches: 'Pouces (in)',
    sizeGuideCm: 'Centimètres (cm)',
    sizeGuideAdvisorTitle: 'Conseiller de Coupe Interactif',
    sizeGuideChestLabel: 'Tour de poitrine :',
    sizeGuideWaistLabel: 'Tour de taille :',
    sizeGuideRecommended: 'Taille recommandée d’après nos coupes :',
    wishlistTitle: 'Articles Sauvegardés',
    wishlistEmptyTitle: 'Aucun article sauvegardé pour le moment',
    wishlistEmptyDesc: 'Cliquez sur l’icône cœur de n’importe quel article pour le garder en favori et y revenir plus tard.',
    wishlistSelectBtn: 'Voir l’article'
  },

  es: {
    siteTitle: 'RENASC',
    tagline: 'Casa de Moda • Argelia',
    subTagline: 'Maison RENASC',
    b2bB2cBadge: 'RENASC • Alta Confección (69 Wilayas)',
    topbarDelivery: '🚚 Envíos a todas las 69 wilayas • Pago contra entrega disponible',
    topbarContact: '📞 Atención al cliente y pedidos por WhatsApp',
    navAll: 'Toda la Colección',
    navHoodies: 'Sudaderas (Hoodies)',
    navJoggers: 'Pantalones Jogger',
    navLongSleeves: 'Manga Larga',
    navTees: 'Camisetas Gruesas',
    navTracksuits: 'Conjuntos Completos',
    navOuterwear: 'Chaquetas & Abrigos',
    navB2B: 'Mayoristas & Socios (B2B)',
    navAdmin: 'Panel de Gestión',
    navContact: 'Contacto',
    navOrderLookup: 'Seguimiento de Pedido',
    orderLookupTitle: 'Seguimiento de Envíos en las 69 Wilayas',
    orderLookupPlaceholder: 'Número de pedido o teléfono...',
    searchPlaceholder: 'Buscar en la colección RENASC...',
    heroTitle: 'Silueta Distintiva & Rigor Estético',
    heroSubtitle: 'Diseño y confección de prendas premium en Argelia para clientes y tiendas.',
    heroExploreBtn: 'Explorar la Colección',
    heroB2BBtn: 'Descubrir el Atelier',
    heroContactBtn: 'Contacto por WhatsApp',
    metricB2B: 'B2B & B2C',
    metricB2BSub: 'Minorista y Socios',
    metricWilayas: '69 Wilayas',
    metricWilayasSub: 'Envío Rápido a Domicilio',
    metricQuality: 'Algodón Pesado',
    metricQualitySub: 'Tejido Suave y Cómodo',
    catalogTitle: 'Colección RENASC',
    catalogSubtitle: 'Prendas resistentes confeccionadas con materias primas seleccionadas',
    winterCollectionHeader: 'Colección RENASC',
    filterAll: 'Todos',
    sortBy: 'Ordenar por',
    sortFeatured: 'Destacados',
    sortPriceAsc: 'Precio: Menor a Mayor',
    sortPriceDesc: 'Precio: Mayor a Menor',
    sortNewest: 'Novedades',
    b2cPrice: 'Precio Minorista',
    b2bWholesalePrice: 'Precio Mayorista (B2B)',
    minWholesaleQty: 'Tarifa mayorista a partir de 6 unidades',
    addToCart: 'Añadir a la Cesta',
    addedSuccess: '¡Añadido a la cesta!',
    selectSize: 'Seleccionar Talla',
    selectColor: 'Seleccionar Color',
    orderViaWhatsApp: 'Pedido Rápido por WhatsApp',
    cartTitle: 'Cesta de Compras',
    cartEmpty: 'Tu cesta está vacía',
    cartSubtotal: 'Subtotal',
    checkoutBtn: 'Tramitar Pedido',
    delivery58Wilayas: 'Envíos rápidos a las 69 wilayas de Argelia',
    wilayaLabel: 'Provincia / Wilaya (69 Wilayas)',
    selectWilaya: 'Selecciona tu wilaya...',
    cityCommuneLabel: 'Municipio / Ciudad',
    fullNameLabel: 'Nombre Completo',
    phoneLabel: 'Número de Teléfono (Necesario para entrega)',
    addressLabel: 'Dirección completa',
    emailOptionalLabel: 'Correo Electrónico (Opcional)',
    deliveryMethod: 'Método de Envío',
    homeDelivery: 'Entrega a Domicilio',
    deskDelivery: 'Recogida en Oficina (StopDesk)',
    paymentMethod: 'Método de Pago',
    cashOnDelivery: 'Pago Contra Entrega (Efectivo)',
    baridiMob: 'Transferencia BaridiMob / CCP',
    orderSummary: 'Resumen del Pedido',
    confirmOrderBtn: 'Confirmar Pedido',
    orderSuccessTitle: '¡Pedido Recibido con Éxito!',
    orderSuccessMsg: 'Gracias por confiar en DBC Workshop. Nuestro repartidor le llamará antes de la entrega.',
    b2bSectionTitle: 'Para Tiendas y Distribuidores (Venta Mayorista B2B)',
    b2bSectionSubtitle: '¿Tienes una tienda o marca? Ofrecemos confección de ropa al por mayor con precios directos de fábrica.',
    b2bInquiryBtn: 'Solicitar Lista de Precios Mayorista',
    continueShopping: 'Continuar comprando',
    adminTitle: 'Panel de Administración del Taller',
    adminAddProduct: 'Añadir Nuevo Producto',
    adminEditProduct: 'Editar Productos y Precios',
    adminContactSettings: 'Configuración y Contacto',
    adminSave: 'Guardar Cambios',
    adminDelete: 'Eliminar Producto',
    close: 'Cerrar',
    currencyDzd: 'DZD',

    viewDetails: 'Ver Detalles',
    wholesaleBadge: 'Mayorista',
    algeriaMade: 'Confeccionado en Argelia 🇩🇿',
    sizeGuideTitle: 'Guía de Tallas del Taller',
    sizeGuideSubtitle: 'Medidas exactas tomadas en nuestras mesas de corte',
    fabricLabel: 'Material y Tejido:',
    tailoringLabel: 'Confección y Origen:',
    quantityLabel: 'Cantidad:',
    totalLabel: 'Total:',
    techSheetTab: 'Ficha Técnica',
    b2bRatesTab: 'Tarifas B2B',
    reviewsTab: 'Opiniones',
    noReviewsYet: 'Aún no hay opiniones registradas para este modelo.',
    customWhatsappBtn: 'Pedir por WhatsApp',
    customWhatsappTitle: 'Enlace WhatsApp personalizado',
    customWhatsappSub: 'Relleno automático con talla, color, referencia y wilaya',
    applyPromoBtn: 'Aplicar',
    promoCodePlaceholder: 'Código promocional',
    promoInvalidMsg: 'Código promocional no válido',
    deleteItemTitle: 'Eliminar de la cesta',
    shippingLabel: 'Gastos de envío',
    freeShippingTag: '🎉 ENVÍO GRATUITO (0 DZD)',
    netTotalToPay: 'Total Neto a Pagar',
    qualityPromiseTitle: 'Compromisos de Calidad RENASC',
    qualityPromisePoint1: '• Prendas verificadas minuciosamente antes del envío',
    qualityPromisePoint2: '• Cambio de talla disponible en 48h',
    qualityPromisePoint3: '• Confirmación telefónica antes de la expedición',
    orderNumberLabel: 'Número de pedido:',
    destinationLabel: 'Destino de entrega:',
    recipientLabel: 'Destinatario:',
    trackShipmentBtn: '🚚 Seguir el paquete en Argelia',
    printReceiptBtn: '🖨️ Imprimir recibo',
    returnToShopBtn: 'Volver a la tienda',
    receiptTitle: 'RENASC',
    receiptSubtitle: 'Recibo de Compra y Confirmación',

    footerAboutText: 'Diseño y confección de ropa de calidad en Argelia: sudaderas de felpa gruesa, pantalones de chándal cómodos, camisetas térmicas de manga larga y conjuntos completos para clientes y tiendas.',
    footerShowroomLabel: 'Taller & Showroom:',
    footerCityLabel: 'Ciudad:',
    footerDirectEmail: 'Email directo:',
    footerPhoneLabel: 'Teléfono:',
    footerCollectionTitle: 'Colección DBC Workshop',
    footerServicesTitle: 'Servicio y Logística',
    footerClientCareTitle: 'Atención al Cliente y Pedidos',
    footerHomeDeskDelivery: 'A domicilio o recogida en StopDesk',
    footerCodText: 'Pago en efectivo contra entrega',
    footerBaridiMobText: 'Transferencia BaridiMob / CCP',
    footerSizeGuideLink: 'Guía de Tallas',
    footerContactAtelier: 'Contactar al Taller',
    footerWhatsappCareText: 'Haz tus pedidos directamente por WhatsApp con confirmación instantánea de tallas y colores.',
    footerAllRightsReserved: 'Todos los derechos reservados.',
    footerAlgerianCraft: '🇩🇿 Diseñado y Confeccionado en Argelia',
    footerWilayasExpress: '69 Wilayas Express',
    footerManagerAccess: 'Acceso Taller',

    b2bModalSubtitle: 'Venta al por mayor para tiendas de ropa y distribuidores en toda Argelia',
    b2bAdvantage1Title: 'Precios Directos de Fábrica',
    b2bAdvantage1Desc: 'Descuentos progresivos al por mayor aplicables a partir de 6 piezas por modelo.',
    b2bAdvantage2Title: 'Combinar Tallas y Colores',
    b2bAdvantage2Desc: 'Posibilidad de combinar tallas (de la S a la 3XL) y colores disponibles.',
    b2bAdvantage3Title: 'Envíos a 69 Wilayas',
    b2bAdvantage3Desc: 'Transporte seguro y directo a todas las tiendas del territorio nacional.',
    b2bStoreNameLabel: 'Nombre de la Tienda o Marca *',
    b2bManagerNameLabel: 'Persona de Contacto *',
    b2bTargetQuantityLabel: 'Cantidad estimada',
    b2bProductInterestLabel: 'Prendas de interés',
    b2bSendInquiryBtn: 'Enviar solicitud por WhatsApp',
    contactDirectWhatsappTitle: 'Pedidos Directos y Atención por WhatsApp',
    contactDirectWhatsappDesc: 'El equipo del taller está disponible todos los días para asesorarle y coordinar sus envíos.',
    contactCopyRip: 'Copiar RIP',
    contactCopied: '¡Copiado!',
    contactCcpLabel: 'Cuenta CCP:',

    sizeGuideInches: 'Pulgadas (in)',
    sizeGuideCm: 'Centímetros (cm)',
    sizeGuideAdvisorTitle: 'Asesor de Tallas Interactivo',
    sizeGuideChestLabel: 'Contorno de pecho:',
    sizeGuideWaistLabel: 'Contorno de cintura:',
    sizeGuideRecommended: 'Talla recomendada según nuestros patrones:',
    wishlistTitle: 'Prendas Guardadas',
    wishlistEmptyTitle: 'No hay prendas guardadas por el momento',
    wishlistEmptyDesc: 'Haz clic en el icono del corazón en cualquier prenda para guardarla y revisarla más tarde.',
    wishlistSelectBtn: 'Ver prenda'
  }
};

export const getCategoryLabel = (
  categoryId: string, 
  lang: Language = 'fr', 
  customCategories?: { id: string; name: string; nameAr?: string; nameEn?: string; nameEs?: string }[]
): string => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.fr;
  switch (categoryId) {
    case 'all': return t.navAll;
    case 'hoodies': return t.navHoodies;
    case 'joggers': return t.navJoggers;
    case 'tracksuits': return t.navTracksuits;
    case 'longsleeves': return t.navLongSleeves;
    case 'tees': return t.navTees;
    case 'outerwear': return t.navOuterwear || (lang === 'ar' ? 'سترات ومعاطف' : lang === 'es' ? 'Chaquetas y Abrigos' : lang === 'en' ? 'Outerwear' : 'Vestes & Manteaux');
    case 'b2b': return t.navB2B;
    default: {
      if (customCategories && customCategories.length > 0) {
        const found = customCategories.find(c => c.id === categoryId);
        if (found) {
          if (lang === 'ar' && found.nameAr) return found.nameAr;
          if (lang === 'en' && found.nameEn) return found.nameEn;
          if (lang === 'es' && found.nameEs) return found.nameEs;
          return found.name;
        }
      }
      return categoryId;
    }
  }
};

export const formatColorName = (rawColorName: string, lang: Language): string => {
  if (!rawColorName) return '';
  if (lang === 'ar') return rawColorName;
  if (lang === 'es') {
    const map: Record<string, string> = {
      'Noir Profond / Black': 'Negro Profundo / Black',
      'Noir / Black': 'Negro / Black',
      'Noir Intégral / All Black': 'Negro Total / All Black',
      'Noir Intense / Jet Black': 'Negro Intenso',
      'Noir Carbone / Carbon Black': 'Negro Carbón',
      'Noir Charbon / Coal Black': 'Negro Carbón',
      'Noir Mat / Matte Black': 'Negro Mate',
      'Noir': 'Negro',
      'Gris Chiné / Heather Grey': 'Gris Jaspeado / Heather Grey',
      'Gris Souris / Ash Grey': 'Gris Ceniza',
      'Gris Ardoise / Slate Grey': 'Gris Pizarra',
      'Gris Anthracite / Charcoal': 'Gris Antracita',
      'Gris Chiné': 'Gris Jaspeado',
      'Gris': 'Gris',
      'Beige Sable / Sand': 'Beige Arena / Sand',
      'Beige Sable / Sand Dune': 'Beige Arena',
      'Beige': 'Beige',
      'Blanc Pur / Clean White': 'Blanco Puro',
      'Blanc Cassé / Off-White': 'Blanco Roto / Off-White',
      'Blanc': 'Blanco',
      'Vert Forêt / Forest Green': 'Verde Bosque',
      'Kaki Olive / Olive Khaki': 'Verde Oliva',
      'Kaki Militaire / Military Khaki': 'Verde Militar',
      'Kaki Fumé / Smoked Olive': 'Verde Oliva Ahumado',
      'Marron Moka / Mocha': 'Marrón Moka',
      'Moka Chaud / Warm Mocha': 'Marrón Moka Cálido',
      'Brun Tabac / Tobacco Brown': 'Marrón Tabaco',
      'Bleu Nuit / Deep Navy': 'Azul Marino Noche',
      'Bleu Marine / Navy': 'Azul Marino',
      'Bleu Pétrole / Petrol Blue': 'Azul Petróleo',
      'Bleu Marine Sombre / Dark Navy': 'Azul Marino Oscuro',
    };
    return map[rawColorName] || rawColorName;
  }
  return rawColorName;
};

