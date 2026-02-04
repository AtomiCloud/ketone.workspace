---
id: infisical
title: Infisical Secret Management
---

# Infisical Secret Management

This document describes the Infisical secret management conventions used in the workspace template.

## Overview

Infisical is a secret management platform. We use it to:

1. Export secrets to gitignored files (`.env`, `.tfvars`)
2. Run processes with secrets injected

## AtomiCloud Instance

```bash
export INFISICAL_API_URL="https://secrets.atomi.cloud"
```

## LPSM Mapping (Critical)

Infisical uses Service Tree concepts - see [service-tree.md](./service-tree.md) for details.

| LPSM              | Infisical Concept |
| ----------------- | ----------------- |
| **Platform (P)**  | Project           |
| **Landscape (L)** | Environment       |

So `--projectId` = Platform, `--env` = Landscape

### Example

Given LPSM: `pichu-diamond-sulfoxide-hydrogen-api`

- `--projectId=sulfoxide` (Platform)
- `--env=pichu` (Landscape)

## Login Mechanism

The standard login pattern from `scripts/local/secrets.sh`:

```bash
#!/usr/bin/env bash
set -eou pipefail

export INFISICAL_API_URL="https://secrets.atomi.cloud"
set +e
(infisical secrets) &>/dev/null
ec="$?"
set -e

if [ "$ec" != '0' ]; then
  infisical login
fi
```

**Pattern:** Try to access secrets → if fails, trigger login

## Use Cases

### 1. Export Secrets to File

Export secrets to a gitignored file:

```bash
# Export to .env (default format)
infisical export --env=<landscape> --projectId=<platform> > .env

# Export with explicit format
infisical export --format=dotenv --output-file=.env

# Export to JSON
infisical export --format=json --output-file=secrets.json

# Export for Terraform
infisical export --format=dotenv --output-file=.auto.tfvars
```

**Supported formats:** `dotenv`, `dotenv-export`, `json`, `yaml`, `csv`

**Important:** Exported files (`.env`, `.tfvars`) MUST be gitignored.

### 2. Run Process with Secrets

Inject secrets into a process without writing to disk:

```bash
infisical run --env=<landscape> --projectId=<platform> -- <command>
```

**Examples:**

```bash
# Run npm with secrets
infisical run --env=pichu --projectId=sulfoxide -- npm run dev

# Run deployment script with secrets
infisical run --env=pichu --projectId=sulfoxide -- ./scripts/deploy.sh

# Run Terraform with secrets
infisical run --env=pikachu --projectId=sulfoxide -- terraform apply
```

## Key Flags

| Flag          | Purpose                                                 |
| ------------- | ------------------------------------------------------- |
| `--env`       | Landscape (dev, staging, prod) - maps to LPSM Landscape |
| `--projectId` | Platform ID - maps to LPSM Platform                     |
| `--path`      | Folder path within project                              |
| `--tags`      | Filter secrets by tags                                  |

## Important Files

### .infisical.json

Project configuration file (stores default projectId):

```json
{
  "projectId": "sulfoxide"
}
```

### .env

Exported environment variables (MUST be gitignored):

```
DATABASE_URL=postgres://...
API_KEY=sk-...
SECRET_VALUE=...
```

### .tfvars / .auto.tfvars

Terraform variables (MUST be gitignored):

```
database_url = "postgres://..."
api_key = "sk-..."
```

## LPSM Examples

Given project LCPSM: `pichu-diamond-sulfoxide-hydrogen-api`

### Export to .env

```bash
infisical export --env=pichu --projectId=sulfoxide > .env
```

### Run with secrets

```bash
infisical run --env=pichu --projectId=sulfoxide -- npm run dev
```

### Export for Terraform

```bash
infisical export --env=pichu --projectId=sulfoxide --format=dotenv --output-file=terraform.tfvars
```

## Trigger Words

When you see these terms, the infisical convention applies:

- Infisical, secrets, secret management
- `.env` file, environment variables
- `tfvars`, Terraform secrets
- `infisical run`, `infisical export`
- `projectId`, environment secrets

## Summary

| Aspect            | Pattern                                                |
| ----------------- | ------------------------------------------------------ |
| **API URL**       | `https://secrets.atomi.cloud`                          |
| **Platform (P)**  | Infisical Project (`--projectId`)                      |
| **Landscape (L)** | Infisical Environment (`--env`)                        |
| **Export**        | `infisical export --env=<L> --projectId=<P> > .env`    |
| **Run**           | `infisical run --env=<L> --projectId=<P> -- <command>` |
| **Login pattern** | Try secrets, if fail → login                           |
| **Gitignored**    | `.env`, `.tfvars`, `.auto.tfvars`                      |
