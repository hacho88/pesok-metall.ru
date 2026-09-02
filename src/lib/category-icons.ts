import {
  Activity,
  ArrowUp,
  BarChart3,
  Boxes,
  Brackets,
  Circle,
  Columns2,
  CornerDownRight,
  CornerUpRight,
  Fence,
  Grid3X3,
  Minus,
  Package,
  RectangleHorizontal,
  Square,
  SquareStack,
  Waves,
  type LucideIcon,
} from "lucide-react";

/** Иконки категорий для дерева каталога и сетки категорий на главной */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Арматура": BarChart3,
  "Балка": Columns2,
  "Сваи": ArrowUp,
  "Дополнительные": Boxes,
  "Квадрат": Square,
  "Лист": RectangleHorizontal,
  "Штакетник": Fence,
  "Отводы": CornerDownRight,
  "Полоса": Minus,
  "Проволока": Activity,
  "Профнастил": Waves,
  "Сетка": Grid3X3,
  "Труба профильная": SquareStack,
  "Трубы": Circle,
  "Уголок": CornerUpRight,
  "Швеллер": Brackets,
};

export function categoryIcon(name: string): LucideIcon {
  const lower = name.toLowerCase();
  const key = Object.keys(CATEGORY_ICONS).find((k) => lower.includes(k.toLowerCase()));
  return key ? CATEGORY_ICONS[key] : Package;
}
