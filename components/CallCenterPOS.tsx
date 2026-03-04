import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../store';
import { MENU_ITEMS, CATEGORIES } from '../constants';
import { OrderType, OrderStatus, PaymentMethod, MenuItem, Customer, CallCenterComplaint } from '../types';
import { 
  Search, Plus, Minus, Trash2, Phone, MapPin, Star, AlertTriangle, 
  Clock, Truck, Zap, Receipt, ChevronLeft, ChevronRight, X, User,
  Scale, AlertCircle, MessageSquare, Send, Check, Package, 
  ArrowLeftRight, Timer, Bike, CheckCircle2, Ban, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── DELIVERY ZONES ───
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

// ─── SWEETS CATEGORIES ───
const SWEETS_CATEGORIES = ['oriental_sweets', 'cake', 'bar_sweets', 'gelato'];

// ─── COMPLAINT TYPES ───
const COMPLAINT_TYPES: { value: CallCenterComplaint['issueType']; label: string }[] = [
  { value: 'COLD_FOOD', label: 'أكل بارد' },
  { value: 'DELAY', label: 'تأخير' },
  { value: 'WRONG_ITEM', label: 'صنف خاطئ' },
  { value: 'MISSING_ITEM', label: 'صنف ناقص' },
  { value: 'QUALITY', label: 'جودة رديئة' },
  { value: 'DRIVER', label: 'مشكلة مع السائق' },
  { value: 'OTHER', label: 'أخرى' },
];

// ─── WEIGHT POPUP ───
const WeightPopup: React.FC<{ item: MenuItem; onConfirm: (weight: number, total: number) => void; onClose: () => void }> = ({ item, onConfirm, onClose }) => {
  const [weight, setWeight] = useState(0);
  const [manualInput, setManualInput] = useState('');
  const total = weight * item.price;

  const quickWeights = [
    { label: '250g', value: 0.25 },
    { label: '500g', value: 0.5 },
    { label: '1kg', value: 1 },
    { label: '1.5kg', value: 1.5 },
    { label: '2kg', value: 2 },
  ];

  const handleManualSubmit = () => {
    const val = parseFloat(manualInput);
    if (val > 0) setWeight(val);
  };

  const handleKeypad = (digit: string) => {
    if (digit === 'C') { setManualInput(''); setWeight(0); return; }
    if (digit === '.') { if (manualInput.includes('.')) return; }
    const next = manualInput + digit;
    setManualInput(next);
    const val = parseFloat(next);
    if (!isNaN(val) && val > 0) setWeight(val);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} className="bg-slate-900 rounded-3xl p-6 w-full max-w-md border border-white/10" onClick={e => e.stopPropagation()} dir="rtl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Scale size={22} className="text-amber-500" />
            <h3 className="text-xl font-black text-white">{item.nameAr}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <p className="text-slate-400 text-sm mb-4">السعر: <span className="text-white font-bold">{item.price}</span> شيكل/كغ</p>

        {/* Quick Weights */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {quickWeights.map(qw => (
            <button key={qw.value} onClick={() => { setWeight(qw.value); setManualInput(String(qw.value)); }}
              className={`py-3 rounded-xl font-black text-sm transition-all ${weight === qw.value ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
              {qw.label}
            </button>
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {['1','2','3','C','4','5','6','.','7','8','9','0'].map(d => (
            <button key={d} onClick={() => handleKeypad(d)}
              className={`py-3 rounded-xl font-black text-lg transition-all ${d === 'C' ? 'bg-red-600/30 text-red-400' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
              {d}
            </button>
          ))}
        </div>

        <div className="bg-slate-800 rounded-xl p-4 mb-4 text-center">
          <p className="text-slate-400 text-xs mb-1">الوزن</p>
          <p className="text-3xl font-black text-white">{weight > 0 ? `${weight} كغ` : '---'}</p>
          <div className="h-px bg-white/10 my-3" />
          <p className="text-slate-400 text-xs mb-1">الإجمالي</p>
          <p className="text-3xl font-black text-red-500">{total > 0 ? `${total.toFixed(2)} شيكل` : '---'}</p>
        </div>

        <button onClick={() => { if (weight > 0) onConfirm(weight, total); }} disabled={weight <= 0}
          className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-lg hover:bg-red-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
          إضافة للفاتورة
        </button>
      </motion.div>
    </motion.div>
  );
};

// ─── SATISFACTION GAUGE ───
const SatisfactionGauge: React.FC<{ score: number }> = ({ score }) => {
  const percentage = (score / 5) * 100;
  const color = score >= 4 ? 'text-emerald-500' : score >= 3 ? 'text-amber-500' : 'text-red-500';
  const bgColor = score >= 4 ? 'bg-emerald-500' : score >= 3 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2.5 bg-slate-700 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full ${bgColor}`} />
      </div>
      <span className={`font-black text-sm ${color}`}>{score.toFixed(1)}/5</span>
    </div>
  );
};

// ─── ORDER LIFECYCLE STEPPER ───
const OrderLifecycleStepper: React.FC<{ timeline: { status: OrderStatus; time: Date }[]; createdAt: Date }> = ({ timeline, createdAt }) => {
  const steps = [
    { status: 'CALL_RECEIVED', label: 'استلام المكالمة', icon: Phone },
    { status: OrderStatus.CONFIRMED, label: 'مؤكد/مدفوع', icon: Check },
    { status: OrderStatus.PREPARING, label: 'في الإنتاج', icon: Package },
    { status: OrderStatus.READY, label: 'جاهز للتوصيل', icon: CheckCircle2 },
    { status: OrderStatus.ON_DELIVERY, label: 'في الطريق', icon: Bike },
    { status: OrderStatus.DELIVERED, label: 'تم التوصيل', icon: CheckCircle2 },
  ];

  const allTimes = [{ status: 'CALL_RECEIVED' as any, time: createdAt }, ...timeline];
  const currentStepIdx = steps.findIndex((s, i) => {
    const found = allTimes.find(t => t.status === s.status);
    if (!found) return true;
    return false;
  });
  const activeIdx = currentStepIdx === -1 ? steps.length : currentStepIdx;

  const getTimeDiff = (idx: number): string | null => {
    if (idx === 0) return null;
    const currStep = steps[idx];
    const prevStep = steps[idx - 1];
    const currTime = allTimes.find(t => t.status === currStep.status)?.time;
    const prevTime = allTimes.find(t => t.status === prevStep.status)?.time;
    if (!currTime || !prevTime) return null;
    const diff = Math.round((currTime.getTime() - prevTime.getTime()) / 60000);
    return `${diff} د`;
  };

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2" dir="rtl">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isDone = idx < activeIdx;
        const isCurrent = idx === activeIdx;
        const timeDiff = getTimeDiff(idx);
        return (
          <React.Fragment key={step.status}>
            <div className="flex flex-col items-center gap-1 min-w-[70px]">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isDone ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
                <Icon size={16} />
              </div>
              <p className={`text-[10px] font-bold text-center leading-tight ${isDone ? 'text-emerald-400' : isCurrent ? 'text-red-400' : 'text-slate-500'}`}>{step.label}</p>
              {timeDiff && <p className="text-[9px] text-slate-500 font-mono">{timeDiff}</p>}
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-shrink-0 h-0.5 w-6 mt-[-18px] ${isDone ? 'bg-emerald-600' : 'bg-slate-700'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── DRIVER STATS MODAL ───
const DriverStatsModal: React.FC<{ driver: any; onClose: () => void }> = ({ driver, onClose }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-slate-900 rounded-3xl p-6 w-full max-w-sm border border-white/10" onClick={e => e.stopPropagation()} dir="rtl">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-black text-white">{driver.name}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
      </div>
      <div className="space-y-3">
        {[
          { label: 'اجمالي الرحلات', value: driver.totalTrips },
          { label: 'اجمالي التوصيلات', value: driver.totalDeliveries },
          { label: 'متوسط وقت التوصيل', value: `${driver.averageDeliveryTime} دقيقة` },
          { label: 'التأخيرات', value: driver.lateDeliveryCount, warn: driver.lateDeliveryCount > 10 },
          { label: 'الشكاوي', value: driver.complaintCount, warn: driver.complaintCount > 3 },
          { label: 'التقييم', value: `${driver.performanceRating}/5` },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
            <span className="text-slate-400 text-sm font-bold">{row.label}</span>
            <span className={`font-black ${row.warn ? 'text-red-400' : 'text-white'}`}>{row.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-slate-800/50 rounded-xl">
        <p className="text-slate-400 text-xs font-bold mb-2">المناطق المغطاة</p>
        <div className="flex flex-wrap gap-1">
          {driver.areasCovered.map((a: string) => (
            <span key={a} className="px-2 py-1 bg-slate-700 rounded-lg text-xs font-bold text-slate-300">{a}</span>
          ))}
        </div>
      </div>
    </motion.div>
  </motion.div>
);

// ═══════════════════════════════════════════
// ═══  MAIN CALL CENTER POS COMPONENT   ═══
// ═══════════════════════════════════════════
export const CallCenterPOS: React.FC = () => {
  const {
    addToCart, currentCart, removeFromCart, updateCartQuantity, updateCartItem, submitOrder, clearCart,
    customers, searchCustomerByPhone, addCustomer, updateCustomer,
    deliveryEmployees, deliveryTrips, activeOrders,
    callCenterComplaints, addCallCenterComplaint, updateCallCenterComplaint,
    currentUser, setOrderType
  } = useApp();

  // ─── UI State ───
  const [activePanel, setActivePanel] = useState<'order' | 'complaints' | 'tracking'>('order');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Customer State ───
  const [phoneInput, setPhoneInput] = useState('');
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustArea, setNewCustArea] = useState('وسط المدينة');

  // ─── Delivery State ───
  const [selectedZone, setSelectedZone] = useState(DELIVERY_ZONES[0]);
  const [isExpress, setIsExpress] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [driverStatsModal, setDriverStatsModal] = useState<any>(null);

  // ─── Invoice State ───
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [orderNote, setOrderNote] = useState('');

  // ─── Weight Popup State ───
  const [weightItem, setWeightItem] = useState<MenuItem | null>(null);

  // ─── Complaint State ───
  const [complaintType, setComplaintType] = useState<CallCenterComplaint['issueType']>('DELAY');
  const [complaintAnger, setComplaintAnger] = useState(3);
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintSolution, setComplaintSolution] = useState('');
  const [complaintOrderId, setComplaintOrderId] = useState('');

  // ─── Tracking State ───
  const [trackingOrderId, setTrackingOrderId] = useState('');

  // Set order type to delivery
  useEffect(() => { setOrderType(OrderType.DELIVERY); }, []);

  // ─── Computed ───
  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter(item =>
      (selectedCategory === 'all' || item.category === selectedCategory) &&
      (item.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) || item.id.includes(searchQuery))
    );
  }, [selectedCategory, searchQuery]);

  const subtotal = currentCart.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountValue = discountType === 'percent' ? subtotal * (discountAmount / 100) : discountAmount;
  const deliveryFee = isExpress ? 0 : selectedZone.price;
  const grandTotal = Math.max(0, subtotal - discountValue + deliveryFee);

  // ─── Handlers ───
  const handlePhoneSearch = () => {
    const customer = searchCustomerByPhone(phoneInput);
    if (customer) {
      setFoundCustomer(customer);
      setIsNewCustomer(false);
      // Auto-set zone
      const zone = DELIVERY_ZONES.find(z => z.name === customer.area);
      if (zone) setSelectedZone(zone);
    } else {
      setFoundCustomer(null);
      setIsNewCustomer(true);
    }
  };

  const handleCreateCustomer = () => {
    if (!newCustName.trim()) return;
    const newCust: Omit<Customer, 'id'> = {
      name: newCustName, phone: phoneInput, address: newCustAddress, area: newCustArea,
      registrationDate: new Date(), totalOrders: 0, totalSpending: 0, loyaltyLevel: 'SILVER',
      orderFrequency: 0, satisfactionScore: 5, hasOpenComplaint: false
    };
    addCustomer(newCust);
    const created = searchCustomerByPhone(phoneInput);
    if (created) setFoundCustomer(created);
    setIsNewCustomer(false);
  };

  const handleAddItem = (item: MenuItem) => {
    if (SWEETS_CATEGORIES.includes(item.category)) {
      setWeightItem(item);
    } else {
      addToCart(item);
    }
  };

  const handleWeightConfirm = (weight: number, total: number) => {
    if (!weightItem) return;
    addToCart(weightItem, { quantity: weight, price: total / weight, note: `${weight} كغ` });
    setWeightItem(null);
  };

  const handleSubmitOrder = () => {
    if (currentCart.length === 0) return;
    submitOrder(
      OrderStatus.CONFIRMED,
      paymentMethod,
      discountValue,
      { name: foundCustomer?.name || newCustName || 'عميل', phone: phoneInput, note: orderNote }
    );
    // Update customer
    if (foundCustomer) {
      updateCustomer(foundCustomer.id, {
        totalOrders: foundCustomer.totalOrders + 1,
        totalSpending: foundCustomer.totalSpending + grandTotal,
        lastOrderDate: new Date()
      });
    }
    // Reset
    setFoundCustomer(null);
    setPhoneInput('');
    setOrderNote('');
    setDiscountAmount(0);
  };

  const handleSubmitComplaint = () => {
    if (!complaintDesc.trim()) return;
    addCallCenterComplaint({
      customerPhone: phoneInput || foundCustomer?.phone || '',
      customerName: foundCustomer?.name || 'غير معرف',
      orderId: complaintOrderId || undefined,
      issueType: complaintType,
      angerLevel: complaintAnger,
      description: complaintDesc,
      proposedSolution: complaintSolution,
      agentName: currentUser?.name
    });
    setComplaintDesc('');
    setComplaintSolution('');
    setComplaintAnger(3);
  };

  const customerComplaints = foundCustomer
    ? callCenterComplaints.filter(c => c.customerPhone === foundCustomer.phone)
    : [];

  const trackedOrder = activeOrders.find(o => o.orderNumber === trackingOrderId || o.id === trackingOrderId);

  // ═══════════════════════════════════
  // ═══  RENDER  ═══
  // ═══════════════════════════════════
  return (
    <div className="h-full flex gap-0 overflow-hidden bg-slate-950" dir="rtl">
      <AnimatePresence>{weightItem && <WeightPopup item={weightItem} onConfirm={handleWeightConfirm} onClose={() => setWeightItem(null)} />}</AnimatePresence>
      <AnimatePresence>{driverStatsModal && <DriverStatsModal driver={driverStatsModal} onClose={() => setDriverStatsModal(null)} />}</AnimatePresence>

      {/* ══════════════════════════════════════════════════════ */}
      {/* ═══  PANEL 1: PRODUCT MENU (LEFT)                ═══ */}
      {/* ══════════════════════════════════════════════════════ */}
      <div className="w-[42%] flex flex-col border-l border-white/5 bg-slate-950">
        {/* Category Tabs */}
        <div className="flex-shrink-0 p-3 border-b border-white/5">
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all ${selectedCategory === cat.id ? 'bg-red-600 text-white' : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'}`}>
                <span className="ml-1">{cat.icon}</span> {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="flex-shrink-0 px-3 pt-3 pb-2">
          <div className="relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="بحث بالاسم أو رقم المنتج..."
              className="w-full pr-10 pl-4 py-2.5 bg-slate-900 border border-white/5 rounded-xl text-white text-sm font-bold focus:outline-none focus:ring-1 focus:ring-red-600/50" />
          </div>
        </div>

        {/* Item Grid */}
        <div className="flex-1 overflow-auto p-3 custom-scrollbar">
          <div className="grid grid-cols-3 gap-2">
            {filteredItems.map(item => (
              <button key={item.id} onClick={() => handleAddItem(item)}
                className="group bg-slate-900 rounded-xl p-2.5 border border-white/5 hover:border-red-600/40 transition-all text-right">
                <div className="flex items-start justify-between mb-1">
                  <span className="text-[10px] font-mono text-slate-500">{item.id}</span>
                  {SWEETS_CATEGORIES.includes(item.category) && <Scale size={12} className="text-amber-500" />}
                </div>
                <p className="text-xs font-black text-white leading-tight mb-1.5 line-clamp-2">{item.nameAr}</p>
                <p className="text-sm font-black text-red-500">{item.price} <span className="text-[10px] text-slate-500">{SWEETS_CATEGORIES.includes(item.category) ? '/كغ' : 'شيكل'}</span></p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* ═══  PANEL 2: INVOICE (CENTER)                   ═══ */}
      {/* ══════════════════════════════════════════════════════ */}
      <div className="w-[30%] flex flex-col bg-slate-900/50 border-l border-white/5">
        {/* Panel Tabs */}
        <div className="flex-shrink-0 border-b border-white/5">
          <div className="flex">
            {[
              { id: 'order' as const, label: 'الفاتورة', icon: Receipt },
              { id: 'complaints' as const, label: 'الشكاوي', icon: MessageSquare },
              { id: 'tracking' as const, label: 'التتبع', icon: Timer },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActivePanel(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-black transition-all border-b-2 ${activePanel === tab.id ? 'text-red-500 border-red-600 bg-red-600/5' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>
                <tab.icon size={14} /> {tab.label}
                {tab.id === 'complaints' && callCenterComplaints.filter(c => c.status === 'OPEN').length > 0 && (
                  <span className="w-4 h-4 bg-red-600 rounded-full text-[9px] text-white flex items-center justify-center">{callCenterComplaints.filter(c => c.status === 'OPEN').length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {activePanel === 'order' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Cart Items */}
            <div className="flex-1 overflow-auto p-3 space-y-2 custom-scrollbar">
              {currentCart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600">
                  <Receipt size={40} className="mb-3 opacity-30" />
                  <p className="font-bold text-sm">الفاتورة فارغة</p>
                  <p className="text-xs mt-1">اختر أصناف من القائمة</p>
                </div>
              ) : currentCart.map((item, idx) => (
                <motion.div key={item.uniqueId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 bg-slate-800/50 rounded-xl p-2.5 border border-white/5">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-white truncate">{item.name}</p>
                    {item.note && <p className="text-[10px] text-amber-400 font-bold">{item.note}</p>}
                    <p className="text-[10px] text-slate-500">{item.price} x {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateCartQuantity(item.uniqueId, -1)} className="w-6 h-6 bg-slate-700 rounded-lg flex items-center justify-center text-white hover:bg-slate-600">
                      <Minus size={12} />
                    </button>
                    <span className="text-xs font-black text-white w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateCartQuantity(item.uniqueId, 1)} className="w-6 h-6 bg-slate-700 rounded-lg flex items-center justify-center text-white hover:bg-slate-600">
                      <Plus size={12} />
                    </button>
                  </div>
                  <p className="text-sm font-black text-red-500 w-14 text-left">{(item.price * item.quantity).toFixed(1)}</p>
                  <button onClick={() => removeFromCart(item.uniqueId)} className="text-slate-600 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Delivery Zone + Express */}
            <div className="flex-shrink-0 px-3 py-2 border-t border-white/5 space-y-2">
              <div className="flex items-center gap-2">
                <select value={selectedZone.id} onChange={e => { const z = DELIVERY_ZONES.find(z => z.id === e.target.value); if (z) setSelectedZone(z); }}
                  className="flex-1 bg-slate-800 border border-white/5 rounded-lg px-2 py-2 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-red-600/50">
                  {DELIVERY_ZONES.map(z => <option key={z.id} value={z.id}>{z.name} - {z.price} شيكل</option>)}
                </select>
                <button onClick={() => setIsExpress(!isExpress)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black transition-all ${isExpress ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400 border border-white/5'}`}>
                  <Zap size={14} /> عاجل
                </button>
              </div>
              {isExpress && <p className="text-[10px] text-amber-400 font-bold text-center">توصيل عاجل - رسوم التوصيل: 0 شيكل (سياسة داخلية)</p>}
            </div>

            {/* Discount */}
            <div className="flex-shrink-0 px-3 py-2 border-t border-white/5">
              <div className="flex items-center gap-2">
                <input type="number" value={discountAmount || ''} onChange={e => setDiscountAmount(Number(e.target.value))} placeholder="خصم"
                  className="flex-1 bg-slate-800 border border-white/5 rounded-lg px-3 py-2 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-red-600/50" />
                <div className="flex bg-slate-800 rounded-lg border border-white/5 overflow-hidden">
                  <button onClick={() => setDiscountType('fixed')} className={`px-3 py-2 text-xs font-black ${discountType === 'fixed' ? 'bg-red-600 text-white' : 'text-slate-400'}`}>شيكل</button>
                  <button onClick={() => setDiscountType('percent')} className={`px-3 py-2 text-xs font-black ${discountType === 'percent' ? 'bg-red-600 text-white' : 'text-slate-400'}`}>%</button>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex-shrink-0 px-3 py-2 border-t border-white/5">
              <div className="flex gap-1">
                {[
                  { m: PaymentMethod.CASH, label: 'كاش' },
                  { m: PaymentMethod.CREDIT_CARD, label: 'بطاقة' },
                  { m: PaymentMethod.ONLINE, label: 'أونلاين' },
                ].map(pm => (
                  <button key={pm.m} onClick={() => setPaymentMethod(pm.m)}
                    className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${paymentMethod === pm.m ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Summary */}
            <div className="flex-shrink-0 p-3 border-t border-white/10 bg-slate-900/80 space-y-1.5">
              <div className="flex justify-between text-xs"><span className="text-slate-400 font-bold">المجموع الفرعي</span><span className="text-white font-black">{subtotal.toFixed(2)}</span></div>
              {discountValue > 0 && <div className="flex justify-between text-xs"><span className="text-emerald-400 font-bold">الخصم</span><span className="text-emerald-400 font-black">-{discountValue.toFixed(2)}</span></div>}
              <div className="flex justify-between text-xs"><span className="text-slate-400 font-bold">التوصيل {isExpress && '(عاجل)'}</span><span className={`font-black ${isExpress ? 'text-amber-400' : 'text-white'}`}>{isExpress ? 'مجاني' : deliveryFee.toFixed(2)}</span></div>
              <div className="h-px bg-white/10 my-1" />
              <div className="flex justify-between"><span className="text-white font-black text-sm">الإجمالي</span><span className="text-red-500 font-black text-xl">{grandTotal.toFixed(2)} <span className="text-xs">شيكل</span></span></div>
            </div>

            {/* Order Note + Submit */}
            <div className="flex-shrink-0 p-3 border-t border-white/5 space-y-2">
              <input value={orderNote} onChange={e => setOrderNote(e.target.value)} placeholder="ملاحظات الطلب..."
                className="w-full bg-slate-800 border border-white/5 rounded-lg px-3 py-2 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-red-600/50" />
              <div className="flex gap-2">
                <button onClick={clearCart} className="px-4 py-3 bg-slate-800 text-slate-400 rounded-xl text-xs font-black hover:bg-slate-700 transition-all">مسح</button>
                <button onClick={handleSubmitOrder} disabled={currentCart.length === 0}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black text-sm hover:bg-red-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  <Send size={16} /> تأكيد الطلب
                </button>
              </div>
            </div>
          </div>
        )}

        {activePanel === 'complaints' && (
          <div className="flex-1 overflow-auto p-3 space-y-4 custom-scrollbar">
            {/* New Complaint Form */}
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-white/5 space-y-3">
              <h4 className="text-sm font-black text-white flex items-center gap-2"><AlertTriangle size={16} className="text-red-500" /> شكوى جديدة</h4>
              
              <select value={complaintType} onChange={e => setComplaintType(e.target.value as any)}
                className="w-full bg-slate-800 border border-white/5 rounded-lg px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-red-600/50">
                {COMPLAINT_TYPES.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
              </select>

              <div>
                <p className="text-[10px] text-slate-400 font-bold mb-1.5">مستوى الغضب</p>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(level => (
                    <button key={level} onClick={() => setComplaintAnger(level)}
                      className={`flex-1 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1 ${complaintAnger >= level ? (level >= 4 ? 'bg-red-600 text-white' : level >= 3 ? 'bg-amber-500 text-black' : 'bg-emerald-600 text-white') : 'bg-slate-700 text-slate-500'}`}>
                      <Flame size={12} /> {level}
                    </button>
                  ))}
                </div>
              </div>

              <input value={complaintOrderId} onChange={e => setComplaintOrderId(e.target.value)} placeholder="رقم الطلب (اختياري)"
                className="w-full bg-slate-800 border border-white/5 rounded-lg px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-red-600/50" />

              <textarea value={complaintDesc} onChange={e => setComplaintDesc(e.target.value)} placeholder="وصف المشكلة..." rows={3}
                className="w-full bg-slate-800 border border-white/5 rounded-lg px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-red-600/50 resize-none" />

              <textarea value={complaintSolution} onChange={e => setComplaintSolution(e.target.value)} placeholder="الحل المقترح..." rows={2}
                className="w-full bg-slate-800 border border-white/5 rounded-lg px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-red-600/50 resize-none" />

              <button onClick={handleSubmitComplaint} disabled={!complaintDesc.trim()}
                className="w-full py-3 bg-red-600 text-white rounded-xl font-black text-sm hover:bg-red-700 transition-all disabled:opacity-30">
                تسجيل الشكوى
              </button>
            </div>

            {/* Existing Complaints for this customer */}
            {customerComplaints.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-400">شكاوي العميل ({customerComplaints.length})</h4>
                {customerComplaints.map(comp => (
                  <div key={comp.id} className={`p-3 rounded-xl border ${comp.status === 'OPEN' ? 'bg-red-600/10 border-red-600/30' : comp.status === 'RESOLVED' ? 'bg-emerald-600/10 border-emerald-600/30' : 'bg-slate-800/50 border-white/5'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-white">{COMPLAINT_TYPES.find(ct => ct.value === comp.issueType)?.label}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${comp.status === 'OPEN' ? 'bg-red-600/20 text-red-400' : comp.status === 'RESOLVED' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {comp.status === 'OPEN' ? 'مفتوحة' : comp.status === 'RESOLVED' ? 'محلولة' : comp.status === 'IN_PROGRESS' ? 'قيد المعالجة' : 'مصعّدة'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-1">{comp.description}</p>
                    {comp.status === 'OPEN' && (
                      <button onClick={() => updateCallCenterComplaint(comp.id, { status: 'RESOLVED', resolvedAt: new Date() })}
                        className="mt-1 text-[10px] font-black text-emerald-400 hover:text-emerald-300">
                        تحديد كمحلولة
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* All open complaints */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-400">جميع الشكاوي المفتوحة</h4>
              {callCenterComplaints.filter(c => c.status !== 'RESOLVED').map(comp => (
                <div key={comp.id} className="p-3 bg-slate-800/50 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-white">{comp.customerName}</span>
                    <span className="text-[10px] text-slate-500">{comp.customerPhone}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{COMPLAINT_TYPES.find(ct => ct.value === comp.issueType)?.label}: {comp.description}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({length: comp.angerLevel}).map((_,i) => <Flame key={i} size={10} className="text-red-500" />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activePanel === 'tracking' && (
          <div className="flex-1 overflow-auto p-3 space-y-4 custom-scrollbar">
            {/* Search by order number */}
            <div className="flex gap-2">
              <input value={trackingOrderId} onChange={e => setTrackingOrderId(e.target.value)} placeholder="رقم الطلب (مثال: ORD-1001)"
                className="flex-1 bg-slate-800 border border-white/5 rounded-lg px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-red-600/50" />
            </div>

            {trackedOrder ? (
              <div className="space-y-3">
                <div className="bg-slate-800/50 rounded-2xl p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-black text-white">#{trackedOrder.orderNumber}</h4>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${trackedOrder.status === OrderStatus.DELIVERED ? 'bg-emerald-600/20 text-emerald-400' : trackedOrder.status === OrderStatus.CANCELED ? 'bg-red-600/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {trackedOrder.status}
                    </span>
                  </div>
                  <OrderLifecycleStepper timeline={trackedOrder.timeline} createdAt={trackedOrder.createdAt} />
                  <div className="mt-3 space-y-1.5">
                    {trackedOrder.items.map(item => (
                      <div key={item.uniqueId} className="flex justify-between text-xs">
                        <span className="text-slate-300 font-bold">{item.name} x{item.quantity}</span>
                        <span className="text-white font-black">{(item.price * item.quantity).toFixed(1)}</span>
                      </div>
                    ))}
                    <div className="h-px bg-white/5 my-1" />
                    <div className="flex justify-between text-xs">
                      <span className="text-white font-black">الإجمالي</span>
                      <span className="text-red-500 font-black">{trackedOrder.total.toFixed(2)} شيكل</span>
                    </div>
                  </div>
                </div>

                {/* Time elapsed */}
                <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Timer size={14} className="text-amber-500" />
                    <span className="text-xs font-black text-white">الوقت المنقضي</span>
                  </div>
                  <p className="text-2xl font-black text-white text-center">
                    {Math.round((Date.now() - trackedOrder.createdAt.getTime()) / 60000)} <span className="text-sm text-slate-400">دقيقة</span>
                  </p>
                </div>
              </div>
            ) : trackingOrderId ? (
              <div className="text-center py-8 text-slate-600">
                <Package size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-bold">لم يتم العثور على طلب</p>
              </div>
            ) : null}

            {/* Recent Orders */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-400">الطلبات الأخيرة</h4>
              {activeOrders.filter(o => o.type === OrderType.DELIVERY).slice(0, 8).map(order => (
                <button key={order.id} onClick={() => setTrackingOrderId(order.orderNumber)}
                  className="w-full text-right p-3 bg-slate-800/50 rounded-xl border border-white/5 hover:border-red-600/30 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white">#{order.orderNumber}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${order.status === OrderStatus.DELIVERED ? 'bg-emerald-600/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">{order.customerName} - {order.total} شيكل</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* ═══  PANEL 3: CUSTOMER & DELIVERY (RIGHT)        ═══ */}
      {/* ══════════════════════════════════════════════════════ */}
      <div className="w-[28%] flex flex-col bg-slate-900 overflow-hidden">
        {/* Phone Search */}
        <div className="flex-shrink-0 p-3 border-b border-white/5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Phone size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={phoneInput} onChange={e => setPhoneInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePhoneSearch()} placeholder="رقم الهاتف..."
                className="w-full pr-9 pl-3 py-3 bg-slate-800 border-2 border-white/5 rounded-xl text-white text-sm font-black focus:outline-none focus:border-red-600 transition-all" />
            </div>
            <button onClick={handlePhoneSearch} className="px-4 bg-red-600 text-white rounded-xl font-black text-sm hover:bg-red-700 transition-all">
              <Search size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          {/* Customer Profile */}
          {foundCustomer && (
            <div className="p-3 space-y-3">
              {/* Complaint Alert */}
              {foundCustomer.hasOpenComplaint && (
                <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}
                  className="flex items-center gap-2 p-3 bg-red-600/20 border border-red-600/40 rounded-xl">
                  <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                  <p className="text-xs font-black text-red-400">تنبيه: يوجد شكوى مفتوحة لهذا العميل!</p>
                </motion.div>
              )}

              {/* Profile Card */}
              <div className="bg-gradient-to-bl from-red-600/10 to-slate-800/80 rounded-2xl p-4 border border-white/5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-black text-white">{foundCustomer.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{foundCustomer.phone}</p>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${foundCustomer.loyaltyLevel === 'PLATINUM' ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30' : foundCustomer.loyaltyLevel === 'GOLD' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-600/20 text-slate-400 border border-slate-600/30'}`}>
                    {foundCustomer.loyaltyLevel}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                  <MapPin size={12} /> <span className="font-bold">{foundCustomer.address}</span>
                </div>

                {/* Satisfaction Gauge */}
                <div className="mb-3">
                  <p className="text-[10px] text-slate-500 font-bold mb-1">مؤشر الرضا</p>
                  <SatisfactionGauge score={foundCustomer.satisfactionScore} />
                </div>

                {/* Insights Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-800/60 rounded-lg p-2.5">
                    <p className="text-[9px] text-slate-500 font-bold mb-0.5">عدد الطلبات</p>
                    <p className="text-sm font-black text-white">{foundCustomer.totalOrders}</p>
                  </div>
                  <div className="bg-slate-800/60 rounded-lg p-2.5">
                    <p className="text-[9px] text-slate-500 font-bold mb-0.5">إجمالي الإنفاق</p>
                    <p className="text-sm font-black text-white">{foundCustomer.totalSpending} <span className="text-[9px] text-slate-500">شيكل</span></p>
                  </div>
                  <div className="bg-slate-800/60 rounded-lg p-2.5">
                    <p className="text-[9px] text-slate-500 font-bold mb-0.5">الصنف المفضل</p>
                    <p className="text-xs font-black text-amber-400 truncate">{foundCustomer.favoriteItem || '---'}</p>
                  </div>
                  <div className="bg-slate-800/60 rounded-lg p-2.5">
                    <p className="text-[9px] text-slate-500 font-bold mb-0.5">آخر سائق</p>
                    <p className="text-xs font-black text-sky-400 truncate">{foundCustomer.lastDriverName || '---'}</p>
                  </div>
                </div>

                {/* Last Order */}
                {foundCustomer.lastOrderDate && (
                  <div className="mt-2 bg-slate-800/60 rounded-lg p-2.5">
                    <p className="text-[9px] text-slate-500 font-bold mb-0.5">آخر طلب</p>
                    <p className="text-xs font-bold text-slate-300">
                      {Math.round((Date.now() - foundCustomer.lastOrderDate.getTime()) / (24 * 3600000))} يوم مضت
                      {foundCustomer.lastOrderId && <span className="text-slate-500 mr-2">#{foundCustomer.lastOrderId}</span>}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* New Customer Form */}
          {isNewCustomer && (
            <div className="p-3 space-y-3">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center gap-2">
                <User size={16} className="text-amber-500 flex-shrink-0" />
                <p className="text-xs font-black text-amber-400">عميل جديد - أدخل البيانات</p>
              </div>
              <input value={newCustName} onChange={e => setNewCustName(e.target.value)} placeholder="اسم العميل"
                className="w-full bg-slate-800 border border-white/5 rounded-xl px-3 py-3 text-sm text-white font-bold focus:outline-none focus:ring-1 focus:ring-red-600/50" />
              <input value={newCustAddress} onChange={e => setNewCustAddress(e.target.value)} placeholder="العنوان الكامل"
                className="w-full bg-slate-800 border border-white/5 rounded-xl px-3 py-3 text-sm text-white font-bold focus:outline-none focus:ring-1 focus:ring-red-600/50" />
              <select value={newCustArea} onChange={e => setNewCustArea(e.target.value)}
                className="w-full bg-slate-800 border border-white/5 rounded-xl px-3 py-3 text-sm text-white font-bold focus:outline-none focus:ring-1 focus:ring-red-600/50">
                {DELIVERY_ZONES.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
              </select>
              <button onClick={handleCreateCustomer} disabled={!newCustName.trim()}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black text-sm hover:bg-emerald-700 transition-all disabled:opacity-30">
                تسجيل العميل
              </button>
            </div>
          )}

          {/* Delivery Hero Assignment */}
          <div className="p-3 space-y-2 border-t border-white/5">
            <h4 className="text-xs font-black text-slate-400 flex items-center gap-1.5"><Truck size={14} /> تعيين سائق التوصيل</h4>
            <div className="space-y-1.5">
              {deliveryEmployees.filter(d => d.status === 'ACTIVE').map(driver => {
                const currentTrips = deliveryTrips.filter(t => t.driverId === driver.id && t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length;
                const isSelected = selectedDriverId === driver.id;
                return (
                  <button key={driver.id} onClick={() => setSelectedDriverId(driver.id)}
                    className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-right transition-all ${isSelected ? 'bg-red-600/20 border border-red-600/40' : 'bg-slate-800/50 border border-white/5 hover:border-white/10'}`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-red-600' : 'bg-slate-700'}`}>
                      <Bike size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-black text-white truncate">{driver.name}</p>
                        <div className="flex items-center gap-0.5">
                          <Star size={10} className="text-amber-500" />
                          <span className="text-[10px] font-black text-amber-400">{driver.performanceRating}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-bold ${currentTrips > 2 ? 'text-red-400' : 'text-slate-500'}`}>
                          {currentTrips} رحلات نشطة
                        </span>
                        <span className="text-[10px] text-slate-600">|</span>
                        <span className="text-[10px] text-slate-500 font-bold">{driver.averageDeliveryTime}د متوسط</span>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setDriverStatsModal(driver); }} className="text-slate-600 hover:text-slate-300">
                      <ArrowLeftRight size={14} />
                    </button>
                  </button>
                );
              })}
            </div>
          </div>

          {/* No customer found yet */}
          {!foundCustomer && !isNewCustomer && (
            <div className="p-3 flex flex-col items-center justify-center text-center py-10">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-3">
                <Phone size={28} className="text-slate-600" />
              </div>
              <p className="text-sm font-bold text-slate-500">أدخل رقم هاتف العميل</p>
              <p className="text-xs text-slate-600 mt-1">للبحث عن بياناته أو تسجيله كعميل جديد</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
