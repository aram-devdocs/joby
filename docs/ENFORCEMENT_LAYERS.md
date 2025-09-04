# Multi-Layer Quality Enforcement

This document describes our multi-layered approach to code quality enforcement,
designed to catch issues as early as possible in the development workflow.

## 🎯 Core Principle: Fail Fast, Fix Early

We enforce quality at multiple stages, with each layer catching different types
of issues. The earlier we catch problems, the easier they are to fix.

## 📊 Enforcement Layers

### Layer 1: Editor/IDE (Immediate Feedback)

**When:** As you type **What:**

- TypeScript errors via language server
- ESLint warnings and errors
- Prettier formatting issues **Tools:** VSCode extensions, IDE integrations

### Layer 2: Pre-Commit (Before Creating Commits)

**When:** `git commit` **What:**

1. **Console.log Detection** - Fails immediately if found
2. **TODO/FIXME Detection** - Warns but doesn't block
3. **Lint-Staged** - Runs on staged files only:
   - Prettier formatting
   - ESLint with `--max-warnings 0`
   - TypeScript type checking for individual files
4. **Package-Level Type Checks** - For affected packages
5. **Build Verification** - Quick build for critical packages (ui, browser)

**Why This Order?**

- Console.logs fail fast (most common oversight)
- Format/lint issues are auto-fixed where possible
- TypeScript catches type errors before they enter history
- Build verification ensures no broken code is committed

### Layer 3: Pre-Push (Before Sharing Code)

**When:** `git push` **What:**

- Full project type checking
- Complete ESLint validation
- Test suite execution
- Full build verification
- Security audit

### Layer 4: Pull Request (Before Merging)

**When:** PR created/updated **What:**

- All pre-push checks
- Code coverage requirements
- Bundle size analysis
- Performance benchmarks
- Cross-browser testing

### Layer 5: Main Branch Protection

**When:** Attempting to merge **What:**

- Required PR reviews
- All CI checks must pass
- No direct pushes
- Linear history enforcement

## 🚀 Performance Optimizations

### Incremental Checking

- **Lint-staged**: Only checks files you're committing
- **TypeScript**: Uses incremental compilation
- **Affected Packages**: Only builds/tests changed packages
- **Parallel Execution**: Runs independent checks simultaneously

### Smart Caching

- Turbo caches successful builds and tests
- ESLint cache for unchanged files
- TypeScript incremental build info

## 📝 Common Scenarios

### Scenario 1: Quick Fix

```bash
# You make a small fix
git add src/component.tsx
git commit -m "fix: resolve button alignment"
# ✅ Runs in <5 seconds (only checks one file)
```

### Scenario 2: Feature Development

```bash
# You add a new feature
git add src/features/newFeature/
git commit -m "feat: add user dashboard"
# ✅ Runs in 10-15 seconds (checks multiple files, builds affected package)
```

### Scenario 3: Refactoring

```bash
# You refactor core types
git add packages/types/
git commit -m "refactor: improve type definitions"
# ✅ Runs full type checking for affected packages
# May take 20-30 seconds but prevents type errors across codebase
```

## 🔧 Manual Commands

For manual checking during development:

```bash
# Check types for staged files only
pnpm check-types:staged

# Watch mode for continuous type checking
pnpm check-types:watch

# Check specific package
pnpm check-types --filter @packages/ui

# Run all pre-commit checks manually
.husky/pre-commit

# Run all pre-push checks manually
.husky/pre-push
```

## 💡 Best Practices

1. **Fix Issues Immediately**: Don't use `--no-verify` unless absolutely
   necessary
2. **Use Watch Mode**: Keep `pnpm check-types:watch` running during development
3. **Small Commits**: Smaller commits = faster checks
4. **Clean as You Go**: Fix warnings before they become errors

## 🚨 Troubleshooting

### "Pre-commit is taking too long"

- Check if you're committing too many files at once
- Consider splitting into smaller commits
- Use `git add -p` for partial staging

### "TypeScript errors in unrelated files"

- Run `pnpm check-types` to find all errors
- Fix them in a separate commit before your changes

### "Build keeps failing"

- Ensure dependencies are up to date: `pnpm install`
- Clear caches: `turbo daemon clean`
- Check for circular dependencies

## 📊 Metrics

Our enforcement pipeline aims for:

- **Pre-commit**: < 10 seconds for typical changes
- **Pre-push**: < 30 seconds for full validation
- **CI Pipeline**: < 5 minutes for complete suite
- **Zero false positives**: All failures are real issues

## 🔄 Continuous Improvement

This enforcement strategy evolves based on:

- Developer feedback
- Common error patterns
- Performance metrics
- New tooling capabilities

Last updated: 2024
