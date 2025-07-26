"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DialogWrapper from "@/components/dialog-wrapper";
import { ResetPasswordForm } from "@/components/reset-password-form";

function ResetPasswordContent() {
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
    <DialogWrapper open={open} setOpen={setOpen} title="Reset your password">
      <ResetPasswordForm token={resetToken} />
    </DialogWrapper>
  );
}

export default function ResetPasswordHandler() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}