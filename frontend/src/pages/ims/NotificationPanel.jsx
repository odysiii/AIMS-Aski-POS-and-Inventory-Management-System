import React from 'react';
import { AlertTriangle, Clock, CheckCircle2, Info, X } from 'lucide-react';

const mockNotifications = [
  {
    id: 1,
    title: 'Low Stocks Alert',
    message: '5 items are below safety threshold.',
    time: '10 mins ago',
    type: 'warning',  
    icon: AlertTriangle,
  },
  {
    id: 2,
    title: 'Expiry Warning',
    message: 'Category 1 - Product 1 expires in 10 days.',
    time: '1 hour ago',
    type: 'danger',
    icon: Clock,
  },
  {
    id: 3,
    title: 'Transaction Completed',
    message: 'PHP 4,005.00 received (ID: 200870027)',
    time: '2 hours ago',
    type: 'success',
    icon: CheckCircle2,
  },
];

export default function NotificationPanel({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay to close dropdown on click outside */}
      <div 
        className="fixed inset-0 z-40 bg-transparent" 
        onClick={onClose} 
      />

      {/* contAiner */}
      <div className="absolute right-0 top-14 z-50 w-80 sm:w-96 rounded-3xl bg-white border border-white/80 p-5 shadow-2xl shadow-blue-900/20 transition-all duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-800 text-base">Notifications</h3>
            <span className="px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-600 text-xs font-bold">
              3 New
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* notif List */}
        <div className="mt-3 space-y-2.5 max-h-[320px] overflow-y-auto pr-1 navy-scrollbar">
          {mockNotifications.map((notif) => {
            const Icon = notif.icon;
            
            const badgeStyles = {
              warning: 'bg-amber-500/15 text-amber-700 border-amber-300/50',
              danger: 'bg-rose-500/15 text-rose-700 border-rose-300/50',
              success: 'bg-emerald-500/15 text-emerald-700 border-emerald-300/50',
            }[notif.type];

            return (
              <div 
                key={notif.id} 
                className="flex items-start gap-3 p-3 rounded-2xl bg-white/50 border border-white/60 hover:bg-white/80 transition cursor-pointer"
              >
                <div className={`p-2 rounded-xl border ${badgeStyles} shrink-0 mt-0.5`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-800 truncate">{notif.title}</p>
                    <span className="text-[10px] text-slate-400 font-medium">{notif.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-slate-200/60 text-center">
          <button className="text-xs font-bold text-blue-600 hover:text-blue-800 transition">
            Mark all as read
          </button>
        </div>
      </div>
    </>
  );
}