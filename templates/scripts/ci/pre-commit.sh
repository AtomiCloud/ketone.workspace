#!/usr/bin/env bash
set -euo pipefail

# install dependencies
echo "⬇️ Installing Dependencies..."
# <%= if (runtime == "go") { %>
go mod tidy
# <%= } %>
# <%= if (runtime == "dotnet") { %>
dotnet restore
# <%= } %>
# <%= if (runtime == "bun") { %>
bun install
# <%= } %>
echo "✅ Done!"

# run precommit
echo "🏃‍➡️ Running Pre-Commit..."
pre-commit run --all -v
echo "✅ Done!"
