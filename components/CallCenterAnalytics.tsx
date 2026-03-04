import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Customer, DeliveryEmployee } from '../types';
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface CustomerAnalyticsProps {
  customer: Customer;
}

export const CustomerAnalyticsCard: React.FC<CustomerAnalyticsProps> = ({ customer }) => {
  // Mock data for 6-month order frequency
  const monthlyData = [
    { month: 'يناير', orders: Math.floor(customer.orderFrequency * 0.8) },
    { month: 'فبراير', orders: Math.floor(customer.orderFrequency * 0.9) },
    { month: 'مارس', orders: Math.floor(customer.orderFrequency * 1.1) },
    { month: 'أبريل', orders: Math.floor(customer.orderFrequency * 1.2) },
    { month: 'مايو', orders: Math.floor(customer.orderFrequency * 0.95) },
    { month: 'يونيو', orders: Math.floor(customer.orderFrequency * 1.3) }
  ];

  // Mock category data
  const categoryData = [
    { name: 'مشاوي', value: 35 },
    { name: 'معكرونة', value: 25 },
    { name: 'وجبات سريعة', value: 20 },
    { name: 'حلويات', value: 15 },
    { name: 'مشروبات', value: 5 }
  ];

  const COLORS = ['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2'];

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-white/5 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={20} className="text-red-500" />
          <h3 className="text-xl font-black text-white">تحليل الطلبات (6 أشهر)</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData} dir="rtl">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }} />
            <Bar dataKey="orders" fill="#dc2626" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <PieChartIcon size={20} className="text-blue-500" />
          <h3 className="text-xl font-black text-white">أكثر الفئات المطلوبة</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface DeliveryAnalyticsProps {
  drivers: DeliveryEmployee[];
}

export const DeliveryAnalyticsCard: React.FC<DeliveryAnalyticsProps> = ({ drivers }) => {
  const driverPerformanceData = drivers.map(driver => ({
    name: driver.name.split(' ')[0],
    deliveries: driver.totalDeliveries,
    rating: driver.performanceRating * 20, // Convert to percentage
    onTime: 100 - (driver.lateDeliveryCount / driver.totalTrips) * 100
  }));

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-white/5 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={20} className="text-green-500" />
          <h3 className="text-xl font-black text-white">أداء السائقين</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={driverPerformanceData} dir="rtl">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }} />
            <Legend wrapperStyle={{ color: '#cbd5e1' }} />
            <Bar dataKey="deliveries" fill="#0891b2" name="التوصيلات" radius={[8, 8, 0, 0]} />
            <Bar dataKey="rating" fill="#16a34a" name="التقييم %" radius={[8, 8, 0, 0]} />
            <Bar dataKey="onTime" fill="#ca8a04" name="التوصيل في الوقت %" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface RevenueAnalyticsProps {
  totalRevenue: number;
  totalOrders: number;
  revenueByCategory?: { category: string; revenue: number }[];
}

export const RevenueAnalyticsCard: React.FC<RevenueAnalyticsProps> = ({ totalRevenue, totalOrders, revenueByCategory }) => {
  const data = revenueByCategory || [
    { category: 'مشاوي', revenue: totalRevenue * 0.35 },
    { category: 'معكرونة', revenue: totalRevenue * 0.25 },
    { category: 'وجبات سريعة', revenue: totalRevenue * 0.20 },
    { category: 'حلويات', revenue: totalRevenue * 0.15 },
    { category: 'مشروبات', revenue: totalRevenue * 0.05 }
  ];

  const COLORS = ['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2'];

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-white/5 space-y-6">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-red-600/10 p-4 rounded-lg border border-red-600/20">
          <p className="text-slate-400 text-sm font-bold">إجمالي الإيرادات</p>
          <p className="text-2xl font-black text-red-500 mt-1">{totalRevenue.toLocaleString()} د.أ</p>
        </div>
        <div className="bg-blue-600/10 p-4 rounded-lg border border-blue-600/20">
          <p className="text-slate-400 text-sm font-bold">متوسط الطلب</p>
          <p className="text-2xl font-black text-blue-500 mt-1">{(totalRevenue / totalOrders).toFixed(1)} د.أ</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-black text-white mb-4">توزيع الإيرادات حسب الفئة</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" labelLine={false} label={({ category, revenue }) => `${category}: ${(revenue / totalRevenue * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="revenue">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value.toFixed(0)} د.أ`} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
