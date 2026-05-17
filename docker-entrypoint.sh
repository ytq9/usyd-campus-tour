#!/bin/sh
set -e

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Running Payload migrations..."
  node ./node_modules/payload/bin.js migrate
else
  echo "Skipping Payload migrations because RUN_MIGRATIONS=false."
fi

echo "Starting Next.js server..."
exec node server.js
