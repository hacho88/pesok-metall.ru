// Дамп HTML .side-catalog для анализа структуры меню
import { readFileSync, writeFileSync } from "node:fs";
import * as cheerio from "cheerio";

const html = readFileSync("citymet-menu.html", "utf-8");
const $ = cheerio.load(html);
const menu = $(".side-catalog").first();
writeFileSync("sidecatalog.html", menu.html() || "", "utf-8");
console.log("Размер .side-catalog:", (menu.html() || "").length);
console.log("=== Первые 6000 символов ===");
console.log((menu.html() || "").slice(0, 6000));
