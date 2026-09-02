# pesok-metall.ru — автономная строительная экосистема

Металлопрокат (арматура, трубы, листы, сетка — парсинг с city-met.ru) и сыпучие материалы
(песок, щебень — мешки 30 кг / биг-беги 1 т) с доставкой по Москве и Московской области.

## Стек

- **Next.js 15** (App Router, Server Components, React 19)
- **Tailwind CSS 3.4** + shadcn/ui-примитивы (CSS-переменные дизайн-токенов)
- **PostgreSQL + Prisma ORM 6** (EAV-модель через `ProductAttribute`, резерв `GENERAL_CONSTRUCTION`)
- **DeepSeek API** через OpenAI SDK (`deepseek-chat` = V3, `deepseek-reasoner` = R1)

## Быстрый старт

```powershell
# 1. Установка зависимостей (postinstall сгенерирует Prisma Client)
npm install

# 2. Настройка окружения
Copy-Item .env.example .env
# впишите DATABASE_URL и DEEPSEEK_API_KEY

# 3. Создание схемы БД и сид-данных
npm run db:push
npm run db:seed

# 4. Запуск
npm run dev
```

Основной сайт: `http://localhost:3000`
Гео-поддомен локально: `http://balashiha.localhost:3000` (middleware рерайтит в `/_geo/balashiha`)

## Структура

```
prisma/schema.prisma          # Модели: GeoZone, Category, Product, ProductAttribute,
                              # GeoProductData, CompetitorPrice, AdCampaign, FleetVehicle,
                              # TenderAnalysis, PageConfig (JSON-driven UI)
prisma/seed.ts                # Идемпотентный сид: зоны, товары, автопарк, реклама, конфиги
src/middleware.ts             # Мультиподдоменный рерайт в /_geo/[slug]
src/lib/calculator.ts         # Математика: объём → тара, автоподбор машины, стоимость доставки
src/lib/ai/deepseek.ts        # OpenAI-клиент → DeepSeek
src/lib/ai/geo-content-pipeline.ts  # Гео-уникализация текстов (DeepSeek-V3)
src/lib/ai/bid-analyzer.ts    # ИИ-биддер Директа и цены (DeepSeek-R1)
src/lib/page-builder.tsx      # Роутер JSON-блоков витрины
src/components/AiCalculator.tsx      # ИИ-калькулятор (сыпучие + металл + автопарк)
src/components/blocks/        # MainHeroBanner, InteractiveCalculator, LiveProductGrid,
                              # AiChatWidget, InvoiceGeneratorCard
src/app/_geo/[slug]/page.tsx  # Гео-страницы поддоменов
src/app/api/                  # /products, /chat, /ai/generate-content,
                              # /ai/analyze-bids, /cron/autopilot
```

## Парсер city-met.ru (металлопрокат)

Импорт товаров с каталога-донора с локальным скачиванием фотографий в `public/products/`.

```powershell
# Через аргументы (npx tsx — надёжнее на Windows)
npx tsx prisma/scripts/parse-citymet.ts --url=https://city-met.ru/armatura --pages=5 --dry-run

# Через env-переменные (работает с npm run)
$env:URL="https://city-met.ru/armatura"; $env:PAGES="5"; npm run parse:citymet
```

Флаги: `--url` (обязательно), `--pages=N`, `--transport=http|playwright`, `--no-images`, `--dry-run`.
Env-аналоги: `URL`, `PAGES`, `TRANSPORT`, `NO_IMAGES=1`, `DRY_RUN=1`.

**Важно:** city-met.ru защищён KillBot — простой HTTP получает страницу верификации.
Парсер определяет это и выдаёт инструкцию. Для обхода установите Playwright:
`npm i -D playwright && npx playwright install chromium`, затем `--transport=playwright`.

Логика: обход пагинации → извлечение карточек (cheerio, селекторы настраиваются в
`src/lib/parser/extract.ts`) → скачивание фото в `/public/products/{slug}.jpg` →
апсерт в БД (дедупликация по `sourceUrl`, авто-создание категорий).
API-триггер: `POST /api/parser/city-met` `{ url, maxPages?, transport?, downloadImages? }`.

## Автопилот

- **Гео-контент:** `POST /api/ai/generate-content` `{ productId }` — обходит все GeoZone,
  генерирует уникальные SEO-тексты и локальные цены.
- **Биддер:** `POST /api/ai/analyze-bids` — пересчёт цен и ставок Яндекс.Директ
  (жёсткий лимит `maxBidLimit`).
- **Cron (каждые 2 часа):**
  `curl -H "x-cron-secret: <CRON_SECRET>" https://pesok-metall.ru/api/cron/autopilot`

## Темы (JSON-driven UI)

Пресеты в `src/app/globals.css`: `industrial-orange`, `b2b-dark-slate`, `clean-minimal`.
Конфиг страницы (тема + массив блоков) хранится в таблице `PageConfig` и редактируется
из админки без переписывания кода. При недоступности БД витрина рендерится из
дефолтного JSON (`src/lib/page-config.ts`).
