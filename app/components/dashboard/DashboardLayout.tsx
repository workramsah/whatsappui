import type { ReactNode } from "react";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return <div className="flex h-screen w-full bg-[#fafafa]">{children}</div>;
}

export function MainContent({ children }: { children: ReactNode }) {
  // Leave room for the mobile bottom nav + FAB.
  return <main className="flex-1 overflow-auto pb-20 lg:pb-0">{children}</main>;
}

