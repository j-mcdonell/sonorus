import React from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import AuthForm from "./AuthForm";

export default function AuthDialog({ open, onOpenChange, message }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* We make the background transparent because AuthForm has its own card styling.
        border-none and shadow-none remove the default Dialog styles.
      */}
      <DialogContent className="sm:max-w-md p-0 bg-transparent border-none shadow-none text-white">
        <div className="hidden">
            <DialogTitle>Authentication Required</DialogTitle>
        </div>
        <AuthForm onSuccess={() => onOpenChange(false)} message={message} />
      </DialogContent>
    </Dialog>
  );
}