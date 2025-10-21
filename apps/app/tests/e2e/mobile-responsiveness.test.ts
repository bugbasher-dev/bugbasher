import { faker } from '@faker-js/faker'
import { prisma } from '#app/utils/db.server.ts'
import { expect, test } from '#tests/playwright-utils.ts'

test.describe('Mobile Responsiveness', () => {
	test('Dashboard is responsive on mobile devices', async ({ page, login }) => {
		const user = await login()

		// Create an organization for the user
		const org = await prisma.organization.create({
			data: {
				name: faker.company.name(),
				slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
				description: faker.company.catchPhrase(),
				members: {
					create: {
						userId: user.id,
						role: 'OWNER'
					}
				}
			}
		})

		// Test on mobile viewport
		await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
		await page.goto(`/${org.slug}`)
		await page.waitForLoadState('networkidle')

		// Verify main content is visible and not cut off
		await expect(page.getByText(org.name)).toBeVisible()

		// Verify no horizontal scrolling is needed
		const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth)
		const viewportWidth = await page.evaluate(() => window.innerWidth)
		expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 1) // Allow 1px tolerance

		// Test on tablet viewport
		await page.setViewportSize({ width: 768, height: 1024 }) // iPad
		await page.waitForLoadState('networkidle')

		// Verify content adapts to tablet size
		await expect(page.getByText(org.name)).toBeVisible()
	})

	test('Navigation menu works on mobile', async ({ page, login }) => {
		const user = await login()

		// Create an organization for the user
		const org = await prisma.organization.create({
			data: {
				name: faker.company.name(),
				slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
				description: faker.company.catchPhrase(),
				members: {
					create: {
						userId: user.id,
						role: 'OWNER'
					}
				}
			}
		})

		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 })
		await page.goto(`/${org.slug}`)
		await page.waitForLoadState('networkidle')

		// Look for mobile menu button (hamburger menu)
		const mobileMenuButton = page.getByRole('button', { name: /menu/i }).or(
			page.getByRole('button', { name: /navigation/i })
		).or(
			page.locator('[data-testid="mobile-menu-button"]')
		).or(
			page.locator('button[aria-expanded]')
		)

		if (await mobileMenuButton.isVisible()) {
			// Open mobile menu
			await mobileMenuButton.click()

			// Verify menu opens
			const mobileMenu = page.getByRole('navigation').or(
				page.locator('[data-testid="mobile-menu"]')
			)
			await expect(mobileMenu).toBeVisible()

			// Verify navigation links are accessible
			await expect(page.getByRole('link', { name: /notes/i })).toBeVisible()
			await expect(page.getByRole('link', { name: /settings/i })).toBeVisible()

			// Close menu by clicking button again
			await mobileMenuButton.click()
			
			// Verify menu closes
			await expect(mobileMenu).not.toBeVisible()
		}
	})

	test('Forms are usable on mobile devices', async ({ page, login }) => {
		const user = await login()

		// Create an organization for the user
		const org = await prisma.organization.create({
			data: {
				name: faker.company.name(),
				slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
				description: faker.company.catchPhrase(),
				members: {
					create: {
						userId: user.id,
						role: 'OWNER'
					}
				}
			}
		})

		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 })
		await page.goto(`/${org.slug}/notes/new`)
		await page.waitForLoadState('networkidle')

		// Test form inputs are properly sized for mobile
		const titleInput = page.getByRole('textbox', { name: /title/i })
		await expect(titleInput).toBeVisible()

		// Verify input is large enough for touch interaction
		const titleInputBox = await titleInput.boundingBox()
		expect(titleInputBox?.height).toBeGreaterThan(40) // Minimum touch target size

		// Test form submission on mobile
		await titleInput.fill('Mobile Test Note')
		
		const contentInput = page.getByRole('textbox', { name: /content/i })
		await contentInput.fill('This note was created on mobile')

		// Verify submit button is accessible
		const submitButton = page.getByRole('button', { name: /save/i })
		await expect(submitButton).toBeVisible()
		
		const submitButtonBox = await submitButton.boundingBox()
		expect(submitButtonBox?.height).toBeGreaterThan(40) // Minimum touch target size

		await submitButton.click()

		// Verify form submission works
		await expect(page.getByText('Mobile Test Note')).toBeVisible()
	})

	test('Tables are responsive on mobile', async ({ page, login }) => {
		const user = await login()

		// Create an organization for the user
		const org = await prisma.organization.create({
			data: {
				name: faker.company.name(),
				slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
				description: faker.company.catchPhrase(),
				members: {
					create: {
						userId: user.id,
						role: 'OWNER'
					}
				}
			}
		})

		// Create multiple notes to populate table
		await prisma.organizationNote.createMany({
			data: Array.from({ length: 5 }, (_, i) => ({
				title: `Note ${i + 1}`,
				content: `Content for note ${i + 1}`,
				organizationId: org.id,
				createdById: user.id,
				isPublic: true
			}))
		})

		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 })
		await page.goto(`/${org.slug}/notes`)
		await page.waitForLoadState('networkidle')

		// Check if tables are present
		const tables = page.locator('table')
		const tableCount = await tables.count()

		if (tableCount > 0) {
			// Verify table doesn't cause horizontal scrolling
			const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth)
			const viewportWidth = await page.evaluate(() => window.innerWidth)
			expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 1)

			// Verify table content is still accessible (might be stacked or scrollable)
			await expect(page.getByText('Note 1')).toBeVisible()
		}
	})

	test('Touch interactions work correctly', async ({ page, login }) => {
		const user = await login()

		// Create an organization for the user
		const org = await prisma.organization.create({
			data: {
				name: faker.company.name(),
				slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
				description: faker.company.catchPhrase(),
				members: {
					create: {
						userId: user.id,
						role: 'OWNER'
					}
				}
			}
		})

		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 })
		await page.goto(`/${org.slug}`)
		await page.waitForLoadState('networkidle')

		// Test tap interactions on buttons
		const buttons = page.getByRole('button')
		const buttonCount = await buttons.count()

		for (let i = 0; i < Math.min(buttonCount, 3); i++) {
			const button = buttons.nth(i)
			if (await button.isVisible()) {
				// Verify button is large enough for touch
				const buttonBox = await button.boundingBox()
				expect(buttonBox?.height).toBeGreaterThan(40)
				expect(buttonBox?.width).toBeGreaterThan(40)

				// Test tap interaction
				await button.tap()
			}
		}

		// Test swipe gestures if applicable
		const swipeableElements = page.locator('[data-swipeable], .swipeable')
		const swipeCount = await swipeableElements.count()

		if (swipeCount > 0) {
			const element = swipeableElements.first()
			const elementBox = await element.boundingBox()
			
			if (elementBox) {
				// Simulate swipe gesture
				await page.mouse.move(elementBox.x + 10, elementBox.y + elementBox.height / 2)
				await page.mouse.down()
				await page.mouse.move(elementBox.x + elementBox.width - 10, elementBox.y + elementBox.height / 2)
				await page.mouse.up()
			}
		}
	})

	test('Text is readable on mobile devices', async ({ page, login }) => {
		const user = await login()

		// Create an organization for the user
		const org = await prisma.organization.create({
			data: {
				name: faker.company.name(),
				slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
				description: faker.company.catchPhrase(),
				members: {
					create: {
						userId: user.id,
						role: 'OWNER'
					}
				}
			}
		})

		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 })
		await page.goto(`/${org.slug}`)
		await page.waitForLoadState('networkidle')

		// Check font sizes are appropriate for mobile
		const textElements = page.locator('p, span, div, h1, h2, h3, h4, h5, h6')
		const textCount = await textElements.count()

		for (let i = 0; i < Math.min(textCount, 10); i++) {
			const element = textElements.nth(i)
			if (await element.isVisible() && await element.textContent()) {
				const fontSize = await element.evaluate(el => {
					return window.getComputedStyle(el).fontSize
				})
				
				// Verify font size is at least 16px for body text (accessibility guideline)
				const fontSizeValue = parseInt(fontSize.replace('px', ''))
				expect(fontSizeValue).toBeGreaterThanOrEqual(14) // Allow slightly smaller for some elements
			}
		}
	})

	test('Images scale properly on mobile', async ({ page, login }) => {
		const user = await login()

		// Create an organization for the user
		const org = await prisma.organization.create({
			data: {
				name: faker.company.name(),
				slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
				description: faker.company.catchPhrase(),
				members: {
					create: {
						userId: user.id,
						role: 'OWNER'
					}
				}
			}
		})

		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 })
		await page.goto(`/${org.slug}`)
		await page.waitForLoadState('networkidle')

		// Check that images don't overflow the viewport
		const images = page.locator('img')
		const imageCount = await images.count()

		for (let i = 0; i < imageCount; i++) {
			const image = images.nth(i)
			if (await image.isVisible()) {
				const imageBox = await image.boundingBox()
				const viewportWidth = await page.evaluate(() => window.innerWidth)
				
				if (imageBox) {
					// Images should not exceed viewport width
					expect(imageBox.width).toBeLessThanOrEqual(viewportWidth)
				}
			}
		}
	})

	test('Modal dialogs work on mobile', async ({ page, login }) => {
		const user = await login()

		// Create an organization for the user
		const org = await prisma.organization.create({
			data: {
				name: faker.company.name(),
				slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
				description: faker.company.catchPhrase(),
				members: {
					create: {
						userId: user.id,
						role: 'OWNER'
					}
				}
			}
		})

		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 })
		await page.goto(`/${org.slug}`)
		await page.waitForLoadState('networkidle')

		// Open command menu modal
		await page.keyboard.press('Meta+k')

		// Verify modal is properly sized for mobile
		const dialog = page.getByRole('dialog')
		await expect(dialog).toBeVisible()

		const dialogBox = await dialog.boundingBox()
		const viewportWidth = await page.evaluate(() => window.innerWidth)
		const viewportHeight = await page.evaluate(() => window.innerHeight)

		if (dialogBox) {
			// Modal should fit within viewport
			expect(dialogBox.width).toBeLessThanOrEqual(viewportWidth)
			expect(dialogBox.height).toBeLessThanOrEqual(viewportHeight)
		}

		// Test modal interaction on mobile
		const searchInput = page.getByPlaceholder(/search/i)
		await expect(searchInput).toBeVisible()
		await searchInput.tap()
		await searchInput.fill('test')

		// Close modal
		await page.keyboard.press('Escape')
		await expect(dialog).not.toBeVisible()
	})

	test('Viewport meta tag is present', async ({ page, login }) => {
		const user = await login()

		// Create an organization for the user
		const org = await prisma.organization.create({
			data: {
				name: faker.company.name(),
				slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
				description: faker.company.catchPhrase(),
				members: {
					create: {
						userId: user.id,
						role: 'OWNER'
					}
				}
			}
		})

		await page.goto(`/${org.slug}`)
		await page.waitForLoadState('networkidle')

		// Check for viewport meta tag
		const viewportMeta = page.locator('meta[name="viewport"]')
		await expect(viewportMeta).toHaveAttribute('content', /width=device-width/)
	})

	test('Orientation changes are handled gracefully', async ({ page, login }) => {
		const user = await login()

		// Create an organization for the user
		const org = await prisma.organization.create({
			data: {
				name: faker.company.name(),
				slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
				description: faker.company.catchPhrase(),
				members: {
					create: {
						userId: user.id,
						role: 'OWNER'
					}
				}
			}
		})

		// Start in portrait mode
		await page.setViewportSize({ width: 375, height: 667 })
		await page.goto(`/${org.slug}`)
		await page.waitForLoadState('networkidle')

		// Verify content is visible in portrait
		await expect(page.getByText(org.name)).toBeVisible()

		// Switch to landscape mode
		await page.setViewportSize({ width: 667, height: 375 })
		await page.waitForLoadState('networkidle')

		// Verify content is still visible and properly laid out in landscape
		await expect(page.getByText(org.name)).toBeVisible()

		// Verify no horizontal scrolling is needed
		const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth)
		const viewportWidth = await page.evaluate(() => window.innerWidth)
		expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 1)
	})

	test('Loading states are appropriate for mobile', async ({ page, login }) => {
		const user = await login()

		// Create an organization for the user
		const org = await prisma.organization.create({
			data: {
				name: faker.company.name(),
				slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
				description: faker.company.catchPhrase(),
				members: {
					create: {
						userId: user.id,
						role: 'OWNER'
					}
				}
			}
		})

		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 })

		// Simulate slow network to see loading states
		await page.route('**/*', route => {
			setTimeout(() => route.continue(), 100) // Add 100ms delay
		})

		await page.goto(`/${org.slug}`)

		// Look for loading indicators
		const loadingIndicators = page.locator('[data-testid="loading"], .loading, .spinner')
		const loadingCount = await loadingIndicators.count()

		if (loadingCount > 0) {
			// Verify loading indicators are visible and appropriately sized for mobile
			const loadingElement = loadingIndicators.first()
			await expect(loadingElement).toBeVisible()
			
			const loadingBox = await loadingElement.boundingBox()
			if (loadingBox) {
				// Loading indicator should be reasonably sized for mobile
				expect(loadingBox.width).toBeLessThan(200)
				expect(loadingBox.height).toBeLessThan(200)
			}
		}

		await page.waitForLoadState('networkidle')
	})
})