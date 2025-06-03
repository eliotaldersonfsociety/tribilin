"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function generateBrowserId() {
  return 'browser_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getBrowserId() {
  const storageKey = 'browser_id';
  let browserId = localStorage.getItem(storageKey);
  
  if (!browserId) {
    browserId = generateBrowserId();
    localStorage.setItem(storageKey, browserId);
  }
  
  return browserId;
}

export function usePageView() {
  const pathname = usePathname();

  useEffect(() => {
    const browserId = getBrowserId();
    const tabId = Math.random().toString(36).substring(2);
    const sessionId = `${browserId}_${tabId}`;

    // Track page visit
    fetch("/api/visitas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pathname }),
    });

    // Track active user
    const trackActiveUser = () => {
      fetch("/api/active-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, pathname }),
      });
    };

    // Initial tracking
    trackActiveUser();

    // Set up interval to keep session alive
    const interval = setInterval(trackActiveUser, 30000);

    // Track on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        trackActiveUser();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Notify server when tab is closed
      fetch("/api/active-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, pathname, action: 'remove' }),
      });
    };
  }, [pathname]);
}