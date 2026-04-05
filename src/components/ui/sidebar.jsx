import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  LayoutGrid, 
  Lock, 
  Activity, 
  FileText 
} from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col py-6">
      {/* Seção Principal */}
      <div className="px-6 mb-2">
        <h3 className="text-xs font-semibold text-gray-400 tracking-wider mb-4">
          PRINCIPAL
        </h3>
        <nav className="flex flex-col gap-1">
          <NavItem href="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem href="/visitantes" icon={Users} label="Visitantes" />
          <NavItem href="/funcionarios" icon={UserSquare2} label="Funcionários" />
          <NavItem href="/setores" icon={LayoutGrid} label="Setores" />
          <NavItem href="/permissoes" icon={Lock} label="Permissões" active />
        </nav>
      </div>

      {/* Seção Relatórios */}
      <div className="px-6 mt-8">
        <h3 className="text-xs font-semibold text-gray-400 tracking-wider mb-4">
          RELATÓRIOS
        </h3>
        <nav className="flex flex-col gap-1">
          <NavItem href="/circulacao" icon={Activity} label="Circulação" />
          <NavItem href="/auditoria" icon={FileText} label="Auditoria" />
        </nav>
      </div>
    </aside>
  );
}

// Componente auxiliar para os itens de navegação
function NavItem({ href, icon: Icon, label, active }) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active 
          ? 'bg-blue-50 text-blue-900' 
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon className={`w-5 h-5 ${active ? 'text-blue-700' : 'text-gray-400'}`} />
      {label}
    </Link>
  );
}