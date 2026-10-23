import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  ExternalLink, 
  MessageCircle, 
  Download, 
  X, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Order, Currency, StoreSettings } from '../types';
import { Language, TRANSLATIONS } from '../data/i18n';
import { 
  TRACKING_STAGES, 
  getOrderStage, 
  generateOrderWhatsAppInquiry,
  StageDefinition 
} from '../utils/orderTracking';
import { fetchLiveOrder, subscribeLiveOrder } from '../services/db';
import { generatePdfReceipt } from '../utils/pdfReceipt';

interface OrderLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  currency: Currency;
  currentLanguage: Language;
  storeSettings: StoreSettings;
  initialQuery?: string;
  onOrderUpdated?: (order: Order) => void;
}

export const OrderLookupModal: React.FC<OrderLookupModalProps> = ({
  isOpen,
  onClose,
  orders,
  currency,
  currentLanguage,
  storeSettings,
  initialQuery = '',
  onOrderUpdated,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const isArabic = currentLanguage === 'ar';
  const t = TRANSLATIONS[currentLanguage];
  const unsubRef = useRef<(() => void) | null>(null);

  // Clean up any active snapshot listener on unmount
  useEffect(() => {
    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, []);

  // Set up live Firestore subscription whenever activeDocId changes
  useEffect(() => {
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }

    if (isOpen && activeDocId) {
      unsubRef.current = subscribeLiveOrder(activeDocId, (liveOrder) => {
        if (liveOrder) {
          setSelectedOrder(liveOrder);
          if (onOrderUpdated) {
            onOrderUpdated(liveOrder);
          }
        }
      });
    }
  }, [isOpen, activeDocId, onOrderUpdated]);

  // Initial load when modal opens or initialQuery changes
  useEffect(() => {
    if (!isOpen) return;

    const queryToRun = initialQuery.trim() || (orders.length > 0 ? orders[0].orderNumber : '');
    if (queryToRun) {
      setSearchQuery(queryToRun);
      executeSearch(queryToRun);
    } else {
      setSelectedOrder(null);
      setActiveDocId(null);
      setHasSearched(false);
      setSearchError(null);
    }
  }, [isOpen, initialQuery]);

  const executeSearch = async (query: string) => {
    const clean = query.trim();
    if (!clean) return;

    setIsLoading(true);
    setSearchError(null);
    setHasSearched(true);

    try {
      const result = await fetchLiveOrder(clean, orders);
      if (result && result.order) {
        setSelectedOrder(result.order);
        setActiveDocId(result.docId);
        setSearchError(null);
        if (onOrderUpdated) {
          onOrderUpdated(result.order);
        }
      } else {
        setSelectedOrder(null);
        setActiveDocId(null);
        setSearchError(
          isArabic
            ? 'لم نتمكن من العثور على أي طلبية بهذا الرقم. يرجى التأكد من الرمز المدخل.'
            : currentLanguage === 'en'
            ? 'No order found with this reference. Please verify your order number.'
            : currentLanguage === 'es'
            ? 'No se encontró ningún pedido con esta referencia. Verifique su número.'
            : 'Aucune commande trouvée sous cette référence. Veuillez vérifier votre numéro.'
        );
      }
    } catch (err) {
      console.error('Error during order lookup:', err);
      const local = orders.find(
        (o) =>
          o.orderNumber.toLowerCase() === clean.toLowerCase() ||
          o.id.toLowerCase() === clean.toLowerCase()
      );
      if (local) {
        setSelectedOrder(local);
        setActiveDocId(local.orderNumber || local.id);
      } else {
        setSearchError(
          isArabic
            ? 'حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مجدداً.'
            : 'Une erreur est survenue lors de la recherche. Veuillez réessayer.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadReceipt = () => {
    if (!selectedOrder) return;
    setIsPdfGenerating(true);
    setTimeout(() => {
      generatePdfReceipt(selectedOrder, currency, currentLanguage);
      setIsPdfGenerating(false);
    }, 150);
  };

  if (!isOpen) return null;

  const currentStage: StageDefinition = selectedOrder
    ? getOrderStage(selectedOrder.status)
    : TRACKING_STAGES[0];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      dir={isArabic ? 'rtl' : 'ltr'}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-white border border-[#E6E6E6] shadow-2xl overflow-hidden my-6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#111111] text-white border-b border-black shrink-0">
          <div className="flex items-center gap-3">
            <Truck className="w-4 h-4 text-white" />
            <div>
              <h2 className="font-serif text-base sm:text-lg font-normal tracking-[0.1em] uppercase">
                {isArabic ? 'تتبع الطلبية المباشر' : 'RENASC • SUIVI DE COMMANDE'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          {/* Minimalist Search Bar */}
          <div>
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isArabic
                      ? 'أدخل رقم الطلب (مثال: DBC-2026-849201)...'
                      : currentLanguage === 'en'
                      ? 'Enter order reference (e.g. DBC-2026-849201)...'
                      : 'N° de commande (ex: DBC-2026-849201)...'
                  }
                  className="w-full pl-9 pr-4 py-2.5 bg-[#FBFBFA] border border-[#E6E6E6] font-sans text-xs focus:outline-none focus:border-black transition-colors"
                />
                <Search className={`w-4 h-4 text-[#737373] absolute top-3 ${isArabic ? 'right-3' : 'left-3'}`} />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 bg-[#111111] hover:bg-black text-white font-sans text-xs uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5 shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>{isArabic ? 'تتبع' : 'Suivre'}</span>
              </button>
            </form>

            {/* Quick recent orders chip */}
            {orders.length > 0 && (
              <div className="mt-2 flex items-center gap-2 text-[11px] font-sans text-[#737373]">
                <Clock className="w-3 h-3" />
                <span>{isArabic ? 'طلبيات سابقة :' : 'Commandes récentes :'}</span>
                <div className="flex flex-wrap gap-1.5">
                  {orders.slice(0, 3).map((ord) => (
                    <button
                      key={ord.id}
                      type="button"
                      onClick={() => {
                        setSearchQuery(ord.orderNumber);
                        executeSearch(ord.orderNumber);
                      }}
                      className="text-[#111111] underline hover:text-black font-mono cursor-pointer"
                    >
                      {ord.orderNumber}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#111111]" />
              <p className="font-sans text-xs text-[#737373] tracking-wide">
                {isArabic
                  ? 'جاري مزامنة بيانات الطلبية مباشرة من الورشة...'
                  : 'Synchronisation en direct de l’état de votre commande...'}
              </p>
            </div>
          )}

          {/* Error / Not Found State */}
          {!isLoading && hasSearched && !selectedOrder && searchError && (
            <div className="p-6 bg-[#FBFBFA] border border-[#E6E6E6] text-center space-y-3">
              <AlertCircle className="w-6 h-6 text-[#737373] mx-auto" />
              <div>
                <h3 className="font-serif text-sm uppercase tracking-[0.1em] text-[#111111] font-medium">
                  {isArabic ? 'تعذر العثور على الطلبية' : 'Commande Introuvable'}
                </h3>
                <p className="font-sans text-xs text-[#737373] mt-1 max-w-md mx-auto">
                  {searchError}
                </p>
              </div>

              <div className="pt-2">
                <a
                  href={`https://wa.me/${(storeSettings.whatsappNumber || '213550458812').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Bonjour RENASC, je n'arrive pas à trouver ma commande avec la référence : ${searchQuery}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-[#111111] text-[#111111] text-xs font-sans uppercase tracking-widest hover:bg-[#111111] hover:text-white transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'مساعدة عبر واتساب' : 'Assistance Conciergerie'}</span>
                </a>
              </div>
            </div>
          )}

          {/* Active Order Result */}
          {!isLoading && selectedOrder && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Order Reference & Current Status Header */}
              <div className="p-5 bg-[#FBFBFA] border border-[#E6E6E6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-sans uppercase tracking-[0.15em] text-[#737373] block">
                    {isArabic ? 'رقم الطلبية' : 'Numéro de Commande'}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-serif text-lg font-medium text-[#111111] tracking-wide">
                      {selectedOrder.orderNumber}
                    </span>
                    <button
                      onClick={() => handleCopy(selectedOrder.orderNumber, 'ord-ref')}
                      className="p-1 text-[#737373] hover:text-black transition-colors cursor-pointer"
                      title="Copier la référence"
                    >
                      {copiedCode === 'ord-ref' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <span className="text-[11px] font-sans text-[#737373] block mt-1">
                    {selectedOrder.date} • {selectedOrder.customer.wilayaName} ({selectedOrder.deliveryType === 'home' ? (isArabic ? 'توصيل للمنزل' : 'À Domicile') : 'StopDesk'})
                  </span>
                </div>

                {/* Authoritative Status Badge */}
                <div className="sm:text-right">
                  <span className="text-[10px] font-sans uppercase tracking-[0.15em] text-[#737373] block">
                    {isArabic ? 'الحالة الحالية' : 'Statut Actuel'}
                  </span>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-xs font-sans uppercase tracking-wider mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{currentStage.labels[currentLanguage] || selectedOrder.status}</span>
                  </div>
                </div>
              </div>

              {/* 4-Stage Visual Progress Indicator */}
              <div className="py-4">
                <div className="relative">
                  {/* Background Track */}
                  <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#E6E6E6] -z-0" />
                  
                  {/* Active Progress Bar */}
                  <div 
                    className="absolute top-4 left-6 h-0.5 bg-[#111111] transition-all duration-500 -z-0"
                    style={{
                      width: `${Math.min(100, Math.max(0, ((currentStage.step - 1) / 3) * 100))}%`,
                    }}
                  />

                  {/* 4 Steps */}
                  <div className="relative z-10 grid grid-cols-4 text-center">
                    {TRACKING_STAGES.map((st) => {
                      const isCompleted = st.step < currentStage.step;
                      const isCurrent = st.step === currentStage.step;

                      return (
                        <div key={st.stage} className="flex flex-col items-center">
                          <div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-sans text-xs transition-colors ${
                              isCompleted
                                ? 'bg-[#111111] text-white'
                                : isCurrent
                                ? 'bg-white border-2 border-[#111111] text-[#111111] font-bold shadow-xs'
                                : 'bg-white border border-[#E6E6E6] text-[#737373]'
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="w-4 h-4 stroke-[2.5]" />
                            ) : isCurrent ? (
                              <span className="w-2 h-2 rounded-full bg-[#111111]" />
                            ) : (
                              <span>0{st.step}</span>
                            )}
                          </div>

                          <span 
                            className={`text-[11px] font-sans mt-2 tracking-wide uppercase ${
                              isCurrent
                                ? 'text-[#111111] font-semibold'
                                : isCompleted
                                ? 'text-[#111111]'
                                : 'text-[#737373]'
                            }`}
                          >
                            {st.labels[currentLanguage]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Short, Relevant Live Status Message */}
              <div className="p-4 bg-[#FBFBFA] border-l-2 border-[#111111] space-y-1">
                <span className="text-[10px] font-sans uppercase tracking-[0.15em] text-[#737373] block">
                  {isArabic ? 'أين طلبيتي الآن؟' : 'Où est ma commande en ce moment ?'}
                </span>
                <p className="font-sans text-xs text-[#111111] leading-relaxed">
                  {currentStage.shortMessages[currentLanguage]}
                </p>

                {selectedOrder.trackingNumber && (
                  <div className="pt-2 flex items-center gap-2 text-xs font-sans text-[#737373]">
                    <span>{isArabic ? 'كود التتبع :' : 'N° d’expédition :'}</span>
                    <span className="font-mono text-[#111111] font-medium">{selectedOrder.trackingNumber}</span>
                    <button
                      onClick={() => handleCopy(selectedOrder.trackingNumber, 'trk-code')}
                      className="p-1 hover:text-black cursor-pointer"
                      title="Copier le code"
                    >
                      {copiedCode === 'trk-code' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {selectedOrder.carrierName && (
                      <span className="text-[11px]">({selectedOrder.carrierName})</span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons: Genuine PDF Download & WhatsApp Concierge */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  disabled={isPdfGenerating}
                  className="flex-1 py-3 px-4 bg-[#111111] hover:bg-black text-white font-sans text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isPdfGenerating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{isArabic ? 'تحميل وصل الطلب (PDF)' : 'Télécharger le Reçu PDF'}</span>
                </button>

                <a
                  href={generateOrderWhatsAppInquiry(selectedOrder, storeSettings.whatsappNumber, currentLanguage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-5 border border-[#E6E6E6] hover:border-black text-[#111111] font-sans text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'استفسار عبر واتساب' : 'Contacter l’Atelier'}</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
