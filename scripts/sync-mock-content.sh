#!/usr/bin/env bash
# Copy mock CMS content from another project into this template's content/mock/
# Usage: ./scripts/sync-mock-content.sh /path/to/other/project/content/mock [--copy-assets]

set -euo pipefail

SRC_DIR=${1:-}
COPY_ASSETS=false

if [ -z "$SRC_DIR" ]; then
  echo "Usage: $0 /path/to/other/project/content/mock [--copy-assets]"
  exit 2
fi

if [ "$2" = "--copy-assets" ]; then
  COPY_ASSETS=true
fi

DEST_DIR="$(pwd)/content/mock"

if [ ! -d "$SRC_DIR" ]; then
  echo "Source directory does not exist: $SRC_DIR"
  exit 3
fi

echo "Syncing mock content from $SRC_DIR -> $DEST_DIR"
mkdir -p "$DEST_DIR"

# copy JSON files
for f in "$SRC_DIR"/*.json; do
  [ -e "$f" ] || continue
  echo "Copying $(basename "$f")"
  cp "$f" "$DEST_DIR/"
done

if $COPY_ASSETS; then
  # attempt to copy public assets referenced in the mock folder
  echo "Copying referenced public assets is enabled. This will copy files referenced by JSON 'src' or 'poster' fields if they exist under the source project public/ folder."
  SRC_PUBLIC_DIR="$(dirname "$SRC_DIR")/public"
  if [ -d "$SRC_PUBLIC_DIR" ]; then
    echo "Copying public assets from $SRC_PUBLIC_DIR -> $(pwd)/public"
    rsync -av --ignore-existing "$SRC_PUBLIC_DIR/" "$(pwd)/public/"
  else
    echo "No public/ folder found adjacent to the provided mock dir: $SRC_PUBLIC_DIR"
  fi
fi

echo "Done. Review content/mock/ and public/ as needed."
