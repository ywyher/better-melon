// components/reset-password-handler.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import DialogWrapper from "@/components/dialog-wrapper";
import { ResetPasswordForm } from "@/components/reset-password-form";

export default function ResetPasswordHandler() {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("reset-password-token");
    if (token) {
      setResetToken(token);
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [searchParams]);

  if (!resetToken) return null;

  return (
    <DialogWrapper open={open} onOpenChange={setOpen} title="">
      <ResetPasswordForm token={resetToken} />
    </DialogWrapper>
  );
}