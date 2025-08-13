# @blaahaj/lint-git-tree

Check that the file / directory names in a Git repository:

- are valid, normalised UTF-8;
- are case-insensitively unique within each directory.

## How to run it

`lint-git-tree` can be run via GitHub Actions, or via `npx`.

### As a GitHub action

The key is to have a step which includes:

```yaml
uses: blaahaj/lint-git-tree@v1.1.0
```

For example, you could have a `.github/workflows/lint-git-tree.yml` file with the following:

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
        uses: blaahaj/lint-git-tree@v1.1.0
```

### Via `npx`

Simply invoke using `npx` from the root of your git working tree:

```shell
npx @blaahaj/lint-git-tree@v1.1.0
```

## What is checked

`lint-git-tree` _only_ checks the file and directory names in a Git repository. It does not look inside the files at all. In other words, it's essentially checking the output of `git ls-tree -r --name-only HEAD`.

### Names must be valid UTF-8

Each file / directory name must be valid UTF-8. Any name that fails this check will be reported like this:

```text
ERROR: invalid utf-8 in 'n�r' <Buffer 6e c3 72> (full path: 'a/n�r')
```

In this example, inside the directory `a`, there is a file or directory whose name consists of the three bytes `6e c3 72`. This is not valid UTF-8.

Solution: rename the item to have a valid UTF-8 name.

### Names must be normalized UTF-8

Each file / directory name must be normalized UTF-8. Any name that fails this check will be reported like this:

```text
ERROR: non-normalised utf-8 encoding når' <Buffer 6e 61 cc 8a 72> (full path: 'a/når')
```

In this example, inside the directory `a`, there is a file or directory whose name is "når", encoded as the five bytes `6e 61 cc 8a 72`. While this is valid UTF-8, it is not normalized UTF-8.

Solution: rename the item to use normalized encoding.

Note: when trying to fix this error, some tools might not recognised that anything has actually changed, and therefore they might not let you commit. If this happens, you might find it helpful to solve this by renaming twice: rename to some temporary name, then commit; then rename to the correct name, and commit again.

### Names must be case-insensitively unique within each directory

Within each directory, each file or directory must have a unique name, ignoring case.

For example, it is not permitted to have both a "foo" and a "Foo" in the same directory.

Any combination of names that fails this check will be reported like this:

```text
ERROR: case clash between 'FOO' and 'foo' under directory 'x'
```

Solution: Ensure there are no case clashes.

Note: if `lint-git-tree` is reporting this error, but when looking at your files and directories, you can't see the problem, try looking using `git ls-tree HEAD`.

For example, if `git ls-tree` shows:

```text
100644 blob 98797936214eb95b087a9b842bc9c30b1f29a018  A-FILE
100644 blob 18aa34a98515b843471406d4677c2b02fc5f482a  a-file
```

Once you can see the problem, you should be able to rectify it by manipulating the git index directly: `git rm --cached thing-to-remove`,
then commit.
