---
id: helm-push
title: Helm Push
---

# Helm Push

This document describes the Helm chart packaging and push pattern used in the workspace template.

## Overview

Helm charts are packaged and pushed to GitHub Container Registry (GHCR) as an OCI registry as part of CI/CD. The pattern uses a reusable workflow that handles versioning, Chart.yaml updates, and OCI registry authentication.

## Reusable Workflow Pattern

### Workflow File

`.github/workflows/⚡reusable-helm.yaml`

### Setup

Uses Nix pattern with NS-Cloud runners (LPSM namespaced caches) and runs:

```bash
nix develop .#ci -c ./scripts/ci/helm.sh [chart_path] [version]
```

## Required Inputs (LPSM-based)

| Input            | Required | Description                                     |
| ---------------- | -------- | ----------------------------------------------- |
| `atomi_platform` | Yes      | LPSM Platform for cache namespacing             |
| `atomi_service`  | Yes      | LPSM Service for cache namespacing              |
| `chart_path`     | Yes      | Path to Helm chart directory                    |
| `version`        | No       | Semver version for release versioning (CD only) |

## Versioning Strategy

Helm chart versions follow different strategies based on the build context:

| Context           | Chart Version           | App Version      |
| ----------------- | ----------------------- | ---------------- |
| CI (no version)   | `v0.0.0-{sha}-{branch}` | `{sha}-{branch}` |
| CD (with version) | `v1.2.3`                | `v1.2.3`         |

### CI Versioning

During CI (no version input), charts get temporary versions:

- Chart version: `v0.0.0-abc123-feature-branch`
- App version: `abc123-feature-branch`

This ensures charts are built and tested without consuming release versions.

### CD Versioning

During CD (with version input), charts get the release version:

- Chart version: `v1.2.3`
- App version: `v1.2.3`

## Registry

### Domain

`ghcr.io`

### OCI Path

```
oci://ghcr.io/{github_repo}
```

For example, if the repository is `AtomiCloud/my-service`:

```
oci://ghcr.io/atomicloud/my-service
```

## Chart.yaml Updates

The Helm script automatically updates the `appVersion` in all Chart.yaml files within the chart directory. This ensures the Helm chart reflects the actual application version being deployed.

## Environment Variables

The following environment variables are provided by the reusable workflow:

| Variable          | Source                    | Description                 |
| ----------------- | ------------------------- | --------------------------- |
| `DOMAIN`          | Fixed                     | Registry domain (`ghcr.io`) |
| `DOCKER_PASSWORD` | `secrets.GITHUB_TOKEN`    | Registry authentication     |
| `DOCKER_USER`     | `github.actor`            | Registry username           |
| `GITHUB_REPO_REF` | `github.repository`       | Repository reference        |
| `GITHUB_SHA`      | `github.sha`              | Commit SHA                  |
| `GITHUB_BRANCH`   | `GITHUB_REF_SLUG` env var | Branch name                 |

## Adding a New Helm Chart

### Step 1: Create Helm Chart

Create a Helm chart in the `infra/` directory. For example:

```
infra/
└── root_chart/
    ├── Chart.yaml
    ├── values.yaml
    └── templates/
```

### Step 2: Add CI Job

Add a job to your CI workflow calling the reusable workflow:

```yaml
# .github/workflows/ci.yml
jobs:
  helm:
    uses: ./.github/workflows/⚡reusable-helm.yaml
    secrets: inherit
    with:
      atomi_platform: ${{ github.repository_owner }}
      atomi_service: ${{ github.event.repository.name }}
      chart_path: ./infra/root_chart
```

### Step 3: Add CD Job (Optional)

For release deployments, add a job to your CD workflow:

```yaml
# .github/workflows/cd.yml
jobs:
  helm:
    uses: ./.github/workflows/⚡reusable-helm.yaml
    secrets: inherit
    with:
      atomi_platform: ${{ github.repository_owner }}
      atomi_service: ${{ github.event.repository.name }}
      chart_path: ./infra/root_chart
      version: ${{ github.ref_name }} # e.g., v1.2.3
```

## Examples

### Root Chart

```yaml
with:
  atomi_platform: sulfoxide
  atomi_service: hydrogen
  chart_path: ./infra/root_chart
```

### Component Chart

```yaml
with:
  atomi_platform: sulfoxide
  atomi_service: hydrogen
  chart_path: ./infra/charts/component
```

### Multiple Charts

You can call the reusable workflow multiple times for different charts:

```yaml
jobs:
  helm-root:
    uses: ./.github/workflows/⚡reusable-helm.yaml
    secrets: inherit
    with:
      atomi_platform: ${{ github.repository_owner }}
      atomi_service: ${{ github.event.repository.name }}
      chart_path: ./infra/root_chart

  helm-component:
    uses: ./.github/workflows/⚡reusable-helm.yaml
    secrets: inherit
    with:
      atomi_platform: ${{ github.repository_owner }}
      atomi_service: ${{ github.event.repository.name }}
      chart_path: ./infra/charts/component
```

## NS-Cloud Runners

The Helm reusable workflow uses NS-Cloud runners with LPSM-based cache namespacing:

```yaml
runs-on:
  - nscloud-ubuntu-22.04-amd64-4x8-with-cache
  - nscloud-cache-size-50gb
  - nscloud-cache-tag-${{ inputs.atomi_platform }}-${{ inputs.atomi_service }}-nix-store-cache
```

This ensures Nix store caches are isolated per service for faster builds.

## Trigger Words

When you see these terms, the helm-push pattern applies:

- Helm, chart, helm chart
- OCI registry, helm push
- Chart.yaml, values.yaml
- Helm packaging, helm lint

## Summary

| Aspect           | Pattern                                    |
| ---------------- | ------------------------------------------ |
| **Workflow**     | `⚡reusable-helm.yaml`                     |
| **Script**       | `nix develop .#ci -c ./scripts/ci/helm.sh` |
| **Registry**     | `ghcr.io` (OCI)                            |
| **OCI path**     | `oci://ghcr.io/{repo}`                     |
| **Version (CI)** | `v0.0.0-{sha}-{branch}`                    |
| **Version (CD)** | `v1.2.3` (when version provided)           |
| **Runners**      | NS-Cloud with LPSM namespaced caches       |

## See Also

- [CI/CD Workflows](./ci-cd.md) - Overall CI/CD architecture
- [Service Tree (LPSM)](./service-tree.md) - LPSM naming conventions
