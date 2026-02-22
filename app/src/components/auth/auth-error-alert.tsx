"use client";

import { AlertCircle } from "lucide-react";

type AuthErrorAlertProps = {
  message: string;
};

export function AuthErrorAlert({ message }: AuthErrorAlertProps) {
  return (
    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md flex items-center gap-2">
      <AlertCircle className="h-4 w-4" />
      {message}
    </div>
  );
}
