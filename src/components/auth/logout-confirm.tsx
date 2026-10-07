"use client";

import { unstable_rethrow } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition, type ReactNode, type RefObject } from "react";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

/**
 * The one place logout actually fires from the UI: every "تسجيل الخروج"
 * (site avatar menu, admin sidebar, admin top bar) opens this first, and only
 * Confirm calls logoutAction -- the same server action the old
 * `<form action={logoutAction}>` posted to, so cookie deletion and the
 * redirect to /login are unchanged. Cancel never touches the server.
 *
 * The caller owns `open` so the dialog can outlive its trigger (the site
 * header's dropdown unmounts the moment it closes).
 */
export function LogoutConfirmDialog({
  open,
  onClose,
  returnFocusRef,
}: {
  open: boolean;
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // useTransition's flag lands a render late; this blocks a fast double click.
  const submittingRef = useRef(false);

  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  const handleCancel = useCallback(() => {
    if (submittingRef.current) return;
    onClose();
  }, [onClose]);

  function handleConfirm() {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError(null);
    startTransition(async () => {
      try {
        await logoutAction();
      } catch (caught) {
        // The successful path ends in redirect("/login"), which reaches the
        // client as a rejected promise the router has to see -- hand it back.
        unstable_rethrow(caught);
        submittingRef.current = false;
        setError("تعذّر تسجيل الخروج الآن. تحقّق من اتصالك وحاول مرة أخرى.");
      }
    });
  }

  return (
    <ConfirmDialog
      open={open}
      title="هل أنت متأكد أنك تريد تسجيل الخروج؟"
      description="ستحتاج إلى تسجيل الدخول مرة أخرى للوصول إلى حسابك."
      icon={<LogOut size={20} strokeWidth={2} />}
      confirmLabel="تسجيل الخروج"
      pendingLabel="جارٍ تسجيل الخروج…"
      pending={isPending}
      error={error}
      returnFocusRef={returnFocusRef}
      onCancel={handleCancel}
      onConfirm={handleConfirm}
    />
  );
}

/** A self-contained trigger + dialog, for places where the button outlives the dialog (admin sidebar/top bar). */
export function LogoutButton({
  className,
  "aria-label": ariaLabel,
  children,
}: {
  className?: string;
  "aria-label"?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        className={className}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        {children}
      </button>
      <LogoutConfirmDialog open={open} onClose={close} />
    </>
  );
}
