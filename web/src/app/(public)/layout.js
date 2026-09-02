import { PublicFooter } from "@/components/layout/public-footer";
import { PublicNav } from "@/components/layout/public-nav";

export default function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <PublicNav />
      <main className="zeo-fade-in flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
