#!/bin/bash
export PATH="./node_modules/.bin:$PATH"
set -e
set -x

# Directories
DIST="dist"
TMP_DIST="dist_tmp"
OLD_DIST="dist_old"
SCHEMA_FILE="prisma/schema.prisma"

# Step 0: Backup schema before pull
cp $SCHEMA_FILE "${SCHEMA_FILE}.bak"

# Step 1: Pull DB schema
npx prisma db pull

# Step 2: Check if schema changed
if cmp -s "$SCHEMA_FILE" "${SCHEMA_FILE}.bak"; then
    echo "✅ No schema changes detected. Skipping rebuild."
    rm -f "${SCHEMA_FILE}.bak"
    exit 0
else
    echo "⚡ Schema changes detected. Rebuilding..."
fi

# Step 3: Generate Prisma Client
npx prisma generate

# Step 4: Build project into tmp folder
rm -rf $TMP_DIST
mkdir -p $TMP_DIST
npx tsc --project tsconfig.build.json --outDir $TMP_DIST
npx tsc-alias -p tsconfig.build.json --outDir $TMP_DIST

# Step 5: Replace old dist only if build succeeds
rm -rf $OLD_DIST
if [ -d $DIST ]; then
    mv $DIST $OLD_DIST
fi
mv $TMP_DIST $DIST

# Step 6: Restart PM2
pm2 restart 2

# Cleanup
rm -f "${SCHEMA_FILE}.bak"

echo "✅ db-sync and build completed successfully!"
