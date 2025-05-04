# @blaahaj/lint-git-tree

A GitHub action for checking that committed file / directory names:

- must be valid, normalised UTF-8
- must be safe to check out on a case-insensitive filesystem.

## Usage

Create a `.github/workflows/lint-git-tree.yml` with the following:

```yaml
---
name: lint-git-tree

on:
  push:
    branches:
      - main
  pull_request:
    types:
      - opened
      - synchronize
      - reopened

jobs:
  build:
    name: lint-git-tree
    runs-on: ubuntu-latest

    steps:
      - name: lint-git-tree
        uses: blaahaj/lint-git-tree@VERSION
```

Where VERSION is the version you wish to use, e.g. `v1.0.0`.
