"use client";

import { useState } from "react";

import { RouteGuard } from "@/components/layout/route-guard";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function AppLayout({ children }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <RouteGuard>
      <div className="min-h-screen lg:ps-[264px]">
        <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
        <div className="flex min-h-screen flex-col">
          <Topbar onOpenNav={() => setNavOpen(true)} />
          <main className="zeo-fade-in mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </RouteGuard>
  );
}
