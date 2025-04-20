import React from 'react';

interface DashboardShellProps {
  children: React.ReactNode;
}

/**
 * DashboardShell is a layout wrapper for dashboard pages
 * It provides consistent padding and structure for dashboard content
 */
export default function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto">
      {children}
    </div>
  );
} 