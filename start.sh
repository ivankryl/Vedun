//  start.sh
#!/usr/bin/env bash
set -e

echo "Running migrations with retries..."

for i in 1 2 3 4 5; do
  if npx prisma migrate deploy; then
    echo "Migrations applied."
    break
  fi
  echo "Migration attempt $i failed; waiting 5s..."
  sleep 5
done

echo "Running seeds..."
node dist/seed.js
node dist/seed-surveys.js

echo "Starting app..."
node dist/main.js
