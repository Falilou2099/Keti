"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";

const mockNotifications = [
  { id: 1, text: "Garantie Darty expire dans 7 jours" },
  { id: 2, text: "Nouveau ticket Fnac ajouté" },
  { id: 3, text: "Carte AMEX reconnue" },
];

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const count = mockNotifications.length;
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
        <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-lg border z-50">
          <div className="p-3 border-b font-semibold">Notifications</div>

          <ul className="max-h-64 overflow-auto">
            {mockNotifications.map((n) => (
              <li
                key={n.id}
                className="px-4 py-3 text-sm hover:bg-secondary cursor-pointer"
              >
                {n.text}
              </li>
            ))}
          </ul>

          <div className="p-2 text-center text-xs text-muted-foreground cursor-pointer">
            Tout marquer comme lu
          </div>
        </div>
      )}
    </div>
  );
}
