import { League_Spartan, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap"
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

export const metadata = {
  title: {
    template: "GetIN - %s",
    default: "GetIN"
  }
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-br"
      className={cn("h-full antialiased", leagueSpartan.variable, inter.variable)}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
