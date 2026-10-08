/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useId, useEffect } from 'react';
import {
  ShoppingBag,
  Truck,
  CreditCard,
  ShieldCheck,
  Clock,
  Sparkles,
  ChevronDown,
  Copy,
  MessageCircle,
  Store,
  Banknote,
  Sliders,
  X,
  AlertCircle,
  Download,
  Check,
  Star,
  ExternalLink,
  PhoneCall,
  Gift,
  FileSpreadsheet,
  Trash2,
  Send
} from 'lucide-react';

import imgFleurOr from './assets/images/parfum_rose_elixir_1791467473131.jpg';
import imgNuitOrient from './assets/images/parfum_nuit_orient_1791468388031.jpg';
import imgVanilleRoyale from './assets/images/parfum_vanille_royale_1791468399313.jpg';

/* ==========================================================================
   CONFIG SELLER & VARIANTS
   ========================================================================== */
export interface PerfumeVariant {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  description: string;
  topNotes: string;
  heartNotes: string;
  baseNotes: string;
  imageUrl: string;
}

export const PERFUME_VARIANTS: PerfumeVariant[] = [
  {
    id: 'fleur-dor',
    name: "AURA Fleur d'Or",
    subtitle: "Rose de Damas & Vanille Bourbon · Best-seller",
    badge: "Best-seller Féminin",
    description:
      "Un parfum envoûtant et raffiné composé pour la femme moderne. Des notes florales lumineuses de rose damascena et de jasmin blanc, enveloppées d'un cœur gourmand de vanille bourbon et d'un sillage délicat d'ambre précieux.",
    topNotes: "Fleur d'oranger & Mandarine givrée",
    heartNotes: "Rose de Damas & Jasmin Sambac",
    baseNotes: "Vanille Bourbon & Musc blanc",
    imageUrl: imgFleurOr
  },
  {
    id: 'nuit-orient',
    name: "AURA Nuit d'Orient",
    subtitle: "Ambre Boisé, Fève Tonka & Oud Doux",
    badge: "Sillage Intense & Envoûtant",
    description:
      "Une fragrance orientale mystérieuse et chaleureuse. Des effluves d'ambre chaud, de cannelle noble, de fève tonka veloutée et une touche d'oud adouci créant un sillage magnétique pour les soirées loméennes.",
    topNotes: "Bergamote dorée & Cannelle douce",
    heartNotes: "Ambre solaire & Encens noble",
    baseNotes: "Oud précieux & Fève Tonka",
    imageUrl: imgNuitOrient
  },
  {
    id: 'vanille-royale',
    name: "AURA Vanille Royale",
    subtitle: "Vanille Dorée, Caramel Fondant & Fleurs Blanches",
    badge: "Gourmand & Chaleureux",
    description:
      "Un accord irrésistible de vanille pure de Madagascar mariée à des nuances de miel doré et de caramel ambré. Doux, réconfortant et ultra longue durée sous la brise de Lomé.",
    topNotes: "Miel d'acacia & Pêche blanche",
    heartNotes: "Gousse de Vanille & Gardénia",
    baseNotes: "Caramel doux, Ambre & Santal",
    imageUrl: imgVanilleRoyale
  }
];

export interface SizeOption {
  id: '50ml' | '100ml';
  name: string;
  volume: string;
  price100: number; // Base price for 1 bottle
  origPrice: number;
}

export const DEFAULT_SIZES: Record<'50ml' | '100ml', { name: string; price: number; origPrice: number }> = {
  '50ml': { name: '50ml (Format Sac & Voyage)', price: 5500, origPrice: 8000 },
  '100ml': { name: '100ml (Grand Flacon)', price: 8500, origPrice: 12000 }
};

export const DEFAULT_SELLER_CONFIG = {
  SELLER_WHATSAPP_NUMBER: '22890123456',
  DELIVERY_FEE_HOME_FCFA: 1500,
  PICKUP_LOCATION_NAME: 'Point Relais Lomé (Carrefour GTA / Tokoin)',
  TMONEY_NUMBER: '90 12 34 56',
  FLOOZ_NUMBER: '98 12 34 56',
  MIXX_NUMBER: '90 12 34 56',
  // Optional Google Sheets Apps Script Webhook URL
  GOOGLE_SHEETS_WEBHOOK_URL: ''
};

const LOME_QUARTIERS = [
  'Adidogomé',
  'Agoè-Nyivé (et environs)',
  'Bè / Bè-Kpota / Bè-Plage',
  'Hedzranawoe',
  'Tokoin (Forever, Trésor, Hôpital)',
  'Kodjoviakopé',
  'Nyékonakpoé',
  'Klikamé / Campus',
  'Totsi / Totsivi',
  'Nukafu / Super Taco',
  'Kégué / Stade',
  'Baguida',
  'Avépozo',
  'Légbassito',
  'Zossimé',
  'Deckon / Casablanca',
  'Cacaveli / GTA / Agbalépédogan',
  'Autre quartier (préciser ci-dessous)'
];

interface OrderRecord {
  id: string;
  date: string;
  customerName: string;
  phone: string;
  perfume: string;
  size: string;
  quantity: number;
  total: number;
  quartier: string;
  delivery: string;
  payment: string;
  notes?: string;
}

export default function App() {
  const [config, setConfig] = useState(DEFAULT_SELLER_CONFIG);
  const [showAdminDrawer, setShowAdminDrawer] = useState(false);
  const [adminTab, setAdminTab] = useState<'settings' | 'orders' | 'export'>('settings');

  // Variant & Size State
  const [selectedVariantId, setSelectedVariantId] = useState<string>('fleur-dor');
  const [selectedSize, setSelectedSize] = useState<'50ml' | '100ml'>('100ml');

  // Order Form State
  const [quantity, setQuantity] = useState<number>(1);
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [selectedQuartier, setSelectedQuartier] = useState<string>('Adidogomé');
  const [customQuartier, setCustomQuartier] = useState<string>('');
  const [addressDetails, setAddressDetails] = useState<string>('');
  const [deliveryOption, setDeliveryOption] = useState<'home' | 'pickup'>('home');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'mixx' | 'tmoney' | 'flooz'>('cod');
  const [orderNotes, setOrderNotes] = useState<string>('');

  // UI state
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedHtmlCode, setCopiedHtmlCode] = useState(false);
  const [copiedTmoney, setCopiedTmoney] = useState(false);
  const [copiedFlooz, setCopiedFlooz] = useState(false);
  const [copiedMixx, setCopiedMixx] = useState(false);
  const [sheetStatus, setSheetStatus] = useState<string>('');

  // Local Order History
  const [orderHistory, setOrderHistory] = useState<OrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem('aura_lome_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('aura_lome_orders', JSON.stringify(orderHistory));
    } catch {
      // ignore
    }
  }, [orderHistory]);

  const notesId = useId();

  const currentVariant =
    PERFUME_VARIANTS.find((v) => v.id === selectedVariantId) || PERFUME_VARIANTS[0];

  const unitPrice = DEFAULT_SIZES[selectedSize].price;
  const originalUnitPrice = DEFAULT_SIZES[selectedSize].origPrice;

  // Bundle / Volume Discount Logic:
  // 1 bottle: 1 * unitPrice
  // 2 bottles: Save 1,000 FCFA + Free Delivery bonus!
  // 3 bottles: Save 2,500 FCFA + Free Delivery + Free Purse Mini Spray!
  let discountAmount = 0;
  let hasFreeDeliveryBundle = false;
  let freeGiftText = '';

  if (quantity === 2) {
    discountAmount = 1000;
    hasFreeDeliveryBundle = true;
  } else if (quantity >= 3) {
    discountAmount = 2500;
    hasFreeDeliveryBundle = true;
    freeGiftText = 'Mini-spray de sac 10ml offert';
  }

  const baseSubtotal = unitPrice * quantity;
  const subtotal = Math.max(0, baseSubtotal - discountAmount);

  // Delivery fee: if free delivery earned via bundle, 0 FCFA!
  const deliveryFee =
    deliveryOption === 'pickup'
      ? 0
      : hasFreeDeliveryBundle
      ? 0
      : config.DELIVERY_FEE_HOME_FCFA;

  const total = subtotal + deliveryFee;

  // Resolved quartier string
  const finalQuartier =
    selectedQuartier === 'Autre quartier (préciser ci-dessous)'
      ? (customQuartier.trim() || 'Lomé (Non précisé)')
      : selectedQuartier;

  const paymentLabels: Record<string, string> = {
    cod: 'Paiement à la livraison (Cash / Mobile Money)',
    mixx: 'Mixx by Yas',
    tmoney: 'TMoney (Togocom *145#)',
    flooz: 'Flooz (Moov Africa *155#)'
  };

  // WhatsApp Message Generator
  const generateWhatsAppMessage = () => {
    const deliveryText =
      deliveryOption === 'home'
        ? hasFreeDeliveryBundle
          ? `Livraison à domicile Lomé (OFFERTE · Promo pack !)`
          : `Livraison à domicile Lomé (${config.DELIVERY_FEE_HOME_FCFA.toLocaleString('fr-FR')} FCFA)`
        : `Retrait gratuit (${config.PICKUP_LOCATION_NAME})`;

    const addressText = addressDetails.trim()
      ? `${finalQuartier} — Repère: ${addressDetails.trim()}`
      : finalQuartier;

    let msg = `🌸 *NOUVELLE COMMANDE LOMÉ*\n\n`;
    msg += `📦 *Parfum :* ${currentVariant.name} (${selectedSize}) x${quantity}\n`;
    if (discountAmount > 0) {
      msg += `🏷️ *Réduction pack :* -${discountAmount.toLocaleString('fr-FR')} FCFA\n`;
    }
    if (freeGiftText) {
      msg += `🎁 *Cadeau inclus :* ${freeGiftText}\n`;
    }
    msg += `💵 *Sous-total :* ${subtotal.toLocaleString('fr-FR')} FCFA\n`;
    msg += `🚚 *Livraison :* ${deliveryText}\n`;
    msg += `✨ *TOTAL À RÉGLER :* ${total.toLocaleString('fr-FR')} FCFA\n\n`;
    msg += `👤 *Client :* ${fullName.trim() || 'Non renseigné'}\n`;
    msg += `📞 *Téléphone :* +228 ${phone.trim() || 'Non renseigné'}\n`;
    msg += `📍 *Quartier / Adresse :* ${addressText}\n`;
    msg += `💳 *Mode de paiement :* ${paymentLabels[paymentMethod]}\n`;
    if (orderNotes.trim()) {
      msg += `📝 *Note client :* ${orderNotes.trim()}\n`;
    }
    msg += `\nMerci de confirmer la commande et le créneau de livraison !`;

    return msg;
  };

  const isFormValid = fullName.trim().length >= 2 && phone.replace(/\D/g, '').length >= 8;

  const logOrderLocallyAndWebhook = (newOrder: OrderRecord) => {
    // 1. Add to local history
    setOrderHistory((prev) => [newOrder, ...prev]);

    // 2. Send to Google Sheets Webhook if provided
    if (config.GOOGLE_SHEETS_WEBHOOK_URL.trim()) {
      try {
        fetch(config.GOOGLE_SHEETS_WEBHOOK_URL.trim(), {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder)
        })
          .then(() => setSheetStatus('✅ Envoyé à Google Sheets'))
          .catch(() => setSheetStatus('⚠️ Erreur envoi webhook Google Sheets'));
      } catch {
        // ignore
      }
    }
  };

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);

    if (!isFormValid) {
      const formEl = document.getElementById('order-form');
      if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const orderData: OrderRecord = {
      id: 'LOM-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      customerName: fullName.trim(),
      phone: '+228 ' + phone.trim(),
      perfume: currentVariant.name,
      size: selectedSize,
      quantity,
      total,
      quartier: finalQuartier,
      delivery: deliveryOption === 'home' ? 'À domicile' : 'Retrait gratuit',
      payment: paymentLabels[paymentMethod],
      notes: orderNotes.trim()
    };

    logOrderLocallyAndWebhook(orderData);

    const message = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const cleanNumber = config.SELLER_WHATSAPP_NUMBER.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyMessage = () => {
    const message = generateWhatsAppMessage();
    navigator.clipboard.writeText(message);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  const handleShareLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const exportOrdersToCSV = () => {
    if (orderHistory.length === 0) return;
    const headers = [
      'ID',
      'Date',
      'Nom Client',
      'Téléphone',
      'Parfum',
      'Format',
      'Quantité',
      'Total FCFA',
      'Quartier',
      'Mode Livraison',
      'Paiement',
      'Notes'
    ];
    const rows = orderHistory.map((o) => [
      o.id,
      `"${o.date}"`,
      `"${o.customerName}"`,
      `"${o.phone}"`,
      `"${o.perfume}"`,
      o.size,
      o.quantity,
      o.total,
      `"${o.quartier}"`,
      `"${o.delivery}"`,
      `"${o.payment}"`,
      `"${o.notes || ''}"`
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `commandes_aura_lome_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] text-[#2D2424] font-sans flex flex-col justify-between selection:bg-[#F0C9C9]">
      {/* Top Banner Notice */}
      <div className="bg-[#5B2A30] text-rose-50 text-xs py-2 px-3 text-center flex items-center justify-center gap-2 font-medium tracking-wide">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
        <span>Livraison express à Lomé en moins de 3h · 🛵 Livraison offerte dès 2 flacons !</span>
      </div>

      {/* Main Single-Column Mobile Container */}
      <main className="w-full max-w-md mx-auto bg-white min-h-screen shadow-xl border-x border-[#F0E6E2] flex flex-col">
        {/* Top Header */}
        <header className="px-5 py-3 border-b border-[#F4EBE8] bg-[#FFFDFC]/95 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold tracking-wider text-[#4A1E24] uppercase">
              AURA
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#9C757B] font-semibold">
              · Lomé
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareLink}
              title="Copier le lien de la page"
              className="p-2 text-[#7A5B60] hover:text-[#4A1E24] hover:bg-[#FAF4F2] rounded-full transition-colors text-xs flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              <span className="text-[11px] font-medium hidden sm:inline">
                {copiedLink ? 'Lien copié !' : 'Partager'}
              </span>
            </button>
            <button
              onClick={() => {
                setShowAdminDrawer(true);
                setAdminTab('settings');
              }}
              title="Paramètres Vendeur & Suivi"
              className="p-2 text-[#7A5B60] hover:text-[#4A1E24] hover:bg-[#FAF4F2] rounded-full transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span className="text-[11px] font-medium text-[#7A5B60]">Vendeur</span>
              {orderHistory.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#5B2A30] text-white text-[9px] font-bold flex items-center justify-center">
                  {orderHistory.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Product Visual & Headline */}
        <div className="p-5 pb-2">
          {/* Main Visual */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#FBF5F2] shadow-inner border border-[#EEDDD7]">
            <img
              src={currentVariant.imageUrl}
              alt={currentVariant.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
              referrerPolicy="no-referrer"
            />

            {/* In-stock indicator overlay */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-sm border border-emerald-100 flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Stock disponible à Lomé</span>
            </div>

            {/* Discount tag overlay */}
            <div className="absolute top-3 right-3 bg-[#5B2A30] text-rose-100 text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
              -29% Promo
            </div>
          </div>

          {/* Scent Variant Selector */}
          <div className="mt-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#694A50] mb-2">
              Choisissez votre senteur :
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {PERFUME_VARIANTS.map((v) => {
                const isSelected = v.id === selectedVariantId;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#7A3640] bg-[#FAF0EE] text-[#4A1E24] shadow-sm ring-1 ring-[#7A3640]'
                        : 'border-[#EADAD5] bg-white text-[#523A3E] hover:border-[#D5BCB5]'
                    }`}
                  >
                    <div className="text-xs font-bold leading-tight truncate">
                      {v.name.replace('AURA ', '')}
                    </div>
                    <div className="text-[9px] text-[#8C6D73] truncate mt-0.5">
                      {v.id === 'fleur-dor' ? 'Rose & Vanille' : v.id === 'nuit-orient' ? 'Ambre & Oud' : 'Vanille Pure'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Volume / Size Selector (50ml vs 100ml) */}
          <div className="mt-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#694A50] mb-1.5">
              Format du flacon :
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['100ml', '50ml'] as const).map((sz) => {
                const isSelected = selectedSize === sz;
                const szInfo = DEFAULT_SIZES[sz];
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#7A3640] bg-[#FAF0EE] text-[#4A1E24] ring-1 ring-[#7A3640]'
                        : 'border-[#EADAD5] bg-white text-[#523A3E] hover:border-[#D5BCB5]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{sz}</div>
                      <div className="text-[10px] text-[#8C6D73]">
                        {sz === '100ml' ? 'Grand Flacon' : 'Format Sac'}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-[#5B2A30]">
                      {szInfo.price.toLocaleString('fr-FR')} F
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Title & Pricing */}
          <div className="mt-4">
            <h1 className="font-serif text-2xl font-bold text-[#3B151C] leading-tight">
              {currentVariant.name}
            </h1>
            <p className="text-xs text-[#8F6C73] mt-0.5 font-medium tracking-wide">
              {currentVariant.subtitle} ({selectedSize})
            </p>

            {/* Price Banner */}
            <div className="mt-3 flex items-baseline gap-3 p-3 bg-[#FAF4F2] rounded-xl border border-[#F0DFDA]">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#5B2A30] tracking-tight">
                {unitPrice.toLocaleString('fr-FR')} FCFA
              </span>
              <span className="text-sm line-through text-[#A3888E] font-medium">
                {originalUnitPrice.toLocaleString('fr-FR')} FCFA
              </span>
              <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                Économisez {(originalUnitPrice - unitPrice).toLocaleString('fr-FR')} F
              </span>
            </div>

            {/* Description */}
            <p className="mt-3 text-xs leading-relaxed text-[#5C4549]">
              {currentVariant.description}
            </p>

            {/* Olfactory pyramid */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] bg-[#FFF9F7] p-2.5 rounded-lg border border-[#F5E6E1]">
              <div className="text-center">
                <span className="block font-semibold text-[#8B4D57]">Tête</span>
                <span className="text-[#63494D] leading-tight block text-[10px] mt-0.5">
                  {currentVariant.topNotes}
                </span>
              </div>
              <div className="text-center border-x border-[#EED7D1] px-1">
                <span className="block font-semibold text-[#8B4D57]">Cœur</span>
                <span className="text-[#63494D] leading-tight block text-[10px] mt-0.5">
                  {currentVariant.heartNotes}
                </span>
              </div>
              <div className="text-center">
                <span className="block font-semibold text-[#8B4D57]">Fond</span>
                <span className="text-[#63494D] leading-tight block text-[10px] mt-0.5">
                  {currentVariant.baseNotes}
                </span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-3 flex items-center justify-around text-[11px] text-[#6E4F55] pt-2 border-t border-[#F5EAE7]">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                <span>100% Original</span>
              </div>
              <span className="text-[#D8BDB7]">·</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>Tenue 24h</span>
              </div>
              <span className="text-[#D8BDB7]">·</span>
              <div className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-amber-700" />
                <span>Livraison Lomé</span>
              </div>
            </div>
          </div>
        </div>

        {/* VOLUME DISCOUNT PACK BANNER */}
        <div className="mx-5 my-2 p-3 bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200 rounded-xl text-xs text-[#502930]">
          <div className="font-bold flex items-center gap-1.5 text-amber-900 mb-1">
            <Gift className="w-4 h-4 text-amber-700" />
            <span>Offres Spéciales Lots Lomé :</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] mt-2">
            <div className="p-2 bg-white/80 rounded-lg border border-amber-200/60">
              <span className="font-bold block text-[#5B2A30]">Pack 2 Flacons</span>
              <span className="text-[#754E55] text-[10px] block leading-tight">
                -1 000 FCFA + <strong>Livraison OFFERTE</strong>
              </span>
            </div>
            <div className="p-2 bg-white/80 rounded-lg border border-amber-200/60">
              <span className="font-bold block text-[#5B2A30]">Pack 3 Flacons</span>
              <span className="text-[#754E55] text-[10px] block leading-tight">
                -2 500 FCFA + <strong>Livraison Offerte + Mini-spray</strong>
              </span>
            </div>
          </div>
        </div>

        {/* "Comment ça marche ?" Section */}
        <div className="mx-5 my-2 p-3.5 bg-gradient-to-r from-[#FAF2F0] to-[#FDF8F6] rounded-xl border border-[#EDDDD8]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#5B2A30] mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Comment ça marche ?
          </h2>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div className="flex flex-col items-center text-center">
              <span className="w-5 h-5 rounded-full bg-[#5B2A30] text-white flex items-center justify-center font-bold text-[10px] mb-1">
                1
              </span>
              <span className="font-semibold text-[#3D2529]">Choisis</span>
              <span className="text-[#75595F] text-[10px]">ta quantité</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="w-5 h-5 rounded-full bg-[#5B2A30] text-white flex items-center justify-center font-bold text-[10px] mb-1">
                2
              </span>
              <span className="font-semibold text-[#3D2529]">Remplis</span>
              <span className="text-[#75595F] text-[10px]">tes infos Lomé</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="w-5 h-5 rounded-full bg-[#5B2A30] text-white flex items-center justify-center font-bold text-[10px] mb-1">
                3
              </span>
              <span className="font-semibold text-[#3D2529]">Reçois & Paie</span>
              <span className="text-[#75595F] text-[10px]">Livraison ou Mixx</span>
            </div>
          </div>
        </div>

        {/* ORDER FORM */}
        <form id="order-form" onSubmit={handleOrder} className="px-5 py-3 space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-[#F0DFDA]">
            <ShoppingBag className="w-4 h-4 text-[#7A3640]" />
            <h2 className="font-serif text-lg font-bold text-[#4A1E24]">
              Formulaire de Commande
            </h2>
          </div>

          {/* 1. QUANTITY SELECTOR (WITH BUNDLE BADGES) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#694A50]">
                1. Quantité de flacons
              </label>
              {quantity >= 2 && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  🎉 Livraison Gratuite activée !
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((qty) => {
                const isSelected = quantity === qty;
                const cost =
                  qty === 1
                    ? unitPrice
                    : qty === 2
                    ? unitPrice * 2 - 1000
                    : unitPrice * 3 - 2500;
                return (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setQuantity(qty)}
                    className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-[#7A3640] bg-[#FAF0EE] text-[#4A1E24] shadow-sm ring-1 ring-[#7A3640]'
                        : 'border-[#EADAD5] bg-white text-[#523A3E] hover:border-[#D5BCB5]'
                    }`}
                  >
                    {qty === 2 && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full font-bold">
                        -1 000 F
                      </span>
                    )}
                    {qty === 3 && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] bg-[#5B2A30] text-white px-1.5 py-0.2 rounded-full font-bold">
                        -2 500 F
                      </span>
                    )}
                    <div className="text-sm font-bold">{qty} flacon{qty > 1 ? 's' : ''}</div>
                    <div className="text-[10px] text-[#8C6D73] font-medium">
                      {cost.toLocaleString('fr-FR')} F
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. CUSTOMER NAME */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#694A50] mb-1">
              2. Nom & Prénoms <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: Mawuena Lawson"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white placeholder-[#B49E9E] focus:outline-none focus:ring-2 focus:ring-[#9E5562] transition-colors ${
                hasSubmitted && fullName.trim().length < 2
                  ? 'border-rose-400 bg-rose-50/30'
                  : 'border-[#DFCEC8]'
              }`}
            />
            {hasSubmitted && fullName.trim().length < 2 && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Veuillez indiquer votre nom
              </p>
            )}
          </div>

          {/* 3. PHONE NUMBER (TOGO DEFAULT +228) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#694A50] mb-1">
              3. Numéro de téléphone (Togo) <span className="text-rose-600">*</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-[#DFCEC8] bg-[#F7EFEA] text-xs font-bold text-[#55363B]">
                🇹🇬 +228
              </span>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d\s]/g, ''))}
                placeholder="Ex: 90 12 34 56 ou 70 88 99 00"
                className={`w-full px-3.5 py-2.5 rounded-r-xl border text-sm bg-white placeholder-[#B49E9E] focus:outline-none focus:ring-2 focus:ring-[#9E5562] transition-colors ${
                  hasSubmitted && phone.replace(/\D/g, '').length < 8
                    ? 'border-rose-400 bg-rose-50/30'
                    : 'border-[#DFCEC8]'
                }`}
              />
            </div>
            <p className="text-[10px] text-[#93777D] mt-1">
              Numéro joignable pour l'appel du livreur à Lomé.
            </p>
            {hasSubmitted && phone.replace(/\D/g, '').length < 8 && (
              <p className="text-[11px] text-rose-600 mt-0.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Numéro incomplet (minimum 8 chiffres)
              </p>
            )}
          </div>

          {/* 4. QUARTIER / ADDRESS IN LOMÉ */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#694A50] mb-1">
              4. Quartier à Lomé <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedQuartier}
                onChange={(e) => setSelectedQuartier(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCEC8] text-sm bg-white text-[#332225] appearance-none pr-9 focus:outline-none focus:ring-2 focus:ring-[#9E5562]"
              >
                {LOME_QUARTIERS.map((quartier) => (
                  <option key={quartier} value={quartier}>
                    {quartier}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#8C6D73] absolute right-3 top-3 pointer-events-none" />
            </div>

            {selectedQuartier.includes('Autre quartier') && (
              <div className="mt-2">
                <input
                  type="text"
                  value={customQuartier}
                  onChange={(e) => setCustomQuartier(e.target.value)}
                  placeholder="Précisez le nom de votre quartier..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DFCEC8] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#9E5562]"
                />
              </div>
            )}

            <div className="mt-2">
              <input
                type="text"
                value={addressDetails}
                onChange={(e) => setAddressDetails(e.target.value)}
                placeholder="Repère précis (Ex: Pharmacie, Carrefour Bodjona, maison bleue...)"
                className="w-full px-3.5 py-2 rounded-xl border border-[#DFCEC8] text-xs bg-white placeholder-[#AFA0A0] focus:outline-none focus:ring-2 focus:ring-[#9E5562]"
              />
            </div>
          </div>

          {/* 5. DELIVERY OPTION */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#694A50] mb-1.5">
              5. Mode de réception à Lomé
            </label>
            <div className="space-y-2">
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  deliveryOption === 'home'
                    ? 'border-[#7A3640] bg-[#FAF0EE] ring-1 ring-[#7A3640]'
                    : 'border-[#EADAD5] bg-white hover:border-[#D5BCB5]'
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  checked={deliveryOption === 'home'}
                  onChange={() => setDeliveryOption('home')}
                  className="mt-1 accent-[#7A3640]"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#451F24] flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#7A3640]" />
                      Livraison à domicile (Lomé)
                    </span>
                    <span className="text-xs font-bold text-[#5B2A30]">
                      {hasFreeDeliveryBundle ? (
                        <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          0 FCFA (Offerte !)
                        </span>
                      ) : (
                        `+${config.DELIVERY_FEE_HOME_FCFA.toLocaleString('fr-FR')} FCFA`
                      )}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7F6167] mt-0.5">
                    Livré directement à votre porte ou bureau en moins de 3h.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  deliveryOption === 'pickup'
                    ? 'border-[#7A3640] bg-[#FAF0EE] ring-1 ring-[#7A3640]'
                    : 'border-[#EADAD5] bg-white hover:border-[#D5BCB5]'
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  checked={deliveryOption === 'pickup'}
                  onChange={() => setDeliveryOption('pickup')}
                  className="mt-1 accent-[#7A3640]"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#451F24] flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-[#7A3640]" />
                      Retrait gratuit en boutique / point relais
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                      0 FCFA (Gratuit)
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7F6167] mt-0.5">
                    {config.PICKUP_LOCATION_NAME}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* 6. PAYMENT METHOD & ONE-TAP USSD BUTTONS */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#694A50] mb-1.5">
              6. Mode de paiement
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  paymentMethod === 'cod'
                    ? 'border-[#7A3640] bg-[#FAF0EE] ring-1 ring-[#7A3640]'
                    : 'border-[#EADAD5] bg-white hover:border-[#D5BCB5]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#451F24]">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>À la livraison</span>
                </div>
                <span className="text-[10px] text-[#80646A] mt-1">
                  Espèces ou Mobile Money à réception
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('mixx')}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  paymentMethod === 'mixx'
                    ? 'border-[#7A3640] bg-[#FAF0EE] ring-1 ring-[#7A3640]'
                    : 'border-[#EADAD5] bg-white hover:border-[#D5BCB5]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#451F24]">
                  <CreditCard className="w-4 h-4 text-amber-600" />
                  <span>Mixx by Yas</span>
                </div>
                <span className="text-[10px] text-[#80646A] mt-1">
                  T-Money / Yas Mobile
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('tmoney')}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  paymentMethod === 'tmoney'
                    ? 'border-[#7A3640] bg-[#FAF0EE] ring-1 ring-[#7A3640]'
                    : 'border-[#EADAD5] bg-white hover:border-[#D5BCB5]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#451F24]">
                  <span className="text-xs font-extrabold text-amber-700">TM</span>
                  <span>TMoney</span>
                </div>
                <span className="text-[10px] text-[#80646A] mt-1">
                  Togocom *145#
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('flooz')}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  paymentMethod === 'flooz'
                    ? 'border-[#7A3640] bg-[#FAF0EE] ring-1 ring-[#7A3640]'
                    : 'border-[#EADAD5] bg-white hover:border-[#D5BCB5]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#451F24]">
                  <span className="text-xs font-extrabold text-blue-700">FL</span>
                  <span>Flooz</span>
                </div>
                <span className="text-[10px] text-[#80646A] mt-1">
                  Moov Africa *155#
                </span>
              </button>
            </div>

            {/* INTERACTIVE USSD HELPER PANEL */}
            <div className="mt-2.5 p-3 bg-[#FAF7F5] rounded-xl border border-[#EDE1DD] text-[11px] text-[#694D52]">
              {paymentMethod === 'cod' && (
                <p>
                  💡 <strong>Paiement à réception :</strong> Vous vérifiez votre flacon avant de payer directement au livreur à Lomé (espèces ou Mobile Money).
                </p>
              )}
              {paymentMethod === 'tmoney' && (
                <div>
                  <div className="font-semibold text-[#5B2A30] mb-1">
                    📱 TMoney Togocom (*145#) :
                  </div>
                  <p className="text-[11px] mb-2">
                    Numéro de paiement : <strong>{config.TMONEY_NUMBER}</strong> (AURA Parfums)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="tel:*145%23"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg font-bold text-[11px] hover:bg-amber-700 transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Composer *145#</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(config.TMONEY_NUMBER.replace(/\s/g, ''));
                        setCopiedTmoney(true);
                        setTimeout(() => setCopiedTmoney(false), 2000);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-[#DFCEC8] rounded-lg text-[11px] font-semibold text-[#5B2A30] cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedTmoney ? 'Copié !' : 'Copier numéro'}</span>
                    </button>
                  </div>
                </div>
              )}
              {paymentMethod === 'flooz' && (
                <div>
                  <div className="font-semibold text-[#5B2A30] mb-1">
                    📱 Flooz Moov Africa (*155#) :
                  </div>
                  <p className="text-[11px] mb-2">
                    Numéro de paiement : <strong>{config.FLOOZ_NUMBER}</strong> (AURA Parfums)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="tel:*155%23"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-[11px] hover:bg-blue-700 transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Composer *155#</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(config.FLOOZ_NUMBER.replace(/\s/g, ''));
                        setCopiedFlooz(true);
                        setTimeout(() => setCopiedFlooz(false), 2000);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-[#DFCEC8] rounded-lg text-[11px] font-semibold text-[#5B2A30] cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedFlooz ? 'Copié !' : 'Copier numéro'}</span>
                    </button>
                  </div>
                </div>
              )}
              {paymentMethod === 'mixx' && (
                <div>
                  <div className="font-semibold text-[#5B2A30] mb-1">
                    📱 Mixx by Yas :
                  </div>
                  <p className="text-[11px] mb-2">
                    Envoyer au : <strong>{config.MIXX_NUMBER}</strong> (AURA Parfums)
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(config.MIXX_NUMBER.replace(/\s/g, ''));
                      setCopiedMixx(true);
                      setTimeout(() => setCopiedMixx(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-[#DFCEC8] rounded-lg text-[11px] font-semibold text-[#5B2A30] cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedMixx ? 'Copié !' : 'Copier numéro'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 7. OPTIONAL ORDER NOTES */}
          <div>
            <label
              htmlFor={notesId}
              className="block text-xs font-bold uppercase tracking-wider text-[#694A50] mb-1"
            >
              7. Notes particulières <span className="text-[#997C82] font-normal">(Optionnel)</span>
            </label>
            <textarea
              id={notesId}
              rows={2}
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Ex: Emballage cadeau, m'appeler 15 min avant d'arriver..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#DFCEC8] text-xs bg-white placeholder-[#AFA0A0] focus:outline-none focus:ring-2 focus:ring-[#9E5562]"
            />
          </div>

          {/* DYNAMIC ORDER SUMMARY */}
          <div className="mt-4 p-4 rounded-2xl bg-[#FAF1EE] border border-[#E8D1CB] space-y-2">
            <div className="border-b border-[#E3C6BF] pb-1.5 flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-[#4A1E24]">
                Récapitulatif de la commande
              </h3>
              <span className="text-xs font-sans font-normal text-[#8A676E]">Devise : FCFA</span>
            </div>

            <div className="flex justify-between text-xs text-[#5D4247]">
              <span>
                {currentVariant.name} ({selectedSize} x{quantity})
              </span>
              <span className="font-semibold">{baseSubtotal.toLocaleString('fr-FR')} FCFA</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-xs text-emerald-700 font-medium">
                <span>Remise lot ({quantity} flacons)</span>
                <span>-{discountAmount.toLocaleString('fr-FR')} FCFA</span>
              </div>
            )}

            {freeGiftText && (
              <div className="flex justify-between text-xs text-amber-800 font-medium">
                <span>Cadeau spécial</span>
                <span>{freeGiftText}</span>
              </div>
            )}

            <div className="flex justify-between text-xs text-[#5D4247]">
              <span>
                Livraison ({deliveryOption === 'home' ? 'À domicile' : 'Retrait gratuit'})
              </span>
              <span className="font-semibold">
                {deliveryFee === 0 ? (
                  <span className="text-emerald-700 font-bold">
                    {hasFreeDeliveryBundle ? 'OFFERTE (Pack)' : 'Gratuit'}
                  </span>
                ) : (
                  `${deliveryFee.toLocaleString('fr-FR')} FCFA`
                )}
              </span>
            </div>

            <div className="pt-2 border-t border-[#DFBDB5] flex items-baseline justify-between text-[#4A1E24]">
              <div>
                <span className="text-sm font-bold block">TOTAL À PAYER</span>
                <span className="text-[10px] text-[#805D64]">
                  {paymentMethod === 'cod' ? 'Règlement à la livraison' : 'Paiement Mobile Money'}
                </span>
              </div>
              <span className="font-serif text-2xl font-bold text-[#5B2A30]">
                {total.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>

          {/* BIG CTA BUTTON (WhatsApp) */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20BD5A] active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
              <span>Commander via WhatsApp</span>
            </button>
            <p className="text-center text-[11px] text-[#8C6D73] mt-2">
              ⚡ Aucun compte nécessaire. Vos détails de commande s'ouvrent directement dans WhatsApp.
            </p>
          </div>

          {/* Quick Fallback: Copy summary */}
          <div className="pt-1 flex justify-center">
            <button
              type="button"
              onClick={handleCopyMessage}
              className="text-xs text-[#7A454E] hover:text-[#4A1E24] flex items-center gap-1.5 underline decoration-[#D0B2AC] hover:decoration-[#7A454E] transition-all cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedMessage ? '✅ Récapitulatif copié !' : 'Copier le récapitulatif du message'}</span>
            </button>
          </div>
        </form>

        {/* CUSTOMER REVIEWS IN LOMÉ */}
        <div className="mx-5 my-6 p-4 bg-[#FDFCFC] rounded-2xl border border-[#EFE4E0]">
          <h3 className="font-serif text-base font-bold text-[#451F24] mb-3 flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            Avis des clientes à Lomé
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-[#FAF4F2] rounded-xl text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[#402025]">Kafui D. (Agoè-Nyivé)</span>
                <span className="text-amber-500 font-semibold tracking-wide">★★★★★</span>
              </div>
              <p className="text-[#63484D] text-[11px]">
                « J'ai pris le pack de 2 flacons (Fleur d'Or + Nuit d'Orient). La livraison à domicile était offerte et reçue en moins de 2 heures. Tenue incroyable ! »
              </p>
            </div>

            <div className="p-3 bg-[#FAF4F2] rounded-xl text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[#402025]">Akofa L. (Hedzranawoe)</span>
                <span className="text-amber-500 font-semibold tracking-wide">★★★★★</span>
              </div>
              <p className="text-[#63484D] text-[11px]">
                « Le bouton TMoney avec le *145# automatique m'a fait gagner un temps précieux. Le parfum sent divinement bon et le packaging est très luxueux. »
              </p>
            </div>
          </div>
        </div>

        {/* FAQ EXPRESS */}
        <div className="px-5 pb-6 text-xs text-[#6E4F55]">
          <h3 className="font-serif text-base font-bold text-[#451F24] mb-2.5">
            Questions fréquentes
          </h3>
          <div className="space-y-2">
            <details className="bg-white p-2.5 rounded-xl border border-[#EDE2DF] cursor-pointer">
              <summary className="font-semibold text-[#451F24]">
                Comment fonctionne la livraison gratuite dès 2 flacons ?
              </summary>
              <p className="mt-1.5 text-[11px] text-[#73575C] leading-relaxed">
                Dès que vous sélectionnez 2 flacons ou plus dans le formulaire, les frais de livraison (1 500 FCFA) passent automatiquement à 0 FCFA et vous bénéficiez en plus d'une remise immédiate !
              </p>
            </details>
            <details className="bg-white p-2.5 rounded-xl border border-[#EDE2DF] cursor-pointer">
              <summary className="font-semibold text-[#451F24]">
                Quel est le délai de livraison dans les quartiers de Lomé ?
              </summary>
              <p className="mt-1.5 text-[11px] text-[#73575C] leading-relaxed">
                Nos coursiers livrent partout à Lomé (Agoè, Adidogomé, Bè, Hedzranawoe, Tokoin, Kodjoviakopé, Baguida, etc.) entre 1h et 3h après validation WhatsApp.
              </p>
            </details>
            <details className="bg-white p-2.5 rounded-xl border border-[#EDE2DF] cursor-pointer">
              <summary className="font-semibold text-[#451F24]">
                Puis-je sentir le flacon avant de payer ?
              </summary>
              <p className="mt-1.5 text-[11px] text-[#73575C] leading-relaxed">
                Oui ! Avec l'option « Paiement à la livraison », vous inspectez votre commande en main propre avant de remettre le paiement en espèces ou via Mobile Money.
              </p>
            </details>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="mt-auto py-5 px-5 bg-[#FAF2F0] border-t border-[#EEDDD8] text-center text-[11px] text-[#8C6D73]">
          <p className="font-serif text-sm font-bold text-[#5B2A30]">
            AURA Parfums Lomé
          </p>
          <p className="mt-0.5">
            Vente directe & distribution express à Lomé, Togo 🇹🇬
          </p>
          <p className="mt-1 text-[10px] text-[#A1868B]">
            WhatsApp : +{config.SELLER_WHATSAPP_NUMBER} · TMoney : +228 {config.TMONEY_NUMBER}
          </p>
          <div className="mt-3">
            <button
              onClick={() => {
                setShowAdminDrawer(true);
                setAdminTab('settings');
              }}
              className="text-[10px] text-[#7A3640] hover:underline inline-flex items-center gap-1 font-medium bg-white px-2.5 py-1 rounded-full border border-[#E2CBC5] cursor-pointer"
            >
              <Sliders className="w-3 h-3" />
              <span>Paramètres Vendeur, Suivi Commandes & Export</span>
            </button>
          </div>
        </footer>
      </main>

      {/* SELLER ADMIN, ORDERS LOG & GOOGLE SHEETS DRAWER */}
      {showAdminDrawer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#F0DFDA]">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#7A3640]" />
                  <h3 className="font-serif text-lg font-bold text-[#451F24]">
                    Espace Vendeur Lomé
                  </h3>
                </div>
                <button
                  onClick={() => setShowAdminDrawer(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 mt-3 text-xs">
                <button
                  onClick={() => setAdminTab('settings')}
                  className={`py-2 px-3 font-bold border-b-2 transition-colors cursor-pointer ${
                    adminTab === 'settings'
                      ? 'border-[#5B2A30] text-[#5B2A30]'
                      : 'border-transparent text-slate-500'
                  }`}
                >
                  Paramètres & USSD
                </button>
                <button
                  onClick={() => setAdminTab('orders')}
                  className={`py-2 px-3 font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    adminTab === 'orders'
                      ? 'border-[#5B2A30] text-[#5B2A30]'
                      : 'border-transparent text-slate-500'
                  }`}
                >
                  <span>Commandes</span>
                  <span className="w-4 h-4 rounded-full bg-slate-100 text-[10px] flex items-center justify-center font-bold">
                    {orderHistory.length}
                  </span>
                </button>
                <button
                  onClick={() => setAdminTab('export')}
                  className={`py-2 px-3 font-bold border-b-2 transition-colors cursor-pointer ${
                    adminTab === 'export'
                      ? 'border-[#5B2A30] text-[#5B2A30]'
                      : 'border-transparent text-slate-500'
                  }`}
                >
                  Google Sheets & Netlify
                </button>
              </div>

              {/* TAB 1: SETTINGS & USSD NUMBERS */}
              {adminTab === 'settings' && (
                <div className="space-y-3 text-xs mt-4">
                  <div>
                    <label className="block font-bold text-[#503137] mb-1">
                      Numéro WhatsApp Vendeur (ex: 22890123456)
                    </label>
                    <input
                      type="text"
                      value={config.SELLER_WHATSAPP_NUMBER}
                      onChange={(e) =>
                        setConfig({ ...config, SELLER_WHATSAPP_NUMBER: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-[#DFCEC8] text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-[#503137] mb-1">
                        Numéro TMoney
                      </label>
                      <input
                        type="text"
                        value={config.TMONEY_NUMBER}
                        onChange={(e) =>
                          setConfig({ ...config, TMONEY_NUMBER: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-[#DFCEC8] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#503137] mb-1">
                        Numéro Flooz
                      </label>
                      <input
                        type="text"
                        value={config.FLOOZ_NUMBER}
                        onChange={(e) =>
                          setConfig({ ...config, FLOOZ_NUMBER: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-[#DFCEC8] text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#503137] mb-1">
                      Numéro Mixx by Yas
                    </label>
                    <input
                      type="text"
                      value={config.MIXX_NUMBER}
                      onChange={(e) =>
                        setConfig({ ...config, MIXX_NUMBER: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-[#DFCEC8] text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#503137] mb-1">
                      Frais Livraison à domicile Lomé (FCFA)
                    </label>
                    <input
                      type="number"
                      value={config.DELIVERY_FEE_HOME_FCFA}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          DELIVERY_FEE_HOME_FCFA: Number(e.target.value) || 0
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-[#DFCEC8] text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#503137] mb-1">
                      Point Relais Retrait Gratuit
                    </label>
                    <input
                      type="text"
                      value={config.PICKUP_LOCATION_NAME}
                      onChange={(e) =>
                        setConfig({ ...config, PICKUP_LOCATION_NAME: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-[#DFCEC8] text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: ORDER HISTORY & CSV EXPORT */}
              {adminTab === 'orders' && (
                <div className="mt-4 text-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-[#451F24]">
                      {orderHistory.length} commande(s) enregistrée(s)
                    </span>
                    {orderHistory.length > 0 && (
                      <button
                        onClick={exportOrdersToCSV}
                        className="px-2.5 py-1 bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer hover:bg-emerald-800"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Exporter CSV</span>
                      </button>
                    )}
                  </div>

                  {orderHistory.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                      <p>Aucune commande passée pour l'instant.</p>
                      <p className="text-[10px] mt-1">
                        Les commandes passées via le bouton WhatsApp s'afficheront ici automatiquement.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                      {orderHistory.map((order) => (
                        <div
                          key={order.id}
                          className="p-3 bg-[#FAF4F2] border border-[#EBD6D0] rounded-xl text-[11px]"
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-[#4A1E24]">
                              {order.customerName}
                            </span>
                            <span className="font-bold text-[#5B2A30]">
                              {order.total.toLocaleString('fr-FR')} FCFA
                            </span>
                          </div>
                          <div className="text-[#7F6167] mt-0.5">
                            📞 {order.phone} · 📍 {order.quartier}
                          </div>
                          <div className="text-[#7F6167] text-[10px] mt-1 flex justify-between">
                            <span>
                              {order.perfume} ({order.size} x{order.quantity})
                            </span>
                            <span>{order.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {orderHistory.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-200 text-right">
                      <button
                        onClick={() => {
                          if (confirm('Voulez-vous réinitialiser l\'historique des commandes ?')) {
                            setOrderHistory([]);
                          }
                        }}
                        className="text-rose-600 text-[10px] hover:underline flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Effacer l'historique local</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: GOOGLE SHEETS & DEPLOY */}
              {adminTab === 'export' && (
                <div className="mt-4 text-xs space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950">
                    <div className="font-bold flex items-center gap-1.5 mb-1 text-emerald-900">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                      <span>Synchronisation Google Sheets</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      Collez l'URL de votre Webhook (Google Apps Script ou SheetDB) pour enregistrer chaque commande automatiquement dans votre tableau Google Sheets.
                    </p>
                    <input
                      type="url"
                      value={config.GOOGLE_SHEETS_WEBHOOK_URL}
                      onChange={(e) =>
                        setConfig({ ...config, GOOGLE_SHEETS_WEBHOOK_URL: e.target.value })
                      }
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="w-full mt-2 px-3 py-1.5 rounded-lg border border-emerald-300 text-xs bg-white text-slate-800"
                    />
                    {sheetStatus && (
                      <p className="text-[10px] mt-1 font-semibold text-emerald-800">
                        {sheetStatus}
                      </p>
                    )}
                  </div>

                  {/* Netlify / Vercel single-file deployment */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950">
                    <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-900">
                      <Sparkles className="w-4 h-4 text-amber-700" />
                      <span>Déploiement Netlify & Vercel en 1 clic</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed mb-2">
                      Fichier HTML complet autonome prêt à être glissé sur Netlify Drop sans compilation.
                    </p>
                    <div className="flex gap-2">
                      <a
                        href="/standalone.html"
                        download="index.html"
                        className="px-3 py-1.5 bg-[#5B2A30] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-[#481E24] cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Télécharger index.html</span>
                      </a>
                      <a
                        href="/standalone.html"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-white border border-[#DFCEC8] text-[#5B2A30] rounded-lg font-semibold text-xs flex items-center gap-1.5 hover:bg-rose-50 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Ouvrir aperçu</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#F0DFDA] space-y-2 mt-4">
              <button
                onClick={() => setShowAdminDrawer(false)}
                className="w-full py-2.5 rounded-xl bg-[#5B2A30] text-white text-xs font-bold hover:bg-[#481E24] cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
