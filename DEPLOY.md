# Деплой на Timeweb Cloud

## Архитектура

- **Next.js 15** (App Router) — приложение, `npm run build` + `npm start`
- **PostgreSQL** — база данных (Timeweb Cloud DB)
- **DeepSeek API** — генерация SEO-статей и описаний (планировщик запускается сам при старте сервера)

## Шаг 1. База данных

1. В Timeweb Cloud: **Базы данных → Создать → PostgreSQL** (версия 14+)
2. После создания скопируйте строку подключения вида:
   `postgresql://gen_user:PASSWORD@HOST:5432/db_name?schema=public`

## Шаг 2. Приложение

1. **Облачные приложения → Создать → Node.js**
2. Подключите GitHub-репозиторий `hacho88/pesok-metall.ru`, ветка `master`
3. Настройки:
   - Node.js: **20** или новее
   - **Build command:** `npx prisma db push && npm run build`
   - **Start command:** `npm start`
   - Порт: 3000 (Timeweb подставит свой — приложение слушает `process.env.PORT` автоматически через `next start`)
4. **Переменные окружения** (раздел «Конфигурация»):

```
DATABASE_URL=postgresql://...строка из п.1...
DEEPSEEK_API_KEY=sk-ваш-ключ
DEEPSEEK_BASE_URL=https://api.deepseek.com
CRON_SECRET=любая-случайная-строка
NEXT_PUBLIC_SITE_URL=https://pesok-metall.ru
ADMIN_ORIGIN=https://pesok-metall.ru
PREVIEW_SECRET=любая-строка
```

5. Домен: привяжите `pesok-metall.ru` в настройках приложения (DNS: A-запись на IP приложения).

## Перенос данных (один раз)

С локальной машины, где лежит `data-export.json`:

```bash
# 1. Применить схему и залить данные в БД Timeweb
#    (временно подставьте DATABASE_URL от Timeweb)
$env:DATABASE_URL="postgresql://...timeweb..."; npx prisma db push
npx tsx scripts/import-db.ts

# 2. Проверить счётчики: products: 841, geoRows: 3760, posts: 5
```

Картинки товаров лежат в `public/` и попадают в репозиторий автоматически.

## Обновления

Push в `master` → в Timeweb нажмите «Пересобрать» (или включите автодеплой при push).

## Полезные эндпоинты (после деплоя)

- `GET /api/cron/seo-generator?count=5` — дописать статьи вручную (заголовок `x-cron-secret`)
- `GET /api/cron/autopilot` — гео-контент + анализ заявок (защищён CRON_SECRET)
- Админка: `https://ваш-домен/admin`
