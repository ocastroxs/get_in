import "./globals.css";
import { cn } from "@/lib/utils";
import { Inter, League_Spartan } from "next/font/google";
import ConsoleWarningSuppressor from "@/components/ConsoleWarningSuppressor";
import { AuthProvider } from "@/lib/AuthContext";

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
    <html lang="pt-br" className="h-full antialiased">
      <body className={cn(leagueSpartan.variable, inter.variable, "min-h-full")}
      suppressHydrationWarning> 
        <AuthProvider>
          <ConsoleWarningSuppressor>{children}</ConsoleWarningSuppressor>
        </AuthProvider>
      </body>
    </html>
  );
}
