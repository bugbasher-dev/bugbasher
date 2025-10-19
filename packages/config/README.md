# @repo/config

Centralized configuration for the Epic Startup monorepo.

## Brand Configuration

All brand-related strings, descriptions, and metadata are centralized in
`brand.ts`. This ensures consistency across all apps and makes rebranding a
breeze.

### Usage

```typescript
import { brand, getPageTitle, getCopyright } from '@repo/config/brand'

// Use brand name
console.log(brand.name) // "Epic Startup"

// Generate page titles
const title = getPageTitle('Login') // "Login | Epic Startup"

// Use product-specific descriptions
const appDescription = brand.products.app.description

// Email subjects
const subject = brand.email.welcome // "Welcome to Epic Startup!"

// Copyright text
const copyright = getCopyright() // "© 2025 Epic Startup. All rights reserved."
```

### What's Centralized

- **Core Identity**: Brand name, tagline, description
- **URLs**: Main URL, support email
- **Product Descriptions**: App-specific names and descriptions
- **Email Subjects**: Standardized email subject lines
- **AI Configuration**: System prompts for AI assistants
- **Legal**: Company name, copyright year

### Updating the Brand

To rebrand your entire application:

1. Edit `packages/config/brand.ts`
2. Change the values (e.g., `name: 'Your New Brand'`)
3. All apps will automatically use the new values

## Favicons & Static Assets

For favicons and other static assets that need to be shared:

### Option 1: Shared Static Package (Recommended)

Create a `packages/static` package with shared assets:

```
packages/static/
  ├── favicons/
  │   ├── favicon.ico
  │   ├── android-chrome-192x192.png
  │   └── android-chrome-512x512.png
  ├── images/
  │   └── logo.svg
  └── package.json
```

Then copy them during build or reference them directly.

### Option 2: Build-time Copy

Use a build script to copy shared assets from a central location to each app's
public folder.

### Option 3: CDN/Static Host

Host shared assets on a CDN and reference them by URL in all apps.

## ESLint Configuration

Import the shared ESLint preset:

```javascript
import eslintPreset from '@repo/config/eslint-preset'

export default eslintPreset
```
