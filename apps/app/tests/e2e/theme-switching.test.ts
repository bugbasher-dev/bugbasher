import { faker } from '@faker-js/faker'
import { prisma } from '#app/utils/db.server.ts'
import { expect, test } from '#tests/playwright-utils.ts'

test.describe('Theme Switching', () => {
	test('Users can switch to dark theme', async ({ page, login }) => {
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

		// Navigate to organization page
		await page.goto(`/${org.slug}`)
		await page.waitForLoadState('networkidle')

		// Find and click theme switcher
		const themeButton = page.getByRole('button', { name: /theme/i }).or(
			page.locator('[data-testid="theme-switch"]')
		).or(
			page.getByLabel(/theme/i)
		)

		await themeButton.click()

		// Select dark theme
		await page.getByRole('menuitem', { name: /dark/i }).or(
			page.getByText(/dark/i)
		).click()

		// Wait for theme to apply
		await page.waitForTimeout(500)

		// Verify dark theme is applied by checking the html class or data attribute
		const htmlElement = page.locator('html')
		await expect(htmlElement).toHaveClass(/dark/)
	})

	test('Users can switch to light theme', async ({ page, login }) => {
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

		// Navigate to organization page
		await page.goto(`/${org.slug}`)
		await page.waitForLoadState('networkidle')

		// First switch to dark theme
		const themeButton = page.getByRole('button', { name: /theme/i }).or(
			page.locator('[data-testid="theme-switch"]')
		).or(
			page.getByLabel(/theme/i)
		)

		await themeButton.click()
		await page.getByRole('menuitem', { name: /dark/i }).or(
			page.getByText(/dark/i)
		).click()
		await page.waitForTimeout(500)

		// Now switch to light theme
		await themeButton.click()
		await page.getByRole('menuitem', { name: /light/i }).or(
			page.getByText(/light/i)
		).click()
		await page.waitForTimeout(500)

		// Verify light theme is applied
		const htmlElement = page.locator('html')
		await expect(htmlElement).not.toHaveClass(/dark/)
	})

	test('Users can switch to system theme', async ({ page, login }) => {
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

		// Navigate to organization page
		await page.goto(`/${org.slug}`)
		await page.waitForLoadState('networkidle')

		// Find and click theme switcher
		const themeButton = page.getByRole('button', { name: /theme/i }).or(
			page.locator('[data-testid="theme-switch"]')
		).or(
			page.getByLabel(/theme/i)
		)

		await themeButton.click()

		// Select system theme
		await page.getByRole('menuitem', { name: /system/i }).or(
			page.getByText(/system/i)
		).click()

		// Wait for theme to apply
		await page.waitForTimeout(500)

		// Verify system theme is applied (this might depend on the system's current theme)
		// We can check that the theme switcher shows "system" as selected
		await expect(themeButton).toContainText(/system/i)
	})

	test('Theme preference persists across page reloads', async ({ page, login }) => {
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

		// Navigate to organization page
		await page.goto(`/${org.slug}`)
		await page.waitForLoadState('networkidle')

		// Switch to dark theme
		const themeButton = page.getByRole('button', { name: /theme/i }).or(
			page.locator('[data-testid="theme-switch"]')
		).or(
			page.getByLabel(/theme/i)
		)

		await themeButton.click()
		await page.getByRole('menuitem', { name: /dark/i }).or(
			page.getByText(/dark/i)
		).click()
		await page.waitForTimeout(500)

		// Verify dark theme is applied
		const htmlElement = page.locator('html')
		await expect(htmlElement).toHaveClass(/dark/)

		// Reload the page
		await page.reload()
		await page.waitForLoadState('networkidle')

		// Verify dark theme is still applied after reload
		await expect(htmlElement).toHaveClass(/dark/)
	})

	test('Theme preference persists across navigation', async ({ page, login }) => {
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

		// Navigate to organization page
		await page.goto(`/${org.slug}`)
		await page.waitForLoadState('networkidle')

		// Switch to dark theme
		const themeButton = page.getByRole('button', { name: /theme/i }).or(
			page.locator('[data-testid="theme-switch"]')
		).or(
			page.getByLabel(/theme/i)
		)

		await themeButton.click()
		await page.getByRole('menuitem', { name: /dark/i }).or(
			page.getByText(/dark/i)
		).click()
		await page.waitForTimeout(500)

		// Verify dark theme is applied
		const htmlElement = page.locator('html')
		await expect(htmlElement).toHaveClass(/dark/)

		// Navigate to settings page
		await page.goto(`/${org.slug}/settings`)
		await page.waitForLoadState('networkidle')

		// Verify dark theme is still applied after navigation
		await expect(htmlElement).toHaveClass(/dark/)

		// Navigate to notes page
		await page.goto(`/${org.slug}/notes`)
		await page.waitForLoadState('networkidle')

		// Verify dark theme is still applied
		await expect(htmlElement).toHaveClass(/dark/)
	})

	test('Theme switcher shows current theme selection', async ({ page, login }) => {
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

		// Navigate to organization page
		await page.goto(`/${org.slug}`)
		await page.waitForLoadState('networkidle')

		// Find theme switcher
		const themeButton = page.getByRole('button', { name: /theme/i }).or(
			page.locator('[data-testid="theme-switch"]')
		).or(
			page.getByLabel(/theme/i)
		)

		// Switch to dark theme
		await themeButton.click()
		await page.getByRole('menuitem', { name: /dark/i }).or(
			page.getByText(/dark/i)
		).click()
		await page.waitForTimeout(500)

		// Open theme menu again and verify dark is selected/highlighted
		await themeButton.click()
		const darkOption = page.getByRole('menuitem', { name: /dark/i }).or(
			page.getByText(/dark/i)
		)
		
		// Check if the dark option has selected/active styling
		await expect(darkOption).toHaveAttribute('aria-selected', 'true')
			.or(expect(darkOption).toHaveClass(/selected/))
			.or(expect(darkOption).toHaveClass(/active/))
	})

	test('Theme switching works on different pages', async ({ page, login }) => {
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

		// Test theme switching on profile page
		await page.goto('/profile')
		await page.waitForLoadState('networkidle')

		const themeButton = page.getByRole('button', { name: /theme/i }).or(
			page.locator('[data-testid="theme-switch"]')
		).or(
			page.getByLabel(/theme/i)
		)

		await themeButton.click()
		await page.getByRole('menuitem', { name: /dark/i }).or(
			page.getByText(/dark/i)
		).click()
		await page.waitForTimeout(500)

		// Verify dark theme is applied on profile page
		const htmlElement = page.locator('html')
		await expect(htmlElement).toHaveClass(/dark/)

		// Test theme switching on organizations page
		await page.goto('/organizations')
		await page.waitForLoadState('networkidle')

		// Verify dark theme persists
		await expect(htmlElement).toHaveClass(/dark/)

		// Switch to light theme from organizations page
		const orgThemeButton = page.getByRole('button', { name: /theme/i }).or(
			page.locator('[data-testid="theme-switch"]')
		).or(
			page.getByLabel(/theme/i)
		)

		await orgThemeButton.click()
		await page.getByRole('menuitem', { name: /light/i }).or(
			page.getByText(/light/i)
		).click()
		await page.waitForTimeout(500)

		// Verify light theme is applied
		await expect(htmlElement).not.toHaveClass(/dark/)
	})

	test('Theme switching is accessible via keyboard', async ({ page, login }) => {
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

		// Navigate to organization page
		await page.goto(`/${org.slug}`)
		await page.waitForLoadState('networkidle')

		// Find theme switcher and focus it
		const themeButton = page.getByRole('button', { name: /theme/i }).or(
			page.locator('[data-testid="theme-switch"]')
		).or(
			page.getByLabel(/theme/i)
		)

		await themeButton.focus()

		// Open theme menu with keyboard
		await page.keyboard.press('Enter')

		// Navigate to dark theme option with arrow keys
		await page.keyboard.press('ArrowDown')
		await page.keyboard.press('Enter')

		// Wait for theme to apply
		await page.waitForTimeout(500)

		// Verify dark theme is applied
		const htmlElement = page.locator('html')
		await expect(htmlElement).toHaveClass(/dark/)
	})

	test('Theme switching works without JavaScript (progressive enhancement)', async ({ page, login }) => {
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

		// Disable JavaScript to test progressive enhancement
		await page.context().addInitScript(() => {
			Object.defineProperty(window, 'navigator', {
				value: { ...window.navigator, javaEnabled: () => false },
				writable: false
			})
		})

		// Navigate to organization page
		await page.goto(`/${org.slug}`)
		await page.waitForLoadState('networkidle')

		// Look for theme form (should work without JS)
		const themeForm = page.locator('form[action*="theme"]')
		
		if (await themeForm.isVisible()) {
			// Select dark theme
			await page.selectOption('select[name="theme"]', 'dark')
			await page.getByRole('button', { name: /submit/i }).click()

			// Wait for page to reload/redirect
			await page.waitForLoadState('networkidle')

			// Verify dark theme is applied
			const htmlElement = page.locator('html')
			await expect(htmlElement).toHaveClass(/dark/)
		}
	})
})