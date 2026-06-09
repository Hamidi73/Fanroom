// Page shell for browse pages: top nav + left sidebar + scrolling content.
// Pass `rightSlot` to add a control to the top-right (e.g. language picker).

import type { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { Sidebar } from "./Sidebar";

export function AppShell({
  children,
  rightSlot,
  sidebar = true,
}: {
  children: ReactNode;
  rightSlot?: ReactNode;
  sidebar?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav rightSlot={rightSlot} />
      <div className="flex flex-1">
        {sidebar && <Sidebar />}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
