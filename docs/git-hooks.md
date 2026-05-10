# Git hooks (optional)

This repo does **not** install Husky or lint-staged by default. To block commits that accidentally include secrets, add a **pre-commit** hook locally.

## Option A: simple pre-commit (recommended)

From the repository root:

**Linux / macOS** — `.git/hooks/pre-commit`:

```sh
#!/bin/sh
npm run check:secrets || exit 1
```

Make it executable: `chmod +x .git/hooks/pre-commit`

**Windows (PowerShell)** — `.git/hooks/pre-commit.bat`:

```bat
@echo off
call npm run check:secrets
if errorlevel 1 exit /b 1
```

## Option B: core.hooksPath (team-shared hooks)

1. Add a folder e.g. `git-hooks/` containing `pre-commit` as above.
2. Run once per clone:

```bash
git config core.hooksPath git-hooks
```

(Commit the hook scripts only if your team agrees on maintaining them.)

## What gets checked

`npm run check:secrets` runs `scripts/check-secrets.mjs` against **tracked** files. It is not a full enterprise secret scanner; combine with host-level scanning (GitHub secret scanning, etc.) for production repos.
