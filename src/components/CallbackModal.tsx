"use client";

import { CallMasterModal } from "./CallMasterModal";

export function CallbackModal({ phone }: { phone: string }) {
  return <CallMasterModal phone={phone || "+7 (999) 000-24-24"} label="Позвонить мастеру" />;
}
