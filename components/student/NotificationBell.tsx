import React, { useState, useRef, useEffect } from 'react';
import { Notification } from '../../types';
import { IconBell, IconCheckCircle } from '../icons';

interface NotificationBellProps {
    notifications: Notification[];
    onMarkAsRead: (notificationId: string) => void;
    onMarkAllAsRead: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, onMarkAsRead, onMarkAllAsRead }) => {
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const timeSince = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return "Just now";
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white rounded-full"
                aria-label="View notifications"
            >
                <IconBell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 block h-3 w-3 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-red-500 ring-2 ring-gray-800"></span>
                )}
            </button>

            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in" role="menu">
                    <div className="flex justify-between items-center p-3 border-b border-gray-200">
                        <h3 className="text-md font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                             <button onClick={onMarkAllAsRead} className="text-xs text-blue-600 hover:underline">Mark all as read</button>
                        )}
                    </div>
                    <ul className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                        {notifications.length > 0 ? (
                             [...notifications].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(notification => (
                                <li
                                    key={notification.id}
                                    onClick={() => onMarkAsRead(notification.id)}
                                    className={`p-3 hover:bg-gray-100 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                                >
                                    <div className="flex items-start gap-3">
                                        {!notification.read && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></span>}
                                        <div className={`flex-1 ${notification.read ? 'ml-5' : ''}`}>
                                            <p className="text-sm font-semibold text-gray-800">{notification.title}</p>
                                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                            <p className="text-xs text-gray-400 mt-2">{timeSince(notification.timestamp)}</p>
                                        </div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="p-4 text-center text-sm text-gray-500">
                                <IconCheckCircle className="w-8 h-8 mx-auto text-gray-300 mb-2"/>
                                You're all caught up!
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
