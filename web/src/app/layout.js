import { Noto_Sans_Arabic, Plus_Jakarta_Sans } from "next/font/google";

import { Providers } from "./providers";
import "./globals.css";

const latin = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-latin",
  display: "swap",
});

const arabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata = {
  title: "ZEO Find Work",
  description: "Construction recruitment marketplace for Saudi Arabia.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" className={`${latin.variable} ${arabic.variable}`}>
      {/* suppressHydrationWarning: browser extensions inject attributes on <body> before React mounts. */}
      <body className="min-h-screen bg-canvas text-ink antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
