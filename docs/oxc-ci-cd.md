# CI/CD with Oxc

## Overview

The CI/CD pipeline has been optimized to use Oxc for fast linting feedback while
maintaining ESLint's comprehensive checks.

## Pipeline Configuration

### Format Job (Parallel)

```yaml
format:
  name: 💅 Prettier
  steps:
    - Checkout & Setup
    - Run: npm run format:check
```

**Time:** ~31s **Fails if:** Code is not formatted

### Lint Job (Parallel)

```yaml
lint:
  name: 🔬 Lint
  steps:
    - Checkout & Setup
    - Database Setup
    - Run: npm run lint # Runs: oxlint . && eslint .
```

**Time:** ~58s (same as before) **Fails if:**

- Oxc finds issues (~50s)
- ESLint finds issues (~58s)

## How It Works

### The `npm run lint` Command

```json
{
	"scripts": {
		"lint": "npm run lint:oxc && nx run-many -t lint"
	}
}
```

This single command:

1. Runs `oxlint .` (117ms)
2. If Oxc passes, runs ESLint via Nx
3. If Oxc fails, stops immediately (fail-fast)

### Time Breakdown

```
Setup (30s)
  ↓
Database (20s)
  ↓
Oxc (0.1s) ⚡
  ↓
  ├─ Issues found? → ❌ FAIL at ~50s
  └─ No issues? → Continue
       ↓
     ESLint (8s)
       ↓
       ├─ Issues found? → ❌ FAIL at ~58s
       └─ No issues? → ✅ PASS at ~58s
```

## Benefits

### 1. No Time Increase

- **Before:** ESLint only (~58s)
- **After:** Oxc + ESLint (~58s)
- **Oxc overhead:** 117ms (negligible)

### 2. Faster Failures

- **Common issues:** Caught by Oxc at ~50s
- **Complex issues:** Caught by ESLint at ~58s
- **Savings:** 8s per failed build

### 3. Better Feedback

Developers know exactly what failed:

- "Oxc found unused imports" (quick fix)
- "ESLint found React Hooks violation" (needs review)

## Comparison

### Before (ESLint Only)

```
┌─────────────────────────────────────┐
│ Lint Job                            │
│ ├─ Setup (30s)                      │
│ ├─ Database (20s)                   │
│ └─ ESLint (8s)                      │
│                                     │
│ Total: 58s                          │
│ Fail time: 58s (always)             │
└─────────────────────────────────────┘
```

### After (Oxc + ESLint)

```
┌─────────────────────────────────────┐
│ Lint Job                            │
│ ├─ Setup (30s)                      │
│ ├─ Database (20s)                   │
│ ├─ Oxc (0.1s) ⚡                    │
│ └─ ESLint (8s)                      │
│                                     │
│ Total: 58s (same!)                  │
│ Fail time: 50s (if Oxc fails)       │
│ Fail time: 58s (if ESLint fails)    │
└─────────────────────────────────────┘
```

## Cost Analysis

### Scenario: 100 PRs/month

**Assumptions:**

- 30% of PRs have lint issues
- 80% of lint issues caught by Oxc
- 20% of lint issues caught by ESLint

**Before:**

- 30 failed builds × 58s = 1,740s = 29 minutes

**After:**

- 24 Oxc failures × 50s = 1,200s = 20 minutes
- 6 ESLint failures × 58s = 348s = 6 minutes
- Total: 26 minutes

**Savings:** 3 minutes/month (10% reduction in failed build time)

## Local Development Alignment

The CI/CD matches local development:

```bash
# Local
npm run format:check    # Same as CI format job
npm run lint            # Same as CI lint job

# CI
- name: 💅 Format check
  run: npm run format:check

- name: 🔬 Lint
  run: npm run lint
```

## Monitoring

### Success Indicators

- ✅ Format job passes
- ✅ Lint job passes (Oxc + ESLint)
- ✅ No time increase

### Failure Patterns

- ❌ Format fails → Run `npm run format` locally
- ❌ Oxc fails → Run `npm run lint:oxc:fix` locally
- ❌ ESLint fails → Run `npm run lint` locally

## FAQ

### Q: Are we running Oxc twice?

**A:** No! `npm run lint` runs Oxc once, then ESLint.

### Q: Does this increase CI time?

**A:** No! Oxc adds only 117ms (negligible).

### Q: Why not run them separately?

**A:** Running them together ensures fail-fast behavior and matches local
development.

### Q: What if I only want to run Oxc?

**A:** Use `npm run lint:oxc` locally for quick checks.

## Summary

✅ **No time increase** - Oxc adds 117ms ✅ **Faster failures** - 8s savings on
Oxc failures ✅ **Better feedback** - Know which tool found issues ✅ **Matches
local** - Same commands everywhere

The CI/CD pipeline is optimized for speed without sacrificing quality! 🚀
