import React from 'react';
import { cn } from '../utils/cn';

interface AppLayoutProps {
  sidebar?: React.ReactNode;
  content: React.ReactNode;
  summary?: React.ReactNode;
  mobileBottomNav?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  sidebar,
  content,
  summary,
  mobileBottomNav,
  className,
  children,
}) => {
  return (
    <div className={cn('h-screen overflow-hidden flex flex-col bg-background font-manrope text-text-charcoal', className)}>
      {/* Main Container - Non-scrolling row */}
      <div className="flex-1 flex flex-col md:flex-row w-full relative overflow-hidden min-h-0">
        {/* Left Sidebar (Desktop categories scrollable / Mobile row scrollable) */}
        {sidebar && (
          <div className="w-full md:w-[280px] md:flex-shrink-0 md:h-full md:overflow-y-auto">
            {sidebar}
          </div>
        )}

        {/* Center Content (Products grid, builder panels - Independently Scrollable) */}
        <main className="flex-1 h-full overflow-y-auto min-w-0 px-4 md:px-6 py-6 md:py-8">
          {content}
        </main>

        {/* Right Sidebar (Desktop order summary - Fixed h-full with internally scrollable cart items) */}
        {summary && (
          <div className="hidden lg:block w-[360px] md:flex-shrink-0 h-full overflow-hidden">
            {summary}
          </div>
        )}
      </div>

      {/* Bottom Nav on Mobile */}
      {mobileBottomNav}
      {children}
    </div>
  );
};
