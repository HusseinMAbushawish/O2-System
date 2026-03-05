import React, { useState, useCallback } from 'react';
import { useApp } from '../store';
import { 
  ShoppingCart, 
  ClipboardList, 
  Grid2X2, 
  Users, 
  PieChart, 
  Power,
  Clock,
  Building2,
  MonitorPlay,
  LayoutDashboard,
  LayoutGrid,
  ChevronRight,
  ChevronLeft,
  Receipt,
  HeartHandshake,
  MessageSquare,
  ListTodo,
  Activity,
  Plus,
  Utensils,
  ChefHat,
  PlayCircle,
  Phone,
  Truck,
  BarChart3,
  Search,
  X,
  ShoppingBag,
  UserCheck
} from 'lucide-react';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick: () => void;
  badge?: number;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, collapsed, onClick, badge }) => (
  <button
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative ${
      active 
        ? 'bg-red-600 text-white shadow-lg shadow-red-900/30' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
    } ${collapsed ? 'justify-center px-0' : ''}`}
  >
    <Icon size={20} />
    {!collapsed && <span className="font-semibold text-sm whitespace-nowrap overflow-hidden">{label}</span>}
    {badge !== undefined && badge > 0 && (
      <span className="absolute top-1 left-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-black">{badge}</span>
    )}
  </button>
);

// Tab type for multi-tab navigation
interface OpenTab {
  id: string;
  view: string;
  label: string;
  icon: React.ElementType;
  closable: boolean;
}

const CALL_CENTER_VIEWS: Record<string, { label: string; icon: React.ElementType }> = {
  call_center_pos: { label: 'نقطة البيع', icon: ShoppingCart },
  call_center_dashboard: { label: 'لوحة التحكم', icon: LayoutDashboard },
  call_center_search: { label: 'بحث العملاء', icon: Phone },
  call_center_delivery: { label: 'ادارة التوصيل', icon: Truck },
  call_center_analytics: { label: 'تحليل الاداء', icon: BarChart3 },
  call_center_drivers: { label: 'ادارة السائقين', icon: UserCheck },
  call_center_loyalty: { label: 'قائمة الولاء', icon: Users },
  call_center_live: { label: 'المراقبة الحية', icon: MonitorPlay },
};

export const AppLayout: React.FC<{ 
  children: React.ReactNode; 
  activeView: string; 
  setActiveView: (view: string) => void;
}> = ({ children, activeView, setActiveView }) => {
  const { currentUser, logout, currentShift, userRole, branches, customers, searchCustomerByPhone } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Multi-tab state for Call Center
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([
    { id: 'tab_pos', view: 'call_center_pos', label: 'نقطة البيع', icon: ShoppingCart, closable: false }
  ]);
  const [activeTabId, setActiveTabId] = useState('tab_pos');

  // Central search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const isAdmin = userRole === 'ADMIN';
  const isBranchManager = userRole === 'BRANCH_MANAGER';
  const isHospitality = userRole === 'HOSPITALITY';
  const isDeptStaff = userRole === 'DEPARTMENT_STAFF';
  const isAggregator = userRole === 'ORDER_AGGREGATOR';
  const isCallCenter = userRole === 'CALL_CENTER_OPERATOR';

  // Open a new tab or focus existing one
  const openTab = useCallback((view: string) => {
    const existingTab = openTabs.find(t => t.view === view);
    if (existingTab) {
      setActiveTabId(existingTab.id);
    } else {
      const viewInfo = CALL_CENTER_VIEWS[view] || { label: view, icon: ShoppingCart };
      const newTab: OpenTab = {
        id: 'tab_' + Math.random().toString(36).substr(2, 6),
        view,
        label: viewInfo.label,
        icon: viewInfo.icon,
        closable: true,
      };
      setOpenTabs(prev => [...prev, newTab]);
      setActiveTabId(newTab.id);
    }
    setActiveView(view);
  }, [openTabs, setActiveView]);

  const closeTab = useCallback((tabId: string) => {
    setOpenTabs(prev => {
      const filtered = prev.filter(t => t.id !== tabId);
      if (activeTabId === tabId && filtered.length > 0) {
        const last = filtered[filtered.length - 1];
        setActiveTabId(last.id);
        setActiveView(last.view);
      }
      return filtered;
    });
  }, [activeTabId, setActiveView]);

  const switchTab = useCallback((tab: OpenTab) => {
    setActiveTabId(tab.id);
    setActiveView(tab.view);
  }, [setActiveView]);

  // Central search handler
  const handleCentralSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.length >= 3) {
      const results = customers.filter(c => 
        c.phone.includes(query) || c.name.includes(query)
      ).slice(0, 8);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [customers]);

  const handleSelectSearchResult = useCallback((customer: any) => {
    setShowSearchResults(false);
    setSearchQuery('');
    // Open customer profile tab
    const viewInfo = CALL_CENTER_VIEWS['call_center_search'];
    const newTab: OpenTab = {
      id: 'tab_customer_' + customer.id,
      view: 'call_center_search',
      label: customer.name,
      icon: viewInfo.icon,
      closable: true,
    };
    const existing = openTabs.find(t => t.id === newTab.id);
    if (existing) {
      setActiveTabId(existing.id);
    } else {
      setOpenTabs(prev => [...prev, newTab]);
      setActiveTabId(newTab.id);
    }
    setActiveView('call_center_search');
  }, [openTabs, setActiveView]);

  // Call Center Layout with top tabs
  if (isCallCenter) {
    return (
      <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-100" dir="rtl">
        {/* Sidebar */}
        <aside className={`${isCollapsed ? 'w-16' : 'w-56'} bg-slate-900 border-l border-white/5 flex flex-col shadow-2xl transition-all duration-300 relative`}>
          <div className={`p-3 flex items-center gap-2 ${isCollapsed ? 'justify-center' : 'px-4'}`}>
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-red-900/20 shrink-0 text-sm">R</div>
            {!isCollapsed && <h1 className="text-base font-black text-white tracking-tight">RestoMaster</h1>}
          </div>

          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -left-3 top-14 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform z-50"
          >
            {isCollapsed ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
          </button>

          <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar px-2 mt-2">
            {!isCollapsed && <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-2 mb-2">الاساسي</p>}
            <SidebarItem icon={ShoppingCart} label="نقطة البيع" active={activeView === 'call_center_pos'} collapsed={isCollapsed} onClick={() => openTab('call_center_pos')} />
            <SidebarItem icon={LayoutDashboard} label="لوحة التحكم" active={activeView === 'call_center_dashboard'} collapsed={isCollapsed} onClick={() => openTab('call_center_dashboard')} />
            
            {!isCollapsed && <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-2 mt-4 mb-2">العملاء والطلبات</p>}
            <SidebarItem icon={Phone} label="بحث العملاء" active={activeView === 'call_center_search'} collapsed={isCollapsed} onClick={() => openTab('call_center_search')} />
            <SidebarItem icon={Users} label="قائمة الولاء" active={activeView === 'call_center_loyalty'} collapsed={isCollapsed} onClick={() => openTab('call_center_loyalty')} />
            
            {!isCollapsed && <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-2 mt-4 mb-2">التوصيل والسائقين</p>}
            <SidebarItem icon={Truck} label="ادارة التوصيل" active={activeView === 'call_center_delivery'} collapsed={isCollapsed} onClick={() => openTab('call_center_delivery')} />
            <SidebarItem icon={UserCheck} label="ادارة السائقين" active={activeView === 'call_center_drivers'} collapsed={isCollapsed} onClick={() => openTab('call_center_drivers')} />
            <SidebarItem icon={MonitorPlay} label="المراقبة الحية" active={activeView === 'call_center_live'} collapsed={isCollapsed} onClick={() => openTab('call_center_live')} />
            
            {!isCollapsed && <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-2 mt-4 mb-2">التقارير</p>}
            <SidebarItem icon={BarChart3} label="تحليل الاداء" active={activeView === 'call_center_analytics'} collapsed={isCollapsed} onClick={() => openTab('call_center_analytics')} />
          </nav>

          <div className="border-t border-white/5 p-3 space-y-1">
            {!isCollapsed && (
              <div className="px-2 py-1">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">مركز الاتصالات</p>
                <p className="text-xs font-black text-slate-100 truncate">{currentUser?.name}</p>
              </div>
            )}
            <button 
              onClick={logout}
              title={isCollapsed ? "تسجيل الخروج" : undefined}
              className={`w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-sm ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Power size={16} />
              {!isCollapsed && <span className="font-semibold text-xs">تسجيل الخروج</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navigation Bar with Tabs + Central Search */}
          <div className="flex-shrink-0 bg-slate-900/80 border-b border-white/5">
            {/* Central Search Bar */}
            <div className="flex items-center gap-3 px-4 py-2 border-b border-white/[0.03]">
              <div className="relative flex-1 max-w-lg">
                <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={e => handleCentralSearch(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  placeholder="بحث عن عميل بالرقم او الاسم..."
                  className="w-full pr-9 pl-4 py-2 bg-slate-800 border border-white/5 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-red-600/50 transition-all" 
                />
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full mt-1 right-0 left-0 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                    {searchResults.map(c => (
                      <button key={c.id} onMouseDown={() => handleSelectSearchResult(c)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-slate-800 transition-colors border-b border-white/[0.03] last:border-b-0">
                        <div className="w-8 h-8 bg-red-600/15 rounded-lg flex items-center justify-center text-red-500 flex-shrink-0">
                          <Phone size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-white truncate">{c.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{c.phone}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${c.loyaltyLevel === 'PLATINUM' ? 'bg-purple-600/20 text-purple-400' : c.loyaltyLevel === 'GOLD' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'}`}>
                            {c.loyaltyLevel}
                          </span>
                          <span className="text-[10px] text-slate-500">{c.totalOrders} طلب</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 rounded-lg">
                  <ShoppingBag size={13} className="text-red-500" />
                  <span className="text-slate-400 font-bold">{customers.length}</span>
                  <span className="text-slate-600 text-[10px]">عميل</span>
                </div>
              </div>
            </div>

            {/* Open Tabs */}
            <div className="flex items-center gap-0 px-2 overflow-x-auto custom-scrollbar">
              {openTabs.map(tab => {
                const TabIcon = tab.icon;
                const isActive = activeTabId === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => switchTab(tab)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex-shrink-0 group ${
                      isActive 
                        ? 'text-red-500 border-red-600 bg-red-600/5' 
                        : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/30'
                    }`}
                  >
                    <TabIcon size={13} />
                    <span>{tab.label}</span>
                    {tab.closable && (
                      <span 
                        onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                        className="w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600/20 transition-all"
                      >
                        <X size={10} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <main className="flex-1 h-full overflow-hidden">
            <div className="h-full p-4">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Default layout for other roles
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-100" dir="rtl">
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-slate-900 border-l border-white/5 flex flex-col p-4 shadow-2xl transition-all duration-300 relative`}>
        <div className={`mb-8 flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'px-4'}`}>
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-red-900/20 shrink-0">R</div>
          {!isCollapsed && <h1 className="text-xl font-black text-white tracking-tight">RestoMaster</h1>}
        </div>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -left-3 top-20 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform z-50"
        >
          {isCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        <nav className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar">
          {isAdmin ? (
            <SidebarItem 
              icon={Building2} label="الهيكل التنظيمي" 
              active={activeView === 'org'} collapsed={isCollapsed} onClick={() => setActiveView('org')} 
            />
          ) : isBranchManager ? (
            <>
              <SidebarItem icon={LayoutDashboard} label="لوحة التحكم" active={activeView === 'branch_dashboard'} collapsed={isCollapsed} onClick={() => setActiveView('branch_dashboard')} />
              <SidebarItem icon={MonitorPlay} label="المراقبة الحية" active={activeView === 'branch_live'} collapsed={isCollapsed} onClick={() => setActiveView('branch_live')} />
              <SidebarItem icon={ShoppingCart} label="طلبات الفرع" active={activeView === 'branch_orders'} collapsed={isCollapsed} onClick={() => setActiveView('branch_orders')} />
            </>
          ) : isHospitality ? (
            <>
              <SidebarItem icon={Grid2X2} label="ادارة الطاولات" active={activeView === 'hospitality_tables'} collapsed={isCollapsed} onClick={() => setActiveView('hospitality_tables')} />
              <SidebarItem icon={Plus} label="انشاء طلب" active={activeView === 'hospitality_pos'} collapsed={isCollapsed} onClick={() => setActiveView('hospitality_pos')} />
              <SidebarItem icon={Activity} label="طلبات جديدة" active={activeView === 'hospitality_new_orders'} collapsed={isCollapsed} onClick={() => setActiveView('hospitality_new_orders')} />
              <SidebarItem icon={Utensils} label="تتبع الطلبات" active={activeView === 'hospitality_tracking'} collapsed={isCollapsed} onClick={() => setActiveView('hospitality_tracking')} />
              <SidebarItem icon={MessageSquare} label="الشكاوي والملاحظات" active={activeView === 'hospitality_feedback'} collapsed={isCollapsed} onClick={() => setActiveView('hospitality_feedback')} />
              <SidebarItem icon={ListTodo} label="المهام والجداول" active={activeView === 'hospitality_tasks'} collapsed={isCollapsed} onClick={() => setActiveView('hospitality_tasks')} />
              <SidebarItem icon={ChefHat} label="شاشة الاقسام" active={activeView === 'dept_orders'} collapsed={isCollapsed} onClick={() => setActiveView('dept_orders')} />
            </>
          ) : isDeptStaff ? (
            <>
              <SidebarItem icon={LayoutDashboard} label="لوحة التحكم" active={activeView === 'dept_dashboard'} collapsed={isCollapsed} onClick={() => setActiveView('dept_dashboard')} />
              <SidebarItem icon={PlayCircle} label="الطلبات النشطة" active={activeView === 'dept_orders'} collapsed={isCollapsed} onClick={() => setActiveView('dept_orders')} />
            </>
          ) : isAggregator ? (
            <>
              <SidebarItem icon={Grid2X2} label="لوحة التجميع" active={activeView === 'aggregator_dashboard'} collapsed={isCollapsed} onClick={() => setActiveView('aggregator_dashboard')} />
              <SidebarItem icon={LayoutGrid} label="شبكة الرفوف" active={activeView === 'aggregator_shelves'} collapsed={isCollapsed} onClick={() => setActiveView('aggregator_shelves')} />
            </>
          ) : (
            <>
              <SidebarItem icon={ShoppingCart} label="نقطة البيع (POS)" active={activeView === 'pos'} collapsed={isCollapsed} onClick={() => setActiveView('pos')} />
              <SidebarItem icon={ClipboardList} label="الطلبات النشطة" active={activeView === 'orders'} collapsed={isCollapsed} onClick={() => setActiveView('orders')} />
              <SidebarItem icon={Grid2X2} label="ادارة الطاولات" active={activeView === 'tables'} collapsed={isCollapsed} onClick={() => setActiveView('tables')} />
              <SidebarItem icon={Receipt} label="التقارير المالية" active={activeView === 'finance'} collapsed={isCollapsed} onClick={() => setActiveView('finance')} />
              <SidebarItem icon={PieChart} label="التقارير" active={activeView === 'reports'} collapsed={isCollapsed} onClick={() => setActiveView('reports')} />
              <SidebarItem icon={Clock} label="ادارة الشفت" active={activeView === 'shift'} collapsed={isCollapsed} onClick={() => setActiveView('shift')} />
            </>
          )}
        </nav>

        <div className="mt-auto border-t border-white/5 pt-4 space-y-2">
          {isHospitality && !isCollapsed && (
            <div className="px-4 mb-4 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-red-900/10 rotate-3">
                  <HeartHandshake size={12} />
                </div>
                <h2 className="text-sm font-black text-white tracking-tight">قسم الضيافة</h2>
              </div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">ادارة الخدمة والزبائن</p>
            </div>
          )}
          {!isCollapsed && (
            <div className="px-4 py-2">
              {!isHospitality && (
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">
                  {isAdmin ? 'الادارة العامة' : isBranchManager ? `مدير: ${branches.find(b => b.id === currentUser?.branchId)?.name}` : isDeptStaff ? 'موظف قسم' : isAggregator ? 'مجمع طلبات' : 'الكاشير'}
                </p>
              )}
              <p className="text-sm font-black text-slate-100 truncate">{currentUser?.name}</p>
            </div>
          )}
          <button 
            onClick={logout}
            title={isCollapsed ? "تسجيل الخروج" : undefined}
            className={`w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors ${isCollapsed ? 'justify-center px-0' : ''}`}
          >
            <Power size={20} />
            {!isCollapsed && <span className="font-semibold text-sm">تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 h-full overflow-hidden">
        <div className="h-full p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
