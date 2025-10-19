# Shared Favicons Setup

## Option 1: Create a Static Assets Package

### Step 1: Create the package structure

```bash
mkdir -p packages/static/favicons
mkdir -p packages/static/images
```

### Step 2: Create package.json

```json
{
	"name": "@repo/static",
	"version": "0.0.0",
	"private": true,
	"description": "Shared static assets for all apps",
	"files": ["favicons/**", "images/**"]
}
```

### Step 3: Move your favicons

Move your favicon files to `packages/static/favicons/`:

- favicon.ico
- android-chrome-192x192.png
- android-chrome-512x512.png
- apple-touch-icon.png
- etc.

### Step 4: Copy script

Create `packages/static/copy-assets.js`:

```javascript
import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const apps = ['app', 'admin', 'web']
const files = [
	'favicons/favicon.ico',
	'favicons/android-chrome-192x192.png',
	'favicons/android-chrome-512x512.png',
]

apps.forEach((app) => {
	const targetDir = join(__dirname, '../../apps', app, 'public')

	files.forEach((file) => {
		const source = join(__dirname, file)
		const target = join(targetDir, file)

		// Create directory if it doesn't exist
		const targetDirPath = dirname(target)
		if (!existsSync(targetDirPath)) {
			mkdirSync(targetDirPath, { recursive: true })
		}

		copyFileSync(source, target)
		console.log(`Copied ${file} to ${app}`)
	})
})
```

### Step 5: Add to root package.json

```json
{
	"scripts": {
		"copy-assets": "node packages/static/copy-assets.js",
		"postinstall": "npm run copy-assets"
	}
}
```

## Option 2: Symbolic Links (Simpler)

From your workspace root:

```bash
# For each app
cd apps/app/public
rm -rf favicons
ln -s ../../../packages/static/favicons ./favicons

cd ../../admin/public
rm -rf favicons
ln -s ../../../packages/static/favicons ./favicons

cd ../../web/public
rm -rf favicons
ln -s ../../../packages/static/favicons ./favicons
```

## Option 3: CDN Hosting

Host your favicons on a CDN and reference them in your HTML:

```html
<link rel="icon" href="https://cdn.yoursite.com/favicons/favicon.ico" />
```

## Recommended Approach

For a monorepo, I recommend **Option 1** (static package with copy script)
because:

- Works in all environments (including Windows where symlinks can be tricky)
- Clear ownership of assets
- Easy to version control
- Build tools can optimize the copied files per app if needed

## Generating site.webmanifest Dynamically

Instead of static JSON files, generate them from your brand config:

Create `packages/config/manifest.ts`:

```typescript
import { brand } from './brand'

export const generateManifest = (startUrl = '/') => ({
	name: brand.name,
	short_name: brand.shortName,
	start_url: startUrl,
	display: 'standalone',
	background_color: '#ffffff',
	theme_color: '#000000',
	icons: [
		{
			src: '/favicons/android-chrome-192x192.png',
			sizes: '192x192',
			type: 'image/png',
		},
		{
			src: '/favicons/android-chrome-512x512.png',
			sizes: '512x512',
			type: 'image/png',
		},
	],
})
```

Then in your app, create an API route that serves this:

```typescript
// apps/app/app/routes/site.webmanifest.ts
import { generateManifest } from '@repo/config/manifest'

export const loader = () => {
	return Response.json(generateManifest())
}
```
