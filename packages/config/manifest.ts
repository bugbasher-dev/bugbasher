import { brand } from './brand'

export interface ManifestIcon {
	src: string
	sizes: string
	type: string
	purpose?: string
}

export interface WebManifest {
	name: string
	short_name: string
	start_url: string
	display: string
	background_color: string
	theme_color: string
	description: string
	icons: ManifestIcon[]
}

/**
 * Generate a web app manifest using centralized brand configuration
 * @param startUrl - The start URL for the app (default: '/')
 * @param themeColor - Theme color for the app (default: '#000000')
 * @param backgroundColor - Background color for the app (default: '#ffffff')
 */
export const generateManifest = (
	startUrl = '/',
	themeColor = '#000000',
	backgroundColor = '#ffffff',
): WebManifest => ({
	name: brand.name,
	short_name: brand.shortName,
	start_url: startUrl,
	display: 'standalone',
	background_color: backgroundColor,
	theme_color: themeColor,
	description: brand.description,
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

/**
 * Generate a product-specific manifest
 */
export const generateProductManifest = (
	product: keyof typeof brand.products,
	startUrl = '/',
	themeColor = '#000000',
	backgroundColor = '#ffffff',
): WebManifest => {
	const productConfig = brand.products[product]
	return {
		name: productConfig.name,
		short_name: productConfig.name,
		start_url: startUrl,
		display: 'standalone',
		background_color: backgroundColor,
		theme_color: themeColor,
		description: productConfig.description,
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
	}
}
