import type { ReactNode } from "react";

export function DashboardTopNavbar({
  mobileHeader,
  desktopHeader,
}: {
  mobileHeader: ReactNode;
  desktopHeader: ReactNode;
}) {
  return (
    <>
      {/* Mobile Header - Compact sticky */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-[#e7e7e7] px-4 py-3">
        {mobileHeader}
      </header>

      {/* Desktop Top Navigation */}
      <header className="hidden lg:flex h-[76px] bg-white border-b border-[#d2d3d6] px-8 items-center justify-between">
        {desktopHeader}
      </header>
    </>
  );
}

