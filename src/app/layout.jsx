import "./globals.css";
import { cn } from "@/lib/utils";
import { IBM_Plex_Mono, Inter, Poppins } from "next/font/google";
import ConsoleWarningSuppressor from "@/components/ConsoleWarningSuppressor";
import { AuthProvider } from "@/lib/AuthContext";
import RouteChangeIndicator from "@/components/RouteChangeIndicator";
import { ToastProvider } from "@/components/ui/toast-provider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-heading",
  display: "swap"
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-mono",
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
      <body className={cn(poppins.variable, inter.variable, ibmPlexMono.variable, "min-h-full")}
      suppressHydrationWarning> 
        <AuthProvider>
          <ToastProvider>
            <RouteChangeIndicator />
            <ConsoleWarningSuppressor>{children}</ConsoleWarningSuppressor>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
