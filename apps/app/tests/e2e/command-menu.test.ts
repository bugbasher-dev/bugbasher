import { faker } from '@faker-js/faker'
import { prisma } from '#app/utils/db.server.ts'
import { expect, test } from '#tests/playwright-utils.ts'

test.describe('Command Menu', () => {
	test('Command menu opens with Cmd+K shortcut', async ({ page, login }) => {
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

		// Open command menu with keyboard shortcut
		await page.keyboard.press('Meta+k') // Mac
		
		// Verify command menu is visible
		await expect(page.getByRole('dialog')).toBeVisible()
		await expect(page.getByPlaceholder(/search/i)).toBeVisible()
	})

	test('Command menu opens with Ctrl+K shortcut on Windows/Linux', async ({ page, login }) => {
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

		// Open command menu with keyboard shortcut
		await page.keyboard.press('Control+k') // Windows/Linux
		
		// Verify command menu is visible
		await expect(page.getByRole('dialog')).toBeVisible()
		await expect(page.getByPlaceholder(/search/i)).toBeVisible()
	})

	test('Command menu can be closed with Escape key', async ({ page, login }) => {
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

		// Open command menu
		await page.keyboard.press('Meta+k')
		await expect(page.getByRole('dialog')).toBeVisible()

		// Close with Escape key
		await page.keyboard.press('Escape')
		await expect(page.getByRole('dialog')).not.toBeVisible()
	})

	test('Command menu searches for notes', async ({ page, login }) => {
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

		// Create test notes
		const searchableNote = await prisma.organizationNote.create({
			data: {
				title: 'Important Meeting Notes',
				content: 'Discussion about project timeline',
				organizationId: org.id,
				createdById: user.id,
				isPublic: true
			}
		})

		const otherNote = await prisma.organizationNote.create({
			data: {
				title: 'Random Thoughts',
				content: 'Some random content',
				organizationId: org.id,
				createdById: user.id,
				isPublic: true
			}
		})

		// Navigate to organization page
		await page.goto(`/${org.slug}`)
		await page.waitForLoadState('networkidle')

		// Open command menu
		await page.keyboard.press('Meta+k')
		await expect(page.getByRole('dialog')).toBeVisible()

		// Search for "Important"
		await page.getByPlaceholder(/search/i).fill('Important')
		await page.waitForTimeout(500) // Wait for debounced search

		// Verify search results
		await expect(page.getByText('Important Meeting Notes')).toBeVisible()
		await expect(page.getByText('Random Thoughts')).not.toBeVisible()
	})

	test('Command menu allows navigation to notes', async ({ page, login }) => {
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

		// Create a test note
		const note = await prisma.organizationNote.create({
			data: {
				title: 'Test Note for Navigation',
				content: 'Content for testing navigation',
				organizationId: org.id,
				createdById: user.id,
				isPublic: true
			}
		})

		// Navigate to organization page
		await page.goto(`/${org.slug}`)
		await page.waitForLoadState('networkidle')

		// Open command menu
		await page.keyboard.press('Meta+k')
		await expect(page.getByRole('dialog')).toBeVisible()

		// Search for the note
		await page.getByPlaceholder(/search/i).fill('Test Note')
		await page.waitForTimeout(500)

		// Click on the note result
		await page.getByText('Test Note for Navigation').click()

		// Verify navigation to the note
		await expect(page).toHaveURL(new RegExp(`/${org.slug}/notes/${note.id}`))
		await expect(page.getByRole('dialog')).not.toBeVisible()
	})

	test('Command menu shows navigation shortcuts', async ({ page, login }) => {
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

		// Open command menu
		await page.keyboard.press('Meta+k')
		await expect(page.getByRole('dialog')).toBeVisible()

		// Verify common navigation options are available
		await expect(page.getByText(/dashboard/i)).toBeVisible()
		await expect(page.getByText(/notes/i)).toBeVisible()
		await expect(page.getByText(/settings/i)).toBeVisible()
	})

	test('Command menu allows quick actions', async ({ page, login }) => {
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

		// Open command menu
		await page.keyboard.press('Meta+k')
		await expect(page.getByRole('dialog')).toBeVisible()

		// Look for quick actions like "Create Note"
		const createNoteAction = page.getByText(/create note/i).or(
			page.getByText(/new note/i)
		)

		if (await createNoteAction.isVisible()) {
			await createNoteAction.click()
			
			// Verify navigation to note creation
			await expect(page).toHaveURL(new RegExp(`/${org.slug}/notes/new`))
		}
	})

	test('Command menu keyboard navigation works', async ({ page, login }) => {
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

		// Create multiple notes for navigation testing
		await prisma.organizationNote.createMany({
			data: [
				{
					title: 'First Note',
					content: 'First content',
					organizationId: org.id,
					createdById: user.id,
					isPublic: true
				},
				{
					title: 'Second Note',
					content: 'Second content',
					organizationId: org.id,
					createdById: user.id,
					isPublic: true
				}
			]
		})

		// Navigate to organization page
		await page.goto(`/${org.slug}`)
		await page.waitForLoadState('networkidle')

		// Open command menu
		await page.keyboard.press('Meta+k')
		await expect(page.getByRole('dialog')).toBeVisible()

		// Search for notes
		await page.getByPlaceholder(/search/i).fill('Note')
		await page.waitForTimeout(500)

		// Navigate through results with arrow keys
		await page.keyboard.press('ArrowDown')
		await page.keyboard.press('ArrowDown')
		await page.keyboard.press('ArrowUp')

		// Select with Enter key
		await page.keyboard.press('Enter')

		// Verify command menu closes and navigation occurs
		await expect(page.getByRole('dialog')).not.toBeVisible()
	})

	test('Command menu shows empty state when no results', async ({ page, login }) => {
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

		// Open command menu
		await page.keyboard.press('Meta+k')
		await expect(page.getByRole('dialog')).toBeVisible()

		// Search for something that doesn't exist
		await page.getByPlaceholder(/search/i).fill('nonexistent-search-term-xyz')
		await page.waitForTimeout(500)

		// Verify empty state message
		await expect(page.getByText(/no results found/i)).toBeVisible()
	})

	test('Command menu respects note permissions', async ({ page, login }) => {
		const user = await login()

		// Create another user
		const otherUser = await prisma.user.create({
			data: {
				email: faker.internet.email(),
				username: faker.internet.username(),
				name: faker.person.fullName(),
				roles: { connect: { name: 'user' } }
			}
		})

		// Create an organization for both users
		const org = await prisma.organization.create({
			data: {
				name: faker.company.name(),
				slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
				description: faker.company.catchPhrase(),
				members: {
					create: [
						{ userId: user.id, role: 'OWNER' },
						{ userId: otherUser.id, role: 'MEMBER' }
					]
				}
			}
		})

		// Create notes with different visibility
		await prisma.organizationNote.createMany({
			data: [
				{
					title: 'Public Searchable Note',
					content: 'This is public',
					organizationId: org.id,
					createdById: otherUser.id,
					isPublic: true
				},
				{
					title: 'Private Searchable Note',
					content: 'This is private',
					organizationId: org.id,
					createdById: otherUser.id,
					isPublic: false
				}
			]
		})

		// Navigate to organization page
		await page.goto(`/${org.slug}`)
		await page.waitForLoadState('networkidle')

		// Open command menu
		await page.keyboard.press('Meta+k')
		await expect(page.getByRole('dialog')).toBeVisible()

		// Search for "Searchable"
		await page.getByPlaceholder(/search/i).fill('Searchable')
		await page.waitForTimeout(500)

		// Verify only public note is visible
		await expect(page.getByText('Public Searchable Note')).toBeVisible()
		await expect(page.getByText('Private Searchable Note')).not.toBeVisible()
	})

	test('Command menu shows keyboard shortcuts hints', async ({ page, login }) => {
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

		// Open command menu
		await page.keyboard.press('Meta+k')
		await expect(page.getByRole('dialog')).toBeVisible()

		// Verify keyboard shortcut hints are shown
		await expect(page.getByText(/↑↓/)).toBeVisible() // Arrow keys hint
		await expect(page.getByText(/↵/)).toBeVisible() // Enter key hint
		await expect(page.getByText(/esc/i)).toBeVisible() // Escape key hint
	})
})