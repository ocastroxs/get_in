import Sidebar from "@/components/Sidebar";
import { CURRENT_USER } from "@/lib/mockData";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={CURRENT_USER} />
      <main className="flex-1 ml-[220px] p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}