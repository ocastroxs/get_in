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
  title: "GetIN",
  description: "Sistema de Controle de Visitantes e Acesso a Setores",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-br"
      className={cn("h-full antialiased", leagueSpartan.variable, inter.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
