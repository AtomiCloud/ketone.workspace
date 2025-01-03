#!/usr/bin/env bash
set -eou pipefail

# install dependencies
echo "⬇️ Installing Dependencies..."
<%= if (runtime == "go") { %>
go mod tidy
<%= } else if (runtime == "dotnet") { %>
dotnet restore
<%= } else if (runtime == "bun") { %>
bun install 
<%= } %>
echo "✅ Done!"

# run precommit
echo "🏃‍➡️ Running Pre-Commit..."
pre-commit run --all -v
echo "✅ Done!"
