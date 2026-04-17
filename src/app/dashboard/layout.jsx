import ParticlesBackground from "@/components/ui/ParticlesBackground";
import Sidebar from "@/components/ui/sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar/>
      <ParticlesBackground/>
      <main className="flex-1 ml-[20px] p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}