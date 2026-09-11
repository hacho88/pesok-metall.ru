#!/bin/bash
# Автодеплой pesok-metall.ru: запускается по cron каждые 5 минут.
# Если в origin/master появился новый коммит — тянет, обновляет БД,
# пересобирает и перезапускает сервис. Иначе ничего не делает.

set -e
APP_DIR="/var/www/pesok-metall.ru"
LOG_TAG="[deploy]"

exec 9>/tmp/pesok-deploy.lock
flock -n 9 || { echo "$LOG_TAG предыдущий деплой ещё идёт, пропуск"; exit 0; }

cd "$APP_DIR"
git fetch origin master

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/master)

if [ "$LOCAL" = "$REMOTE" ]; then
  exit 0
fi

echo "$LOG_TAG $(date '+%F %T') обновление: $LOCAL -> $REMOTE"
git pull origin master
npx prisma db push
npm run build
systemctl restart pesok
echo "$LOG_TAG деплой завершён: $(git log --oneline -1)"
