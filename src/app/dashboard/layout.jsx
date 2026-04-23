import Sidebar from "@/components/Sidebar";
import { CURRENT_USER } from "@/lib/mockData";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('getin_token');
    if (!token) {
      router.push('/');
    } else {
      setIsAuth(true);
    }
  }, [router]);

  if (!isAuth) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={CURRENT_USER} />
      <main className="flex-1 ml-[220px] p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}