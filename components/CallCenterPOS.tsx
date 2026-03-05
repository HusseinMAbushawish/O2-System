import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../store';
import { MENU_ITEMS, CATEGORIES } from '../constants';
import { OrderType, OrderStatus, PaymentMethod, MenuItem, Customer, CallCenterComplaint } from '../types';
import { 
  Search, Plus, Minus, Trash2, Phone, MapPin, Star, AlertTriangle, 
  Clock, Truck, Zap, Receipt, X, User, Scale, AlertCircle, MessageSquare, 
  Send, Check, Package, Timer, Bike, CheckCircle2, Flame,
  ShoppingBag, TrendingUp, ChevronDown, ChevronUp, Eye, EyeOff, Info, BarChart3,
  RefreshCw, Heart, Repeat, ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── CONSTANTS ───
const DELIVERY_ZONES = [
  { id: 'z1', name: 'وسط المدينة', price: 10 },
  { id: 'z2', name: 'الرمال', price: 12 },
  { id: 'z3', name: 'الشجاعية', price: 15 },
  { id: 'z4', name: 'جباليا', price: 18 },
  { id: 'z5', name: 'الشمال', price: 20 },
  { id: 'z6', name: 'القرارة', price: 25 },
  { id: 'z7', name: 'خانيونس', price: 30 },
  { id: 'z8', name: 'رفح', price: 35 },
];
const SWEETS_CATEGORIES = ['oriental_sweets', 'cake', 'bar_sweets', 'gelato'];
const COMPLAINT_TYPES: { value: CallCenterComplaint['issueType']; label: string }[] = [
  { value: 'COLD_FOOD', label: 'أكل بارد' },
  { value: 'DELAY', label: 'تأخير' },
  { value: 'WRONG_ITEM', label: 'صنف خاطئ' },
  { value: 'MISSING_ITEM', label: 'صنف ناقص' },
  { value: 'QUALITY', label: 'جودة رديئة' },
  { value: 'DRIVER', label: 'مشكلة سائق' },
  { value: 'OTHER', label: 'أخرى' },
];

// ═══════════════════════════════════════
// ═══  WEIGHT POPUP (Sweets Only)   ═══
// ═══════════════════════════════════════
const WeightPopup: React.FC<{ item: MenuItem; onConfirm: (w: number, t: number) => void; onClose: () => void }> = ({ item, onConfirm, onClose }) => {
  const [weight, setWeight] = useState(0);
  const [input, setInput] = useState('');
  const total = weight * item.price;
  const quickWeights = [{ label: '250g', v: 0.25 }, { label: '500g', v: 0.5 }, { label: '1kg', v: 1 }, { label: '1.5kg', v: 1.5 }, { label: '2kg', v: 2 }];

  const handleKeypad = (d: string) => {
    if (d === 'C') { setInput(''); setWeight(0); return; }
    if (d === '.' && input.includes('.')) return;
    const next = input + d;
    setInput(next);
    const val = parseFloat(next);
    if (!isNaN(val) && val > 0) setWeight(val);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-slate-900 rounded-2xl p-5 w-full max-w-sm border border-white/10" onClick={e => e.stopPropagation()} dir="rtl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><Scale size={18} className="text-amber-500" /><h3 className="text-base font-black text-white">{item.nameAr}</h3></div>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>
        <p className="text-slate-500 text-xs mb-3">{'السعر: '}<span className="text-white font-bold">{item.price}</span>{' شيكل/كغ'}</p>
        <div className="grid grid-cols-5 gap-1.5 mb-3">
          {quickWeights.map(qw => (
            <button key={qw.v} onClick={() => { setWeight(qw.v); setInput(String(qw.v)); }}
              className={`py-2.5 rounded-lg font-black text-xs transition-all ${weight === qw.v ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{qw.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {['1','2','3','C','4','5','6','.','7','8','9','0'].map(d => (
            <button key={d} onClick={() => handleKeypad(d)}
              className={`py-2.5 rounded-lg font-black text-sm ${d === 'C' ? 'bg-red-600/20 text-red-400' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>{d}</button>
          ))}
        </div>
        <div className="bg-slate-800/80 rounded-xl p-3 mb-3 flex items-center justify-between">
          <div><p className="text-[10px] text-slate-500">الوزن</p><p className="text-lg font-black text-white">{weight > 0 ? `${weight} كغ` : '---'}</p></div>
          <div className="text-left"><p className="text-[10px] text-slate-500">الاجمالي</p><p className="text-lg font-black text-red-500">{total > 0 ? `${total.toFixed(1)} شيكل` : '---'}</p></div>
        </div>
        <button onClick={() => { if (weight > 0) onConfirm(weight, total); }} disabled={weight <= 0}
          className="w-full py-3 bg-red-600 text-white rounded-xl font-black text-sm hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed">{'اضافة للفاتورة'}</button>
      </motion.div>
    </motion.div>
  );
};

// ═══════════════════════════════════════
// ═══  FEEDBACK POPUP              ═══
// ═══════════════════════════════════════
const FeedbackPopup: React.FC<{ customerName: string; onSubmit: (rating: number) => void; onClose: () => void }> = ({ customerName, onSubmit, onClose }) => {
  const [rating, setRating] = useState(0);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-slate-900 rounded-2xl p-6 w-full max-w-xs border border-white/10 text-center" onClick={e => e.stopPropagation()} dir="rtl">
        <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3" />
        <h3 className="text-lg font-black text-white mb-1">{'تم التوصيل بنجاح!'}</h3>
        <p className="text-xs text-slate-400 mb-4">{'تقييم رضا العميل: '}{customerName}</p>
        <div className="flex items-center justify-center gap-2 mb-5">
          {[1,2,3,4,5].map(s => (
            <button key={s} onClick={() => setRating(s)} className="transition-transform hover:scale-110">
              <Star size={28} className={s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'} />
            </button>
          ))}
        </div>
        <button onClick={() => { if (rating > 0) onSubmit(rating); }} disabled={rating === 0}
          className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black text-sm disabled:opacity-30">{'تسجيل التقييم'}</button>
      </motion.div>
    </motion.div>
  );
};

// ═══════════════════════════════════════
// ═══  ORDER STEPPER               ═══
// ═══════════════════════════════════════
const OrderStepper: React.FC<{ timeline: { status: OrderStatus; time: Date }[]; createdAt: Date }> = ({ timeline, createdAt }) => {
  const steps = [
    { status: 'CALL_RECEIVED', label: 'استلام', icon: Phone, color: 'sky' },
    { status: OrderStatus.CONFIRMED, label: 'مؤكد', icon: Check, color: 'blue' },
    { status: OrderStatus.PREPARING, label: 'التحضير', icon: Package, color: 'amber' },
    { status: OrderStatus.READY, label: 'جاهز', icon: CheckCircle2, color: 'orange' },
    { status: OrderStatus.ON_DELIVERY, label: 'في الطريق', icon: Bike, color: 'purple' },
    { status: OrderStatus.DELIVERED, label: 'تم', icon: CheckCircle2, color: 'emerald' },
  ];
  const allTimes = [{ status: 'CALL_RECEIVED' as any, time: createdAt }, ...timeline];
  const activeIdx = steps.findIndex(s => !allTimes.find(t => t.status === s.status));
  const currentIdx = activeIdx === -1 ? steps.length : activeIdx;

  return (
    <div className="flex items-center gap-0.5 py-2" dir="rtl">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isDone = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const prevTime = idx > 0 ? allTimes.find(t => t.status === steps[idx - 1].status)?.time : null;
        const currTime = allTimes.find(t => t.status === step.status)?.time;
        const diff = prevTime && currTime ? Math.round((currTime.getTime() - prevTime.getTime()) / 60000) : null;
        return (
          <React.Fragment key={step.status}>
            <div className="flex flex-col items-center gap-0.5 min-w-[52px]">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] ${isDone ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-slate-600'}`}>
                <Icon size={13} />
              </div>
              <p className={`text-[8px] font-bold text-center leading-none ${isDone ? 'text-emerald-500' : isCurrent ? 'text-red-400' : 'text-slate-600'}`}>{step.label}</p>
              {diff !== null && <p className="text-[8px] text-slate-600 font-mono">{diff}{'د'}</p>}
            </div>
            {idx < steps.length - 1 && <div className={`flex-1 h-px mt-[-14px] ${isDone ? 'bg-emerald-600' : 'bg-slate-800'}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════
// ═══  ACTIVE ORDERS CARDS (Visual) ═══
// ═══════════════════════════════════════
const ActiveOrderCard: React.FC<{ order: any; elapsed: number }> = ({ order, elapsed }) => {
  const isNew = order.status === OrderStatus.CONFIRMED || order.status === OrderStatus.PENDING;
  const isPreparing = order.status === OrderStatus.PREPARING || order.status === OrderStatus.IN_PROGRESS;
  const isReady = order.status === OrderStatus.READY;
  const isDelivering = order.status === OrderStatus.ON_DELIVERY;
  const isLate = elapsed > 45;

  let borderColor = 'border-emerald-600/40';
  let bgColor = 'bg-emerald-600/5';
  let statusText = 'جديد';
  let statusBg = 'bg-emerald-600 text-white';

  if (isLate) {
    borderColor = 'border-red-600/60';
    bgColor = 'bg-red-600/10';
    statusText = 'متأخر!';
    statusBg = 'bg-red-600 text-white animate-pulse';
  } else if (isPreparing) {
    borderColor = 'border-amber-500/40';
    bgColor = 'bg-amber-500/5';
    statusText = 'قيد التجهيز';
    statusBg = 'bg-amber-500 text-black';
  } else if (isReady) {
    borderColor = 'border-blue-500/40';
    bgColor = 'bg-blue-500/5';
    statusText = 'جاهز للتوصيل';
    statusBg = 'bg-blue-500 text-white';
  } else if (isDelivering) {
    borderColor = 'border-purple-500/40';
    bgColor = 'bg-purple-500/5';
    statusText = 'في الطريق';
    statusBg = 'bg-purple-500 text-white';
  }

  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className={`${bgColor} border ${borderColor} rounded-xl p-3 transition-all hover:shadow-lg`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black text-white">#{order.orderNumber}</span>
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${statusBg}`}>{statusText}</span>
      </div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] text-slate-400">{order.customerName || 'عميل'}</span>
        <span className="text-[10px] font-black text-red-500">{order.total?.toFixed(0)} {'شيكل'}</span>
      </div>
      <div className="flex items-center gap-1.5 text-[9px] text-slate-500">
        <Timer size={10} />
        <span className="font-mono">{elapsed} {'دقيقة'}</span>
        <span className="text-slate-700">{'|'}</span>
        <span>{order.items?.length || 0} {'اصناف'}</span>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════
// ═══  SMART CART SUGGESTIONS       ═══
// ═══════════════════════════════════════
const SmartCartSuggestions: React.FC<{ customer: Customer; onAddItem: (item: MenuItem) => void }> = ({ customer, onAddItem }) => {
  const lastOrderItem = customer.favoriteItem ? MENU_ITEMS.find(i => i.nameAr === customer.favoriteItem) : null;
  const frequentCategory = customer.favoriteCategory;
  const categoryItems = frequentCategory ? MENU_ITEMS.filter(i => {
    const cat = CATEGORIES.find(c => c.name === frequentCategory);
    return cat ? i.category === cat.id : false;
  }).slice(0, 3) : [];

  if (!lastOrderItem && categoryItems.length === 0) return null;

  return (
    <div className="bg-slate-800/30 rounded-lg p-2 border border-white/[0.03]">
      <p className="text-[9px] font-black text-slate-500 mb-1.5 flex items-center gap-1"><Heart size={9} className="text-red-500" /> {'اقتراحات ذكية'}</p>
      {lastOrderItem && (
        <button onClick={() => onAddItem(lastOrderItem)}
          className="w-full flex items-center gap-2 p-1.5 bg-red-600/10 rounded-lg border border-red-600/20 hover:bg-red-600/20 transition-all mb-1">
          <Repeat size={10} className="text-red-500 flex-shrink-0" />
          <div className="flex-1 min-w-0 text-right">
            <p className="text-[10px] font-black text-white truncate">{lastOrderItem.nameAr}</p>
            <p className="text-[8px] text-slate-500">{'الطلب الاكثر تكرارا'}</p>
          </div>
          <span className="text-[10px] font-black text-red-500">{lastOrderItem.price}{'$'}</span>
          <Plus size={12} className="text-red-500 flex-shrink-0" />
        </button>
      )}
      {categoryItems.length > 0 && (
        <div className="flex gap-1 mt-1">
          {categoryItems.map(item => (
            <button key={item.id} onClick={() => onAddItem(item)}
              className="flex-1 p-1.5 bg-slate-800/60 rounded text-center hover:bg-slate-700 transition-all border border-white/[0.03]">
              <p className="text-[9px] font-black text-slate-300 truncate">{item.nameAr}</p>
              <p className="text-[9px] font-black text-red-500">{item.price}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════
// ═══  DRIVER PERF TABLE            ═══
// ═══════════════════════════════════════
const DriverTable: React.FC<{ drivers: any[] }> = ({ drivers }) => (
  <div className="overflow-auto custom-scrollbar">
    <table className="w-full text-xs" dir="rtl">
      <thead>
        <tr className="border-b border-white/5">
          <th className="text-right py-2 px-2 text-slate-500 font-bold">{'السائق'}</th>
          <th className="text-center py-2 px-1 text-slate-500 font-bold">{'الطلبات'}</th>
          <th className="text-center py-2 px-1 text-slate-500 font-bold">{'المتوسط'}</th>
          <th className="text-center py-2 px-1 text-slate-500 font-bold">{'النجاح'}</th>
          <th className="text-center py-2 px-1 text-slate-500 font-bold">{'التقييم'}</th>
        </tr>
      </thead>
      <tbody>
        {drivers.map(d => {
          const successRate = d.totalDeliveries > 0 ? Math.round(((d.totalDeliveries - d.lateDeliveryCount) / d.totalDeliveries) * 100) : 100;
          return (
            <tr key={d.id} className="border-b border-white/5 hover:bg-slate-800/30">
              <td className="py-2 px-2">
                <p className="font-black text-white">{d.name}</p>
                <p className="text-[10px] text-slate-600">{d.areasCovered.slice(0, 2).join('، ')}</p>
              </td>
              <td className="text-center py-2 px-1 font-black text-white">{d.totalDeliveries}</td>
              <td className="text-center py-2 px-1 font-bold text-slate-300">{d.averageDeliveryTime}{'د'}</td>
              <td className="text-center py-2 px-1">
                <span className={`font-black ${successRate >= 90 ? 'text-emerald-400' : successRate >= 75 ? 'text-amber-400' : 'text-red-400'}`}>{successRate}{'%'}</span>
              </td>
              <td className="text-center py-2 px-1">
                <span className="flex items-center justify-center gap-0.5"><Star size={10} className="text-amber-500" /><span className="font-black text-white">{d.performanceRating}</span></span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

// ═══════════════════════════════════════════
// ═══  MAIN CALL CENTER POS COMPONENT   ═══
// ═══════════════════════════════════════════
export const CallCenterPOS: React.FC = () => {
  const {
    addToCart, currentCart, removeFromCart, updateCartQuantity, submitOrder, clearCart,
    customers, searchCustomerByPhone, addCustomer, updateCustomer,
    deliveryEmployees, deliveryTrips, activeOrders,
    callCenterComplaints, addCallCenterComplaint, updateCallCenterComplaint,
    currentUser, setOrderType
  } = useApp();

  // ─── State ───
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustArea, setNewCustArea] = useState('وسط المدينة');
  const [selectedZone, setSelectedZone] = useState(DELIVERY_ZONES[0]);
  const [isExpress, setIsExpress] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [orderNote, setOrderNote] = useState('');
  const [weightItem, setWeightItem] = useState<MenuItem | null>(null);
  const [rightTab, setRightTab] = useState<'context' | 'complaints' | 'orders'>('context');
  const [showMoreProfile, setShowMoreProfile] = useState(false);
  const [feedbackPopup, setFeedbackPopup] = useState<{ orderId: string; customerName: string } | null>(null);
  const [manualTotal, setManualTotal] = useState<number | null>(null);

  // Complaint state
  const [complaintType, setComplaintType] = useState<CallCenterComplaint['issueType']>('DELAY');
  const [complaintAnger, setComplaintAnger] = useState(3);
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintSolution, setComplaintSolution] = useState('');
  const [complaintOrderId, setComplaintOrderId] = useState('');

  useEffect(() => { setOrderType(OrderType.DELIVERY); }, []);

  // ─── Computed ───
  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter(item =>
      (selectedCategory === 'all' || item.category === selectedCategory) &&
      (item.nameAr.includes(searchQuery) || item.id.includes(searchQuery))
    );
  }, [selectedCategory, searchQuery]);

  const subtotal = currentCart.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountValue = discountType === 'percent' ? subtotal * (discountAmount / 100) : discountAmount;
  const deliveryFee = isExpress ? 0 : selectedZone.price;
  const grandTotal = manualTotal !== null ? manualTotal : Math.max(0, subtotal - discountValue + deliveryFee);

  const todayOrders = activeOrders.filter(o => o.type === OrderType.DELIVERY);
  const avgDeliveryTime = deliveryEmployees.length > 0 
    ? Math.round(deliveryEmployees.reduce((s, d) => s + d.averageDeliveryTime, 0) / deliveryEmployees.length) 
    : 0;
  const openComplaints = callCenterComplaints.filter(c => c.status === 'OPEN').length;
  const customerComplaints = foundCustomer ? callCenterComplaints.filter(c => c.customerPhone === foundCustomer.phone) : [];
  const customerOrders = foundCustomer ? activeOrders.filter(o => o.customerPhone === foundCustomer.phone) : [];

  // ─── Handlers ───
  const handlePhoneSearch = useCallback(() => {
    const customer = searchCustomerByPhone(phoneInput);
    if (customer) {
      setFoundCustomer(customer);
      setIsNewCustomer(false);
      const zone = DELIVERY_ZONES.find(z => z.name === customer.area);
      if (zone) setSelectedZone(zone);
    } else {
      setFoundCustomer(null);
      setIsNewCustomer(true);
    }
  }, [phoneInput, searchCustomerByPhone]);

  const handleCreateCustomer = () => {
    if (!newCustName.trim()) return;
    addCustomer({
      name: newCustName, phone: phoneInput, address: newCustAddress, area: newCustArea,
      registrationDate: new Date(), totalOrders: 0, totalSpending: 0, loyaltyLevel: 'SILVER',
      orderFrequency: 0, satisfactionScore: 5, hasOpenComplaint: false
    });
    const created = searchCustomerByPhone(phoneInput);
    if (created) setFoundCustomer(created);
    setIsNewCustomer(false);
  };

  const handleAddItem = (item: MenuItem) => {
    if (SWEETS_CATEGORIES.includes(item.category)) { setWeightItem(item); return; }
    addToCart(item);
    setManualTotal(null);
  };

  const handleSubmitOrder = () => {
    if (currentCart.length === 0) return;
    const finalDiscount = manualTotal !== null ? (subtotal + deliveryFee - manualTotal) : discountValue;
    submitOrder(OrderStatus.CONFIRMED, paymentMethod, Math.max(0, finalDiscount), {
      name: foundCustomer?.name || newCustName || 'عميل', phone: phoneInput, note: orderNote
    });
    if (foundCustomer) {
      updateCustomer(foundCustomer.id, {
        totalOrders: foundCustomer.totalOrders + 1,
        totalSpending: foundCustomer.totalSpending + grandTotal,
        lastOrderDate: new Date()
      });
    }
    setFoundCustomer(null); setPhoneInput(''); setOrderNote(''); setDiscountAmount(0); setManualTotal(null);
  };

  const handleSubmitComplaint = () => {
    if (!complaintDesc.trim()) return;
    addCallCenterComplaint({
      customerPhone: phoneInput || foundCustomer?.phone || '',
      customerName: foundCustomer?.name || 'غير معرف',
      orderId: complaintOrderId || undefined,
      issueType: complaintType, angerLevel: complaintAnger,
      description: complaintDesc, proposedSolution: complaintSolution,
      agentName: currentUser?.name
    });
    setComplaintDesc(''); setComplaintSolution(''); setComplaintAnger(3); setComplaintOrderId('');
  };

  const handleFeedback = (rating: number) => {
    if (feedbackPopup && foundCustomer) {
      updateCustomer(foundCustomer.id, { satisfactionScore: rating });
    }
    setFeedbackPopup(null);
  };

  // ═══════════════════════════
  // ═══  RENDER  ═══
  // ═══════════════════════════
  return (
    <div className="h-full flex gap-0 overflow-hidden bg-slate-950" dir="rtl">
      <AnimatePresence>
        {weightItem && <WeightPopup item={weightItem} onConfirm={(w, t) => { addToCart(weightItem, { quantity: w, price: t / w, note: `${w} كغ` }); setWeightItem(null); }} onClose={() => setWeightItem(null)} />}
        {feedbackPopup && <FeedbackPopup customerName={feedbackPopup.customerName} onSubmit={handleFeedback} onClose={() => setFeedbackPopup(null)} />}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════ */}
      {/* ═══  LEFT COLUMN: Live Stats Sidebar    ═══ */}
      {/* ═══════════════════════════════════════════ */}
      <div className="w-[56px] flex flex-col bg-slate-900 border-l border-white/5 items-center py-2 gap-2 flex-shrink-0">
        <div className="flex flex-col items-center gap-1.5 w-full px-1">
          <div className="w-full bg-slate-800 rounded-lg p-1.5 text-center" title="طلبات اليوم">
            <ShoppingBag size={13} className="text-red-500 mx-auto mb-0.5" />
            <p className="text-[10px] font-black text-white leading-none">{todayOrders.length}</p>
            <p className="text-[7px] text-slate-600 mt-0.5">{'طلبات'}</p>
          </div>
          <div className="w-full bg-slate-800 rounded-lg p-1.5 text-center" title="متوسط التوصيل">
            <Timer size={13} className="text-amber-500 mx-auto mb-0.5" />
            <p className="text-[10px] font-black text-white leading-none">{avgDeliveryTime}</p>
            <p className="text-[7px] text-slate-600 mt-0.5">{'دقيقة'}</p>
          </div>
          <div className="w-full bg-slate-800 rounded-lg p-1.5 text-center" title="شكاوي مفتوحة">
            <AlertTriangle size={13} className={`mx-auto mb-0.5 ${openComplaints > 0 ? 'text-red-500' : 'text-emerald-500'}`} />
            <p className={`text-[10px] font-black leading-none ${openComplaints > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{openComplaints}</p>
            <p className="text-[7px] text-slate-600 mt-0.5">{'شكاوي'}</p>
          </div>
          <div className="w-full bg-slate-800 rounded-lg p-1.5 text-center" title="سائقين نشطين">
            <Bike size={13} className="text-sky-500 mx-auto mb-0.5" />
            <p className="text-[10px] font-black text-white leading-none">{deliveryEmployees.filter(d => d.status === 'ACTIVE').length}</p>
            <p className="text-[7px] text-slate-600 mt-0.5">{'سائقين'}</p>
          </div>
        </div>

        {/* Active Orders Quick View */}
        <div className="flex-1 w-full overflow-hidden flex flex-col">
          <div className="px-1 mt-1">
            <div className="h-px bg-white/5" />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar px-1 mt-1 space-y-1">
            {todayOrders.filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELED).slice(0, 6).map(order => {
              const elapsed = Math.round((Date.now() - order.createdAt.getTime()) / 60000);
              const isLate = elapsed > 45;
              return (
                <div key={order.id} className={`w-full rounded-lg p-1.5 text-center border ${isLate ? 'bg-red-600/15 border-red-600/30' : 'bg-slate-800/50 border-white/[0.03]'}`}>
                  <p className="text-[8px] font-black text-white leading-none">{order.orderNumber?.split('-')[1]}</p>
                  <p className={`text-[7px] font-mono mt-0.5 ${isLate ? 'text-red-400' : 'text-slate-600'}`}>{elapsed}{'د'}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* ═══  CENTER: Action Zone               ═══ */}
      {/* ═══════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 border-l border-white/5">
        
        {/* Top Bar: Phone Search + Customer Badge */}
        <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2 bg-slate-900/80 border-b border-white/5">
          <div className="relative w-56">
            <Phone size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
            <input value={phoneInput} onChange={e => setPhoneInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePhoneSearch()} placeholder="رقم الهاتف..."
              className="w-full pr-8 pl-3 py-2 bg-slate-800 border border-white/5 rounded-lg text-white text-xs font-bold focus:outline-none focus:border-red-600 transition-all" />
          </div>
          <button onClick={handlePhoneSearch} className="px-3 py-2 bg-red-600 text-white rounded-lg font-black text-xs hover:bg-red-700 transition-all">{'بحث'}</button>

          <div className="h-6 w-px bg-white/5" />

          {foundCustomer && (
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-1.5 border border-white/5">
              <span className="text-xs font-black text-white">{foundCustomer.name}</span>
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${foundCustomer.loyaltyLevel === 'PLATINUM' ? 'bg-purple-600/20 text-purple-400' : foundCustomer.loyaltyLevel === 'GOLD' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-600/20 text-slate-400'}`}>
                {foundCustomer.loyaltyLevel}
              </span>
              {foundCustomer.hasOpenComplaint && (
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                  <AlertCircle size={14} className="text-red-500" />
                </motion.div>
              )}
            </div>
          )}

          <div className="flex-1" />

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-bold">{currentCart.length} {'صنف'}</span>
            <span className="text-white font-black">{grandTotal.toFixed(1)} {'شيكل'}</span>
          </div>
        </div>

        {/* Active Orders Visual Tracking Cards */}
        {todayOrders.filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELED).length > 0 && (
          <div className="flex-shrink-0 px-3 py-2 border-b border-white/5 bg-slate-900/30">
            <div className="flex items-center gap-2 mb-1.5">
              <Clock size={12} className="text-red-500" />
              <span className="text-[10px] font-black text-slate-400">{'الطلبات النشطة'}</span>
              <span className="text-[10px] text-slate-600">({todayOrders.filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELED).length})</span>
            </div>
            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
              {todayOrders.filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELED).map(order => {
                const elapsed = Math.round((Date.now() - order.createdAt.getTime()) / 60000);
                return <div key={order.id} className="flex-shrink-0 w-48"><ActiveOrderCard order={order} elapsed={elapsed} /></div>;
              })}
            </div>
          </div>
        )}

        {/* Main Content: Menu + Cart */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Menu Section */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Categories */}
            <div className="flex-shrink-0 px-3 pt-2 pb-1">
              <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${selectedCategory === cat.id ? 'bg-red-600 text-white' : 'bg-slate-800/60 text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="flex-shrink-0 px-3 pb-2">
              <div className="relative">
                <Search size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="بحث بالاسم او رقم المنتج..."
                  className="w-full pr-8 pl-3 py-2 bg-slate-800/60 border border-white/5 rounded-lg text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-red-600/30" />
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1 overflow-auto px-3 pb-3 custom-scrollbar">
              <div className="grid grid-cols-4 gap-1.5">
                {filteredItems.map(item => (
                  <button key={item.id} onClick={() => handleAddItem(item)}
                    className="group bg-slate-900/80 rounded-lg p-2 border border-white/[0.03] hover:border-red-600/30 transition-all text-right">
                    <div className="flex items-start justify-between mb-0.5">
                      <span className="text-[9px] font-mono text-slate-600">{item.id}</span>
                      {SWEETS_CATEGORIES.includes(item.category) && <Scale size={10} className="text-amber-500/70" />}
                    </div>
                    <p className="text-[11px] font-black text-slate-300 leading-tight mb-1 line-clamp-2 group-hover:text-white transition-colors">{item.nameAr}</p>
                    <p className="text-xs font-black text-red-500">{item.price} <span className="text-[9px] text-slate-600">{SWEETS_CATEGORIES.includes(item.category) ? '/كغ' : ''}</span></p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cart / Invoice Panel */}
          <div className="w-[280px] flex flex-col bg-slate-900/40 border-r border-white/5 flex-shrink-0">
            {/* Smart Cart Suggestions */}
            {foundCustomer && currentCart.length === 0 && (
              <div className="flex-shrink-0 p-2 border-b border-white/[0.03]">
                <SmartCartSuggestions customer={foundCustomer} onAddItem={handleAddItem} />
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-auto p-2.5 space-y-1.5 custom-scrollbar">
              {currentCart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-700">
                  <Receipt size={32} className="mb-2 opacity-30" />
                  <p className="font-bold text-xs">{'الفاتورة فارغة'}</p>
                </div>
              ) : currentCart.map(item => (
                <div key={item.uniqueId} className="flex items-center gap-1.5 bg-slate-800/40 rounded-lg p-2 border border-white/[0.03]">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-white truncate">{item.name}</p>
                    {item.note && <p className="text-[9px] text-amber-400/80 font-bold">{item.note}</p>}
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button onClick={() => updateCartQuantity(item.uniqueId, -1)} className="w-5 h-5 bg-slate-700 rounded flex items-center justify-center text-white hover:bg-slate-600"><Minus size={10} /></button>
                    <span className="text-[10px] font-black text-white w-5 text-center">{item.quantity}</span>
                    <button onClick={() => updateCartQuantity(item.uniqueId, 1)} className="w-5 h-5 bg-slate-700 rounded flex items-center justify-center text-white hover:bg-slate-600"><Plus size={10} /></button>
                  </div>
                  <p className="text-[11px] font-black text-red-500 w-11 text-left flex-shrink-0">{(item.price * item.quantity).toFixed(0)}</p>
                  <button onClick={() => removeFromCart(item.uniqueId)} className="text-slate-700 hover:text-red-500"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>

            {/* Cart Controls */}
            <div className="flex-shrink-0 border-t border-white/5">
              {/* Delivery Zone + Express */}
              <div className="px-2.5 py-2 flex items-center gap-1.5">
                <select value={selectedZone.id} onChange={e => { const z = DELIVERY_ZONES.find(z => z.id === e.target.value); if (z) setSelectedZone(z); }}
                  className="flex-1 bg-slate-800 border border-white/5 rounded px-2 py-1.5 text-[10px] text-white font-bold focus:outline-none">
                  {DELIVERY_ZONES.map(z => <option key={z.id} value={z.id}>{z.name} - {z.price}{'\u20AA'}</option>)}
                </select>
                <button onClick={() => setIsExpress(!isExpress)}
                  className={`px-2.5 py-1.5 rounded text-[10px] font-black transition-all flex items-center gap-1 ${isExpress ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-500 border border-white/5'}`}>
                  <Zap size={11} /> {'عاجل'}
                </button>
              </div>

              {/* Discount */}
              <div className="px-2.5 py-1.5 flex items-center gap-1.5 border-t border-white/[0.03]">
                <input type="number" value={discountAmount || ''} onChange={e => { setDiscountAmount(Number(e.target.value)); setManualTotal(null); }} placeholder="خصم"
                  className="flex-1 bg-slate-800 border border-white/5 rounded px-2 py-1.5 text-[10px] text-white font-bold focus:outline-none" />
                <div className="flex bg-slate-800 rounded border border-white/5 overflow-hidden">
                  <button onClick={() => setDiscountType('fixed')} className={`px-2 py-1.5 text-[10px] font-black ${discountType === 'fixed' ? 'bg-red-600 text-white' : 'text-slate-500'}`}>{'\u20AA'}</button>
                  <button onClick={() => setDiscountType('percent')} className={`px-2 py-1.5 text-[10px] font-black ${discountType === 'percent' ? 'bg-red-600 text-white' : 'text-slate-500'}`}>{'%'}</button>
                </div>
              </div>

              {/* Manual Total Override */}
              <div className="px-2.5 py-1.5 flex items-center gap-1.5 border-t border-white/[0.03]">
                <input type="number" value={manualTotal !== null ? manualTotal : ''} 
                  onChange={e => setManualTotal(e.target.value ? Number(e.target.value) : null)} 
                  placeholder="تعديل الاجمالي يدويا"
                  className="flex-1 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1.5 text-[10px] text-amber-400 font-bold focus:outline-none placeholder:text-amber-500/30" />
                {manualTotal !== null && (
                  <button onClick={() => setManualTotal(null)} className="text-slate-600 hover:text-red-500"><X size={12} /></button>
                )}
              </div>

              {/* Payment */}
              <div className="px-2.5 py-1.5 flex gap-1 border-t border-white/[0.03]">
                {[{ m: PaymentMethod.CASH, l: 'كاش' }, { m: PaymentMethod.CREDIT_CARD, l: 'بطاقة' }, { m: PaymentMethod.ONLINE, l: 'أونلاين' }].map(pm => (
                  <button key={pm.m} onClick={() => setPaymentMethod(pm.m)}
                    className={`flex-1 py-1.5 rounded text-[10px] font-black transition-all ${paymentMethod === pm.m ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-500'}`}>{pm.l}</button>
                ))}
              </div>

              {/* Summary */}
              <div className="px-2.5 py-2 border-t border-white/10 bg-slate-900/60 space-y-1">
                <div className="flex justify-between text-[10px]"><span className="text-slate-500">{'المجموع'}</span><span className="text-white font-black">{subtotal.toFixed(1)}</span></div>
                {discountValue > 0 && manualTotal === null && <div className="flex justify-between text-[10px]"><span className="text-emerald-500">{'الخصم'}</span><span className="text-emerald-400 font-black">-{discountValue.toFixed(1)}</span></div>}
                <div className="flex justify-between text-[10px]"><span className="text-slate-500">{'التوصيل'}</span><span className={`font-black ${isExpress ? 'text-amber-400' : 'text-white'}`}>{isExpress ? 'مجاني' : deliveryFee}</span></div>
                {manualTotal !== null && <div className="flex justify-between text-[10px]"><span className="text-amber-500">{'تعديل يدوي'}</span><span className="text-amber-400 font-black">{'فعال'}</span></div>}
                <div className="h-px bg-white/5" />
                <div className="flex justify-between items-baseline"><span className="text-white font-black text-xs">{'الاجمالي'}</span><span className="text-red-500 font-black text-base">{grandTotal.toFixed(1)}</span></div>
              </div>

              {/* Note + Submit */}
              <div className="px-2.5 py-2 border-t border-white/5 space-y-1.5">
                <input value={orderNote} onChange={e => setOrderNote(e.target.value)} placeholder="ملاحظات..."
                  className="w-full bg-slate-800 border border-white/5 rounded px-2 py-1.5 text-[10px] text-white font-bold focus:outline-none" />
                
                <select value={selectedDriverId} onChange={e => setSelectedDriverId(e.target.value)}
                  className="w-full bg-slate-800 border border-white/5 rounded px-2 py-1.5 text-[10px] text-white font-bold focus:outline-none">
                  <option value="">{'اختر سائق التوصيل'}</option>
                  {deliveryEmployees.filter(d => d.status === 'ACTIVE').map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.averageDeliveryTime}{'د'})</option>
                  ))}
                </select>

                <div className="flex gap-1.5">
                  <button onClick={clearCart} className="px-3 py-2.5 bg-slate-800 text-slate-500 rounded-lg text-[10px] font-black hover:bg-slate-700">{'مسح'}</button>
                  <button onClick={handleSubmitOrder} disabled={currentCart.length === 0}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-black text-xs hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
                    <Send size={13} /> {'تأكيد الطلب'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* ═══  RIGHT: Customer Context            ═══ */}
      {/* ═══════════════════════════════════════════ */}
      <div className="w-[280px] flex flex-col bg-slate-900 flex-shrink-0 overflow-hidden">
        {/* Tabs */}
        <div className="flex-shrink-0 flex border-b border-white/5">
          {[
            { id: 'context' as const, label: 'العميل', icon: User },
            { id: 'complaints' as const, label: 'الشكاوي', icon: MessageSquare, badge: openComplaints },
            { id: 'orders' as const, label: 'الطلبات', icon: ShoppingBag },
          ].map(tab => (
            <button key={tab.id} onClick={() => setRightTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-2.5 text-[10px] font-black transition-all border-b-2 ${rightTab === tab.id ? 'text-red-500 border-red-600' : 'text-slate-600 border-transparent hover:text-slate-400'}`}>
              <tab.icon size={12} /> {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="w-3.5 h-3.5 bg-red-600 rounded-full text-[8px] text-white flex items-center justify-center">{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          {/* ─── Context Tab ─── */}
          {rightTab === 'context' && (
            <div className="p-3 space-y-3">
              {foundCustomer ? (
                <>
                  {foundCustomer.hasOpenComplaint && (
                    <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}
                      className="flex items-center gap-2 p-2.5 bg-red-600/15 border border-red-600/30 rounded-lg">
                      <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                      <p className="text-[10px] font-black text-red-400">{'شكوى مفتوحة لهذا العميل!'}</p>
                    </motion.div>
                  )}

                  <div className="bg-slate-800/40 rounded-xl p-3 border border-white/[0.03]">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-sm font-black text-white">{foundCustomer.name}</h3>
                        <p className="text-[10px] text-slate-500 font-mono">{foundCustomer.phone}</p>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${foundCustomer.loyaltyLevel === 'PLATINUM' ? 'bg-purple-600/20 text-purple-400' : foundCustomer.loyaltyLevel === 'GOLD' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'}`}>
                        {foundCustomer.loyaltyLevel}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-2">
                      <MapPin size={10} className="flex-shrink-0" /><span className="font-bold truncate">{foundCustomer.address}</span>
                    </div>

                    {/* Key metrics - no financials in quick view */}
                    <div className="grid grid-cols-3 gap-1.5 mb-2">
                      <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                        <p className="text-[8px] text-slate-600">{'الاكثر طلبا'}</p>
                        <p className="text-[9px] font-black text-amber-400 truncate">{foundCustomer.favoriteItem || '---'}</p>
                      </div>
                      <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                        <p className="text-[8px] text-slate-600">{'عدد الطلبات'}</p>
                        <p className="text-[10px] font-black text-white">{foundCustomer.totalOrders}</p>
                      </div>
                      <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                        <p className="text-[8px] text-slate-600">{'آخر طلب'}</p>
                        <p className="text-[9px] font-black text-slate-300">
                          {foundCustomer.lastOrderDate ? `${Math.round((Date.now() - foundCustomer.lastOrderDate.getTime()) / (24 * 3600000))} يوم` : '---'}
                        </p>
                      </div>
                    </div>

                    <button onClick={() => setShowMoreProfile(!showMoreProfile)}
                      className="w-full flex items-center justify-center gap-1 text-[9px] text-slate-600 hover:text-slate-400 transition-colors py-1">
                      {showMoreProfile ? <><EyeOff size={10} /> {'اخفاء التفاصيل'}</> : <><Eye size={10} /> {'عرض المزيد'}</>}
                    </button>

                    <AnimatePresence>
                      {showMoreProfile && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="pt-2 space-y-1.5">
                            <div className="flex items-center gap-2 bg-slate-800/60 rounded-lg p-2">
                              <span className="text-[8px] text-slate-600 w-12">{'الرضا'}</span>
                              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${(foundCustomer.satisfactionScore / 5) * 100}%` }}
                                  className={`h-full rounded-full ${foundCustomer.satisfactionScore >= 4 ? 'bg-emerald-500' : foundCustomer.satisfactionScore >= 3 ? 'bg-amber-500' : 'bg-red-500'}`} />
                              </div>
                              <span className="text-[10px] font-black text-white">{foundCustomer.satisfactionScore.toFixed(1)}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5">
                              <div className="bg-slate-800/60 rounded-lg p-2">
                                <p className="text-[8px] text-slate-600">{'القسم المفضل'}</p>
                                <p className="text-[10px] font-black text-slate-300">{foundCustomer.favoriteCategory || '---'}</p>
                              </div>
                              <div className="bg-slate-800/60 rounded-lg p-2">
                                <p className="text-[8px] text-slate-600">{'آخر سائق'}</p>
                                <p className="text-[10px] font-black text-sky-400">{foundCustomer.lastDriverName || '---'}</p>
                              </div>
                            </div>

                            {foundCustomer.notes && (
                              <div className="bg-slate-800/60 rounded-lg p-2">
                                <p className="text-[8px] text-slate-600 mb-0.5">{'ملاحظات'}</p>
                                <p className="text-[10px] text-slate-400">{foundCustomer.notes}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Live Order Timeline */}
                  {customerOrders.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black text-slate-500 flex items-center gap-1"><Clock size={10} /> {'تتبع الطلبات الحية'}</h4>
                      {customerOrders.slice(0, 3).map(order => (
                        <div key={order.id} className="bg-slate-800/40 rounded-xl p-3 border border-white/[0.03]">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-black text-white">#{order.orderNumber}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-black text-red-500">{order.total.toFixed(0)}{'\u20AA'}</span>
                              {order.status === OrderStatus.DELIVERED && (
                                <button onClick={() => setFeedbackPopup({ orderId: order.id, customerName: foundCustomer.name })}
                                  className="text-[9px] bg-emerald-600/20 text-emerald-400 px-1.5 py-0.5 rounded font-black hover:bg-emerald-600/30">
                                  {'تقييم'}
                                </button>
                              )}
                            </div>
                          </div>
                          <OrderStepper timeline={order.timeline} createdAt={order.createdAt} />
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <Timer size={10} className="text-slate-600" />
                            <span className="text-[9px] text-slate-500 font-mono">{Math.round((Date.now() - order.createdAt.getTime()) / 60000)} {'دقيقة منذ الاستلام'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : isNewCustomer ? (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <User size={14} className="text-amber-500" />
                    <p className="text-[10px] font-black text-amber-400">{'عميل جديد - أدخل البيانات'}</p>
                  </div>
                  <input value={newCustName} onChange={e => setNewCustName(e.target.value)} placeholder="اسم العميل"
                    className="w-full bg-slate-800 border border-white/5 rounded-lg px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-red-600" />
                  <input value={newCustAddress} onChange={e => setNewCustAddress(e.target.value)} placeholder="العنوان الكامل"
                    className="w-full bg-slate-800 border border-white/5 rounded-lg px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-red-600" />
                  <select value={newCustArea} onChange={e => setNewCustArea(e.target.value)}
                    className="w-full bg-slate-800 border border-white/5 rounded-lg px-3 py-2.5 text-xs text-white font-bold focus:outline-none">
                    {DELIVERY_ZONES.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
                  </select>
                  <button onClick={handleCreateCustomer} disabled={!newCustName.trim()}
                    className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-black text-xs disabled:opacity-30">{'تسجيل العميل'}</button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-3">
                    <Phone size={20} className="text-slate-700" />
                  </div>
                  <p className="text-xs font-bold text-slate-600">{'أدخل رقم هاتف العميل'}</p>
                  <p className="text-[10px] text-slate-700 mt-1">{'للبحث عن بياناته أو تسجيله'}</p>
                </div>
              )}
            </div>
          )}

          {/* ─── Complaints Tab ─── */}
          {rightTab === 'complaints' && (
            <div className="p-3 space-y-3">
              <div className="bg-slate-800/40 rounded-xl p-3 border border-white/[0.03] space-y-2">
                <h4 className="text-[10px] font-black text-slate-400 flex items-center gap-1.5"><AlertTriangle size={11} className="text-red-500" /> {'شكوى جديدة'}</h4>
                <select value={complaintType} onChange={e => setComplaintType(e.target.value as any)}
                  className="w-full bg-slate-800 border border-white/5 rounded px-2.5 py-2 text-[10px] text-white font-bold focus:outline-none">
                  {COMPLAINT_TYPES.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
                </select>
                <div>
                  <p className="text-[9px] text-slate-600 mb-1">{'مستوى الغضب'}</p>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(l => (
                      <button key={l} onClick={() => setComplaintAnger(l)}
                        className={`flex-1 py-1.5 rounded text-[10px] font-black flex items-center justify-center gap-0.5 ${complaintAnger >= l ? (l >= 4 ? 'bg-red-600 text-white' : l >= 3 ? 'bg-amber-500 text-black' : 'bg-emerald-600 text-white') : 'bg-slate-800 text-slate-600'}`}>
                        <Flame size={9} />{l}
                      </button>
                    ))}
                  </div>
                </div>
                <input value={complaintOrderId} onChange={e => setComplaintOrderId(e.target.value)} placeholder="رقم الطلب (اختياري)"
                  className="w-full bg-slate-800 border border-white/5 rounded px-2.5 py-2 text-[10px] text-white font-bold focus:outline-none" />
                <textarea value={complaintDesc} onChange={e => setComplaintDesc(e.target.value)} placeholder="وصف المشكلة..." rows={2}
                  className="w-full bg-slate-800 border border-white/5 rounded px-2.5 py-2 text-[10px] text-white font-bold focus:outline-none resize-none" />
                <textarea value={complaintSolution} onChange={e => setComplaintSolution(e.target.value)} placeholder="الحل المقترح..." rows={2}
                  className="w-full bg-slate-800 border border-white/5 rounded px-2.5 py-2 text-[10px] text-white font-bold focus:outline-none resize-none" />
                <button onClick={handleSubmitComplaint} disabled={!complaintDesc.trim()}
                  className="w-full py-2.5 bg-red-600 text-white rounded-lg font-black text-[10px] disabled:opacity-30">{'تسجيل الشكوى'}</button>
              </div>

              {customerComplaints.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-[9px] font-black text-slate-500">{'شكاوي العميل'} ({customerComplaints.length})</h4>
                  {customerComplaints.map(c => (
                    <div key={c.id} className={`p-2.5 rounded-lg border ${c.status === 'OPEN' ? 'bg-red-600/10 border-red-600/20' : c.status === 'RESOLVED' ? 'bg-emerald-600/10 border-emerald-600/20' : 'bg-slate-800/40 border-white/[0.03]'}`}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] font-black text-white">{COMPLAINT_TYPES.find(ct => ct.value === c.issueType)?.label}</span>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${c.status === 'OPEN' ? 'bg-red-600/20 text-red-400' : 'bg-emerald-600/20 text-emerald-400'}`}>
                          {c.status === 'OPEN' ? 'مفتوحة' : c.status === 'RESOLVED' ? 'محلولة' : 'قيد المعالجة'}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-500 mb-1">{c.description}</p>
                      {c.status === 'OPEN' && (
                        <button onClick={() => updateCallCenterComplaint(c.id, { status: 'RESOLVED', resolvedAt: new Date() })}
                          className="text-[9px] font-black text-emerald-400 hover:text-emerald-300">{'تحديد كمحلولة'}</button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-1.5">
                <h4 className="text-[9px] font-black text-slate-500">{'جميع الشكاوي المفتوحة'}</h4>
                {callCenterComplaints.filter(c => c.status !== 'RESOLVED').map(c => (
                  <div key={c.id} className="p-2 bg-slate-800/30 rounded-lg border border-white/[0.03]">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-black text-white">{c.customerName}</span>
                      <span className="text-[9px] text-slate-600">{c.customerPhone}</span>
                    </div>
                    <p className="text-[9px] text-slate-500">{COMPLAINT_TYPES.find(ct => ct.value === c.issueType)?.label}{': '}{c.description}</p>
                    <div className="flex items-center gap-0.5 mt-1">{Array.from({length: c.angerLevel}).map((_,i) => <Flame key={i} size={8} className="text-red-500" />)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Orders Tab (Active Orders with Visual Tracking) ─── */}
          {rightTab === 'orders' && (
            <div className="p-3 space-y-2">
              <h4 className="text-[10px] font-black text-slate-500 flex items-center gap-1"><ShoppingBag size={11} /> {'جميع الطلبات النشطة'}</h4>
              {todayOrders.filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELED).length === 0 ? (
                <div className="text-center py-8 text-slate-700">
                  <ShoppingBag size={24} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-bold">{'لا توجد طلبات نشطة'}</p>
                </div>
              ) : todayOrders.filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELED).map(order => {
                const elapsed = Math.round((Date.now() - order.createdAt.getTime()) / 60000);
                return (
                  <div key={order.id}>
                    <ActiveOrderCard order={order} elapsed={elapsed} />
                    <div className="mt-1 px-1">
                      <OrderStepper timeline={order.timeline} createdAt={order.createdAt} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
