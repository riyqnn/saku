"use client";

import { useNotifications, Notification } from "@/hooks/useNotifications";
import { Loader2, Bell, ArrowRight, TrendingUp, Download, ArrowUpRight, ArrowDownLeft, Gift, X } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const NotificationIcon = ({ type }: { type: string }) => {
  const iconProps = {
    className: "w-5 h-5 text-white"
  };
  let bgClass = "bg-gray-400";

  switch (type) {
    case 'TRANSFER_IN':
      bgClass = "bg-green-500";
      return <div className={`p-2 rounded-full ${bgClass}`}><ArrowDownLeft {...iconProps} /></div>;
    case 'TRANSFER_OUT':
      bgClass = "bg-red-500";
      return <div className={`p-2 rounded-full ${bgClass}`}><ArrowUpRight {...iconProps} /></div>;
    case 'TOPUP_SUCCESS':
      bgClass = "bg-blue-500";
      return <div className={`p-2 rounded-full ${bgClass}`}><Download {...iconProps} /></div>;
    case 'WITHDRAW_SUCCESS':
      bgClass = "bg-orange-500";
      return <div className={`p-2 rounded-full ${bgClass}`}><ArrowUpRight {...iconProps} /></div>;
    case 'STAKE_SUCCESS':
    case 'UNSTAKE_SUCCESS':
      bgClass = "bg-indigo-500";
      return <div className={`p-2 rounded-full ${bgClass}`}><TrendingUp {...iconProps} /></div>;
    case 'CLAIM_SUCCESS':
       bgClass = "bg-yellow-500";
      return <div className={`p-2 rounded-full ${bgClass}`}><Gift {...iconProps} /></div>;
    default:
      return <div className={`p-2 rounded-full ${bgClass}`}><Bell {...iconProps} /></div>;
  }
};

const NotificationItem = ({ notification }: { notification: Notification }) => {
  const router = useRouter();

  const handleNotificationClick = () => {
    if (notification.metadata?.tx_hash) {
      const explorerUrl = `https://sepolia.basescan.org/tx/${notification.metadata.tx_hash}`;
      window.open(explorerUrl, '_blank');
    }
  };

  return (
    <div 
      onClick={handleNotificationClick}
      className={`flex items-start gap-4 p-4 border-b border-gray-100 transition-colors ${!notification.is_read ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-gray-50'} cursor-pointer`}
    >
      <NotificationIcon type={notification.type} />
      <div className="flex-1">
        <p className={`text-sm ${!notification.is_read ? 'font-bold text-gray-800' : 'font-medium text-gray-700'}`}>
          {notification.message}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>
      {!notification.is_read && (
        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full self-center"></div>
      )}
    </div>
  );
};

interface NotificationCardProps {
  onClose: () => void;
}

export default function NotificationCard({ onClose }: NotificationCardProps) {
  const { notifications, isLoading, error, fetchNotifications, markAllAsRead } = useNotifications();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markAllAsRead(); // Mark all as read when the card is opened
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div 
      ref={cardRef}
      className="absolute right-0 mt-3 w-80 max-h-[80dvh] bg-white/90 backdrop-blur-2xl border rounded-xl shadow-lg p-2 z-20 animate-in fade-in zoom-in-95 duration-150 origin-top-right flex flex-col"
    >
      <div className="flex items-center justify-between p-3 border-b border-gray-200/80 mb-1">
        <p className="text-base font-bold text-gray-800">Notifications</p>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center h-full p-8">
            <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
          </div>
        )}

        {!isLoading && error && (
           <div className="text-center p-8">
              <p className="text-gray-600">Error loading notifications.</p>
              <button onClick={fetchNotifications} className="mt-4 px-4 py-2 bg-primary text-black font-semibold rounded-lg">
                Try Again
              </button>
           </div>
        )}

        {!isLoading && !error && notifications.length === 0 && (
          <div className="text-center p-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Bell className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="mt-4 text-md font-bold text-gray-800">No Notifications Yet</h3>
            <p className="mt-1 text-xs text-gray-500">
              Important updates about your account will appear here.
            </p>
          </div>
        )}

        {!isLoading && !error && notifications.length > 0 && (
          <div>
            {notifications.map(notif => (
              <NotificationItem key={notif.id} notification={notif} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
