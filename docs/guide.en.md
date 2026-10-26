## What it's for

Writing release notes by hand takes time and changes get forgotten. If your commit messages follow the "conventional commits" convention (`feat:`, `fix:`, `perf:`…), this script produces a clean Markdown changelog, grouped by type, between two Git references.

## Before you start

- Git installed and a repository with history.
- Commit messages shaped like `type(scope): description`. A `!` after the type (`feat!:`) or a `BREAKING CHANGE:` line in the body marks a breaking change.

## Step by step

1. From the repository root:
   ```bash
   node src/git-changelog.mjs --from v1.1.0 --to HEAD --title "v1.2.0"
   ```
2. Without `--from`, the script starts at the latest tag; with no tag, at the whole history.
3. Add `--out CHANGELOG.md` to write a file, or paste the result into the release page.

## Reading the output

Sections appear in this order: breaking changes, features, fixes, performance, refactoring, documentation, tests, build, continuous integration, maintenance. Commits that do not follow the convention go under "Other changes": a sign that messages need more care.

## Automating it

On every tag, in CI: generate the changelog and attach it to the release. Merge commits are ignored.

## Pitfalls

- The script **reads** your history; it never rewrites it, and creates no tag or commit.
- A badly typed message (`feature:` instead of `feat:`) lands in "Other changes".
