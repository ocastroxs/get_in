import "./globals.css";
import { cn } from "@/lib/utils";
import { IBM_Plex_Mono, Inter, Poppins } from "next/font/google";
import ConsoleWarningSuppressor from "@/components/ConsoleWarningSuppressor";
import { AuthProvider } from "@/lib/AuthContext";
import RouteChangeIndicator from "@/components/RouteChangeIndicator";
import { ToastProvider } from "@/components/ui/toast-provider";
import { FloatingAboutBubble } from "@/components/ui/FloatingAboutBubble";
import { THEME_INIT_SCRIPT } from "@/lib/theme-script";
import { PREFERENCES_INIT_SCRIPT } from "@/lib/preferences-script";
import { I18nProvider } from "@/lib/i18n";

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
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className="h-full antialiased" suppressHydrationWarning>
      <body className={cn(poppins.variable, inter.variable, ibmPlexMono.variable, "min-h-full")}
      suppressHydrationWarning> 
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: PREFERENCES_INIT_SCRIPT }} />
        <I18nProvider>
          <AuthProvider>
            <ToastProvider>
              <RouteChangeIndicator />
              <ConsoleWarningSuppressor>{children}</ConsoleWarningSuppressor>
              <FloatingAboutBubble/>
            </ToastProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
