"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ContactContextValue = {
  isContactOpen: boolean;
  openContact: () => void;
  closeContact: () => void;
};

const ContactContext = createContext<ContactContextValue | null>(null);

export function ContactProvider({ children }: { children: ReactNode }) {
  const [isContactOpen, setOpen] = useState(false);

  const openContact = useCallback(() => setOpen(true), []);
  const closeContact = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ isContactOpen, openContact, closeContact }),
    [isContactOpen, openContact, closeContact],
  );

  return (
    <ContactContext.Provider value={value}>{children}</ContactContext.Provider>
  );
}

export function useContact() {
  const ctx = useContext(ContactContext);
  if (!ctx) {
    throw new Error("useContact must be used within ContactProvider");
  }
  return ctx;
}
