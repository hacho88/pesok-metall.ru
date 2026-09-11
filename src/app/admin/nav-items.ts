import {
  LayoutDashboard,
  Package,
  LayoutGrid,
  PanelTop,
  Megaphone,
  PenTool,
  FileText,
  Palette,
  MapPin,
  Receipt,
  Wand2,
} from "lucide-react";

export const adminNavItems = [
  { name: "Дашборд", href: "/admin", icon: LayoutDashboard },
  { name: "Каталог", href: "/admin/catalog", icon: Package },
  { name: "Боксы на главной", href: "/admin/hero-boxes", icon: LayoutGrid },
  { name: "Hero-конструктор", href: "/admin/hero-builder", icon: Wand2 },
  { name: "Интерфейс", href: "/admin/interface", icon: PanelTop },
  { name: "Маркетинг", href: "/admin/marketing", icon: Megaphone },
  { name: "Чеки", href: "/admin/receipts", icon: Receipt },
  { name: "Блог", href: "/admin/blog", icon: PenTool },
  { name: "Страницы", href: "/admin/pages", icon: FileText },
  { name: "Темы", href: "/admin/themes", icon: Palette },
  { name: "Геозоны", href: "/admin/themes/geo", icon: MapPin },
];
