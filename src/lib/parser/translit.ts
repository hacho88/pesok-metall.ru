// Транслитерация кириллицы в латиницу для имён файлов и slug
// (Next.js image optimizer не читает файлы с кириллическими именами на Windows)
const MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e",
  ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
  н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
  ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "shch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

export function transliterate(input: string): string {
  return input
    .toLowerCase()
    .split("")
    .map((ch) => MAP[ch] ?? ch)
    .join("");
}

// Транслитерирует имя файла, сохраняя расширение
export function transliterateFileName(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  if (dot === -1) return transliterate(fileName);
  const base = fileName.slice(0, dot);
  const ext = fileName.slice(dot);
  return `${transliterate(base)}${ext}`;
}
