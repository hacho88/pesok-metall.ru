import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string) {
  const rus = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя ".split("");
  const eng = "a b v g d e e zh z i y k l m n o p r s t u f kh ts ch sh shch  y  e yu ya -".split(" ");
  return text
    .toLowerCase()
    .split("")
    .map((char) => {
      const index = rus.indexOf(char);
      return index !== -1 ? eng[index] : char;
    })
    .join("")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
