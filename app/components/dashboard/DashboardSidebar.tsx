import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { MessageSquare } from "lucide-react";

export type DashboardSidebarNavItem = {
  name: string;
  href: string;
  // lucide icon component type
  icon: ComponentType<{ className?: string }>;
};

export type DashboardSidebarSection = {
  section: string;
  items: DashboardSidebarNavItem[];
};

export function DashboardSidebar({
  companyName,
  sidebarSections,
  isActive,
  mobileBusinessSelector,
}: {
  companyName: string | null;
  sidebarSections: DashboardSidebarSection[];
  isActive: (href: string) => boolean;
  // optional node for mobile header business selector (keeps logic centralized in Navigation)
  mobileBusinessSelector?: ReactNode;
}) {
  const initials = (companyName || "B")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <>
      {/* Desktop Sidebar - Hidden on Mobile */}
      <aside className="hidden lg:flex w-[240px] bg-white border-r border-[#e7e7e7] flex-col">
        {/* Logo */}
        <div className="h-[76px] px-6 flex items-center border-b border-[#e7e7e7]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#1da750] to-[#00a85a] rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-[16px] text-[#1d1b1c]">iofy.com</h1>
              <p className="text-[11px] text-[#9e9d9d]">WhatsApp Platform</p>
            </div>
          </div>
        </div>

        {/* Business Selector */}
        <div className="px-4 py-4 border-b border-[#e7e7e7]">
          <div className="w-full bg-[#f8faf8] border border-[#1c9f43] rounded-lg px-3 py-2 flex items-center gap-2">
            <div className="w-6 h-6 bg-[#00a85a] rounded-full flex items-center justify-center">
              <span className="text-white text-[12px] font-bold">{initials || "B"}</span>
            </div>
            <span className="text-[13px] font-bold text-[#1d1b1c] flex-1 text-left">
              {companyName || "Bhatbhateni"}
            </span>
          </div>
          {/* Business switching remains in the avatar dropdown (Navigation), so we keep this as a visual selector only. */}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {sidebarSections.map((section) => (
            <div key={section.section} className="mb-6">
              <h3 className="px-6 text-[11px] font-semibold text-[#9e9d9d] mb-2 tracking-wide">
                {section.section}
              </h3>
              <div className="space-y-1 px-3">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        active
                          ? "bg-[#e8f5ec] text-[#1da750]"
                          : "text-[#716f70] hover:bg-[#f5f5f5]"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? "text-[#1da750]" : "text-[#716f70]"}`} />
                      <span className="text-[14px]">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile business selector placeholder (optional) */}
      {mobileBusinessSelector ? <>{mobileBusinessSelector}</> : null}
    </>
  );
}

