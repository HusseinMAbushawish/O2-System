import React, { useState, useMemo } from 'react';
import { useApp } from '../store';
import { 
  Search, Phone, Briefcase, BarChart3, TrendingUp, Clock, MapPin, Star, AlertCircle, 
  CheckCircle2, Users, Truck, Calendar, CalendarDays, Award, Timer, Eye, Activity,
  UserCheck, Zap, ArrowUp, ArrowDown, Filter
} from 'lucide-react';
import { Customer, DeliveryTrip, DeliveryEmployee } from '../types';
import { CustomerAnalyticsCard, DeliveryAnalyticsCard, RevenueAnalyticsCard } from './CallCenterAnalytics';
import { SmartInsights, CustomerInsightWidget } from './SmartInsights';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

interface CallCenterDashboardProps {
  initialTab?: 'dashboard' | 'search' | 'delivery' | 'analytics' | 'drivers' | 'loyalty' | 'live';
}

export const CallCenterDashboard: React.FC<CallCenterDashboardProps> = ({ initialTab = 'dashboard' }) => {
  const { 
    customers, searchCustomerByPhone, deliveryTrips, deliveryEmployees, activeOrders, 
    updateCustomer, addDeliveryTrip, updateDeliveryTrip, updateDeliveryEmployee 
  } = useApp();

  // Route to correct tab content based on prop
  switch (initialTab) {
    case 'dashboard': return <DashboardTab customers={customers} deliveryTrips={deliveryTrips} deliveryEmployees={deliveryEmployees} />;
    case 'search': return <SearchTab customers={customers} searchCustomerByPhone={searchCustomerByPhone} updateCustomer={updateCustomer} />;
    case 'delivery': return <DeliveryTab deliveryTrips={deliveryTrips} deliveryEmployees={deliveryEmployees} updateDeliveryTrip={updateDeliveryTrip} />;
    case 'analytics': return <AnalyticsTab customers={customers} deliveryEmployees={deliveryEmployees} />;
    case 'drivers': return <DriverManagementTab deliveryEmployees={deliveryEmployees} deliveryTrips={deliveryTrips} updateDeliveryEmployee={updateDeliveryEmployee} />;
    case 'loyalty': return <LoyaltyTab customers={customers} />;
    case 'live': return <LiveOperationsTab deliveryTrips={deliveryTrips} deliveryEmployees={deliveryEmployees} activeOrders={activeOrders} />;
    default: return <DashboardTab customers={customers} deliveryTrips={deliveryTrips} deliveryEmployees={deliveryEmployees} />;
  }
};

// ═══════════════════════════════════════
// ═══  DASHBOARD TAB                 ═══
// ═══════════════════════════════════════
const DashboardTab: React.FC<{ customers: Customer[]; deliveryTrips: DeliveryTrip[]; deliveryEmployees: DeliveryEmployee[] }> = ({ customers, deliveryTrips, deliveryEmployees }) => {
  const totalCustomers = customers.length;
  const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0);
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpending, 0);
  const activeTrips = deliveryTrips.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length;

  return (
    <div className="h-full overflow-auto custom-scrollbar space-y-4" dir="rtl">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <KPICard icon={<Users size={20} />} label="اجمالي العملاء" value={totalCustomers.toString()} color="blue" />
        <KPICard icon={<Briefcase size={20} />} label="اجمالي الطلبات" value={totalOrders.toString()} color="green" />
        <KPICard icon={<TrendingUp size={20} />} label="الايرادات الكلية" value={`${totalRevenue.toLocaleString()} شيكل`} color="red" />
        <KPICard icon={<Truck size={20} />} label="رحلات نشطة" value={activeTrips.toString()} color="orange" />
      </div>

      <SmartInsights customers={customers} drivers={deliveryEmployees} />
    </div>
  );
};

// ═══════════════════════════════════════
// ═══  SEARCH TAB                    ═══
// ═══════════════════════════════════════
const SearchTab: React.FC<{
  customers: Customer[];
  searchCustomerByPhone: (phone: string) => Customer | undefined;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
}> = ({ customers, searchCustomerByPhone, updateCustomer }) => {
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState('');

  const handleSearch = () => {
    const customer = searchCustomerByPhone(searchPhone);
    if (customer) {
      setSelectedCustomer(customer);
      setNotes(customer.notes || '');
    } else {
      alert('لم يتم العثور على عميل برقم الهاتف: ' + searchPhone);
    }
  };

  return (
    <div className="h-full overflow-auto custom-scrollbar" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900 p-5 rounded-2xl border border-white/5">
            <h3 className="text-lg font-black text-white mb-4">{'البحث عن عميل'}</h3>
            <div className="flex gap-2 mb-4">
              <input type="tel" value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="رقم الهاتف" className="flex-1 px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-red-600" dir="rtl" />
              <button onClick={handleSearch} className="px-6 py-3 bg-red-600 text-white rounded-xl font-black hover:bg-red-700 transition-all">
                <Search size={20} />
              </button>
            </div>
          </div>
        </div>

        {selectedCustomer && (
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gradient-to-l from-red-600/10 to-slate-900 p-6 rounded-2xl border border-red-600/20">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-black text-white">{selectedCustomer.name}</h2>
                  <p className="text-slate-400 mt-1">{selectedCustomer.phone}</p>
                </div>
                <div className="flex items-center gap-2 bg-red-600/20 px-3 py-1.5 rounded-full border border-red-600/30">
                  <Star size={16} className="text-yellow-500" />
                  <span className="font-black text-yellow-500 text-sm">{selectedCustomer.loyaltyLevel}</span>
                </div>
              </div>

              {/* Key metrics without financials in quick view */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-slate-800/50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-500 font-bold">{'الاكثر طلبا'}</p>
                  <p className="text-sm font-black text-amber-400 mt-1">{selectedCustomer.favoriteItem || '---'}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-500 font-bold">{'عدد الطلبات'}</p>
                  <p className="text-sm font-black text-white mt-1">{selectedCustomer.totalOrders}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-500 font-bold">{'آخر طلب'}</p>
                  <p className="text-sm font-black text-white mt-1">
                    {selectedCustomer.lastOrderDate ? `${Math.round((Date.now() - selectedCustomer.lastOrderDate.getTime()) / (24 * 3600000))} يوم` : '---'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-400 font-bold mb-2">{'الملاحظات'}</p>
                <textarea value={notes} onChange={(e) => { setNotes(e.target.value); updateCustomer(selectedCustomer.id, { notes: e.target.value }); }}
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-red-600" rows={3} dir="rtl" />
              </div>

              <CustomerInsightWidget customer={selectedCustomer} />
            </div>
            
            <CustomerAnalyticsCard customer={selectedCustomer} />
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════
// ═══  DELIVERY TAB                  ═══
// ═══════════════════════════════════════
const DeliveryTab: React.FC<{
  deliveryTrips: DeliveryTrip[];
  deliveryEmployees: DeliveryEmployee[];
  updateDeliveryTrip: (id: string, trip: Partial<DeliveryTrip>) => void;
}> = ({ deliveryTrips, deliveryEmployees, updateDeliveryTrip }) => {
  const [selectedDriver, setSelectedDriver] = useState<DeliveryEmployee | null>(null);
  const activeTrips = deliveryTrips.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');

  return (
    <div className="h-full overflow-auto custom-scrollbar" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
          <h3 className="font-black text-white text-base mb-3">{'السائقون'}</h3>
          {deliveryEmployees.map(driver => (
            <button key={driver.id} onClick={() => setSelectedDriver(driver)}
              className={`w-full p-3 rounded-xl text-right transition-all ${
                selectedDriver?.id === driver.id ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-100 hover:bg-slate-800 border border-white/5'
              }`}>
              <p className="font-black text-sm">{driver.name}</p>
              <p className="text-[11px] opacity-70">{driver.phone}</p>
              <p className="text-[11px] opacity-70 mt-1">{'رحلات: '}{driver.totalTrips}</p>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          <h3 className="font-black text-white text-base mb-3">{'رحلات التوصيل النشطة'}</h3>
          <div className="space-y-3">
            {activeTrips.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Truck size={40} className="mx-auto mb-4 opacity-50" />
                <p>{'لا توجد رحلات نشطة'}</p>
              </div>
            ) : activeTrips.map(trip => (
              <TripCard key={trip.id} trip={trip} updateDeliveryTrip={updateDeliveryTrip} deliveryEmployees={deliveryEmployees} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════
// ═══  TRIP CARD                     ═══
// ═══════════════════════════════════════
const TripCard: React.FC<{
  trip: DeliveryTrip;
  updateDeliveryTrip: (id: string, trip: Partial<DeliveryTrip>) => void;
  deliveryEmployees: DeliveryEmployee[];
}> = ({ trip, updateDeliveryTrip, deliveryEmployees }) => {
  const driver = deliveryEmployees.find(d => d.id === trip.driverId);
  const elapsed = Math.round((Date.now() - trip.createdAt.getTime()) / 60000);
  const isLate = elapsed > 45;

  return (
    <div className={`bg-slate-900 p-4 rounded-xl border transition-all ${isLate ? 'border-red-600/40 bg-red-600/5' : 'border-white/5 hover:border-red-600/30'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white font-black">{'رقم الرحلة: #'}{trip.id.slice(0, 8)}</p>
          <p className="text-slate-400 text-sm mt-1">{driver?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {isLate && <span className="text-[10px] font-black text-red-400 animate-pulse">{'متأخر!'}</span>}
          <select value={trip.status} onChange={(e) => updateDeliveryTrip(trip.id, { status: e.target.value as any })}
            className="px-3 py-1 rounded-lg font-bold text-sm bg-slate-800 text-white border border-white/10 focus:outline-none">
            <option value="PREPARING">{'قيد التحضير'}</option>
            <option value="OUT_FOR_DELIVERY">{'في الطريق'}</option>
            <option value="COMPLETED">{'مكتملة'}</option>
            <option value="DELAYED">{'متأخرة'}</option>
            <option value="CANCELLED">{'ملغاة'}</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 text-sm">
        <div><p className="text-slate-400 text-xs">{'المنطقة'}</p><p className="text-white font-black">{trip.area}</p></div>
        <div><p className="text-slate-400 text-xs">{'الطلبات'}</p><p className="text-white font-black">{trip.orderIds.length}</p></div>
        <div><p className="text-slate-400 text-xs">{'القيمة'}</p><p className="text-white font-black">{trip.totalValue} {'شيكل'}</p></div>
        <div><p className="text-slate-400 text-xs">{'الزمن'}</p><p className={`font-black ${isLate ? 'text-red-400' : 'text-white'}`}>{elapsed} {'د'}</p></div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════
// ═══  DRIVER MANAGEMENT TAB         ═══
// ═══════════════════════════════════════
const DriverManagementTab: React.FC<{
  deliveryEmployees: DeliveryEmployee[];
  deliveryTrips: DeliveryTrip[];
  updateDeliveryEmployee: (id: string, employee: Partial<DeliveryEmployee>) => void;
}> = ({ deliveryEmployees, deliveryTrips, updateDeliveryEmployee }) => {
  const [selectedDriver, setSelectedDriver] = useState<DeliveryEmployee | null>(null);
  const [driverTab, setDriverTab] = useState<'performance' | 'schedule'>('performance');

  // Attendance mock data
  const daysOfWeek = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const today = new Date().getDay();

  return (
    <div className="h-full overflow-auto custom-scrollbar" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Driver List */}
        <div className="lg:col-span-1 space-y-2">
          <h3 className="font-black text-white text-base mb-3">{'السائقون'}</h3>
          {deliveryEmployees.map(driver => {
            const successRate = driver.totalDeliveries > 0 ? Math.round(((driver.totalDeliveries - driver.lateDeliveryCount) / driver.totalDeliveries) * 100) : 100;
            return (
              <button key={driver.id} onClick={() => setSelectedDriver(driver)}
                className={`w-full p-3 rounded-xl text-right transition-all ${
                  selectedDriver?.id === driver.id ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-100 hover:bg-slate-800 border border-white/5'
                }`}>
                <div className="flex items-center justify-between">
                  <p className="font-black text-sm">{driver.name}</p>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                    driver.status === 'ACTIVE' ? 'bg-emerald-600/20 text-emerald-400' : 
                    driver.status === 'ON_LEAVE' ? 'bg-amber-500/20 text-amber-400' : 
                    'bg-red-600/20 text-red-400'
                  }`}>
                    {driver.status === 'ACTIVE' ? 'نشط' : driver.status === 'ON_LEAVE' ? 'اجازة' : 'غير نشط'}
                  </span>
                </div>
                <p className="text-[11px] opacity-70 mt-1">{driver.totalDeliveries} {'توصيلة'} | {successRate}{'% نجاح'}</p>
              </button>
            );
          })}
        </div>

        {/* Driver Details */}
        <div className="lg:col-span-3">
          {selectedDriver ? (
            <div className="space-y-4">
              {/* Driver Header */}
              <div className="bg-gradient-to-l from-red-600/10 to-slate-900 p-5 rounded-2xl border border-red-600/20">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-black text-white">{selectedDriver.name}</h2>
                    <p className="text-slate-400 text-sm mt-1">{selectedDriver.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <Star size={14} className="text-amber-500" />
                      <span className="font-black text-amber-500 text-sm">{selectedDriver.performanceRating.toFixed(1)}</span>
                    </div>
                    <select value={selectedDriver.status}
                      onChange={e => updateDeliveryEmployee(selectedDriver.id, { status: e.target.value as any })}
                      className="px-3 py-1.5 bg-slate-800 border border-white/10 rounded-lg text-sm text-white font-bold focus:outline-none">
                      <option value="ACTIVE">{'نشط'}</option>
                      <option value="ON_LEAVE">{'اجازة'}</option>
                      <option value="INACTIVE">{'غير نشط'}</option>
                    </select>
                  </div>
                </div>

                {/* KPI Row */}
                <div className="grid grid-cols-5 gap-3">
                  <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-500">{'الرحلات'}</p>
                    <p className="text-lg font-black text-white">{selectedDriver.totalTrips}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-500">{'التوصيلات'}</p>
                    <p className="text-lg font-black text-white">{selectedDriver.totalDeliveries}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-500">{'المبالغ المحصلة'}</p>
                    <p className="text-lg font-black text-emerald-400">{selectedDriver.totalRevenue} {'شيكل'}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-500">{'متوسط/رحلة'}</p>
                    <p className="text-lg font-black text-white">{selectedDriver.averageOrdersPerTrip.toFixed(1)}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-500">{'شكاوي'}</p>
                    <p className={`text-lg font-black ${selectedDriver.complaintCount > 3 ? 'text-red-400' : 'text-white'}`}>{selectedDriver.complaintCount}</p>
                  </div>
                </div>
              </div>

              {/* Sub-tabs */}
              <div className="flex gap-2 border-b border-white/5 pb-1">
                <button onClick={() => setDriverTab('performance')}
                  className={`px-4 py-2 rounded-t-lg text-sm font-bold transition-all ${driverTab === 'performance' ? 'text-red-500 border-b-2 border-red-600' : 'text-slate-500 hover:text-slate-300'}`}>
                  {'لوحة الاداء'}
                </button>
                <button onClick={() => setDriverTab('schedule')}
                  className={`px-4 py-2 rounded-t-lg text-sm font-bold transition-all ${driverTab === 'schedule' ? 'text-red-500 border-b-2 border-red-600' : 'text-slate-500 hover:text-slate-300'}`}>
                  {'جدول الدوام'}
                </button>
              </div>

              {driverTab === 'performance' && (
                <DriverPerformanceChart driver={selectedDriver} />
              )}

              {driverTab === 'schedule' && (
                <div className="bg-slate-900 rounded-2xl p-5 border border-white/5">
                  <h3 className="text-base font-black text-white mb-4 flex items-center gap-2"><CalendarDays size={18} className="text-red-500" /> {'جدول الدوام الاسبوعي'}</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {daysOfWeek.map((day, idx) => {
                      const isToday = idx === today;
                      // Mock schedule: weekdays on, Friday off
                      const isWorkday = idx !== 5;
                      return (
                        <div key={day} className={`p-3 rounded-xl text-center border transition-all ${
                          isToday ? 'border-red-600/50 bg-red-600/10' :
                          isWorkday ? 'border-emerald-600/20 bg-emerald-600/5' : 
                          'border-amber-500/20 bg-amber-500/5'
                        }`}>
                          <p className={`text-xs font-black mb-1 ${isToday ? 'text-red-400' : 'text-slate-300'}`}>{day}</p>
                          <p className={`text-[10px] font-bold ${isWorkday ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {isWorkday ? 'دوام' : 'اجازة'}
                          </p>
                          {isWorkday && <p className="text-[9px] text-slate-600 mt-1">{'9:00 - 9:00'}</p>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Areas covered */}
                  <div className="mt-4">
                    <p className="text-xs font-black text-slate-500 mb-2">{'المناطق المغطاة'}</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDriver.areasCovered.map(area => (
                        <span key={area} className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-bold text-slate-300 border border-white/5">{area}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-700">
              <div className="text-center">
                <UserCheck size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-bold">{'اختر سائق لعرض التفاصيل'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════
// ═══  DRIVER PERFORMANCE CHART      ═══
// ═══════════════════════════════════════
const DriverPerformanceChart: React.FC<{ driver: DeliveryEmployee }> = ({ driver }) => {
  const monthlyData = [
    { month: 'يناير', deliveries: Math.floor(driver.totalDeliveries * 0.12), revenue: Math.floor(driver.totalRevenue * 0.11) },
    { month: 'فبراير', deliveries: Math.floor(driver.totalDeliveries * 0.14), revenue: Math.floor(driver.totalRevenue * 0.13) },
    { month: 'مارس', deliveries: Math.floor(driver.totalDeliveries * 0.16), revenue: Math.floor(driver.totalRevenue * 0.15) },
    { month: 'ابريل', deliveries: Math.floor(driver.totalDeliveries * 0.18), revenue: Math.floor(driver.totalRevenue * 0.18) },
    { month: 'مايو', deliveries: Math.floor(driver.totalDeliveries * 0.19), revenue: Math.floor(driver.totalRevenue * 0.20) },
    { month: 'يونيو', deliveries: Math.floor(driver.totalDeliveries * 0.21), revenue: Math.floor(driver.totalRevenue * 0.23) },
  ];

  const successRate = driver.totalDeliveries > 0 ? Math.round(((driver.totalDeliveries - driver.lateDeliveryCount) / driver.totalDeliveries) * 100) : 100;

  return (
    <div className="space-y-4">
      {/* Performance Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900 p-4 rounded-xl border border-white/5">
          <p className="text-xs text-slate-500 font-bold">{'معدل النجاح'}</p>
          <p className={`text-2xl font-black mt-1 ${successRate >= 90 ? 'text-emerald-400' : successRate >= 75 ? 'text-amber-400' : 'text-red-400'}`}>
            {successRate}{'%'}
          </p>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div className={`h-full rounded-full ${successRate >= 90 ? 'bg-emerald-500' : successRate >= 75 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${successRate}%` }} />
          </div>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-white/5">
          <p className="text-xs text-slate-500 font-bold">{'متوسط التوصيل'}</p>
          <p className="text-2xl font-black text-white mt-1">{driver.averageDeliveryTime} {'د'}</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-white/5">
          <p className="text-xs text-slate-500 font-bold">{'تأخيرات'}</p>
          <p className={`text-2xl font-black mt-1 ${driver.lateDeliveryCount > 10 ? 'text-red-400' : 'text-white'}`}>{driver.lateDeliveryCount}</p>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-white/5">
        <h3 className="text-base font-black text-white mb-4 flex items-center gap-2"><BarChart3 size={18} className="text-red-500" /> {'تحليل الاداء الشهري'}</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
            <YAxis stroke="#94a3b8" fontSize={11} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="deliveries" fill="#dc2626" name="التوصيلات" radius={[6, 6, 0, 0]} />
            <Bar dataKey="revenue" fill="#0891b2" name="الايرادات" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════
// ═══  LOYALTY TAB                   ═══
// ═══════════════════════════════════════
const LoyaltyTab: React.FC<{ customers: Customer[] }> = ({ customers }) => {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month'>('week');
  
  const sortedCustomers = useMemo(() => {
    const now = Date.now();
    const cutoff = timeFilter === 'week' ? 7 * 24 * 3600000 : 30 * 24 * 3600000;
    
    return [...customers]
      .filter(c => c.lastOrderDate && (now - c.lastOrderDate.getTime()) < cutoff)
      .sort((a, b) => b.totalOrders - a.totalOrders);
  }, [customers, timeFilter]);

  const allSorted = useMemo(() => [...customers].sort((a, b) => b.totalOrders - a.totalOrders), [customers]);

  return (
    <div className="h-full overflow-auto custom-scrollbar space-y-4" dir="rtl">
      {/* Header with filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-white flex items-center gap-2"><Award size={22} className="text-amber-500" /> {'قائمة الولاء'}</h2>
        <div className="flex bg-slate-900 rounded-lg border border-white/5 overflow-hidden">
          <button onClick={() => setTimeFilter('week')}
            className={`px-4 py-2 text-xs font-black transition-all ${timeFilter === 'week' ? 'bg-red-600 text-white' : 'text-slate-500 hover:text-white'}`}>
            {'هذا الاسبوع'}
          </button>
          <button onClick={() => setTimeFilter('month')}
            className={`px-4 py-2 text-xs font-black transition-all ${timeFilter === 'month' ? 'bg-red-600 text-white' : 'text-slate-500 hover:text-white'}`}>
            {'هذا الشهر'}
          </button>
        </div>
      </div>

      {/* Filtered Active Customers */}
      <div className="bg-slate-900 rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5">
          <p className="text-sm font-black text-white">{'الاكثر طلبا - '}{timeFilter === 'week' ? 'خلال الاسبوع' : 'خلال الشهر'} ({sortedCustomers.length})</p>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {sortedCustomers.length === 0 ? (
            <div className="text-center py-8 text-slate-600">
              <Users size={30} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs font-bold">{'لا يوجد عملاء نشطون في هذه الفترة'}</p>
            </div>
          ) : sortedCustomers.map((customer, idx) => (
            <div key={customer.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-800/30 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                idx === 0 ? 'bg-amber-500 text-black' : idx === 1 ? 'bg-slate-400 text-black' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white">{customer.name}</p>
                <p className="text-[11px] text-slate-500">{customer.phone}</p>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                customer.loyaltyLevel === 'PLATINUM' ? 'bg-purple-600/20 text-purple-400' : 
                customer.loyaltyLevel === 'GOLD' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'
              }`}>
                {customer.loyaltyLevel}
              </span>
              <div className="text-right">
                <p className="text-sm font-black text-white">{customer.totalOrders} {'طلب'}</p>
                <p className="text-[11px] text-slate-500">{customer.favoriteItem || '---'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All-time top customers */}
      <div className="bg-slate-900 rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5">
          <p className="text-sm font-black text-white">{'الاكثر طلبا - اجمالي'}</p>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {allSorted.slice(0, 10).map((customer, idx) => (
            <div key={customer.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-800/30 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                idx === 0 ? 'bg-amber-500 text-black' : idx === 1 ? 'bg-slate-400 text-black' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white">{customer.name}</p>
                <p className="text-[11px] text-slate-500">{customer.phone} | {customer.area}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-white">{customer.totalOrders} {'طلب'}</p>
                <p className="text-[11px] text-emerald-400">{customer.totalSpending} {'شيكل'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════
// ═══  LIVE OPERATIONS TAB           ═══
// ═══════════════════════════════════════
const LiveOperationsTab: React.FC<{
  deliveryTrips: DeliveryTrip[];
  deliveryEmployees: DeliveryEmployee[];
  activeOrders: any[];
}> = ({ deliveryTrips, deliveryEmployees, activeOrders }) => {
  const activeTrips = deliveryTrips.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
  const now = Date.now();

  return (
    <div className="h-full overflow-auto custom-scrollbar space-y-4" dir="rtl">
      {/* Live Header */}
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
        <h2 className="text-xl font-black text-white">{'المراقبة الحية'}</h2>
        <span className="text-xs text-slate-500 font-mono">{new Date().toLocaleTimeString('ar-AE')}</span>
      </div>

      {/* Active Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {activeTrips.length === 0 ? (
          <div className="col-span-3 text-center py-16 text-slate-700">
            <Activity size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-bold text-sm">{'لا توجد رحلات نشطة حاليا'}</p>
          </div>
        ) : activeTrips.map(trip => {
          const driver = deliveryEmployees.find(d => d.id === trip.driverId);
          const elapsed = Math.round((now - trip.createdAt.getTime()) / 60000);
          const dispatchElapsed = trip.dispatchedAt ? Math.round((now - trip.dispatchedAt.getTime()) / 60000) : null;
          const isLate = elapsed > 45;

          return (
            <div key={trip.id} className={`bg-slate-900 rounded-2xl p-4 border transition-all ${
              isLate ? 'border-red-600/50 bg-red-600/5 shadow-lg shadow-red-600/10' : 'border-white/5'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLate ? 'bg-red-600 animate-pulse' : 'bg-slate-800'}`}>
                    <Truck size={16} className={isLate ? 'text-white' : 'text-slate-400'} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{driver?.name || '---'}</p>
                    <p className="text-[10px] text-slate-500">{trip.area}</p>
                  </div>
                </div>
                <span className={`text-xs font-black px-2 py-1 rounded-lg ${
                  trip.status === 'OUT_FOR_DELIVERY' ? 'bg-blue-600/20 text-blue-400' :
                  trip.status === 'DELAYED' ? 'bg-red-600/20 text-red-400' :
                  trip.status === 'PREPARING' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {trip.status === 'OUT_FOR_DELIVERY' ? 'في الطريق' : trip.status === 'DELAYED' ? 'متأخر' : trip.status === 'PREPARING' ? 'قيد التحضير' : trip.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                  <p className="text-[9px] text-slate-500">{'الطلبات'}</p>
                  <p className="text-sm font-black text-white">{trip.orderIds.length}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                  <p className="text-[9px] text-slate-500">{'القيمة'}</p>
                  <p className="text-sm font-black text-white">{trip.totalValue}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                  <p className="text-[9px] text-slate-500">{'الزمن'}</p>
                  <p className={`text-sm font-black ${isLate ? 'text-red-400' : 'text-white'}`}>{dispatchElapsed !== null ? `${dispatchElapsed}د` : `${elapsed}د`}</p>
                </div>
              </div>

              {/* Time bar */}
              <div className="mt-3">
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${isLate ? 'bg-red-600' : elapsed > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, (elapsed / 60) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-[9px] text-slate-600">
                  <span>{'0 د'}</span>
                  <span>{'30 د'}</span>
                  <span>{'60 د'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Driver Status Grid */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-white/5">
        <h3 className="text-base font-black text-white mb-4">{'حالة السائقين'}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {deliveryEmployees.map(driver => {
            const activeTrip = activeTrips.find(t => t.driverId === driver.id);
            return (
              <div key={driver.id} className={`p-3 rounded-xl border text-center ${
                activeTrip ? 'border-blue-600/30 bg-blue-600/5' : 
                driver.status === 'ACTIVE' ? 'border-emerald-600/20 bg-emerald-600/5' :
                'border-slate-700 bg-slate-800/30'
              }`}>
                <p className="text-xs font-black text-white">{driver.name}</p>
                <p className={`text-[10px] mt-1 font-bold ${
                  activeTrip ? 'text-blue-400' : driver.status === 'ACTIVE' ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  {activeTrip ? `في الطريق - ${activeTrip.area}` : driver.status === 'ACTIVE' ? 'متاح' : 'غير متاح'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════
// ═══  ANALYTICS TAB                 ═══
// ═══════════════════════════════════════
const AnalyticsTab: React.FC<{ customers: Customer[]; deliveryEmployees: DeliveryEmployee[] }> = ({ customers, deliveryEmployees }) => {
  const topCustomers = [...customers].sort((a, b) => b.totalSpending - a.totalSpending).slice(0, 5);
  const topDrivers = [...deliveryEmployees].sort((a, b) => b.totalDeliveries - a.totalDeliveries).slice(0, 5);
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpending, 0);
  const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0);

  return (
    <div className="h-full overflow-auto custom-scrollbar space-y-4" dir="rtl">
      <RevenueAnalyticsCard totalRevenue={totalRevenue} totalOrders={totalOrders} />
      <DeliveryAnalyticsCard drivers={topDrivers} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-white/5">
          <h3 className="text-base font-black text-white mb-4">{'افضل العملاء'}</h3>
          <div className="space-y-2">
            {topCustomers.map((customer, idx) => (
              <div key={customer.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-600/20 rounded-full flex items-center justify-center text-red-500 font-black text-sm">{idx + 1}</div>
                  <div>
                    <p className="text-white font-black text-xs">{customer.name}</p>
                    <p className="text-slate-400 text-[11px]">{customer.totalOrders} {'طلب'}</p>
                  </div>
                </div>
                <p className="text-white font-black text-sm">{customer.totalSpending} {'شيكل'}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-white/5">
          <h3 className="text-base font-black text-white mb-4">{'افضل السائقين'}</h3>
          <div className="space-y-2">
            {topDrivers.map((driver, idx) => (
              <div key={driver.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center text-blue-500 font-black text-sm">{idx + 1}</div>
                  <div>
                    <p className="text-white font-black text-xs">{driver.name}</p>
                    <p className="text-slate-400 text-[11px]">{driver.totalDeliveries} {'توصيلة'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-500" />
                  <span className="text-white font-black text-sm">{driver.performanceRating.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════
// ═══  KPI CARD                      ═══
// ═══════════════════════════════════════
const KPICard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({ icon, label, value, color }) => {
  const bgColor = color === 'blue' ? 'bg-blue-600/10' : color === 'green' ? 'bg-emerald-600/10' : color === 'red' ? 'bg-red-600/10' : 'bg-orange-600/10';
  const borderColor = color === 'blue' ? 'border-blue-600/20' : color === 'green' ? 'border-emerald-600/20' : color === 'red' ? 'border-red-600/20' : 'border-orange-600/20';
  const iconColor = color === 'blue' ? 'text-blue-500' : color === 'green' ? 'text-emerald-500' : color === 'red' ? 'text-red-500' : 'text-orange-500';

  return (
    <div className={`${bgColor} p-4 rounded-2xl border ${borderColor}`}>
      <div className={`w-10 h-10 ${bgColor} rounded-xl flex items-center justify-center mb-3 ${iconColor}`}>
        {icon}
      </div>
      <p className="text-slate-400 font-bold text-xs mb-1">{label}</p>
      <p className="text-xl font-black text-white">{value}</p>
    </div>
  );
};
