'use client';

import React from 'react';
import { CheckCircle2, Clock, Truck, Package, ExternalLink, Activity } from 'lucide-react';
import { Order, OrderStatus } from '@/types/ecommerce';

interface OrderTimelineProps {
  order: Order;
  isRealtime?: boolean;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ order, isRealtime = true }) => {
  const steps: { key: OrderStatus; title: string; desc: string; icon: React.ElementType }[] = [
    {
      key: 'pending',
      title: 'Order Placed',
      desc: 'Order received and awaiting store confirmation.',
      icon: Clock,
    },
    {
      key: 'processing',
      title: 'Accepted & Processing',
      desc: 'Items are being packed in our fulfillment center.',
      icon: Package,
    },
    {
      key: 'shipped',
      title: 'Dispatched & Shipped',
      desc: order.courierName
        ? `Handed to ${order.courierName} (${order.trackingNumber || 'Tracking assigned'})`
        : 'In transit with logistics carrier.',
      icon: Truck,
    },
    {
      key: 'delivered',
      title: 'Delivered',
      desc: 'Package successfully handed to recipient.',
      icon: CheckCircle2,
    },
  ];

  const getStepStatus = (stepKey: OrderStatus) => {
    const statusOrder: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(order.status);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (order.status === 'cancelled') return 'cancelled';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'upcoming';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm">
      {/* Top Realtime Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {order.trackingNumber ? 'Logistics Tracking Number' : 'Auto Generated Order ID'}
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
            {order.trackingNumber ? (
              <span className="flex items-center gap-2 flex-wrap">
                <span className="text-brand-600">{order.courierName || 'Courier'}:</span>
                <span>{order.trackingNumber}</span>
              </span>
            ) : (
              order.orderId || `#ORD-${order.id.substring(0, 10).toUpperCase()}`
            )}
          </h2>
          {order.trackingNumber && (
            <p className="text-xs text-slate-400 font-mono mt-1">
              Store Order ID: <span className="text-slate-700 dark:text-slate-300 font-bold">{order.orderId || order.id}</span>
            </p>
          )}
        </div>

        {isRealtime && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold w-max">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <Activity className="w-3.5 h-3.5" />
            <span>Live Firestore Sync</span>
          </div>
        )}
      </div>

      {/* Courier & Tracking Link Pill (if shipped) */}
      {order.status === 'shipped' && order.trackingNumber && (
        <div className="mb-8 p-4 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wider">
              Shipment Logistics Partner
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {order.courierName || 'Express Courier'} — AWB: <span className="font-mono">{order.trackingNumber}</span>
            </h4>
          </div>

          {order.trackingUrl && (
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
            >
              <span>Track on Courier Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Timeline Visual Steps */}
      <div className="relative pl-4 md:pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-10">
        {steps.map((step) => {
          const status = getStepStatus(step.key);
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative flex items-start gap-4 group">
              {/* Circle Marker */}
              <div
                className={`absolute -left-[25px] md:-left-[41px] top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  status === 'completed'
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                    : status === 'active'
                    ? 'bg-brand-600 border-brand-600 text-white shadow-glow ring-4 ring-brand-100 dark:ring-brand-900/50 scale-110'
                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Step Content */}
              <div className="pl-4">
                <div className="flex items-center gap-2">
                  <h4
                    className={`text-sm font-bold ${
                      status === 'active'
                        ? 'text-brand-600 dark:text-brand-400 text-base'
                        : status === 'completed'
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </h4>

                  {status === 'active' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-100 text-brand-800 uppercase">
                      Current Phase
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                  {step.desc}
                </p>

                {step.key === 'shipped' && order.trackingNumber && (
                  <p className="text-xs font-mono font-semibold text-brand-600 mt-1">
                    Tracking #: {order.trackingNumber}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
