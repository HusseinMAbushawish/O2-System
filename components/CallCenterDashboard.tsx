import React, { useState } from 'react';
import { useApp } from '../store';
import { Search, Phone, Briefcase, BarChart3, TrendingUp, Clock, MapPin, Star, AlertCircle, CheckCircle2, Users, Truck } from 'lucide-react';
import { Customer, DeliveryTrip, DeliveryEmployee } from '../types';
import { CustomerAnalyticsCard, DeliveryAnalyticsCard, RevenueAnalyticsCard } from './CallCenterAnalytics';
import { SmartInsights, CustomerInsightWidget } from './SmartInsights';

interface CallCenterDashboardProps {
  initialTab?: 'dashboard' | 'search' | 'delivery' | 'analytics';
}

export const CallCenterDashboard: React.FC<CallCenterDashboardProps> = ({ initialTab = 'dashboard' }) => {
  const { customers, searchCustomerByPhone, deliveryTrips, deliveryEmployees, activeOrders, updateCustomer, addDeliveryTrip, updateDeliveryTrip } = useApp();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'search' | 'delivery' | 'analytics'>(initialTab);
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<DeliveryEmployee | null>(null);

  const handleSearch = () => {
    const customer = searchCustomerByPhone(searchPhone);
    if (customer) {
      setSelectedCustomer(customer);
    } else {
      alert('لم يتم العثور على عميل برقم الهاتف: ' + searchPhone);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 overflow-auto custom-scrollbar" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-l from-red-600/10 to-slate-900/50 px-8 py-6 rounded-3xl border border-red-600/20">
        <div>
          <h1 className="text-4xl font-black text-white">مركز الاتصالات</h1>
          <p className="text-slate-400 mt-2 font-bold">إدارة الطلبات والتوصيل والعملاء</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">عدد الطلبات النشطة</p>
          <p className="text-3xl font-black text-red-500">{activeOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELED').length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5">
        {['dashboard', 'search', 'delivery', 'analytics'].map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab as any); setSelectedCustomer(null); }}
            className={`px-6 py-3 font-bold text-sm transition-all ${
              activeTab === tab
                ? 'text-red-500 border-b-2 border-red-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab === 'dashboard' ? '📊 لوحة التحكم' : tab === 'search' ? '🔍 بحث العملاء' : tab === 'delivery' ? '🚚 إدارة التوصيل' : '📈 التحليلات'}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'dashboard' && <DashboardTab customers={customers} deliveryTrips={deliveryTrips} deliveryEmployees={deliveryEmployees} />}
      {activeTab === 'search' && <SearchTab searchPhone={searchPhone} setSearchPhone={setSearchPhone} handleSearch={handleSearch} selectedCustomer={selectedCustomer} updateCustomer={updateCustomer} />}
      {activeTab === 'delivery' && <DeliveryTab deliveryTrips={deliveryTrips} deliveryEmployees={deliveryEmployees} updateDeliveryTrip={updateDeliveryTrip} selectedDriver={selectedDriver} setSelectedDriver={setSelectedDriver} />}
      {activeTab === 'analytics' && <AnalyticsTab customers={customers} deliveryEmployees={deliveryEmployees} />}
    </div>
  );
};

// Dashboard Tab Component
const DashboardTab: React.FC<{ customers: Customer[]; deliveryTrips: DeliveryTrip[]; deliveryEmployees: DeliveryEmployee[] }> = ({ customers, deliveryTrips, deliveryEmployees }) => {
  const totalCustomers = customers.length;
  const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0);
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpending, 0);
  const activeTrips = deliveryTrips.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={<Users size={24} />} label="إجمالي العملاء" value={totalCustomers.toString()} color="blue" />
        <KPICard icon={<Briefcase size={24} />} label="إجمالي الطلبات" value={totalOrders.toString()} color="green" />
        <KPICard icon={<TrendingUp size={24} />} label="الإيرادات الكلية" value={`${totalRevenue.toLocaleString()} د.أ`} color="purple" />
        <KPICard icon={<Truck size={24} />} label="رحلات التوصيل النشطة" value={activeTrips.toString()} color="orange" />
      </div>

      {/* Smart Insights */}
      <SmartInsights customers={customers} drivers={deliveryEmployees} />
    </div>
  );
};

// Search Tab Component
const SearchTab: React.FC<{
  searchPhone: string;
  setSearchPhone: (phone: string) => void;
  handleSearch: () => void;
  selectedCustomer: Customer | null;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
}> = ({ searchPhone, setSearchPhone, handleSearch, selectedCustomer, updateCustomer }) => {
  const [notes, setNotes] = useState(selectedCustomer?.notes || '');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Search Section */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-slate-900 p-6 rounded-2xl border border-white/5">
          <h3 className="text-xl font-black text-white mb-4">البحث عن عميل</h3>
          <div className="flex gap-2 mb-4">
            <input
              type="tel"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              placeholder="رقم الهاتف"
              className="flex-1 px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-red-600"
              dir="rtl"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-red-600 text-white rounded-xl font-black hover:bg-red-700 transition-all"
            >
              <Search size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Customer Profile */}
      {selectedCustomer && (
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gradient-to-l from-red-600/20 to-slate-900 p-8 rounded-2xl border border-red-600/20">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-black text-white">{selectedCustomer.name}</h2>
                <p className="text-slate-400 mt-2">{selectedCustomer.phone}</p>
              </div>
              <div className="flex items-center gap-2 bg-red-600/20 px-4 py-2 rounded-full border border-red-600/30">
                <Star size={18} className="text-yellow-500" />
                <span className="font-black text-yellow-500">{selectedCustomer.loyaltyLevel}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-slate-400 font-bold">العنوان</p>
                <p className="text-white font-black">{selectedCustomer.address}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 font-bold">المنطقة</p>
                <p className="text-white font-black">{selectedCustomer.area}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 font-bold">عدد الطلبات</p>
                <p className="text-white font-black">{selectedCustomer.totalOrders}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 font-bold">إجمالي الإنفاق</p>
                <p className="text-white font-black">{selectedCustomer.totalSpending} د.أ</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-400 font-bold mb-2">الملاحظات</p>
              <textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  updateCustomer(selectedCustomer.id, { notes: e.target.value });
                }}
                className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-red-600"
                rows={4}
                dir="rtl"
              />
            </div>

            {/* Customer Insight */}
            <CustomerInsightWidget customer={selectedCustomer} />
          </div>
          
          {/* Analytics Charts */}
          <CustomerAnalyticsCard customer={selectedCustomer} />
        </div>
      )}
    </div>
  );
};

// Delivery Tab Component
const DeliveryTab: React.FC<{
  deliveryTrips: DeliveryTrip[];
  deliveryEmployees: DeliveryEmployee[];
  updateDeliveryTrip: (id: string, trip: Partial<DeliveryTrip>) => void;
  selectedDriver: DeliveryEmployee | null;
  setSelectedDriver: (driver: DeliveryEmployee | null) => void;
}> = ({ deliveryTrips, deliveryEmployees, updateDeliveryTrip, selectedDriver, setSelectedDriver }) => {
  const activeTrips = deliveryTrips.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Drivers List */}
      <div className="lg:col-span-1 space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
        <h3 className="font-black text-white text-lg mb-4">السائقون</h3>
        {deliveryEmployees.map(driver => (
          <button
            key={driver.id}
            onClick={() => setSelectedDriver(driver)}
            className={`w-full p-4 rounded-xl text-right transition-all ${
              selectedDriver?.id === driver.id
                ? 'bg-red-600 text-white'
                : 'bg-slate-900 text-slate-100 hover:bg-slate-800 border border-white/5'
            }`}
          >
            <p className="font-black">{driver.name}</p>
            <p className="text-[12px] opacity-70">{driver.phone}</p>
            <p className="text-[12px] opacity-70 mt-1">رحلات: {driver.totalTrips}</p>
          </button>
        ))}
      </div>

      {/* Trips List */}
      <div className="lg:col-span-3">
        <h3 className="font-black text-white text-lg mb-4">رحلات التوصيل النشطة</h3>
        <div className="space-y-3">
          {activeTrips.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Truck size={40} className="mx-auto mb-4 opacity-50" />
              <p>لا توجد رحلات نشطة</p>
            </div>
          ) : (
            activeTrips.map(trip => (
              <TripCard key={trip.id} trip={trip} updateDeliveryTrip={updateDeliveryTrip} deliveryEmployees={deliveryEmployees} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Trip Card Component
const TripCard: React.FC<{
  trip: DeliveryTrip;
  updateDeliveryTrip: (id: string, trip: Partial<DeliveryTrip>) => void;
  deliveryEmployees: DeliveryEmployee[];
}> = ({ trip, updateDeliveryTrip, deliveryEmployees }) => {
  const driver = deliveryEmployees.find(d => d.id === trip.driverId);
  const statusColor = trip.status === 'DELAYED' ? 'red' : trip.status === 'OUT_FOR_DELIVERY' ? 'blue' : 'green';

  return (
    <div className="bg-slate-900 p-4 rounded-xl border border-white/5 hover:border-red-600/30 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white font-black">رقم الرحلة: #{trip.id.slice(0, 8)}</p>
          <p className="text-slate-400 text-sm mt-1">{driver?.name}</p>
        </div>
        <select
          value={trip.status}
          onChange={(e) => updateDeliveryTrip(trip.id, { status: e.target.value as any })}
          className={`px-3 py-1 rounded-lg font-bold text-sm bg-${statusColor}-600/20 text-${statusColor}-400 border border-${statusColor}-600/30 focus:outline-none`}
        >
          <option value="PREPARING">قيد التحضير</option>
          <option value="OUT_FOR_DELIVERY">في الطريق</option>
          <option value="COMPLETED">مكتملة</option>
          <option value="DELAYED">متأخرة</option>
          <option value="CANCELLED">ملغاة</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-slate-400">المنطقة</p>
          <p className="text-white font-black">{trip.area}</p>
        </div>
        <div>
          <p className="text-slate-400">عدد الطلبات</p>
          <p className="text-white font-black">{trip.orderIds.length}</p>
        </div>
        <div>
          <p className="text-slate-400">القيمة الإجمالية</p>
          <p className="text-white font-black">{trip.totalValue} د.أ</p>
        </div>
        <div>
          <p className="text-slate-400">تكلفة النقل</p>
          <p className="text-white font-black">{trip.transportationCost} د.أ</p>
        </div>
      </div>
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab: React.FC<{ customers: Customer[]; deliveryEmployees: DeliveryEmployee[] }> = ({ customers, deliveryEmployees }) => {
  const topCustomers = [...customers].sort((a, b) => b.totalSpending - a.totalSpending).slice(0, 5);
  const topDrivers = [...deliveryEmployees].sort((a, b) => b.totalDeliveries - a.totalDeliveries).slice(0, 5);
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpending, 0);
  const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0);

  return (
    <div className="space-y-6">
      {/* Revenue Analytics */}
      <RevenueAnalyticsCard totalRevenue={totalRevenue} totalOrders={totalOrders} />

      {/* Driver Performance */}
      <DeliveryAnalyticsCard drivers={topDrivers} />

      {/* Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-white/5">
          <h3 className="text-xl font-black text-white mb-4">أفضل العملاء</h3>
          <div className="space-y-3">
            {topCustomers.map((customer, idx) => (
              <div key={customer.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center text-red-500 font-black">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-white font-black text-sm">{customer.name}</p>
                    <p className="text-slate-400 text-[12px]">{customer.totalOrders} طلب</p>
                  </div>
                </div>
                <p className="text-white font-black">{customer.totalSpending} د.أ</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Drivers */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-white/5">
          <h3 className="text-xl font-black text-white mb-4">أفضل السائقين</h3>
          <div className="space-y-3">
            {topDrivers.map((driver, idx) => (
              <div key={driver.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center text-blue-500 font-black">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-white font-black text-sm">{driver.name}</p>
                    <p className="text-slate-400 text-[12px]">{driver.totalDeliveries} توصيلة</p>
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

// KPI Card Component
const KPICard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({ icon, label, value, color }) => {
  const bgColor = color === 'blue' ? 'bg-blue-600/10' : color === 'green' ? 'bg-green-600/10' : color === 'purple' ? 'bg-purple-600/10' : 'bg-orange-600/10';
  const borderColor = color === 'blue' ? 'border-blue-600/20' : color === 'green' ? 'border-green-600/20' : color === 'purple' ? 'border-purple-600/20' : 'border-orange-600/20';
  const iconColor = color === 'blue' ? 'text-blue-500' : color === 'green' ? 'text-green-500' : color === 'purple' ? 'text-purple-500' : 'text-orange-500';

  return (
    <div className={`${bgColor} p-6 rounded-2xl border ${borderColor}`}>
      <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center mb-4 ${iconColor}`}>
        {icon}
      </div>
      <p className="text-slate-400 font-bold text-sm mb-1">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
};
