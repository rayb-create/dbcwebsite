import React, { useState } from 'react';
import { Truck, ShieldCheck, Mail, ArrowRight, Check, Heart, Building2, Phone, MessageCircle, CreditCard, Lock } from 'lucide-react';
import { StoreSettings } from '../types';
import { Language, TRANSLATIONS } from '../data/i18n';

interface FooterProps {
  onOpenSizeGuide: () => void;
  onOpenContact: () => void;
  onOpenB2B: () => void;
  onOpenAdmin?: () => void;
  onOpenOrderLookup?: () => void;
  onSelectCategory: (cat: string) => void;
  storeSettings: StoreSettings;
  currentLanguage: Language;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenSizeGuide,
  onOpenContact,
  onOpenB2B,
  onOpenAdmin,
  onOpenOrderLookup,
  onSelectCategory,
  storeSettings,
  currentLanguage,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const t = TRANSLATIONS[currentLanguage];
  const isArabic = currentLanguage === 'ar';

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
  };

  const cleanWhatsapp = storeSettings.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <footer className="bg-[#191715] text-[#ECE7DF] border-t border-[#36322E] pt-14 pb-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-[#36322E]">
          {/* Brand Info (4 cols) */}
          <div className="lg:col-span-4 space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl tracking-[0.15em] font-semibold text-white">
                DBC WORKSHOP
              </span>
            </div>
            <p className="text-xs font-mono text-[#A8A196] tracking-wider uppercase">
              Atelier de Confection • Vente B2B & B2C Algérie
            </p>
            <p className="text-xs text-[#9E9689] leading-relaxed max-w-sm">
              Conception et confection de vêtements de qualité en Algérie : Hoodies, pantalons de jogging confortables, t-shirts manches longues et ensembles complets pour particuliers et magasins revendeurs.
            </p>
            <div className="pt-1 text-xs font-mono text-[#8C8477] space-y-1">
              <div>Atelier & Showroom : {storeSettings.address}</div>
              <div>Ville : {storeSettings.city}</div>
              <div>Email direct : <a href={`mailto:${storeSettings.email}`} className="text-[#C9A96E] hover:underline">{storeSettings.email}</a></div>
              <div>Téléphone : {storeSettings.phone}</div>
            </div>
          </div>

          {/* Quick Collection Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3 text-xs font-mono">
            <h4 className="text-white uppercase tracking-wider font-semibold text-[11px]">
              Collection DBC Workshop
            </h4>
            <ul className="space-y-2 text-[#A8A196]">
              <li>
                <button 
                  onClick={() => onSelectCategory('hoodies')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Hoodies Épais Molleton
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory('joggers')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Pantalons Jogging Molleton
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory('tracksuits')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Ensembles Tracksuits Complets
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory('longsleeves')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Manches Longues Waffle Thermal
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory('tees')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  T-shirts Épais Heavyweight
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenB2B} 
                  className="text-[#C9A96E] hover:underline transition-colors cursor-pointer font-bold flex items-center gap-1 mt-1"
                >
                  <Building2 className="w-3 h-3" />
                  <span>Espace Vente en Gros (B2B)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Sourcing & Atelier Care (2 cols) */}
          <div className="lg:col-span-2 space-y-3 text-xs font-mono">
            <h4 className="text-white uppercase tracking-wider font-semibold text-[11px]">
              Service & Livraison
            </h4>
            <ul className="space-y-2 text-[#A8A196]">
              <li>
                <span className="text-white">Livraison 69 Wilayas</span>
              </li>
              {onOpenOrderLookup && (
                <li>
                  <button
                    onClick={onOpenOrderLookup}
                    className="text-[#C9A96E] hover:text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>{t.navOrderLookup || 'Suivi Colis (69 Wilayas)'}</span>
                  </button>
                </li>
              )}
              <li>
                <span>À domicile ou StopDesk</span>
              </li>
              <li>
                <span>Paiement à la livraison</span>
              </li>
              <li>
                <span>Virement BaridiMob / CCP</span>
              </li>
              <li>
                <button 
                  onClick={onOpenSizeGuide} 
                  className="hover:text-white underline transition-colors cursor-pointer"
                >
                  Guide des Tailles
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenContact} 
                  className="hover:text-white text-[#C9A96E] underline transition-colors cursor-pointer"
                >
                  Contacter l'Atelier
                </button>
              </li>
            </ul>
          </div>

          {/* WhatsApp & Contact Box (3 cols) */}
          <div className="lg:col-span-3 space-y-3 text-xs">
            <h4 className="font-mono text-white uppercase tracking-wider font-semibold text-[11px]">
              Commandes & Service Client
            </h4>
            <p className="text-[#9E9689] leading-relaxed">
              Passez vos commandes directement par WhatsApp ou suivez vos colis avec notre équipe.
            </p>

            <a
              href={`https://wa.me/${cleanWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-mono text-xs font-semibold rounded flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp : +{cleanWhatsapp}</span>
            </a>

            <div className="pt-2 p-3 bg-[#24211D] border border-[#3B352E] rounded space-y-1 font-mono text-[11px] text-[#A8A196]">
              <div className="flex items-center gap-1.5 text-white font-bold">
                <CreditCard className="w-3.5 h-3.5 text-[#C9A96E]" />
                <span>BaridiMob / CCP</span>
              </div>
              <p className="text-[10px] text-[#8C8477]">
                RIP : {storeSettings.baridiMobRip}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#8C8477] gap-3">
          <p>© {new Date().getFullYear()} DBC WORKSHOP ALGÉRIE • Confection B2B & B2C • Tous droits réservés.</p>
          <div className="flex items-center space-x-4">
            <span>🇩🇿 Conçu & Confectionné en Algérie</span>
            <span>•</span>
            <span>58 Wilayas Express</span>
            {onOpenAdmin && (
              <>
                <span>•</span>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-[#C9A96E] flex items-center gap-1 transition-colors cursor-pointer text-[#6B6358] hover:underline"
                  title="Accès Gérant Atelier"
                >
                  <Lock className="w-3 h-3" />
                  <span>Atelier</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
