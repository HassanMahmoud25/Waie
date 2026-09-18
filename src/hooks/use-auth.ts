"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

type StoredUser = { id: string; name: string; email: string; password: string };
type AuthState = { users: StoredUser[]; sessionUserId: string | null };

const STORAGE_KEY = "waie:auth:v1";
const emptyState: AuthState = { users: [], sessionUserId: null };

function readState(): AuthState {
  if (typeof window === "undefined") return emptyState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...emptyState, ...JSON.parse(raw) } : emptyState;
  } catch {
    return emptyState;
  }
}

// Module-level store (not per-hook-call state) so every component calling
// useAuth() in the same tab re-renders on login/logout/signup immediately --
// a plain useState here would only sync across *different* tabs (via the
// storage event) and leave same-tab consumers like the header and the
// episode notes list showing a stale, already-logged-out session.
let cachedState: AuthState | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): AuthState {
  if (!cachedState) cachedState = readState();
  return cachedState;
}

function getServerSnapshot(): AuthState {
  return emptyState;
}

function commitState(next: AuthState) {
  cachedState = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private browsing, storage full, etc. — the UI still works for this session.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    cachedState = readState();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export type AuthUser = { id: string; name: string; email: string };
export type AuthResult = { ok: true } | { ok: false; error: string };

/**
 * Local, per-device stand-in for a real account system — mirrors the shape
 * of hooks/use-library.ts. Accounts and sessions live only in this browser's
 * localStorage (no hashing, no server): good enough to demo the full
 * login/signup UI, not a real auth backend. Swap the internals for a real
 * session provider later without touching the components that call it.
 */
export function useAuth() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const user: AuthUser | null = (() => {
    const found = state.users.find((u) => u.id === state.sessionUserId);
    return found ? { id: found.id, name: found.name, email: found.email } : null;
  })();

  const signup = useCallback((name: string, email: string, password: string): AuthResult => {
    const normalized = normalizeEmail(email);
    const current = getSnapshot();
    if (current.users.some((u) => u.email === normalized)) {
      return { ok: false, error: "هذا البريد الإلكتروني مسجّل بالفعل، جرّب تسجيل الدخول." };
    }
    const newUser: StoredUser = { id: crypto.randomUUID(), name: name.trim(), email: normalized, password };
    commitState({ users: [...current.users, newUser], sessionUserId: newUser.id });
    return { ok: true };
  }, []);

  const login = useCallback((email: string, password: string): AuthResult => {
    const normalized = normalizeEmail(email);
    const current = getSnapshot();
    const match = current.users.find((u) => u.email === normalized);
    if (!match || match.password !== password) {
      return { ok: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." };
    }
    commitState({ ...current, sessionUserId: match.id });
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    commitState({ ...getSnapshot(), sessionUserId: null });
  }, []);

  const requestPasswordReset = useCallback((email: string): AuthResult => {
    const normalized = normalizeEmail(email);
    const current = getSnapshot();
    const exists = current.users.some((u) => u.email === normalized);
    if (!exists) {
      return { ok: false, error: "لا يوجد حساب مرتبط بهذا البريد الإلكتروني." };
    }
    return { ok: true };
  }, []);

  return { isHydrated, user, signup, login, logout, requestPasswordReset };
}
