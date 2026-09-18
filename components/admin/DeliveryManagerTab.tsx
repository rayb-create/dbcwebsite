import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  Save, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Check, 
  ExternalLink, 
  Phone, 
  Building, 
  Percent, 
  DollarSign, 
  Search, 
  Filter, 
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import { StoreSettings, DeliveryCompany, Currency } from '../../types';
import { Language } from '../../data/i18n';
import { ALGERIAN_WILAYAS, Wilaya, getWilayasWithCustomRates } from '../../data/wilayas';
import { DEFAULT_DELIVERY_COMPANIES } from '../../data/deliveryCompanies';
import { formatPrice } from '../../utils/format';
import { useAdminLanguage } from '../../context/AdminLanguageContext';

interface DeliveryManagerTabProps {
  storeSettings: StoreSettings;
  onUpdateStoreSettings: (newSettings: Partial<StoreSettings>) => void;
  currentLanguage?: Language;
  currency: Currency;
}

export const DeliveryManagerTab: React.FC<DeliveryManagerTabProps> = ({
  storeSettings,
  onUpdateStoreSettings,
  currentLanguage,
  currency,
}) => {
  const { adminLang, isRtl } = useAdminLanguage();
  const isArabic = adminLang === 'ar';

  // Sub-tab: 'companies' | 'rates'
  const [subTab, setSubTab] = useState<'rates' | 'companies'>('rates');

  // Delivery companies state
  const [companies, setCompanies] = useState<DeliveryCompany[]>(() => {
    return storeSettings.deliveryCompanies && storeSettings.deliveryCompanies.length > 0
      ? storeSettings.deliveryCompanies
      : DEFAULT_DELIVERY_COMPANIES;
  });
  const [activeCompanyId, setActiveCompanyId] = useState<string>(
    storeSettings.activeDeliveryCompany || 'yalidine'
  );

  // New / Edit company modal/inline form
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyTrackingUrl, setCompanyTrackingUrl] = useState('');
  const [companyPrefix, setCompanyPrefix] = useState('');
  const [companySupportsStopDesk, setCompanySupportsStopDesk] = useState(true);
  const [companyNotes, setCompanyNotes] = useState('');

  // 69 Wilayas delivery rates state
  const [customRates, setCustomRates] = useState<Record<string, { home: number; desk: number }>>(() => {
    return storeSettings.customWilayaRates || {};
  });

  // Free shipping threshold state
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(
    storeSettings.freeShippingThresholdDzd || 0
  );

  // Zone bulk inputs state
  const [zoneInputs, setZoneInputs] = useState<Record<string, { home: number; desk: number }>>({
    centre: { home: 500, desk: 350 },
    est: { home: 750, desk: 500 },
    ouest: { home: 750, desk: 500 },
    sud: { home: 1000, desk: 750 },
  });

  // General shift input state
  const [generalShiftDzd, setGeneralShiftDzd] = useState<number>(50);

  // Wilaya filter state
  const [wilayaSearchQuery, setWilayaSearchQuery] = useState('');
  const [wilayaZoneFilter, setWilayaZoneFilter] = useState<'all' | 'centre' | 'est' | 'ouest' | 'sud'>('all');

  // Success Toast
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  // Get current effective rates for all 69 wilayas
  const effectiveWilayas = getWilayasWithCustomRates(customRates);

  // Filtered wilayas
  const filteredWilayas = effectiveWilayas.filter((w) => {
    if (wilayaZoneFilter !== 'all' && w.zone !== wilayaZoneFilter) return false;
    if (wilayaSearchQuery.trim()) {
      const q = wilayaSearchQuery.toLowerCase().trim();
      return (
        w.code.includes(q) ||
        w.nameEn.toLowerCase().includes(q) ||
        w.nameAr.includes(q)
      );
    }
    return true;
  });

  // Handle individual wilaya price change
  const handleWilayaFeeChange = (code: string, type: 'home' | 'desk', value: number) => {
    const val = Math.max(0, isNaN(value) ? 0 : value);
    const existing = customRates[code] || {
      home: ALGERIAN_WILAYAS.find((w) => w.code === code)?.homeDeliveryFeeDzd || 600,
      desk: ALGERIAN_WILAYAS.find((w) => w.code === code)?.deskDeliveryFeeDzd || 400,
    };

    setCustomRates((prev) => ({
      ...prev,
      [code]: {
        ...existing,
        [type]: val,
      },
    }));
  };

  // Apply bulk zone price
  const handleApplyZoneBulk = (zone: 'centre' | 'est' | 'ouest' | 'sud') => {
    const ratesForZone = zoneInputs[zone];
    const newRates = { ...customRates };

    ALGERIAN_WILAYAS.filter((w) => w.zone === zone).forEach((w) => {
      newRates[w.code] = {
        home: ratesForZone.home,
        desk: ratesForZone.desk,
      };
    });

    setCustomRates(newRates);
    triggerToast(
      isArabic
        ? `تم تطبيق أسعار منطقة ${zone.toUpperCase()} بنجاح على جميع ولاياتها !`
        : `Tarifs appliqués avec succès à toute la zone ${zone.toUpperCase()} !`
    );
  };

  // Apply general uniform offset shift
  const handleApplyUniformShift = (isAddition: boolean) => {
    const delta = isAddition ? generalShiftDzd : -generalShiftDzd;
    const newRates = { ...customRates };

    ALGERIAN_WILAYAS.forEach((w) => {
      const current = customRates[w.code] || {
        home: w.homeDeliveryFeeDzd,
        desk: w.deskDeliveryFeeDzd,
      };
      newRates[w.code] = {
        home: Math.max(0, current.home + delta),
        desk: Math.max(0, current.desk + delta),
      };
    });

    setCustomRates(newRates);
    triggerToast(
      isArabic
        ? `تم تطبيق ${isAddition ? '+' : '-'}${generalShiftDzd} د.ج على جميع الـ 69 ولاية !`
        : `Ajustement de ${isAddition ? '+' : '-'}${generalShiftDzd} DZD appliqué sur les 69 wilayas !`
    );
  };

  // Reset wilaya rates to defaults
  const handleResetWilayaRates = () => {
    if (
      confirm(
        isArabic
          ? 'هل ترغب في استعادة أسعار التوصيل الرسمية الأصلية لجميع الـ 69 ولاية؟'
          : 'Voulez-vous rétablir les tarifs officiels par défaut pour l’ensemble des 69 wilayas ?'
      )
    ) {
      setCustomRates({});
      onUpdateStoreSettings({ customWilayaRates: {} });
      triggerToast(
        isArabic
          ? 'تمت استعادة الأسعار الافتراضية بنجاح.'
          : 'Tarifs officiels réinitialisés avec succès.'
      );
    }
  };

  // Save all delivery rates & threshold
  const handleSaveDeliveryRates = () => {
    onUpdateStoreSettings({
      customWilayaRates: customRates,
      freeShippingThresholdDzd: freeShippingThreshold,
    });
    triggerToast(
      isArabic
        ? 'تم حفظ أسعار التوصيل الجديدة عبر كامل الـ 69 ولاية بنجاح !'
        : 'Tarifs de livraison des 69 wilayas enregistrés avec succès !'
    );
  };

  // Delivery Companies Actions
  const handleSetActiveCompany = (id: string) => {
    setActiveCompanyId(id);
    const updatedCompanies = companies.map((c) => ({
      ...c,
      isActive: c.id === id,
    }));
    setCompanies(updatedCompanies);
    onUpdateStoreSettings({
      activeDeliveryCompany: id,
      deliveryCompanies: updatedCompanies,
    });
    const found = companies.find((c) => c.id === id);
    triggerToast(
      isArabic
        ? `تم تفعيل ${found?.name} كشركة توصيل رئيسية للطلبيات !`
        : `${found?.name} défini comme transporteur principal pour toutes les commandes !`
    );
  };

  const handleStartAddCompany = () => {
    setIsAddingCompany(true);
    setEditingCompanyId(null);
    setCompanyName('');
    setCompanyPhone('');
    setCompanyTrackingUrl('https://exemple.dz/tracking/{TRACKING}');
    setCompanyPrefix('EXP-');
    setCompanySupportsStopDesk(true);
    setCompanyNotes('');
  };

  const handleStartEditCompany = (c: DeliveryCompany) => {
    setEditingCompanyId(c.id);
    setIsAddingCompany(false);
    setCompanyName(c.name);
    setCompanyPhone(c.phone);
    setCompanyTrackingUrl(c.trackingUrlTemplate);
    setCompanyPrefix(c.trackingPrefix);
    setCompanySupportsStopDesk(c.supportsStopDesk);
    setCompanyNotes(c.notes || '');
  };

  const handleSaveCompanyForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    if (isAddingCompany) {
      const newComp: DeliveryCompany = {
        id: `carrier-${Date.now()}`,
        name: companyName.trim(),
        phone: companyPhone.trim(),
        trackingUrlTemplate: companyTrackingUrl.trim(),
        trackingPrefix: companyPrefix.trim().toUpperCase(),
        supportsStopDesk: companySupportsStopDesk,
        isActive: false,
        notes: companyNotes.trim(),
      };
      const updated = [...companies, newComp];
      setCompanies(updated);
      onUpdateStoreSettings({ deliveryCompanies: updated });
      setIsAddingCompany(false);
      triggerToast(
        isArabic
          ? `تمت إضافة شركة التوصيل "${companyName}" بنجاح !`
          : `Transporteur "${companyName}" ajouté avec succès !`
      );
    } else if (editingCompanyId) {
      const updated = companies.map((c) =>
        c.id === editingCompanyId
          ? {
              ...c,
              name: companyName.trim(),
              phone: companyPhone.trim(),
              trackingUrlTemplate: companyTrackingUrl.trim(),
              trackingPrefix: companyPrefix.trim().toUpperCase(),
              supportsStopDesk: companySupportsStopDesk,
              notes: companyNotes.trim(),
            }
          : c
      );
      setCompanies(updated);
      onUpdateStoreSettings({ deliveryCompanies: updated });
      setEditingCompanyId(null);
      triggerToast(
        isArabic
          ? `تم تحديث بيانات "${companyName}" بنجاح !`
          : `Informations de "${companyName}" mises à jour avec succès !`
      );
    }
  };

  const handleDeleteCompany = (id: string) => {
    const target = companies.find((c) => c.id === id);
    if (!target) return;
    if (companies.length <= 1) {
      triggerToast(isArabic ? 'يجب الإبقاء على شركة توصيل واحدة على الأقل.' : 'Vous devez conserver au moins un transporteur.');
      return;
    }
    if (confirm(isArabic ? `هل أنت متأكد من حذف ${target.name}؟` : `Supprimer le transporteur ${target.name} ?`)) {
      const updated = companies.filter((c) => c.id !== id);
      if (activeCompanyId === id && updated.length > 0) {
        updated[0].isActive = true;
        setActiveCompanyId(updated[0].id);
        onUpdateStoreSettings({
          activeDeliveryCompany: updated[0].id,
          deliveryCompanies: updated,
        });
      } else {
        setCompanies(updated);
        onUpdateStoreSettings({ deliveryCompanies: updated });
      }
      triggerToast(
        isArabic ? `تم حذف شركة التوصيل.` : `Transporteur supprimé.`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {showSavedToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-mono rounded flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setShowSavedToast(false)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner Navigation between Rates & Carriers */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-[#DDD4C5] p-4 rounded shadow-xs">
        <div>
          <h3 className="font-serif text-lg font-medium text-[#1F1D1A] flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#C9A96E]" />
            <span>{isArabic ? 'إدارة التوصيل: الأسعار والشركات الشاحنة' : 'Tarifs de Livraison & Sociétés de Transport'}</span>
          </h3>
          <p className="text-xs text-[#736B5E] mt-0.5 font-sans">
            {isArabic
              ? 'تحديد أسعار التوصيل لـ 69 ولاية، تفعيل الشحن المجاني، وضبط شركات التوصيل وروابط التتبع.'
              : 'Ajustez les prix de livraison domicile et StopDesk par wilaya, configurez le seuil franco et vos transporteurs partenaires.'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-stretch sm:self-auto bg-[#F5F2EB] p-1 rounded border border-[#EAE3D6]">
          <button
            onClick={() => setSubTab('rates')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              subTab === 'rates'
                ? 'bg-[#1F1D1A] text-white font-medium shadow-xs'
                : 'text-[#5C5446] hover:bg-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#C9A96E]" />
            <span>{isArabic ? 'أسعار 69 ولاية' : 'Tarifs 69 Wilayas'}</span>
          </button>

          <button
            onClick={() => setSubTab('companies')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              subTab === 'companies'
                ? 'bg-[#1F1D1A] text-white font-medium shadow-xs'
                : 'text-[#5C5446] hover:bg-white'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-[#C9A96E]" />
            <span>{isArabic ? `شركات التوصيل (${companies.length})` : `Transporteurs (${companies.length})`}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SUB-TAB 1: TARIFS DE LIVRAISON 69 WILAYAS
         ========================================================================= */}
      {subTab === 'rates' && (
        <div className="space-y-6">
          {/* Quick Zone Bulk Adjustment Cards */}
          <div className="bg-white border border-[#DDD4C5] rounded p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EAE3D6]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C9A96E]" />
                <h4 className="font-serif text-sm font-medium text-[#1F1D1A]">
                  {isArabic ? 'تعديل سريع ومباشر حسب المناطق الجغرافية' : 'Ajustement Rapide par Zone Géographique'}
                </h4>
              </div>
              <span className="text-[11px] font-mono text-[#8C8275]">
                {isArabic ? 'يطبق بنقرة واحدة على جميع ولايات المنطقة' : 'Applique les tarifs en 1 clic à toutes les wilayas de la zone'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(['centre', 'est', 'ouest', 'sud'] as const).map((z) => {
                const zoneLabels = {
                  centre: { fr: 'Zone Centre (Alger, Blida...)', ar: 'منطقة الوسط (الجزائر، البليدة...)' },
                  est: { fr: 'Zone Est (Constantine, Annaba...)', ar: 'منطقة الشرق (قسنطينة، عنابة...)' },
                  ouest: { fr: 'Zone Ouest (Oran, Tlemcen...)', ar: 'منطقة الغرب (وهران، تلمسان...)' },
                  sud: { fr: 'Zone Sud (Ouargla, Adrar...)', ar: 'منطقة الجنوب (ورقلة، أدرار...)' },
                };

                const wilayaCount = ALGERIAN_WILAYAS.filter((w) => w.zone === z).length;

                return (
                  <div key={z} className="p-3.5 bg-[#FAF8F5] border border-[#EAE3D6] rounded space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase text-[#1F1D1A]">
                        {isArabic ? zoneLabels[z].ar : zoneLabels[z].fr}
                      </span>
                      <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-[#DDD4C5] text-[#736B5E]">
                        {wilayaCount} wilayas
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div>
                        <label className="block text-[10px] text-[#736B5E] mb-0.5">
                          {isArabic ? '🏠 توصيل للمنزل' : '🏠 Domicile'}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="50"
                            value={zoneInputs[z].home}
                            onChange={(e) =>
                              setZoneInputs((prev) => ({
                                ...prev,
                                [z]: { ...prev[z], home: Number(e.target.value) },
                              }))
                            }
                            className="w-full px-2 py-1 bg-white border border-[#DDD4C5] rounded text-xs font-mono text-[#1F1D1A]"
                          />
                          <span className="absolute right-2 top-1 text-[10px] text-[#8C8275]">DZD</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-[#736B5E] mb-0.5">
                          {isArabic ? '🏢 مكتب StopDesk' : '🏢 StopDesk'}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="50"
                            value={zoneInputs[z].desk}
                            onChange={(e) =>
                              setZoneInputs((prev) => ({
                                ...prev,
                                [z]: { ...prev[z], desk: Number(e.target.value) },
                              }))
                            }
                            className="w-full px-2 py-1 bg-white border border-[#DDD4C5] rounded text-xs font-mono text-[#1F1D1A]"
                          />
                          <span className="absolute right-2 top-1 text-[10px] text-[#8C8275]">DZD</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyZoneBulk(z)}
                      className="w-full py-1.5 bg-white hover:bg-[#F2EDE4] text-[#8C6D3B] hover:text-[#1F1D1A] border border-[#DDD4C5] text-[11px] font-mono rounded transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>{isArabic ? 'تطبيق على المنطقة' : 'Appliquer à la zone'}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* General Uniform Offset Shift & Free Shipping Threshold */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#EAE3D6]">
              {/* Shift +/- */}
              <div className="p-3 bg-[#FAF8F5] border border-[#EAE3D6] rounded flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono font-semibold text-[#1F1D1A] mb-1">
                    {isArabic ? 'تعديل عام نسبي (+/- د.ج)' : 'Ajustement Général Rapide (+/- DZD)'}
                  </div>
                  <p className="text-[11px] text-[#736B5E]">
                    {isArabic ? 'إضافة أو خصم مبلغ محدد دفعة واحدة على جميع الـ 69 ولاية.' : 'Appliquez une variation uniforme sur l’ensemble des 69 wilayas.'}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <input
                    type="number"
                    value={generalShiftDzd}
                    onChange={(e) => setGeneralShiftDzd(Number(e.target.value) || 0)}
                    className="w-24 px-2 py-1 bg-white border border-[#DDD4C5] rounded text-xs font-mono"
                  />
                  <span className="text-xs font-mono text-[#736B5E]">DZD</span>
                  <button
                    type="button"
                    onClick={() => handleApplyUniformShift(true)}
                    className="px-3 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-[#DDD4C5] text-xs font-mono rounded cursor-pointer"
                  >
                    +{generalShiftDzd} DZD
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyUniformShift(false)}
                    className="px-3 py-1 bg-white hover:bg-rose-50 text-rose-800 border border-[#DDD4C5] text-xs font-mono rounded cursor-pointer"
                  >
                    -{generalShiftDzd} DZD
                  </button>
                </div>
              </div>

              {/* Free Shipping Threshold */}
              <div className="p-3 bg-[#FAF8F5] border border-[#EAE3D6] rounded flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono font-semibold text-[#1F1D1A] mb-1 flex items-center justify-between">
                    <span>{isArabic ? 'شحن مجاني للطلبات الكبيرة' : 'Seuil de Livraison Gratuite (Franco)'}</span>
                    <span className="text-[10px] text-[#8C8275] font-mono">
                      {freeShippingThreshold > 0 ? `${freeShippingThreshold} DZD` : 'Désactivé'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#736B5E]">
                    {isArabic
                      ? 'إذا تجاوزت قيمة سلة المشتريات هذا المبلغ، تصبح مصاريف الشحن 0 د.ج (0 = بدون شحن مجاني).'
                      : 'Au-delà de ce montant panier, les frais de port deviennent 0 DZD (0 pour désactiver).'}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(Number(e.target.value) || 0)}
                    placeholder="15000"
                    className="w-32 px-2 py-1 bg-white border border-[#DDD4C5] rounded text-xs font-mono"
                  />
                  <span className="text-xs font-mono text-[#736B5E]">DZD</span>
                  <button
                    type="button"
                    onClick={() => setFreeShippingThreshold(0)}
                    className="px-2 py-1 bg-white hover:bg-[#F2EDE4] text-xs text-[#8C8275] border border-[#DDD4C5] rounded"
                  >
                    Désactiver
                  </button>
                  <button
                    type="button"
                    onClick={() => setFreeShippingThreshold(15000)}
                    className="px-2 py-1 bg-white hover:bg-[#F2EDE4] text-xs text-[#8C6D3B] border border-[#DDD4C5] rounded"
                  >
                    15 000 DZD
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 69 Wilayas Editable Table */}
          <div className="bg-white border border-[#DDD4C5] rounded overflow-hidden shadow-xs">
            {/* Filter & Search Header */}
            <div className="p-4 bg-[#FAF8F5] border-b border-[#DDD4C5] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8C8275] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={wilayaSearchQuery}
                  onChange={(e) => setWilayaSearchQuery(e.target.value)}
                  placeholder={isArabic ? 'ابحث برقم الولاية (16، 31...) أو اسمها بالعربية والفرنسية...' : 'Filtrer par code (16, 31...) ou nom de wilaya...'}
                  className="w-full pl-9 pr-4 py-1.5 bg-white border border-[#DDD4C5] rounded text-xs font-sans text-[#1F1D1A]"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs font-mono">
                {(['all', 'centre', 'est', 'ouest', 'sud'] as const).map((z) => (
                  <button
                    key={z}
                    onClick={() => setWilayaZoneFilter(z)}
                    className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                      wilayaZoneFilter === z
                        ? 'bg-[#1F1D1A] text-white font-medium'
                        : 'bg-white text-[#5C5446] border border-[#DDD4C5] hover:bg-[#F2EDE4]'
                    }`}
                  >
                    {z === 'all' ? (isArabic ? 'الكل (69)' : 'Toutes (69)') : z.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#F2EDE4] text-[#4A4338] text-[11px] font-mono uppercase tracking-wider sticky top-0 z-10 border-b border-[#DDD4C5]">
                  <tr>
                    <th className="py-2.5 px-3 w-14">Code</th>
                    <th className="py-2.5 px-3">Wilaya (Français / العربية)</th>
                    <th className="py-2.5 px-3">Zone</th>
                    <th className="py-2.5 px-3 w-36">🏠 Domicile (DZD)</th>
                    <th className="py-2.5 px-3 w-36">🏢 StopDesk (DZD)</th>
                    <th className="py-2.5 px-3 w-28 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE3D6] text-[#1F1D1A]">
                  {filteredWilayas.map((w) => {
                    const base = ALGERIAN_WILAYAS.find((b) => b.code === w.code);
                    const isCustomized =
                      base &&
                      (base.homeDeliveryFeeDzd !== w.homeDeliveryFeeDzd ||
                        base.deskDeliveryFeeDzd !== w.deskDeliveryFeeDzd);

                    return (
                      <tr key={w.code} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#8C6D3B]">
                          {w.code}
                        </td>
                        <td className="py-2.5 px-3 font-medium">
                          <div className="flex items-center gap-2">
                            <span>{w.nameEn}</span>
                            <span className="text-[#8C8275] text-[11px]" dir="rtl">
                              ({w.nameAr})
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-mono uppercase rounded ${
                              w.zone === 'centre'
                                ? 'bg-amber-100 text-amber-900'
                                : w.zone === 'est'
                                ? 'bg-sky-100 text-sky-900'
                                : w.zone === 'ouest'
                                ? 'bg-indigo-100 text-indigo-900'
                                : 'bg-orange-100 text-orange-900'
                            }`}
                          >
                            {w.zone}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              step="50"
                              value={w.homeDeliveryFeeDzd}
                              onChange={(e) =>
                                handleWilayaFeeChange(w.code, 'home', Number(e.target.value))
                              }
                              className="w-full px-2 py-1 bg-white border border-[#DDD4C5] rounded text-xs font-mono text-[#1F1D1A]"
                            />
                            <span className="absolute right-2 top-1 text-[10px] text-[#8C8275] pointer-events-none">
                              د.ج
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              step="50"
                              value={w.deskDeliveryFeeDzd}
                              onChange={(e) =>
                                handleWilayaFeeChange(w.code, 'desk', Number(e.target.value))
                              }
                              className="w-full px-2 py-1 bg-white border border-[#DDD4C5] rounded text-xs font-mono text-[#1F1D1A]"
                            />
                            <span className="absolute right-2 top-1 text-[10px] text-[#8C8275] pointer-events-none">
                              د.ج
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {isCustomized ? (
                            <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 rounded text-[10px] font-mono">
                              Modifié
                            </span>
                          ) : (
                            <span className="text-[#B3AAA0] text-[10px] font-mono">
                              Standard
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Save & Reset Bar */}
            <div className="p-4 bg-[#F2EDE4] border-t border-[#DDD4C5] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono text-[#736B5E]">
                <span>
                  {Object.keys(customRates).length} {isArabic ? 'ولايات مخصصة السعر' : 'wilayas personnalisées'}
                </span>
                {Object.keys(customRates).length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetWilayaRates}
                    className="text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{isArabic ? 'إعادة ضبط الجميع إلى الأصل' : 'Réinitialiser aux tarifs d’origine'}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveDeliveryRates}
                  className="px-5 py-2.5 bg-[#1F1D1A] hover:bg-[#332E27] text-white text-xs font-mono font-semibold rounded flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                >
                  <Save className="w-4 h-4 text-[#C9A96E]" />
                  <span>{isArabic ? 'حفظ أسعار التوصيل (69 ولاية)' : 'Enregistrer les Tarifs des 69 Wilayas'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 2: SOCIÉTÉS DE LIVRAISON (CARRIERS)
         ========================================================================= */}
      {subTab === 'companies' && (
        <div className="space-y-6">
          {/* Active Carrier Spotlight */}
          <div className="bg-white border border-[#DDD4C5] rounded p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EAE3D6]">
              <div>
                <div className="text-xs font-mono text-[#8C6D3B] uppercase tracking-wider mb-0.5">
                  {isArabic ? 'الناقل الرسمي الحالي' : 'Transporteur Principal Actif'}
                </div>
                <h4 className="font-serif text-base font-semibold text-[#1F1D1A]">
                  {companies.find((c) => c.id === activeCompanyId)?.name || 'Yalidine Express'}
                </h4>
                <p className="text-xs text-[#736B5E]">
                  {isArabic 
                    ? 'هذا الناقل يُحدد تلقائياً لجميع الطلبيات الجديدة المنفذة عبر المتجر.'
                    : 'Attribué par défaut à chaque nouvelle commande client validée.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartAddCompany}
                className="px-4 py-2 bg-[#1F1D1A] hover:bg-[#332E27] text-white text-xs font-mono rounded flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5 text-[#C9A96E]" />
                <span>{isArabic ? 'إضافة شركة توصيل جديدة' : 'Ajouter un Transporteur'}</span>
              </button>
            </div>

            {/* List of Carriers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {companies.map((carrier) => {
                const isActive = carrier.id === activeCompanyId;

                return (
                  <div
                    key={carrier.id}
                    className={`p-4 rounded border transition-all ${
                      isActive
                        ? 'bg-amber-50/40 border-[#C9A96E] ring-1 ring-[#C9A96E]/40'
                        : 'bg-[#FAF8F5] border-[#DDD4C5] hover:border-[#B3AAA0]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-serif font-bold text-[#1F1D1A] text-sm">
                            {carrier.name}
                          </h5>
                          {isActive && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono rounded-full font-bold">
                              ★ {isArabic ? 'نشط (الافتراضي)' : 'Actif'}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[#736B5E] font-mono mt-1">
                          <Phone className="w-3 h-3 text-[#8C6D3B]" />
                          <span>{carrier.phone || '0550 ...'}</span>
                          <span className="text-[#DDD4C5]">|</span>
                          <span className="text-[11px] font-semibold text-[#8C6D3B]">
                            Préfixe: {carrier.trackingPrefix}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartEditCompany(carrier)}
                          className="p-1.5 text-[#5C5446] hover:text-[#1F1D1A] hover:bg-white rounded border border-[#DDD4C5] transition-colors cursor-pointer"
                          title="Modifier"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </button>
                        {companies.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCompany(carrier.id)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded border border-[#DDD4C5] transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[#5C5446] font-sans mt-2 line-clamp-2">
                      {carrier.notes || 'Transporteur conventionné pour les expéditions DBC Workshop.'}
                    </p>

                    {/* Tracking URL Template info */}
                    <div className="mt-3 pt-2 border-t border-[#EAE3D6] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                      <div className="text-[#8C8275] truncate max-w-[220px]" title={carrier.trackingUrlTemplate}>
                        URL : {carrier.trackingUrlTemplate ? carrier.trackingUrlTemplate.slice(0, 32) + '...' : 'Suivi direct'}
                      </div>

                      {!isActive ? (
                        <button
                          type="button"
                          onClick={() => handleSetActiveCompany(carrier.id)}
                          className="px-2.5 py-1 bg-white hover:bg-[#F2EDE4] text-[#8C6D3B] border border-[#DDD4C5] rounded text-[11px] font-mono font-medium cursor-pointer"
                        >
                          {isArabic ? 'تعيين كافتراضي' : 'Définir comme actif'}
                        </button>
                      ) : (
                        <span className="text-emerald-700 text-[11px] font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>{isArabic ? 'مفعل للطلبات' : 'Sélectionné'}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add / Edit Company Form Modal / Panel */}
          {(isAddingCompany || editingCompanyId) && (
            <div className="bg-white border border-[#C9A96E] rounded p-5 shadow-md space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D6]">
                <h4 className="font-serif text-base font-semibold text-[#1F1D1A] flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#C9A96E]" />
                  <span>
                    {isAddingCompany
                      ? isArabic ? 'إضافة شركة توصيل جديدة' : 'Nouveau Transporteur Partenaire'
                      : isArabic ? 'تعديل بيانات شركة التوصيل' : 'Modifier les Paramètres du Transporteur'}
                  </span>
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCompany(false);
                    setEditingCompanyId(null);
                  }}
                  className="text-xs text-[#8C8275] hover:text-[#1F1D1A]"
                >
                  ✕ {isArabic ? 'إلغاء' : 'Annuler'}
                </button>
              </div>

              <form onSubmit={handleSaveCompanyForm} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-[#5C5446] mb-1 font-medium">
                      {isArabic ? 'اسم شركة التوصيل *' : 'Nom de la Société *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Ex: Yalidine Express, Procolis..."
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD4C5] rounded text-xs font-sans text-[#1F1D1A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#5C5446] mb-1 font-medium">
                      {isArabic ? 'رقم هاتف الاتصال / الدعم' : 'Téléphone Contact / Dispatch'}
                    </label>
                    <input
                      type="text"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                      placeholder="0982 40 40 40"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD4C5] rounded text-xs font-mono text-[#1F1D1A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#5C5446] mb-1 font-medium">
                      {isArabic ? 'قالب رابط التتبع (استخدم {TRACKING})' : 'Modèle de Lien de Suivi (Template URL)'}
                    </label>
                    <input
                      type="text"
                      value={companyTrackingUrl}
                      onChange={(e) => setCompanyTrackingUrl(e.target.value)}
                      placeholder="https://transporteur.com/suivi/?tracking={TRACKING}"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD4C5] rounded text-xs font-mono text-[#1F1D1A]"
                    />
                    <p className="text-[10px] text-[#8C8275] font-mono mt-1">
                      Remplacez le code de suivi par {'{TRACKING}'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#5C5446] mb-1 font-medium">
                      {isArabic ? 'بادئة كود التتبع الافتراضية' : 'Préfixe N° de Suivi'}
                    </label>
                    <input
                      type="text"
                      value={companyPrefix}
                      onChange={(e) => setCompanyPrefix(e.target.value.toUpperCase())}
                      placeholder="DZ-YAL-, PRC-, DBC-EXP-"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD4C5] rounded text-xs font-mono text-[#1F1D1A]"
                    />
                    <p className="text-[10px] text-[#8C8275] font-mono mt-1">
                      Utilisé pour la génération automatique de code
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#5C5446] mb-1 font-medium">
                    {isArabic ? 'ملاحظات ومعلومات العقد' : 'Notes internes / N° de contrat client'}
                  </label>
                  <textarea
                    rows={2}
                    value={companyNotes}
                    onChange={(e) => setCompanyNotes(e.target.value)}
                    placeholder="Informations sur le contrat commercial, ramassage à l'atelier, encaissement COD..."
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD4C5] rounded text-xs font-sans text-[#1F1D1A]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="stopdesk-check"
                    checked={companySupportsStopDesk}
                    onChange={(e) => setCompanySupportsStopDesk(e.target.checked)}
                    className="w-4 h-4 text-[#C9A96E] rounded border-[#DDD4C5]"
                  />
                  <label htmlFor="stopdesk-check" className="text-xs text-[#5C5446] font-mono">
                    {isArabic ? 'تدعم خدمة الاستلام من المكتب (StopDesk)' : 'Prend en charge le retrait en bureau (StopDesk)'}
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAE3D6]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCompany(false);
                      setEditingCompanyId(null);
                    }}
                    className="px-4 py-2 bg-white text-[#736B5E] border border-[#DDD4C5] rounded text-xs font-mono cursor-pointer"
                  >
                    {isArabic ? 'إلغاء' : 'Annuler'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#1F1D1A] hover:bg-[#332E27] text-white text-xs font-mono font-semibold rounded flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <Save className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>{isArabic ? 'حفظ بيانات الشركة' : 'Enregistrer le Transporteur'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
