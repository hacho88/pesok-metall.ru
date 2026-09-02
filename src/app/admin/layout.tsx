import { ReactNode } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Package, 
  Megaphone, 
  PenTool, 
  FileText, 
  Settings,
  Palette,
  Boxes
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navItems = [
    { name: "Дашборд", href: "/admin", icon: LayoutDashboard },
    { name: "Каталог", href: "/admin/catalog", icon: Package },
    { name: "Маркетинг", href: "/admin/marketing", icon: Megaphone },
    { name: "Блог", href: "/admin/blog", icon: PenTool },
    { name: "Страницы", href: "/admin/pages", icon: FileText },
    { name: "Темы", href: "/admin/themes", icon: Palette },
    { name: "Конструктор тем", href: "/admin/striker-engine", icon: Boxes },
    { name: "Настройки", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 border-r bg-card shadow-sm lg:block hidden">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin" className="flex items-center gap-2 font-jakarta text-xl font-black text-primary">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">П</span>
            ПЕСОК-МЕТАЛЛ
          </Link>
        </div>
        <nav className="space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all hover:bg-muted active:scale-95",
                "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex min-h-screen flex-1 flex-col lg:pl-64">
        {/* Header (Mobile) */}
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-card/80 px-6 backdrop-blur-md lg:hidden">
           <Link href="/admin" className="font-jakarta text-xl font-black text-primary">P</Link>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
