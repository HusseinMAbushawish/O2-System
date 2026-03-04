import React from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Customer, DeliveryEmployee } from '../types';
import { getCustomerRecommendation, assessCustomerRisk, isTripOverdue } from '../utils/callCenterUtils';

interface SmartInsightsProps {
  customers: Customer[];
  drivers: DeliveryEmployee[];
}

export const SmartInsights: React.FC<SmartInsightsProps> = ({ customers, drivers }) => {
  const inactiveCustomers = customers.filter(c => {
    const daysInactive = Math.floor((Date.now() - (c.lastOrderDate?.getTime() || 0)) / (1000 * 60 * 60 * 24));
    return daysInactive > 30;
  });

  const highValueCustomers = customers.filter(c => c.totalSpending > 3000);
  
  const lowPerformingDrivers = drivers.filter(d => 
    (d.lateDeliveryCount / d.totalTrips) > 0.2 || d.complaintCount > 5
  );

  const insights = [];

  if (inactiveCustomers.length > 0) {
    insights.push({
      type: 'warning',
      icon: <Clock size={20} />,
      title: 'عملاء خاملون',
      description: `${inactiveCustomers.length} عميل لم يطلبوا منذ أكثر من شهر`,
      action: 'تواصل معهم برسائل ترويجية'
    });
  }

  if (highValueCustomers.length > 0) {
    const avgValue = highValueCustomers.reduce((sum, c) => sum + c.totalSpending, 0) / highValueCustomers.length;
    insights.push({
      type: 'success',
      icon: <TrendingUp size={20} />,
      title: 'عملاء قيمين',
      description: `لديك ${highValueCustomers.length} عملاء بقيمة عالية (متوسط: ${avgValue.toFixed(0)} د.أ)`,
      action: 'ركز على رضاهم وقدم خدمة متميزة'
    });
  }

  if (lowPerformingDrivers.length > 0) {
    insights.push({
      type: 'alert',
      icon: <AlertTriangle size={20} />,
      title: 'سائقون بأداء منخفض',
      description: `${lowPerformingDrivers.length} سائقين لديهم معدل تأخير عالي`,
      action: 'قيم أدائهم وقدم تدريباً إضافياً'
    });
  }

  if (customers.length === 0) {
    insights.push({
      type: 'info',
      icon: <Lightbulb size={20} />,
      title: 'ابدأ الآن',
      description: 'لا توجد بيانات عملاء بعد. أضف عملائك الأولين لبدء التحليل',
      action: 'أضف عميل جديد'
    });
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-black text-white mb-4">الرؤى الذكية</h3>
      {insights.map((insight, idx) => (
        <InsightCard key={idx} insight={insight} />
      ))}
    </div>
  );
};

interface InsightCardProps {
  insight: {
    type: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    action: string;
  };
}

const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const bgColor = insight.type === 'success' ? 'bg-green-600/10 border-green-600/20' : 
                  insight.type === 'warning' ? 'bg-yellow-600/10 border-yellow-600/20' :
                  insight.type === 'alert' ? 'bg-red-600/10 border-red-600/20' :
                  'bg-blue-600/10 border-blue-600/20';

  const iconColor = insight.type === 'success' ? 'text-green-500' :
                   insight.type === 'warning' ? 'text-yellow-500' :
                   insight.type === 'alert' ? 'text-red-500' :
                   'text-blue-500';

  return (
    <div className={`p-4 rounded-xl border ${bgColor} flex gap-3`}>
      <div className={`${iconColor} flex-shrink-0`}>
        {insight.icon}
      </div>
      <div className="flex-1 text-sm">
        <p className="text-white font-black">{insight.title}</p>
        <p className="text-slate-400 text-[12px] mt-1">{insight.description}</p>
        <p className="text-[11px] text-slate-300 mt-2 italic">{insight.action}</p>
      </div>
    </div>
  );
};

interface CustomerInsightProps {
  customer: Customer;
}

export const CustomerInsightWidget: React.FC<CustomerInsightProps> = ({ customer }) => {
  const recommendation = getCustomerRecommendation(customer);
  const risk = assessCustomerRisk(customer);

  const riskColor = risk === 'HIGH' ? 'red' : risk === 'MEDIUM' ? 'yellow' : 'green';
  const riskLabel = risk === 'HIGH' ? 'خطر عالي' : risk === 'MEDIUM' ? 'خطر متوسط' : 'خطر منخفض';

  return (
    <div className="bg-slate-900 p-4 rounded-xl border border-white/5">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 bg-${riskColor}-600/20 rounded-lg flex items-center justify-center text-${riskColor}-500 flex-shrink-0`}>
          <Lightbulb size={18} />
        </div>
        <div className="flex-1">
          <p className="text-white font-black text-sm">{recommendation}</p>
          <p className={`text-[12px] mt-2 text-${riskColor}-400 font-bold`}>تقييم المخاطر: {riskLabel}</p>
        </div>
      </div>
    </div>
  );
};
