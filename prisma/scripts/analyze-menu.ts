// Анализ HTML city-met.ru: структура меню каталога .side-catalog
import { readFileSync, writeFileSync } from "node:fs";
import * as cheerio from "cheerio";

const html = readFileSync("citymet-menu.html", "utf-8");
const $ = cheerio.load(html);

// Меню каталога в .side-catalog:
//   <ul><li><a itemprop="url" href="/armatura/"><span itemprop="name">Арматура</span>
//     <ul><li><a class="nav-link" href="..."><span itemprop="name">Подкатегория</span>
//       <ul><li class="nav-item"><a class="nav-link" href="..."><span class="nav-link__content">...</span>
interface Node {
  name: string;
  url: string;
  children: Node[];
}

const buildTree = (el: cheerio.Cheerio<any>): Node[] => {
  const nodes: Node[] = [];
  el.children("li").each((_, li) => {
    const $li = $(li);
    const a = $li.children("a").first();
    const href = a.attr("href") || "";
    const name = (a.find("span[itemprop='name'], span.nav-link__content").first().text() || a.text())
      .trim()
      .replace(/\s+/g, " ");
    if (!name || name.length < 2 || !href) return;
    const node: Node = {
      name,
      url: href.startsWith("/") ? `https://city-met.ru${href}` : href,
      children: buildTree($li.children("ul")),
    };
    nodes.push(node);
  });
  return nodes;
};

const menu = $(".side-catalog").first();
console.log("=== .side-catalog найден:", menu.length > 0, "===");
const tree = buildTree(menu.children("ul"));

const print = (nodes: Node[], d: number) => {
  for (const n of nodes) {
    console.log(`${"  ".repeat(d)}- ${n.name} (${n.url})`);
    print(n.children, d + 1);
  }
};
print(tree, 0);
console.log(`\nВсего пунктов верхнего уровня: ${tree.length}`);

// Плоский список всех URL категорий (для парсера) с именем родителя
const flat: { name: string; url: string; parentName: string | null }[] = [];
const walk = (nodes: Node[], parentName: string | null) => {
  for (const n of nodes) {
    flat.push({ name: n.name, url: n.url, parentName });
    walk(n.children, n.name);
  }
};
walk(tree, null);
writeFileSync("citymet-categories.json", JSON.stringify(flat, null, 2), "utf-8");
console.log("Сохранено в citymet-categories.json:", flat.length);
