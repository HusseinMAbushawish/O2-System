import { Customer, DeliveryEmployee, DeliveryTrip, Order } from '../types';

/**
 * Calculate customer loyalty level based on spending
 */
export const calculateLoyaltyLevel = (totalSpending: number): 'SILVER' | 'GOLD' | 'PLATINUM' => {
  if (totalSpending >= 5000) return 'PLATINUM';
  if (totalSpending >= 2500) return 'GOLD';
  return 'SILVER';
};

/**
 * Calculate average order value for a customer
 */
export const calculateAverageOrderValue = (customer: Customer): number => {
  return customer.totalOrders > 0 ? customer.totalSpending / customer.totalOrders : 0;
};

/**
 * Detect customer's favorite category based on order history
 */
export const detectFavoriteCategory = (customer: Customer): string => {
  // This would normally analyze actual orders, but we'll use the stored favorite
  return customer.favoriteCategory || 'عام';
};

/**
 * Calculate delivery time in minutes
 */
export const calculateDeliveryTime = (dispatchTime: Date, arrivalTime: Date): number => {
  return Math.round((arrivalTime.getTime() - dispatchTime.getTime()) / (1000 * 60));
};

/**
 * Calculate trip profitability
 */
export const calculateTripProfit = (trip: DeliveryTrip): number => {
  return trip.totalValue - trip.transportationCost;
};

/**
 * Calculate driver performance score (1-5)
 */
export const calculatePerformanceScore = (driver: DeliveryEmployee): number => {
  const onTimePercent = ((driver.totalTrips - driver.lateDeliveryCount) / driver.totalTrips) * 100;
  const complaintFactor = Math.max(0, 1 - (driver.complaintCount / driver.totalTrips) * 0.5);
  const deliveryFactor = Math.min(5, (driver.totalDeliveries / 50)); // Scale based on deliveries
  
  return (onTimePercent / 20) * complaintFactor * (deliveryFactor / 5) * 5;
};

/**
 * Get customer risk assessment based on behavior
 */
export const assessCustomerRisk = (customer: Customer): 'LOW' | 'MEDIUM' | 'HIGH' => {
  const frequencyScore = customer.orderFrequency > 0 ? 100 : 0;
  const loyaltyScore = customer.loyaltyLevel === 'PLATINUM' ? 100 : customer.loyaltyLevel === 'GOLD' ? 75 : 50;
  const spendingScore = customer.totalSpending > 2000 ? 100 : customer.totalSpending > 1000 ? 75 : 50;
  
  const averageScore = (frequencyScore + loyaltyScore + spendingScore) / 3;
  
  if (averageScore >= 80) return 'LOW';
  if (averageScore >= 60) return 'MEDIUM';
  return 'HIGH';
};

/**
 * Format currency in Arabic
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ar-AE', {
    style: 'currency',
    currency: 'AED'
  }).format(amount);
};

/**
 * Format date in Arabic
 */
export const formatDateAr = (date: Date): string => {
  return new Intl.DateTimeFormat('ar-AE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Get smart recommendation for customer
 */
export const getCustomerRecommendation = (customer: Customer): string => {
  const avgOrderValue = calculateAverageOrderValue(customer);
  const daysInactive = Math.floor((Date.now() - (customer.lastOrderDate?.getTime() || 0)) / (1000 * 60 * 60 * 24));
  
  if (daysInactive > 30) {
    return `عميل خامل منذ ${daysInactive} يوماً - قد يحتاج لعرض ترويجي`;
  }
  
  if (customer.totalOrders > 20 && customer.loyaltyLevel === 'PLATINUM') {
    return `عميل مشترك منتظم - قدم له عروضاً مميزة`;
  }
  
  if (customer.totalOrders > 10 && avgOrderValue > 50) {
    return `عميل قيمة - حاول زيادة متوسط الطلب`;
  }
  
  return `عميل عادي - شجعه على الطلب بشكل متكرر`;
};

/**
 * Generate trip summary
 */
export const generateTripSummary = (trip: DeliveryTrip, driver: DeliveryEmployee): string => {
  const profit = calculateTripProfit(trip);
  const status = trip.status === 'COMPLETED' ? 'مكتملة' : trip.status === 'DELAYED' ? 'متأخرة' : 'قيد الطريق';
  
  return `الرحلة #${trip.id.slice(0, 8)} - ${driver.name} - ${trip.orderIds.length} طلبات - ${status} - ربح: ${profit} د.أ`;
};

/**
 * Check if trip is overdue
 */
export const isTripOverdue = (trip: DeliveryTrip): boolean => {
  if (trip.status === 'COMPLETED' || trip.status === 'CANCELLED') return false;
  
  const createdTime = trip.createdAt.getTime();
  const currentTime = Date.now();
  const elapsedMinutes = (currentTime - createdTime) / (1000 * 60);
  
  // Assume delivery should take 45 minutes maximum
  return elapsedMinutes > 45;
};

/**
 * Calculate optimal delivery area assignment
 */
export const suggestBestDriver = (drivers: DeliveryEmployee[], targetArea: string): DeliveryEmployee | null => {
  const areaSpecialists = drivers.filter(d => 
    d.status === 'ACTIVE' && 
    d.areasCovered.includes(targetArea)
  ).sort((a, b) => 
    (b.totalTrips - b.lateDeliveryCount) - (a.totalTrips - a.lateDeliveryCount)
  );
  
  return areaSpecialists.length > 0 ? areaSpecialists[0] : null;
};
