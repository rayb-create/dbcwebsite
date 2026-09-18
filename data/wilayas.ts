export interface Wilaya {
  code: string;
  nameEn: string;
  nameAr: string;
  homeDeliveryFeeDzd: number;
  deskDeliveryFeeDzd: number;
  zone: 'centre' | 'est' | 'ouest' | 'sud';
}

export const ALGERIAN_WILAYAS: Wilaya[] = [
  { code: '01', nameEn: 'Adrar', nameAr: 'أدرار', homeDeliveryFeeDzd: 1100, deskDeliveryFeeDzd: 800, zone: 'sud' },
  { code: '02', nameEn: 'Chlef', nameAr: 'الشلف', homeDeliveryFeeDzd: 700, deskDeliveryFeeDzd: 450, zone: 'centre' },
  { code: '03', nameEn: 'Laghouat', nameAr: 'الأغواط', homeDeliveryFeeDzd: 850, deskDeliveryFeeDzd: 600, zone: 'sud' },
  { code: '04', nameEn: 'Oum El Bouaghi', nameAr: 'أم البواقي', homeDeliveryFeeDzd: 750, deskDeliveryFeeDzd: 500, zone: 'est' },
  { code: '05', nameEn: 'Batna', nameAr: 'باتنة', homeDeliveryFeeDzd: 750, deskDeliveryFeeDzd: 500, zone: 'est' },
  { code: '06', nameEn: 'Béjaïa', nameAr: 'بجاية', homeDeliveryFeeDzd: 700, deskDeliveryFeeDzd: 450, zone: 'centre' },
  { code: '07', nameEn: 'Biskra', nameAr: 'بسكرة', homeDeliveryFeeDzd: 850, deskDeliveryFeeDzd: 600, zone: 'sud' },
  { code: '08', nameEn: 'Béchar', nameAr: 'بشار', homeDeliveryFeeDzd: 1000, deskDeliveryFeeDzd: 750, zone: 'sud' },
  { code: '09', nameEn: 'Blida', nameAr: 'البليدة', homeDeliveryFeeDzd: 500, deskDeliveryFeeDzd: 350, zone: 'centre' },
  { code: '10', nameEn: 'Bouira', nameAr: 'البويرة', homeDeliveryFeeDzd: 650, deskDeliveryFeeDzd: 400, zone: 'centre' },
  { code: '11', nameEn: 'Tamanrasset', nameAr: 'تمنراست', homeDeliveryFeeDzd: 1300, deskDeliveryFeeDzd: 950, zone: 'sud' },
  { code: '12', nameEn: 'Tébessa', nameAr: 'تبسة', homeDeliveryFeeDzd: 800, deskDeliveryFeeDzd: 550, zone: 'est' },
  { code: '13', nameEn: 'Tlemcen', nameAr: 'تلمسان', homeDeliveryFeeDzd: 750, deskDeliveryFeeDzd: 500, zone: 'ouest' },
  { code: '14', nameEn: 'Tiaret', nameAr: 'تيارت', homeDeliveryFeeDzd: 750, deskDeliveryFeeDzd: 500, zone: 'ouest' },
  { code: '15', nameEn: 'Tizi Ouzou', nameAr: 'تيزي وزو', homeDeliveryFeeDzd: 650, deskDeliveryFeeDzd: 400, zone: 'centre' },
  { code: '16', nameEn: 'Alger', nameAr: 'الجزائر العاصمة', homeDeliveryFeeDzd: 450, deskDeliveryFeeDzd: 300, zone: 'centre' },
  { code: '17', nameEn: 'Djelfa', nameAr: 'الجلفة', homeDeliveryFeeDzd: 800, deskDeliveryFeeDzd: 550, zone: 'centre' },
  { code: '18', nameEn: 'Jijel', nameAr: 'جيجل', homeDeliveryFeeDzd: 750, deskDeliveryFeeDzd: 500, zone: 'est' },
  { code: '19', nameEn: 'Sétif', nameAr: 'سطيف', homeDeliveryFeeDzd: 700, deskDeliveryFeeDzd: 450, zone: 'est' },
  { code: '20', nameEn: 'Saïda', nameAr: 'سعيدة', homeDeliveryFeeDzd: 800, deskDeliveryFeeDzd: 550, zone: 'ouest' },
  { code: '21', nameEn: 'Skikda', nameAr: 'سكيكدة', homeDeliveryFeeDzd: 750, deskDeliveryFeeDzd: 500, zone: 'est' },
  { code: '22', nameEn: 'Sidi Bel Abbès', nameAr: 'سيدي بلعباس', homeDeliveryFeeDzd: 750, deskDeliveryFeeDzd: 500, zone: 'ouest' },
  { code: '23', nameEn: 'Annaba', nameAr: 'عنابة', homeDeliveryFeeDzd: 750, deskDeliveryFeeDzd: 500, zone: 'est' },
  { code: '24', nameEn: 'Guelma', nameAr: 'قالمة', homeDeliveryFeeDzd: 800, deskDeliveryFeeDzd: 550, zone: 'est' },
  { code: '25', nameEn: 'Constantine', nameAr: 'قسنطينة', homeDeliveryFeeDzd: 700, deskDeliveryFeeDzd: 450, zone: 'est' },
  { code: '26', nameEn: 'Médéa', nameAr: 'المدية', homeDeliveryFeeDzd: 650, deskDeliveryFeeDzd: 400, zone: 'centre' },
  { code: '27', nameEn: 'Mostaganem', nameAr: 'مستغانم', homeDeliveryFeeDzd: 750, deskDeliveryFeeDzd: 500, zone: 'ouest' },
  { code: '28', nameEn: "M'Sila", nameAr: 'المسيلة', homeDeliveryFeeDzd: 750, deskDeliveryFeeDzd: 500, zone: 'centre' },
  { code: '29', nameEn: 'Mascara', nameAr: 'معسكر', homeDeliveryFeeDzd: 750, deskDeliveryFeeDzd: 500, zone: 'ouest' },
  { code: '30', nameEn: 'Ouargla', nameAr: 'ورقلة', homeDeliveryFeeDzd: 950, deskDeliveryFeeDzd: 700, zone: 'sud' },
  { code: '31', nameEn: 'Oran', nameAr: 'وهران', homeDeliveryFeeDzd: 700, deskDeliveryFeeDzd: 450, zone: 'ouest' },
  { code: '32', nameEn: 'El Bayadh', nameAr: 'البيض', homeDeliveryFeeDzd: 900, deskDeliveryFeeDzd: 650, zone: 'sud' },
  { code: '33', nameEn: 'Illizi', nameAr: 'إليزي', homeDeliveryFeeDzd: 1300, deskDeliveryFeeDzd: 950, zone: 'sud' },
  { code: '34', nameEn: 'Bordj Bou Arréridj', nameAr: 'برج بوعريريج', homeDeliveryFeeDzd: 700, deskDeliveryFeeDzd: 450, zone: 'est' },
  { code: '35', nameEn: 'Boumerdès', nameAr: 'بومرداس', homeDeliveryFeeDzd: 550, deskDeliveryFeeDzd: 350, zone: 'centre' },
  { code: '36', nameEn: 'El Tarf', nameAr: 'الطارف', homeDeliveryFeeDzd: 850, deskDeliveryFeeDzd: 600, zone: 'est' },
  { code: '37', nameEn: 'Tindouf', nameAr: 'تندوف', homeDeliveryFeeDzd: 1300, deskDeliveryFeeDzd: 950, zone: 'sud' },
  { code: '38', nameEn: 'Tissemsilt', nameAr: 'تيسمسيلت', homeDeliveryFeeDzd: 800, deskDeliveryFeeDzd: 550, zone: 'centre' },
  { code: '39', nameEn: 'El Oued', nameAr: 'الوادي', homeDeliveryFeeDzd: 950, deskDeliveryFeeDzd: 700, zone: 'sud' },
  { code: '40', nameEn: 'Khenchela', nameAr: 'خنشلة', homeDeliveryFeeDzd: 800, deskDeliveryFeeDzd: 550, zone: 'est' },
  { code: '41', nameEn: 'Souk Ahras', nameAr: 'سوق أهراس', homeDeliveryFeeDzd: 800, deskDeliveryFeeDzd: 550, zone: 'est' },
  { code: '42', nameEn: 'Tipaza', nameAr: 'تيبازة', homeDeliveryFeeDzd: 550, deskDeliveryFeeDzd: 350, zone: 'centre' },
  { code: '43', nameEn: 'Mila', nameAr: 'ميلة', homeDeliveryFeeDzd: 750, deskDeliveryFeeDzd: 500, zone: 'est' },
  { code: '44', nameEn: 'Aïn Defla', nameAr: 'عين الدفلى', homeDeliveryFeeDzd: 700, deskDeliveryFeeDzd: 450, zone: 'centre' },
  { code: '45', nameEn: 'Naâma', nameAr: 'النعامة', homeDeliveryFeeDzd: 950, deskDeliveryFeeDzd: 700, zone: 'sud' },
  { code: '46', nameEn: 'Aïn Témouchent', nameAr: 'عين تموشنت', homeDeliveryFeeDzd: 750, deskDeliveryFeeDzd: 500, zone: 'ouest' },
  { code: '47', nameEn: 'Ghardaïa', nameAr: 'غرداية', homeDeliveryFeeDzd: 900, deskDeliveryFeeDzd: 650, zone: 'sud' },
  { code: '48', nameEn: 'Relizane', nameAr: 'غليزان', homeDeliveryFeeDzd: 750, deskDeliveryFeeDzd: 500, zone: 'ouest' },
  { code: '49', nameEn: 'Timimoun', nameAr: 'تيميمون', homeDeliveryFeeDzd: 1200, deskDeliveryFeeDzd: 850, zone: 'sud' },
  { code: '50', nameEn: 'Bordj Badji Mokhtar', nameAr: 'برج باجي مختار', homeDeliveryFeeDzd: 1500, deskDeliveryFeeDzd: 1100, zone: 'sud' },
  { code: '51', nameEn: 'Ouled Djellal', nameAr: 'أولاد جلال', homeDeliveryFeeDzd: 850, deskDeliveryFeeDzd: 600, zone: 'sud' },
  { code: '52', nameEn: 'Béni Abbès', nameAr: 'بني عباس', homeDeliveryFeeDzd: 1200, deskDeliveryFeeDzd: 850, zone: 'sud' },
  { code: '53', nameEn: 'In Salah', nameAr: 'عين صالح', homeDeliveryFeeDzd: 1250, deskDeliveryFeeDzd: 900, zone: 'sud' },
  { code: '54', nameEn: 'In Guezzam', nameAr: 'عين قزام', homeDeliveryFeeDzd: 1600, deskDeliveryFeeDzd: 1200, zone: 'sud' },
  { code: '55', nameEn: 'Touggourt', nameAr: 'تقرت', homeDeliveryFeeDzd: 950, deskDeliveryFeeDzd: 700, zone: 'sud' },
  { code: '56', nameEn: 'Djanet', nameAr: 'جانت', homeDeliveryFeeDzd: 1500, deskDeliveryFeeDzd: 1100, zone: 'sud' },
  { code: '57', nameEn: "El M'Ghair", nameAr: 'المغير', homeDeliveryFeeDzd: 900, deskDeliveryFeeDzd: 650, zone: 'sud' },
  { code: '58', nameEn: 'El Meniaa', nameAr: 'المنيعة', homeDeliveryFeeDzd: 950, deskDeliveryFeeDzd: 700, zone: 'sud' },
  { code: '59', nameEn: 'Aflou', nameAr: 'آفلو', homeDeliveryFeeDzd: 850, deskDeliveryFeeDzd: 600, zone: 'sud' },
  { code: '60', nameEn: 'Barika', nameAr: 'بريكة', homeDeliveryFeeDzd: 750, deskDeliveryFeeDzd: 500, zone: 'est' },
  { code: '61', nameEn: 'El Kantara', nameAr: 'القنطرة', homeDeliveryFeeDzd: 800, deskDeliveryFeeDzd: 550, zone: 'est' },
  { code: '62', nameEn: 'Bir El Ater', nameAr: 'بئر العاتر', homeDeliveryFeeDzd: 850, deskDeliveryFeeDzd: 600, zone: 'est' },
  { code: '63', nameEn: 'El Aricha', nameAr: 'العريشة', homeDeliveryFeeDzd: 800, deskDeliveryFeeDzd: 550, zone: 'ouest' },
  { code: '64', nameEn: 'Ksar Chellala', nameAr: 'قصر الشلالة', homeDeliveryFeeDzd: 800, deskDeliveryFeeDzd: 550, zone: 'ouest' },
  { code: '65', nameEn: 'Aïn Oussara', nameAr: 'عين وسارة', homeDeliveryFeeDzd: 750, deskDeliveryFeeDzd: 500, zone: 'centre' },
  { code: '66', nameEn: 'Messaad', nameAr: 'مسعد', homeDeliveryFeeDzd: 800, deskDeliveryFeeDzd: 550, zone: 'centre' },
  { code: '67', nameEn: 'Ksar El Boukhari', nameAr: 'قصر البخاري', homeDeliveryFeeDzd: 700, deskDeliveryFeeDzd: 450, zone: 'centre' },
  { code: '68', nameEn: 'Bou Saâda', nameAr: 'بوسعادة', homeDeliveryFeeDzd: 800, deskDeliveryFeeDzd: 550, zone: 'centre' },
  { code: '69', nameEn: 'El Abiodh Sidi Cheikh', nameAr: 'الأبيض سيدي الشيخ', homeDeliveryFeeDzd: 950, deskDeliveryFeeDzd: 700, zone: 'sud' },
];

export function getWilayaByCode(code: string, customRates?: Record<string, { home: number; desk: number }>): Wilaya | undefined {
  const base = ALGERIAN_WILAYAS.find((w) => w.code === code);
  if (!base) return undefined;
  if (!customRates || !customRates[code]) return base;
  return {
    ...base,
    homeDeliveryFeeDzd: typeof customRates[code].home === 'number' ? customRates[code].home : base.homeDeliveryFeeDzd,
    deskDeliveryFeeDzd: typeof customRates[code].desk === 'number' ? customRates[code].desk : base.deskDeliveryFeeDzd,
  };
}

export function getWilayasWithCustomRates(customRates?: Record<string, { home: number; desk: number }>): Wilaya[] {
  if (!customRates || Object.keys(customRates).length === 0) {
    return ALGERIAN_WILAYAS;
  }
  return ALGERIAN_WILAYAS.map((w) => {
    const custom = customRates[w.code];
    if (!custom) return w;
    return {
      ...w,
      homeDeliveryFeeDzd: typeof custom.home === 'number' ? custom.home : w.homeDeliveryFeeDzd,
      deskDeliveryFeeDzd: typeof custom.desk === 'number' ? custom.desk : w.deskDeliveryFeeDzd,
    };
  });
}
