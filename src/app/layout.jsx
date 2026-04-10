"use client";

import "./globals.css";
import { useEffect } from "react";

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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
