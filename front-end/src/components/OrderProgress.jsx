import React, { useEffect, useState } from 'react';
import * as Lucide from 'lucide-react';

export default function OrderProgress({ order }) {
  const [percent, setPercent] = useState(0);

  // Status mapping to indices
  const getStatusIndex = (status) => {
    const statuses = ['pending', 'accepted', 'preparing', 'ready', 'out-for-delivery', 'delivered'];
    return statuses.indexOf(status);
  };

  const currentIndex = getStatusIndex(order.status);

  // Animate map motorcycle position based on status
  useEffect(() => {
    if (order.status === 'pending' || order.status === 'accepted') {
      setPercent(5);
    } else if (order.status === 'preparing' || order.status === 'ready') {
      setPercent(25);
    } else if (order.status === 'out-for-delivery') {
      // Animate from 25 to 80 slowly
      let current = 25;
      const interval = setInterval(() => {
        if (current < 85) {
          current += 1;
          setPercent(current);
        } else {
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    } else if (order.status === 'delivered') {
      setPercent(100);
    }
  }, [order.status]);

  const steps = [
    { label: 'Placed', desc: 'Order received', icon: Lucide.Receipt },
    { label: 'Accepted', desc: 'Restaurant confirmed', icon: Lucide.CheckSquare },
    { label: 'Preparing', desc: 'Cooking', icon: Lucide.CookingPot },
    { label: 'Ready', desc: 'Awaiting Pickup', icon: Lucide.Package },
    { label: 'On the Way', desc: 'Out for Delivery', icon: Lucide.Bike },
    { label: 'Delivered', desc: 'Enjoy your food!', icon: Lucide.CheckCircle2 }
  ];

  return (
    <div className="space-y-6">
      {/* Real-time progress timeline */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentIndex;
            const isActive = idx === currentIndex;
            const isFuture = idx > currentIndex;

            return (
              <div key={step.label} className="flex-1 flex items-start md:items-center space-x-3 md:space-x-0 md:flex-col text-left md:text-center relative">
                {/* Visual Circle */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 z-10 ${
                    isCompleted
                      ? 'bg-brand-50 border-brand-500 text-brand-600 shadow-sm shadow-brand-500/10'
                      : isActive
                      ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/25 animate-pulse'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <Icon size={18} />
                </div>

                {/* Text Details */}
                <div className="md:mt-3">
                  <p className={`text-xs font-bold transition-colors ${isActive ? 'text-brand-500' : isCompleted ? 'text-[#1A1A1A]' : 'text-slate-500'}`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5 line-clamp-1">
                    {step.desc}
                  </p>
                </div>

                {/* Connecting lines for desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[calc(50%+20px)] right-[calc(-50%+20px)] h-0.5 bg-slate-200 -z-0">
                    <div
                      className="h-full bg-brand-500 transition-all duration-500"
                      style={{
                        width: idx < currentIndex ? '100%' : idx === currentIndex ? '50%' : '0%'
                      }}
                    ></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SVG Map Path Simulation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <h4 className="font-bold text-sm text-[#1A1A1A] mb-4 flex items-center space-x-2">
          <Lucide.MapPin size={16} className="text-brand-500" />
          <span>Live Courier Tracking Map</span>
        </h4>

        {/* Map Canvas */}
        <div className="relative h-60 w-full bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-inner">
          {/* Subtle grid backdrop */}
          <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]"></div>

          <svg className="w-full h-full" viewBox="0 0 500 240">
            {/* Delivery Route Path */}
            <path
              id="delivery-path"
              d="M 60 170 Q 150 50, 240 120 T 440 70"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Glowing route trail */}
            <path
              d="M 60 170 Q 150 50, 240 120 T 440 70"
              fill="none"
              stroke="#f97316"
              strokeWidth="3"
              strokeDasharray="8 6"
              strokeLinecap="round"
              className="opacity-40 animate-[dash_30s_linear_infinite]"
            />

            {/* Restaurant Marker */}
            <g transform="translate(60, 170)">
              <circle r="12" fill="#f8fafc" stroke="#f97316" strokeWidth="2" />
              <g transform="translate(-6, -6)">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="#f97316" transform="scale(0.5) translate(4, 4)"/>
              </g>
              <text y="24" textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold">Bella Italia</text>
            </g>

            {/* Customer Marker */}
            <g transform="translate(440, 70)">
              <circle r="12" fill="#f8fafc" stroke="#ef4444" strokeWidth="2" />
              <text y="24" textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold">My Location</text>
            </g>

            {/* Animated Motorcycle Courier */}
            <path
              id="rider-position"
              d="M 60 170 Q 150 50, 240 120 T 440 70"
              fill="none"
              stroke="transparent"
            />

            <g id="rider-g">
              <circle r="14" fill="#f97316" className="opacity-20 animate-ping" />
              <circle r="8" fill="#f97316" />
              {/* Courier icon */}
            </g>
          </svg>

          {/* Simple absolute positioned slider overlay for position updating in svg */}
          <RiderAnimator percent={percent} />
        </div>
      </div>

      {/* Driver info card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-brand-500 shadow-inner">
            <Lucide.UserCircle size={28} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Your Courier</p>
            <h5 className="font-bold text-sm text-[#1A1A1A]">Marco "Veloce" Rossi</h5>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5 flex items-center space-x-1">
              <Lucide.Bike size={12} className="text-brand-500" />
              <span>Electric Scooter • Plate #BS-909</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <a
            href="tel:+1234567890"
            className="p-3 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Lucide.Phone size={16} />
          </a>
          <button
            onClick={() => alert('Chat with rider feature simulated!')}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Lucide.MessageSquare size={14} className="text-brand-500" />
            <span>Message</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Custom sub-component to calculate SVG path positions for rider
function RiderAnimator({ percent }) {
  const [position, setPosition] = useState({ x: 60, y: 170 });

  useEffect(() => {
    const path = document.getElementById('delivery-path');
    if (path) {
      const pathLength = path.getTotalLength();
      const point = path.getPointAtLength((percent / 100) * pathLength);
      setPosition({ x: point.x, y: point.y });
    }
  }, [percent]);

  return (
    <div
      className="absolute w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 transition-all duration-500"
      style={{
        left: `${(position.x / 500) * 100}%`,
        top: `${(position.y / 240) * 100}%`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <Lucide.Bike size={14} className="animate-bounce" />
    </div>
  );
}
