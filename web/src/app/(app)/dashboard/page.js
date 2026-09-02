"use client";

import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { BuyerDashboard } from "@/components/dashboard/buyer-dashboard";
import { SellerDashboard } from "@/components/dashboard/seller-dashboard";
import { FullPageLoader } from "@/components/layout/route-guard";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return <FullPageLoader />;
  if (user.role === "buyer") return <BuyerDashboard />;
  if (user.role === "seller") return <SellerDashboard />;
  return <AdminDashboard />;
}
