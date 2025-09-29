"use client";

import { useEffect } from "react";

export default function VerificationGate() {
  useEffect(() => {
    (async () => {
      try {
        const [authRes, meRes] = await Promise.all([
          fetch("/api/auth/type", { credentials: "same-origin" }),
          fetch("/api/me", { credentials: "same-origin" }),
        ]);
        if (!authRes.ok || !meRes.ok) return;
        const authData = await authRes.json();
        const user = await meRes.json();
        if (authData?.requires_verification && user && !user.is_verified) {
          const protocol = window.location.protocol;
          const host = window.location.host;
          window.location.href = `${protocol}//${host}/auth/waiting-on-verification`;
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  return null;
} 