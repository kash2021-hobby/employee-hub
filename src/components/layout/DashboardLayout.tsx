import { ReactNode, useState } from 'react';
import { Sidebar, MobileMenuButton } from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      {isMobile && <MobileMenuButton onClick={() => setMobileOpen(true)} />}
      <main
        className={`min-h-screen transition-all duration-300 ${
          isMobile ? 'ml-0 pt-16' : 'ml-64'
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
