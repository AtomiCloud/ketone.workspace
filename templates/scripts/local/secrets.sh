#!/usr/bin/env bash

set -euo pipefail

echo "🔏 Setting up secrets for local development..."

export INFISICAL_API_URL="https://secrets.atomi.cloud"
set +e
(infisical secrets) &>/dev/null
ec="$?"
set -e

if [ "$ec" != '0' ]; then
  infisical login
fi
