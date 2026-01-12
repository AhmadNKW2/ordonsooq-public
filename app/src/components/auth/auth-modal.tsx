"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "login" | "register";
}

export function AuthModal({ isOpen, onClose, initialView = "login" }: AuthModalProps) {
  const [view, setView] = useState<"login" | "register">(initialView);

  // Update view if initialView changes when opening
  // (Optional: this depends on whether we want to reset or persist state)
  
  const handleSuccess = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md w-full p-6 bg-white rounded-xl">
      {view === "login" ? (
        <LoginForm 
            onSuccess={handleSuccess} 
            onRegisterClick={() => setView("register")} 
        />
      ) : (
        <RegisterForm 
            onSuccess={handleSuccess} 
            onLoginClick={() => setView("login")} 
        />
      )}
    </Modal>
  );
}
