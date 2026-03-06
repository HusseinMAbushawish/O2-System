import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Phone, User, MapPin, Clock, Plus, Minus, Trash2, 
  AlertTriangle, Star, ChevronLeft, ChevronRight, X, Edit3,
  MessageSquare, CheckCircle, Package, Truck, CreditCard, Banknote,
  Hash, Heart, History, Send, UserPlus, FileText, AlertCircle, Scale,
  Timer, Bike, Check, CheckCircle2, Flame, Eye, EyeOff
} from 'lucide-react';
import { useApp } from '../store';
import { MENU_ITEMS, CATEGORIES } from '../constants';
import { OrderType, OrderStatus, PaymentMethod, Customer, CallCenterComplaint, MenuItem } from '../types';

// ===================== SAMPLE DATA =====================
const SAMPLE_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'أحمد محمد العلي', phone: '0501234567', address: 'شارع الملك فهد، حي النخيل، فيلا 25', area: 'النخيل', registrationDate: new Date('2023-01-15'), totalOrders: 45, totalSpending: 3250, loyaltyLevel: 'PLATINUM', favoriteCategory: 'shawarma', favoriteItem: '102', orderFrequency: 8, lastOrderDate: new Date(Date.now() - 2 * 24 * 60 * 60000), satisfactionScore: 4.8, hasOpenComplaint: false },
  { id: 'c2', name: 'فاطمة أحمد السالم', phone: '0559876543', address: 'شارع الأمير سلطان، حي الروضة، شقة 12', area: 'الروضة', registrationDate: new Date('2023-03-20'), totalOrders: 28, totalSpending: 1890, loyaltyLevel: 'GOLD', favoriteCategory: 'oriental_sweets', favoriteItem: '407', orderFrequency: 5, lastOrderDate: new Date(Date.now() - 5 * 24 * 60 * 60000), satisfactionScore: 4.5, hasOpenComplaint: true },
  { id: 'c3', name: 'خالد عبدالله النصر', phone: '0567891234', address: 'شارع التحلية، حي السليمانية، برج الفيصلية', area: 'السليمانية', registrationDate: new Date('2023-06-10'), totalOrders: 12, totalSpending: 980, loyaltyLevel: 'SILVER', favoriteCategory: 'western', favoriteItem: '301', orderFrequency: 2, lastOrderDate: new Date(Date.now() - 10 * 24 * 60 * 60000), satisfactionScore: 4.2, hasOpenComplaint: false },
  { id: 'c4', name: 'نورة سعد الدوسري', phone: '0512345678', address: 'شارع العليا، حي الورود، مجمع الراشد', area: 'الورود', registrationDate: new Date('2022-11-05'), totalOrders: 67, totalSpending: 5430, loyaltyLevel: 'PLATINUM', favoriteCategory: 'italian', favoriteItem: '204', orderFrequency: 12, lastOrderDate: new Date(Date.now() - 1 * 24 * 60 * 60000), satisfactionScore: 4.9, hasOpenComplaint: false },
  { id: 'c5', name: 'محمد علي الشمري', phone: '0598765432', address: 'شارع الستين، حي المروج، فيلا 8', area: 'المروج', registrationDate: new Date('2023-08-22'), totalOrders: 8, totalSpending: 560, loyaltyLevel: 'SILVER', favoriteCategory: 'drinks', favoriteItem: '709', orderFrequency: 2, lastOrderDate: new Date(Date.now() - 15 * 24 * 60 * 60000), satisfactionScore: 3.8, hasOpenComplaint: true },
  { id: 'c6', name: 'سارة محمد القحطاني', phone: '0534567890', address: 'شارع الأمير محمد، حي الياسمين، شقة 5', area: 'الياسمين', registrationDate: new Date('2023-02-14'), totalOrders: 35, totalSpending: 2780, loyaltyLevel: 'GOLD', favoriteCategory: 'cake', favoriteItem: '507', orderFrequency: 6, lastOrderDate: new Date(Date.now() - 3 * 24 * 60 * 60000), satisfactionScore: 4.6, hasOpenComplaint: false },
  { id: 'c7', name: 'عبدالرحمن خالد المطيري', phone: '0576543210', address: 'شارع الملك عبدالعزيز، حي الصفا، برج النخيل', area: 'الصفا', registrationDate: new Date('2023-04-30'), totalOrders: 22, totalSpending: 1650, loyaltyLevel: 'GOLD', favoriteCategory: 'bar_sweets', favoriteItem: '601', orderFrequency: 4, lastOrderDate: new Date(Date.now() - 7 * 24 * 60 * 60000), satisfactionScore: 4.3, hasOpenComplaint: false },
  { id: 'c8', name: 'منى عبدالله الحربي', phone: '0543216789', address: 'شارع الثلاثين، حي النسيم، منزل 15', area: 'النسيم', registrationDate: new Date('2023-09-15'), totalOrders: 5, totalSpending: 320, loyaltyLevel: 'SILVER', favoriteCategory: 'gelato', favoriteItem: '902', orderFrequency: 1, lastOrderDate: new Date(Date.now() - 20 * 24 * 60 * 60000), satisfactionScore: 4.0, hasOpenComplaint: false },
  { id: 'c9', name: 'يوسف إبراهيم العتيبي', phone: '0587654321', address: 'شارع الأربعين، حي الملز، شقة 22', area: 'الملز', registrationDate: new Date('2022-08-10'), totalOrders: 89, totalSpending: 7250, loyaltyLevel: 'PLATINUM', favoriteCategory: 'shawarma', favoriteItem: '108', orderFrequency: 15, lastOrderDate: new Date(Date.now() - 0.5 * 24 * 60 * 60000), satisfactionScore: 5.0, hasOpenComplaint: false },
  { id: 'c10', name: 'ليلى سالم الزهراني', phone: '0521098765', address: 'شارع الخمسين، حي الربوة، فيلا 30', area: 'الربوة', registrationDate: new Date('2023-05-25'), totalOrders: 18, totalSpending: 1420, loyaltyLevel: 'GOLD', favoriteCategory: 'salads', favoriteItem: '801', orderFrequency: 3, lastOrderDate: new Date(Date.now() - 4 * 24 * 60 * 60000), satisfactionScore: 4.4, hasOpenComplaint: false },
];

const SAMPLE_COMPLAINTS: CallCenterComplaint[] = [
  { id: 'comp1', customerPhone: '0559876543', customerName: 'فاطمة أحمد السالم', orderId: 'ORD-2001', issueType: 'DELAY', angerLevel: 3, description: 'تأخر الطلب ساعة كاملة', proposedSolution: 'خصم 20% على الطلب القادم', status: 'OPEN', createdAt: new Date(Date.now() - 2 * 60 * 60000), agentName: 'محمد' },
  { id: 'comp2', customerPhone: '0598765432', customerName: 'محمد علي الشمري', orderId: 'ORD-1998', issueType: 'COLD_FOOD', angerLevel: 4, description: 'الطعام وصل بارد تماماً', proposedSolution: 'إعادة الطلب مجاناً', status: 'IN_PROGRESS', createdAt: new Date(Date.now() - 5 * 60 * 60000), agentName: 'سارة' },
];

const SAMPLE_DRIVERS = [
  { id: 'd1', name: 'أحمد الدليفري', phone: '0551112233', status: 'ACTIVE' as const, currentOrders: 2, area: 'النخيل' },
  { id: 'd2', name: 'محمد السائق', phone: '0552223344', status: 'ACTIVE' as const, currentOrders: 1, area: 'الروضة' },
  { id: 'd3', name: 'خالد التوصيل', phone: '0553334455', status: 'ACTIVE' as const, currentOrders: 0, area: 'السليمانية' },
  { id: 'd4', name: 'عبدالله الموصل', phone: '0554445566', status: 'INACTIVE' as const, currentOrders: 0, area: 'الورود' },
  { id: 'd5', name: 'سعود المندوب', phone: '0555556677', status: 'ACTIVE' as const, currentOrders: 3, area: 'المروج' },
];

const DELIVERY_ZONES = [
  { id: 'z1', name: 'النخيل', price: 10 },
  { id: 'z2', name: 'الروضة', price: 12 },
  { id: 'z3', name: 'السليمانية', price: 15 },
  { id: 'z4', name: 'الورود', price: 18 },
  { id: 'z5', name: 'المروج', price: 20 },
  { id: 'z6', name: 'الياسمين', price: 15 },
  { id: 'z7', name: 'الصفا', price: 25 },
  { id: 'z8', name: 'النسيم', price: 30 },
];

const SWEETS_CATEGORIES = ['oriental_sweets', 'cake', 'bar_sweets', 'gelato'];

// ===================== WEIGHT POPUP =====================
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
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-slate-900 rounded-2xl p-5 w-full max-w-sm border border-slate-700" onClick={e => e.stopPropagation()} dir="rtl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><Scale size={18} className="text-amber-500" /><h3 className="text-base font-bold text-white">{item.nameAr}</h3></div>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>
        <p className="text-slate-500 text-xs mb-3">السعر: <span className="text-white font-bold">{item.price}</span> ر.س/كغ</p>
        <div className="grid grid-cols-5 gap-1.5 mb-3">
          {quickWeights.map(qw => (
            <button key={qw.v} onClick={() => { setWeight(qw.v); setInput(String(qw.v)); }}
              className={`py-2.5 rounded-lg font-bold text-xs transition-all ${weight === qw.v ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{qw.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {['1','2','3','C','4','5','6','.','7','8','9','0'].map(d => (
            <button key={d} onClick={() => handleKeypad(d)}
              className={`py-2.5 rounded-lg font-bold text-sm ${d === 'C' ? 'bg-red-600/20 text-red-400' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>{d}</button>
          ))}
        </div>
        <div className="bg-slate-800/80 rounded-xl p-3 mb-3 flex items-center justify-between">
          <div><p className="text-[10px] text-slate-500">الوزن</p><p className="text-lg font-bold text-white">{weight > 0 ? `${weight} كغ` : '---'}</p></div>
          <div className="text-left"><p className="text-[10px] text-slate-500">الإجمالي</p><p className="text-lg font-bold text-blue-400">{total > 0 ? `${total.toFixed(1)} ر.س` : '---'}</p></div>
        </div>
        <button onClick={() => { if (weight > 0) onConfirm(weight, total); }} disabled={weight <= 0}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed">إضافة للفاتورة</button>
      </motion.div>
    </motion.div>
  );
};

// ===================== COMPONENT =====================
export const CallCenterPOS: React.FC = () => {
  const { 
    activeOrders, 
    currentCart, 
    addToCart, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart,
    submitOrder,
    customers: storeCustomers,
    addCustomer,
    callCenterComplaints: storeComplaints,
    addCallCenterComplaint,
    setOrderType
  } = useApp();

  // Merge store data with sample data
  const allCustomers = useMemo(() => [...SAMPLE_CUSTOMERS, ...storeCustomers], [storeCustomers]);
  const allComplaints = useMemo(() => [...SAMPLE_COMPLAINTS, ...storeComplaints], [storeComplaints]);

  // ========== STATE ==========
  const [phoneSearch, setPhoneSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [productIdInput, setProductIdInput] = useState('');
  const [manualTotal, setManualTotal] = useState<string>('');
  const [orderNote, setOrderNote] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState(DELIVERY_ZONES[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [showComplaintBox, setShowComplaintBox] = useState(false);
  const [activeOrderTab, setActiveOrderTab] = useState<string | null>(null);
  const [weightItem, setWeightItem] = useState<MenuItem | null>(null);
  const [now, setNow] = useState(Date.now());
  
  // New customer form
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '', area: '' });
  
  // Complaint form
  const [complaintForm, setComplaintForm] = useState({ 
    issueType: 'DELAY' as CallCenterComplaint['issueType'], 
    angerLevel: 3, 
    description: '', 
    proposedSolution: '' 
  });

  // Orders navigation ref
  const ordersNavRef = useRef<HTMLDivElement>(null);

  // Set order type on mount
  useEffect(() => { setOrderType(OrderType.DELIVERY); }, [setOrderType]);

  // Timer for order elapsed time
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  // ========== COMPUTED ==========
  const deliveryOrders = useMemo(() => 
    activeOrders.filter(o => o.type === OrderType.DELIVERY && o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELED),
    [activeOrders]
  );

  const filteredMenu = useMemo(() => {
    if (selectedCategory === 'all') return MENU_ITEMS;
    return MENU_ITEMS.filter(item => item.category === selectedCategory);
  }, [selectedCategory]);

  const cartSubtotal = useMemo(() => 
    currentCart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [currentCart]
  );

  const deliveryFee = selectedZone.price;

  const finalTotal = useMemo(() => {
    if (manualTotal && !isNaN(parseFloat(manualTotal))) {
      return parseFloat(manualTotal);
    }
    return cartSubtotal + deliveryFee;
  }, [cartSubtotal, manualTotal, deliveryFee]);

  const customerComplaint = useMemo(() => {
    if (!selectedCustomer) return null;
    return allComplaints.find(c => c.customerPhone === selectedCustomer.phone && c.status !== 'RESOLVED');
  }, [selectedCustomer, allComplaints]);

  const customerFavoriteItem = useMemo(() => {
    if (!selectedCustomer?.favoriteItem) return null;
    return MENU_ITEMS.find(item => item.id === selectedCustomer.favoriteItem);
  }, [selectedCustomer]);

  // ========== HANDLERS ==========
  const handlePhoneSearch = (phone: string) => {
    setPhoneSearch(phone);
    if (phone.length >= 10) {
      const customer = allCustomers.find(c => c.phone === phone || c.phone.includes(phone));
      if (customer) {
        setSelectedCustomer(customer);
        setShowNewCustomerForm(false);
        // Auto-select zone based on customer area
        const zone = DELIVERY_ZONES.find(z => z.name === customer.area);
        if (zone) setSelectedZone(zone);
      } else {
        setSelectedCustomer(null);
        setShowNewCustomerForm(true);
        setNewCustomer(prev => ({ ...prev, phone }));
      }
    } else {
      setSelectedCustomer(null);
      setShowNewCustomerForm(false);
    }
  };

  const handleProductIdSubmit = () => {
    if (!productIdInput) return;
    const item = MENU_ITEMS.find(m => m.id === productIdInput);
    if (item) {
      handleAddItem(item);
      setProductIdInput('');
    }
  };

  const handleAddItem = (item: MenuItem) => {
    if (SWEETS_CATEGORIES.includes(item.category)) {
      setWeightItem(item);
    } else {
      addToCart(item);
    }
  };

  const handleWeightConfirm = (weight: number, total: number) => {
    if (weightItem) {
      addToCart({ ...weightItem, price: total } as MenuItem, { weight });
      setWeightItem(null);
    }
  };

  const handleAddNewCustomer = () => {
    if (newCustomer.name && newCustomer.phone && newCustomer.address) {
      const customer: Customer = {
        id: `c-${Date.now()}`,
        name: newCustomer.name,
        phone: newCustomer.phone,
        address: newCustomer.address,
        area: newCustomer.area || 'غير محدد',
        registrationDate: new Date(),
        totalOrders: 0,
        totalSpending: 0,
        loyaltyLevel: 'SILVER',
        orderFrequency: 0,
        satisfactionScore: 5,
      };
      addCustomer(customer);
      setSelectedCustomer(customer);
      setShowNewCustomerForm(false);
      setNewCustomer({ name: '', phone: '', address: '', area: '' });
    }
  };

  const handleSubmitComplaint = () => {
    if (selectedCustomer && complaintForm.description) {
      addCallCenterComplaint({
        customerPhone: selectedCustomer.phone,
        customerName: selectedCustomer.name,
        issueType: complaintForm.issueType,
        angerLevel: complaintForm.angerLevel,
        description: complaintForm.description,
        proposedSolution: complaintForm.proposedSolution,
        agentName: 'المشغل الحالي'
      });
      setShowComplaintBox(false);
      setComplaintForm({ issueType: 'DELAY', angerLevel: 3, description: '', proposedSolution: '' });
    }
  };

  const handleSubmitOrder = () => {
    if (!selectedCustomer || currentCart.length === 0) return;
    
    submitOrder(
      OrderStatus.PENDING,
      paymentMethod,
      manualTotal ? (cartSubtotal + deliveryFee) - parseFloat(manualTotal) : 0,
      {
        name: selectedCustomer.name,
        phone: selectedCustomer.phone,
        note: orderNote
      }
    );
    
    setManualTotal('');
    setOrderNote('');
    setSelectedDriver('');
  };

  const scrollOrders = (direction: 'left' | 'right') => {
    if (ordersNavRef.current) {
      const scrollAmount = 200;
      ordersNavRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getOrderTimerColor = (createdAt: Date) => {
    const minutes = Math.floor((now - new Date(createdAt).getTime()) / 60000);
    if (minutes < 15) return 'bg-emerald-500';
    if (minutes < 30) return 'bg-amber-500';
    if (minutes < 45) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getOrderTimer = (createdAt: Date) => {
    const minutes = Math.floor((now - new Date(createdAt).getTime()) / 60000);
    return `${minutes} د`;
  };

  const getLoyaltyBadge = (level: string) => {
    switch (level) {
      case 'PLATINUM': return { color: 'bg-gradient-to-r from-slate-400 to-slate-600', text: 'بلاتيني' };
      case 'GOLD': return { color: 'bg-gradient-to-r from-amber-400 to-amber-600', text: 'ذهبي' };
      default: return { color: 'bg-gradient-to-r from-gray-300 to-gray-500', text: 'فضي' };
    }
  };

  // ========== RENDER ==========
  return (
    <div dir="rtl" className="h-screen bg-slate-900 text-white flex flex-col overflow-hidden">
      {/* ===== TOP: Orders Navigation Bar ===== */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => scrollOrders('right')}
            className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <div 
            ref={ordersNavRef}
            className="flex-1 flex gap-2 overflow-x-auto py-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {deliveryOrders.map(order => (
              <motion.button
                key={order.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => setActiveOrderTab(activeOrderTab === order.id ? null : order.id)}
                className={`flex-shrink-0 flex items-center gap-3 px-4 py-2 rounded-lg border transition-all ${
                  activeOrderTab === order.id 
                    ? 'bg-blue-600 border-blue-500' 
                    : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${getOrderTimerColor(order.createdAt)} animate-pulse`} />
                <span className="font-medium">{order.orderNumber}</span>
                <span className="text-slate-300 text-sm">{order.customerName}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${getOrderTimerColor(order.createdAt)}`}>
                  {getOrderTimer(order.createdAt)}
                </span>
              </motion.button>
            ))}
            
            {deliveryOrders.length === 0 && (
              <div className="flex items-center gap-2 text-slate-400 px-4">
                <Package className="w-5 h-5" />
                <span>لا توجد طلبات توصيل نشطة</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => scrollOrders('left')}
            className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 px-4 border-r border-slate-600">
            <Clock className="w-5 h-5 text-slate-400" />
            <span className="text-lg font-bold">{deliveryOrders.length}</span>
            <span className="text-slate-400">طلبات نشطة</span>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* ===== RIGHT PANEL: Customer Info (Sticky) ===== */}
        <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col overflow-hidden flex-shrink-0">
          {/* Phone Search */}
          <div className="p-4 border-b border-slate-700">
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="tel"
                value={phoneSearch}
                onChange={(e) => handlePhoneSearch(e.target.value)}
                placeholder="ادخل رقم الجوال..."
                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 pr-11 pl-4 text-lg focus:outline-none focus:border-blue-500 transition-colors"
                dir="ltr"
              />
            </div>
          </div>

          {/* Customer Info or New Customer Form */}
          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence mode="wait">
              {selectedCustomer ? (
                <motion.div
                  key="customer-info"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Customer Header */}
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{selectedCustomer.name}</h3>
                          <p className="text-slate-400 text-sm" dir="ltr">{selectedCustomer.phone}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getLoyaltyBadge(selectedCustomer.loyaltyLevel).color}`}>
                        {getLoyaltyBadge(selectedCustomer.loyaltyLevel).text}
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-2 text-slate-300">
                      <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                      <p className="text-sm">{selectedCustomer.address}</p>
                    </div>
                  </div>

                  {/* Customer Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-blue-400">{selectedCustomer.totalOrders}</p>
                      <p className="text-xs text-slate-400">إجمالي الطلبات</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-emerald-400">{selectedCustomer.totalSpending}</p>
                      <p className="text-xs text-slate-400">إجمالي الإنفاق</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-xl font-bold">{selectedCustomer.satisfactionScore}</span>
                      </div>
                      <p className="text-xs text-slate-400">التقييم</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-purple-400">{selectedCustomer.orderFrequency}</p>
                      <p className="text-xs text-slate-400">طلبات/شهر</p>
                    </div>
                  </div>

                  {/* Favorite Item Quick Add */}
                  {customerFavoriteItem && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAddItem(customerFavoriteItem)}
                      className="w-full bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl p-4 flex items-center gap-3 hover:from-amber-500 hover:to-orange-500 transition-all"
                    >
                      <Heart className="w-6 h-6 fill-white" />
                      <div className="flex-1 text-right">
                        <p className="text-xs text-amber-200">المفضل لدى العميل</p>
                        <p className="font-bold">{customerFavoriteItem.nameAr}</p>
                      </div>
                      <span className="text-lg font-bold">{customerFavoriteItem.price} ر.س</span>
                    </motion.button>
                  )}

                  {/* Open Complaint Warning */}
                  {customerComplaint && (
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="bg-red-900/50 border border-red-700 rounded-xl p-4"
                    >
                      <div className="flex items-center gap-2 text-red-400 mb-2">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-bold">شكوى مفتوحة!</span>
                      </div>
                      <p className="text-sm text-red-300 mb-2">{customerComplaint.description}</p>
                      <p className="text-xs text-red-400">الحل المقترح: {customerComplaint.proposedSolution}</p>
                    </motion.div>
                  )}

                  {/* Complaint Button */}
                  <button
                    onClick={() => setShowComplaintBox(true)}
                    className="w-full bg-slate-700 hover:bg-slate-600 rounded-lg py-3 flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>تسجيل شكوى جديدة</span>
                  </button>
                </motion.div>
              ) : showNewCustomerForm ? (
                <motion.div
                  key="new-customer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 text-amber-400 mb-4">
                    <UserPlus className="w-6 h-6" />
                    <span className="font-bold text-lg">عميل جديد</span>
                  </div>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="اسم العميل"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="tel"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="رقم الجوال"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500"
                      dir="ltr"
                    />
                    <select
                      value={newCustomer.area}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, area: e.target.value }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">اختر المنطقة...</option>
                      {DELIVERY_ZONES.map(zone => (
                        <option key={zone.id} value={zone.name}>{zone.name}</option>
                      ))}
                    </select>
                    <textarea
                      value={newCustomer.address}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="العنوان بالتفصيل"
                      rows={3}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                  
                  <button
                    onClick={handleAddNewCustomer}
                    disabled={!newCustomer.name || !newCustomer.phone || !newCustomer.address}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg py-3 font-bold transition-colors"
                  >
                    إضافة العميل
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-slate-500"
                >
                  <Phone className="w-16 h-16 mb-4" />
                  <p className="text-lg">ادخل رقم الجوال للبحث</p>
                  <p className="text-sm">أو إضافة عميل جديد</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ===== CENTER: Menu Grid ===== */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Categories + Product ID Input */}
          <div className="bg-slate-800/50 border-b border-slate-700 p-3 flex-shrink-0">
            <div className="flex items-center gap-3 mb-3">
              {/* Quick Product ID Input */}
              <div className="flex items-center gap-2 bg-slate-700 rounded-lg px-3 py-2 flex-shrink-0">
                <Hash className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={productIdInput}
                  onChange={(e) => setProductIdInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleProductIdSubmit()}
                  placeholder="رقم المنتج"
                  className="bg-transparent w-24 focus:outline-none"
                  dir="ltr"
                />
                <button
                  onClick={handleProductIdSubmit}
                  className="bg-blue-600 hover:bg-blue-500 rounded px-2 py-1 text-sm transition-colors"
                >
                  إضافة
                </button>
              </div>
              
              {/* Categories Scroll */}
              <div className="flex-1 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <span className="ml-2">{cat.icon}</span>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Menu Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {filteredMenu.map(item => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleAddItem(item)}
                  className="bg-slate-800 hover:bg-slate-700 rounded-xl overflow-hidden transition-colors text-right group"
                >
                  <div className="aspect-square bg-slate-700 overflow-hidden relative">
                    <img 
                      src={item.image} 
                      alt={item.nameAr}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute top-2 left-2 bg-slate-900/80 rounded px-2 py-1 text-xs font-mono">
                      #{item.id}
                    </div>
                    {SWEETS_CATEGORIES.includes(item.category) && (
                      <div className="absolute top-2 right-2 bg-amber-600 rounded px-2 py-1 text-xs flex items-center gap-1">
                        <Scale className="w-3 h-3" />
                        <span>وزن</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-sm truncate">{item.nameAr}</p>
                    <p className="text-blue-400 font-bold">{item.price} ر.س{SWEETS_CATEGORIES.includes(item.category) ? '/كغ' : ''}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* ===== LEFT PANEL: Invoice (Sticky) ===== */}
        <div className="w-96 bg-slate-800 border-r border-slate-700 flex flex-col overflow-hidden flex-shrink-0">
          {/* Invoice Header */}
          <div className="p-4 border-b border-slate-700 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="w-6 h-6" />
                الفاتورة
              </h2>
              {currentCart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            {currentCart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <Package className="w-16 h-16 mb-4" />
                <p>السلة فارغة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentCart.map((item, index) => (
                  <motion.div
                    key={item.uniqueId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-slate-700/50 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium flex-1">{item.name}</p>
                      <button
                        onClick={() => removeFromCart(item.uniqueId)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQuantity(item.uniqueId, -1)}
                          className="w-8 h-8 bg-slate-600 hover:bg-slate-500 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.uniqueId, 1)}
                          className="w-8 h-8 bg-slate-600 hover:bg-slate-500 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="font-bold text-blue-400">{item.price * item.quantity} ر.س</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Invoice Footer */}
          <div className="border-t border-slate-700 p-4 space-y-3 flex-shrink-0">
            {/* Order Note */}
            <textarea
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              placeholder="ملاحظات على الطلب..."
              rows={2}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-blue-500 resize-none"
            />

            {/* Zone Selection */}
            <select
              value={selectedZone.id}
              onChange={(e) => {
                const zone = DELIVERY_ZONES.find(z => z.id === e.target.value);
                if (zone) setSelectedZone(zone);
              }}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 focus:outline-none focus:border-blue-500 text-sm"
            >
              {DELIVERY_ZONES.map(zone => (
                <option key={zone.id} value={zone.id}>{zone.name} - {zone.price} ر.س</option>
              ))}
            </select>

            {/* Driver Selection */}
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="">اختر السائق...</option>
              {SAMPLE_DRIVERS.filter(d => d.status === 'ACTIVE').map(driver => (
                <option key={driver.id} value={driver.id}>
                  {driver.name} ({driver.currentOrders} طلبات) - {driver.area}
                </option>
              ))}
            </select>

            {/* Payment Method */}
            <div className="flex gap-2">
              <button
                onClick={() => setPaymentMethod(PaymentMethod.CASH)}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm ${
                  paymentMethod === PaymentMethod.CASH
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Banknote className="w-4 h-4" />
                نقداً
              </button>
              <button
                onClick={() => setPaymentMethod(PaymentMethod.CREDIT_CARD)}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm ${
                  paymentMethod === PaymentMethod.CREDIT_CARD
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                بطاقة
              </button>
            </div>

            {/* Totals */}
            <div className="bg-slate-700/50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-slate-400 text-sm">
                <span>المجموع الفرعي</span>
                <span>{cartSubtotal} ر.س</span>
              </div>
              <div className="flex justify-between text-slate-400 text-sm">
                <span>التوصيل ({selectedZone.name})</span>
                <span>{deliveryFee} ر.س</span>
              </div>
              <div className="border-t border-slate-600 pt-2 flex items-center gap-2">
                <span className="text-slate-300 font-medium">الإجمالي</span>
                <input
                  type="number"
                  value={manualTotal}
                  onChange={(e) => setManualTotal(e.target.value)}
                  placeholder={(cartSubtotal + deliveryFee).toString()}
                  className="flex-1 bg-slate-600 border border-slate-500 rounded px-2 py-1 text-left focus:outline-none focus:border-blue-500 font-bold"
                  dir="ltr"
                />
                <span className="text-slate-300">ر.س</span>
              </div>
              {manualTotal && parseFloat(manualTotal) !== (cartSubtotal + deliveryFee) && (
                <div className="flex justify-between text-amber-400 text-sm">
                  <span>الخصم</span>
                  <span>{(cartSubtotal + deliveryFee) - parseFloat(manualTotal)} ر.س</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmitOrder}
              disabled={!selectedCustomer || currentCart.length === 0}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed rounded-xl py-4 font-bold text-lg flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-6 h-6" />
              تأكيد الطلب ({finalTotal.toFixed(0)} ر.س)
            </motion.button>
          </div>
        </div>
      </div>

      {/* ===== WEIGHT POPUP ===== */}
      <AnimatePresence>
        {weightItem && (
          <WeightPopup 
            item={weightItem} 
            onConfirm={handleWeightConfirm} 
            onClose={() => setWeightItem(null)} 
          />
        )}
      </AnimatePresence>

      {/* ===== COMPLAINT MODAL ===== */}
      <AnimatePresence>
        {showComplaintBox && selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowComplaintBox(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg"
              dir="rtl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  تسجيل شكوى - {selectedCustomer.name}
                </h3>
                <button
                  onClick={() => setShowComplaintBox(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">نوع المشكلة</label>
                  <select
                    value={complaintForm.issueType}
                    onChange={(e) => setComplaintForm(prev => ({ ...prev, issueType: e.target.value as CallCenterComplaint['issueType'] }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500"
                  >
                    <option value="DELAY">تأخير</option>
                    <option value="COLD_FOOD">طعام بارد</option>
                    <option value="WRONG_ITEM">طلب خاطئ</option>
                    <option value="MISSING_ITEM">صنف ناقص</option>
                    <option value="QUALITY">جودة الطعام</option>
                    <option value="DRIVER">مشكلة مع السائق</option>
                    <option value="OTHER">أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">مستوى الغضب (1-5)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(level => (
                      <button
                        key={level}
                        onClick={() => setComplaintForm(prev => ({ ...prev, angerLevel: level }))}
                        className={`flex-1 py-3 rounded-lg font-bold transition-colors ${
                          complaintForm.angerLevel === level
                            ? level <= 2 ? 'bg-emerald-600' : level <= 3 ? 'bg-amber-600' : 'bg-red-600'
                            : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">وصف المشكلة</label>
                  <textarea
                    value={complaintForm.description}
                    onChange={(e) => setComplaintForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="اكتب تفاصيل الشكوى..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">الحل المقترح</label>
                  <textarea
                    value={complaintForm.proposedSolution}
                    onChange={(e) => setComplaintForm(prev => ({ ...prev, proposedSolution: e.target.value }))}
                    rows={2}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="مثال: خصم 20% على الطلب القادم..."
                  />
                </div>

                <button
                  onClick={handleSubmitComplaint}
                  disabled={!complaintForm.description}
                  className="w-full bg-red-600 hover:bg-red-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg py-3 font-bold transition-colors"
                >
                  تسجيل الشكوى
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CallCenterPOS;
