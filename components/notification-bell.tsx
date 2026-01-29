"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";

interface Notification {
  id: number;
  text: string;
  created_at?: string;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  // Récupérer les notifications depuis l'API (pour l'instant vide)
  useEffect(() => {
    // TODO: Implémenter une vraie API de notifications
    // Pour l'instant, on laisse vide
    setNotifications([]);
  }, []);

  const count = notifications.length;
  const displayCount = count > 99 ? "99+" : count;

  // Fermer quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary"
      >
        <Bell className="w-5 h-5" />

        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none">
            {displayCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg border z-50">
          <div className="p-3 border-b font-semibold">Notifications</div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Aucune notification</p>
            </div>
          ) : (
            <>
              <ul className="max-h-64 overflow-auto">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className="px-4 py-3 text-sm hover:bg-secondary cursor-pointer border-b last:border-b-0"
                  >
                    {n.text}
                  </li>
                ))}
              </ul>
              <div className="p-2 text-center text-xs text-muted-foreground cursor-pointer hover:bg-secondary">
                Tout marquer comme lu
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
