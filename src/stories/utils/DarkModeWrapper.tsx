import React from 'react';

// Dark Mode Wrapper — renders component in light and dark themes side-by-side for snapshot testing

export function DarkModeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: "2rem" }}>
      <div data-theme="light" style={{ flex: 1 }}>
        {children}
      </div>
      <div data-theme="dark" style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
}
