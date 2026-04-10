"use client";

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
  useEffect(() => {
    // Suprimir avisos específicos do Recharts sobre dimensões dos gráficos
    const originalWarn = console.warn;
    console.warn = (...args) => {
      const message = args.join(' ');
      if (message.includes('The width(-1) and height(-1) of chart should be greater than 0')) {
        return; // Não mostrar este aviso
      }
      originalWarn.apply(console, args);
    };

    return () => {
      console.warn = originalWarn; // Restaurar quando o componente for desmontado
    };
  }, []);

  return (
    <html
      lang="pt-br"
      className="h-full antialiased"
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
