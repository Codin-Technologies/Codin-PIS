'use client';

import {
  DollarSign, ShoppingBag, Users, TrendingUp,
  ArrowUpRight, ArrowDownRight, Activity, Calendar
} from 'lucide-react';
import clsx from 'clsx';

const STATS = [
  { label: 'Total Revenue', value: '$45,231.89', change: '+20.1%', trend: 'up', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Total Orders', value: '1,342', change: '+12%', trend: 'up', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Active Staff', value: '24', change: 'On Shift', trend: 'neutral', icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
  { label: 'Avg Order Value', value: '$34.50', change: '-2.3%', trend: 'down', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
];

const RECENT_ACTIVITY = [
  { id: 1, type: 'Order', desc: 'Table #12 placed an order', time: '2 mins ago', amount: '$124.00' },
  { id: 2, type: 'Stock', desc: 'Received delivery from Meat Co.', time: '15 mins ago', amount: '+45kg' },
  { id: 3, type: 'Staff', desc: 'Sarah clocked in', time: '1 hour ago', amount: '' },
  { id: 4, type: 'Alert', desc: 'Low stock: Tomatoes', time: '2 hours ago', amount: 'Critical' },
];

export default function DashboardPage() {
  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-6 overflow-y-auto pr-2 scrollbar-thin">

      {/* Header */}
      <div className="flex items-center justify-between rounded-2xl bg-[#1e1f21] p-8 text-white shadow-lg">
        <div>
          <h1 className="text-3xl font-bold">Good Evening, Admin</h1>
          <p className="text-gray-400 mt-1">Here's what's happening in your restaurant today.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 rounded-xl bg-white/10 px-4 py-2 backdrop-blur-md">
            <Calendar className="h-4 w-4 text-pink-400" />
            <span className="text-sm font-medium">Jan 19, 2026</span>
          </div>
          <button className="rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 px-6 py-2 text-sm font-bold shadow-lg hover:opacity-90 transition-opacity">
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, idx) => (
          <div key={idx} className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="flex justify-between items-start">
              <div className={clsx("h-12 w-12 rounded-xl flex items-center justify-center transition-colors", stat.bg)}>
                <stat.icon className={clsx("h-6 w-6", stat.color)} />
              </div>
              <span className={clsx("flex items-center text-xs font-bold rounded-full px-2 py-1",
                stat.trend === 'up' ? 'bg-green-100 text-green-700' :
                  stat.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700')}>
                {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : stat.trend === 'down' ? <ArrowDownRight className="h-3 w-3 mr-1" /> : null}
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Split Section: Analytics & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">

        {/* Main Chart Area (Mock) */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Revenue Analytics</h2>
            <select className="rounded-lg border-gray-200 text-sm font-medium text-gray-600 focus:border-[#2a2b2d] focus:ring-[#2a2b2d]">
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200 min-h-[300px]">
            <div className="text-center">
              <Activity className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 font-medium">Interactive Chart Component Placeholder</p>
            </div>
          </div>
        </div>

        {/* Live Feed */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Live Activity</h2>
          <div className="space-y-6">
            {RECENT_ACTIVITY.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-2 w-2 rounded-full bg-[#2a2b2d]"></div>
                  {i !== RECENT_ACTIVITY.length - 1 && <div className="w-0.5 flex-1 bg-gray-100 my-1"></div>}
                </div>
                <div className="pb-2">
                  <div className="flex items-center justify-between min-w-[240px]">
                    <p className="text-sm font-bold text-gray-900">{item.type}</p>
                    <span className="text-xs text-gray-400">{item.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{item.desc}</p>
                  {item.amount && <span className="inline-block mt-2 text-xs font-semibold bg-gray-100 px-2 py-1 rounded-md text-gray-700">{item.amount}</span>}
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}
