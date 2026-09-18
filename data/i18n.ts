export type Language = 'ar' | 'en' | 'fr' | 'es';

export interface Translations {
  siteTitle: string;
  tagline: string;
  b2bB2cBadge: string;
  topbarDelivery: string;
  topbarContact: string;
  navAll: string;
  navHoodies: string;
  navJoggers: string;
  navLongSleeves: string;
  navTees: string;
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
  b2bInquiryBtn: string;
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
}

export const TRANSLATIONS: Record<Language, Translations> = {
  ar: {
    siteTitle: 'ورشة DBC | دي بي سي وورك شوب',
    tagline: 'تصنيع وتوزيع أرقى الملابس بالجملة والتجزئة (B2B & B2C)',
    b2bB2cBadge: 'بيع بالجملة والتجزئة (B2B & B2C) • التوصيل لـ 69 ولاية',
    topbarDelivery: '🚚 توصيل متوفر لجميع الـ 69 ولاية • الدفع عند الاستلام متوفر',
    topbarContact: '📞 خدمة العملاء والطلبيات عبر واتساب',
    navAll: 'كل المنتجات',
    navHoodies: 'هوديز (Hoodies)',
    navJoggers: 'سراويل جوجينج (Joggers)',
    navLongSleeves: 'أكمام طويلة (Long Sleeves)',
    navTees: 'تيشيرتات (Tees)',
    navB2B: 'طلبات الجملة (B2B)',
    navAdmin: 'إدارة الورشة',
    navContact: 'تواصل معنا',
    navOrderLookup: 'تتبع طلبيتك',
    orderLookupTitle: 'تتبع الطلبية والشحن عبر 69 ولاية',
    orderLookupPlaceholder: 'أدخل رقم الطلب (مثال: DBC-2026-8492) أو رقم الهاتف...',
    searchPlaceholder: 'ابحث عن هوديز، سراويل جوجينج، أكمام طويلة...',
    heroTitle: 'ملابس راقية مصنعة بأعلى معايير الجودة والتفصيل',
    heroSubtitle: 'أرقى الملابس المصنعة بحرفية في ورشة DBC بالجزائر: هوديز، سراويل جوجينج، وأقمصة أكمام طويلة وتيشيرتات فاخرة. نوفر البيع بالتجزئة للأفراد والبيع بالجملة للمحلات عبر كامل الـ 69 ولاية.',
    heroExploreBtn: 'تصفح كوليكشن الملابس',
    heroB2BBtn: 'عروض الجملة (B2B)',
    heroContactBtn: 'تواصل مباشر عبر واتساب',
    metricB2B: 'B2B & B2C',
    metricB2BSub: 'تجزئة وجملة للمحلات',
    metricWilayas: '69 ولاية',
    metricWilayasSub: 'توصيل سريع لباب المنزل',
    metricQuality: 'جودة أقمشة فائقة',
    metricQualitySub: 'قطن ناعم ومريح',
    catalogTitle: 'كوليكشن الملابس',
    catalogSubtitle: 'اكتشف تشكيلة الهوديز، الجوجينج والتيشيرتات المصنوعة بعناية وإتقان',
    winterCollectionHeader: 'كوليكشن ورشة DBC',
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
    adminTitle: 'لوحة تحكم صاحب الورشة',
    adminAddProduct: 'إضافة منتج جديد',
    adminEditProduct: 'تعديل المنتجات والأسعار',
    adminContactSettings: 'إعدادات الاتصال ومعلومات المتجر',
    adminSave: 'حفظ التعديلات',
    adminDelete: 'حذف المنتج',
    close: 'إغلاق',
    currencyDzd: 'د.ج',
  },
  en: {
    siteTitle: 'DBC WORKSHOP',
    tagline: 'Premium Apparel Atelier & Manufacturing (B2B & B2C)',
    b2bB2cBadge: 'Wholesale & Retail (B2B & B2C) • 69 Wilayas Nationwide Delivery',
    topbarDelivery: '🚚 Nationwide Delivery Across All 69 Algerian Wilayas • Cash On Delivery Available',
    topbarContact: '📞 Direct WhatsApp Support & Bulk Orders',
    navAll: 'All Products',
    navHoodies: 'Hoodies',
    navJoggers: 'Joggers',
    navLongSleeves: 'Long Sleeves',
    navTees: 'Tees',
    navB2B: 'Wholesale (B2B)',
    navAdmin: 'Workshop Manager',
    navContact: 'Contact Us',
    navOrderLookup: 'Track Order',
    orderLookupTitle: 'Order Lookup & Delivery across 69 Wilayas',
    orderLookupPlaceholder: 'Enter Order ID (e.g. DBC-2026-8492) or Phone number...',
    searchPlaceholder: 'Search hoodies, joggers, colors, sizes...',
    heroTitle: 'Premium Quality Apparel Engineered for Style & Durability',
    heroSubtitle: 'Quality apparel crafted with precision in Algeria: hoodies, sweatpants, joggers, and long-sleeve tees. Serving individual retail clients (B2C) and boutique wholesale buyers (B2B) across all 69 wilayas.',
    heroExploreBtn: 'Explore Collection',
    heroB2BBtn: 'Wholesale B2B Inquiry',
    heroContactBtn: 'Order on WhatsApp',
    metricB2B: 'B2B & B2C',
    metricB2BSub: 'Retail & bulk store supply',
    metricWilayas: '69 Wilayas',
    metricWilayasSub: 'Door-to-door delivery',
    metricQuality: 'Premium Fabrics',
    metricQualitySub: 'Dense, soft brushed cotton',
    catalogTitle: 'Workshop Collection',
    catalogSubtitle: 'Precision-tailored hoodies, ergonomic joggers, and essential casualwear.',
    winterCollectionHeader: 'DBC Workshop Collection',
    filterAll: 'All Items',
    sortBy: 'Sort by',
    sortFeatured: 'Featured',
    sortPriceAsc: 'Price: Low to High',
    sortPriceDesc: 'Price: High to Low',
    sortNewest: 'New Releases',
    b2cPrice: 'Retail Price',
    b2bWholesalePrice: 'Wholesale Price (B2B)',
    minWholesaleQty: 'Wholesale rate applies from 6+ units',
    addToCart: 'Add to Bag',
    selectSize: 'Select Size',
    selectColor: 'Select Color',
    orderViaWhatsApp: 'Quick Order via WhatsApp',
    cartTitle: 'Your Workshop Bag',
    cartEmpty: 'Your bag is currently empty',
    cartSubtotal: 'Subtotal',
    checkoutBtn: 'Proceed to Checkout',
    delivery58Wilayas: 'Fast shipping to all 69 Algerian Wilayas',
    wilayaLabel: 'Wilaya (69 Wilayas)',
    selectWilaya: 'Select your wilaya from the list...',
    cityCommuneLabel: 'City / Commune',
    fullNameLabel: 'Full Name',
    phoneLabel: 'Phone Number (Required for delivery)',
    addressLabel: 'Detailed Street Address',
    deliveryMethod: 'Delivery Method',
    homeDelivery: 'Home Delivery (Door to Door)',
    deskDelivery: 'Desk / StopDesk Pickup',
    paymentMethod: 'Payment Method',
    cashOnDelivery: 'Cash on Delivery (Main à main)',
    baridiMob: 'BaridiMob / CCP Bank Transfer',
    orderSummary: 'Order Summary',
    confirmOrderBtn: 'Confirm Algerian Order',
    orderSuccessTitle: 'Order Received Successfully!',
    orderSuccessMsg: 'Thank you for choosing DBC Workshop. Our delivery courier will call you before dispatching to your Wilaya.',
    b2bSectionTitle: 'For Boutiques & Retailers (B2B Wholesale)',
    b2bSectionSubtitle: 'Own a clothing store or brand? We supply bulk apparel orders at factory-direct pricing with optional custom labeling and embroidery.',
    b2bInquiryBtn: 'Request Wholesale Price List',
    adminTitle: 'Workshop Owner Manager Panel',
    adminAddProduct: 'Add New Product',
    adminEditProduct: 'Edit Products & Prices',
    adminContactSettings: 'Contact & Store Settings',
    adminSave: 'Save Changes',
    adminDelete: 'Delete Product',
    close: 'Close',
    currencyDzd: 'DZD',
  },
  fr: {
    siteTitle: 'DBC WORKSHOP ALGÉRIE',
    tagline: 'Confection & Vente Vêtements Gros et Détail (B2B & B2C)',
    b2bB2cBadge: 'Vente en Gros & Détail (B2B & B2C) • Livraison 69 Wilayas',
    topbarDelivery: '🚚 Livraison disponible dans les 69 Wilayas • Paiement à la livraison',
    topbarContact: '📞 Service client & commandes directes via WhatsApp',
    navAll: 'Tous les produits',
    navHoodies: 'Hoodies',
    navJoggers: 'Pantalons Jogging',
    navLongSleeves: 'Manches Longues',
    navTees: 'T-shirts',
    navB2B: 'Vente en Gros (B2B)',
    navAdmin: 'Gestion Atelier',
    navContact: 'Contactez-nous',
    navOrderLookup: 'Suivi Colis',
    orderLookupTitle: 'Suivi de Commande & Livraison 69 Wilayas',
    orderLookupPlaceholder: 'Entrez votre N° de commande (ex: DBC-2026-8492) ou N° de téléphone...',
    searchPlaceholder: 'Rechercher hoodies, joggings, couleurs, tailles...',
    heroTitle: 'Vêtements de confection soignée conçus pour durer',
    heroSubtitle: 'Vêtements de confection artisanale en Algérie : Hoodies confortables, joggings en coton et t-shirts manches longues. Vente au détail pour particuliers et en gros pour magasins à travers les 69 wilayas.',
    heroExploreBtn: 'Voir la Collection',
    heroB2BBtn: 'Demande Gros (B2B)',
    heroContactBtn: 'Commander sur WhatsApp',
    metricB2B: 'B2B & B2C',
    metricB2BSub: 'Détail et gros pour boutiques',
    metricWilayas: '69 Wilayas',
    metricWilayasSub: 'Livraison à domicile rapide',
    metricQuality: 'Tissus de Qualité',
    metricQualitySub: 'Coton brossé doux et résistant',
    catalogTitle: 'Collection Atelier',
    catalogSubtitle: 'Pièces élégantes et confortables taillées dans des cotons de haute confection.',
    winterCollectionHeader: 'Collection DBC Workshop',
    filterAll: 'Tous',
    sortBy: 'Trier par',
    sortFeatured: 'En Vedette',
    sortPriceAsc: 'Prix : Croissant',
    sortPriceDesc: 'Prix : Décroissant',
    sortNewest: 'Nouveautés',
    b2cPrice: 'Prix Détail',
    b2bWholesalePrice: 'Prix de Gros (B2B)',
    minWholesaleQty: 'Tarif de gros applicable dès 6 pièces',
    addToCart: 'Ajouter au Panier',
    selectSize: 'Choisir la taille',
    selectColor: 'Choisir la couleur',
    orderViaWhatsApp: 'Commande rapide via WhatsApp',
    cartTitle: 'Mon Panier',
    cartEmpty: 'Votre panier est vide',
    cartSubtotal: 'Sous-total',
    checkoutBtn: 'Passer la Commande',
    delivery58Wilayas: 'Livraison express vers les 69 Wilayas d’Algérie',
    wilayaLabel: 'Wilaya (69 Wilayas)',
    selectWilaya: 'Sélectionnez votre wilaya...',
    cityCommuneLabel: 'Commune / Ville',
    fullNameLabel: 'Nom & Prénom',
    phoneLabel: 'Numéro de Téléphone (Requis pour confirmation)',
    addressLabel: 'Adresse complète',
    deliveryMethod: 'Mode de livraison',
    homeDelivery: 'Livraison à Domicile',
    deskDelivery: 'Récupération au Bureau (StopDesk)',
    paymentMethod: 'Mode de paiement',
    cashOnDelivery: 'Paiement à la livraison (Main à main)',
    baridiMob: 'Virement BaridiMob / CCP',
    orderSummary: 'Récapitulatif de la commande',
    confirmOrderBtn: 'Confirmer la commande en Algérie',
    orderSuccessTitle: 'Commande reçue avec succès !',
    orderSuccessMsg: 'Merci de votre confiance en DBC Workshop. Notre livreur vous appellera avant l’expédition vers votre wilaya.',
    b2bSectionTitle: 'Espace Boutiques & Revendeurs (Vente B2B en Gros)',
    b2bSectionSubtitle: 'Vous gérez une boutique ou une marque ? Nous fournissons des séries de vêtements complètes à prix d’atelier direct.',
    b2bInquiryBtn: 'Demander le catalogue de gros',
    adminTitle: 'Panneau d’Administration Atelier',
    adminAddProduct: 'Ajouter un nouveau produit',
    adminEditProduct: 'Modifier les produits et prix',
    adminContactSettings: 'Coordonnées & Paramètres du magasin',
    adminSave: 'Enregistrer les modifications',
    adminDelete: 'Supprimer le produit',
    close: 'Fermer',
    currencyDzd: 'DZD',
  },
  es: {
    siteTitle: 'DBC WORKSHOP ARGELIA',
    tagline: 'Confección y Venta de Ropa B2B y B2C',
    b2bB2cBadge: 'Venta Mayorista y Minorista (B2B & B2C) • Envíos a 69 Provincias',
    topbarDelivery: '🚚 Envíos a las 69 Provincias de Argelia • Pago contra entrega',
    topbarContact: '📞 Atención al cliente y pedidos directos por WhatsApp',
    navAll: 'Todos los productos',
    navHoodies: 'Sudaderas (Hoodies)',
    navJoggers: 'Pantalones Joggers',
    navLongSleeves: 'Manga Larga',
    navTees: 'Camisetas',
    navB2B: 'Venta por Mayor (B2B)',
    navAdmin: 'Gestión de Taller',
    navContact: 'Contacto',
    navOrderLookup: 'Seguimiento',
    orderLookupTitle: 'Seguimiento de Pedido en 69 Wilayas',
    orderLookupPlaceholder: 'Introduzca el N° de pedido (ej: DBC-2026-8492) o teléfono...',
    searchPlaceholder: 'Buscar sudaderas, joggings, colores, tallas...',
    heroTitle: 'Prendas de confección cuidada diseñadas para durar',
    heroSubtitle: 'Prendas de confección en Argelia: Sudaderas, joggers de algodón y camisetas. Venta minorista (B2C) y mayorista (B2B) en las 69 provincias.',
    heroExploreBtn: 'Explorar Colección',
    heroB2BBtn: 'Consulta Mayorista (B2B)',
    heroContactBtn: 'Pedir por WhatsApp',
    metricB2B: 'B2B & B2C',
    metricB2BSub: 'Venta al por mayor y menor',
    metricWilayas: '69 Provincias',
    metricWilayasSub: 'Entrega rápida a domicilio',
    metricQuality: 'Tejidos de Calidad',
    metricQualitySub: 'Algodón suave y resistente',
    catalogTitle: 'Colección de Taller',
    catalogSubtitle: 'Prendas cómodas y versátiles diseñadas en algodón para uso diario.',
    winterCollectionHeader: 'Colección DBC Workshop',
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
    adminTitle: 'Panel de Administración del Taller',
    adminAddProduct: 'Añadir Nuevo Producto',
    adminEditProduct: 'Editar Productos y Precios',
    adminContactSettings: 'Configuración y Contacto',
    adminSave: 'Guardar Cambios',
    adminDelete: 'Eliminar Producto',
    close: 'Cerrar',
    currencyDzd: 'DZD',
  },
};
