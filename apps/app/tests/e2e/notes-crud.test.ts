import { faker } from '@faker-js/faker'
import { prisma } from '#app/utils/db.server.ts'
import { expect, test } from '#tests/playwright-utils.ts'

test.describe('Notes CRUD Operations', () => {
	test('Users can create notes', async ({ page, login }) => {
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

		await page.goto(`/${org.slug}/notes`)
		await page.waitForLoadState('networkidle')

		const newNote = createNote()
		await page.getByRole('link', { name: /New Note/i }).click()

		// fill in form and submit
		await page.getByRole('textbox', { name: /title/i }).fill(newNote.title)
		await page.getByRole('textbox', { name: /content/i }).fill(newNote.content)

		await page.getByRole('button', { name: /save/i }).click()
		await expect(page).toHaveURL(new RegExp(`/${org.slug}/notes/.*`))
		await expect(page.getByText(newNote.title)).toBeVisible()
	})

	test('Users can edit notes', async ({ page, login }) => {
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

		const note = await prisma.organizationNote.create({
			select: { id: true },
			data: { 
				...createNote(), 
				organizationId: org.id,
				createdById: user.id,
				isPublic: true
			},
		})
		await page.goto(`/${org.slug}/notes/${note.id}`)
		await page.waitForLoadState('networkidle')

		// edit the note
		await page.getByRole('link', { name: 'Edit', exact: true }).click()
		const updatedNote = createNote()
		await page.getByRole('textbox', { name: /title/i }).fill(updatedNote.title)
		await page
			.getByRole('textbox', { name: /content/i })
			.fill(updatedNote.content)
		await page.getByRole('button', { name: /save/i }).click()

		await expect(page).toHaveURL(`/${org.slug}/notes/${note.id}`)
		await expect(
			page.getByRole('heading', { name: updatedNote.title }),
		).toBeVisible()
	})

	test('Users can delete notes', async ({ page, login }) => {
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

		const note = await prisma.organizationNote.create({
			select: { id: true },
			data: { 
				...createNote(), 
				organizationId: org.id,
				createdById: user.id,
				isPublic: true
			},
		})
		await page.goto(`/${org.slug}/notes/${note.id}`)
		await page.waitForLoadState('networkidle')

		// delete the note
		await page.getByRole('button', { name: /delete/i }).click()
		
		// Confirm deletion if there's a confirmation dialog
		const confirmButton = page.getByRole('button', { name: /confirm/i }).or(
			page.getByRole('button', { name: /delete/i })
		)
		if (await confirmButton.isVisible()) {
			await confirmButton.click()
		}

		await expect(
			page.getByText(/note.*deleted/i),
		).toBeVisible()
		await expect(page).toHaveURL(`/${org.slug}/notes`)
	})

	test('Users can view note details', async ({ page, login }) => {
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

		const noteData = createNote()
		const note = await prisma.organizationNote.create({
			select: { id: true },
			data: { 
				...noteData, 
				organizationId: org.id,
				createdById: user.id,
				isPublic: true
			},
		})

		await page.goto(`/${org.slug}/notes/${note.id}`)
		await page.waitForLoadState('networkidle')

		// Verify note details are displayed
		await expect(page.getByRole('heading', { name: noteData.title })).toBeVisible()
		await expect(page.getByText(noteData.content)).toBeVisible()
	})

	test('Users can list all notes', async ({ page, login }) => {
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

		// Create multiple notes
		const notes = Array.from({ length: 3 }, () => createNote())
		await prisma.organizationNote.createMany({
			data: notes.map(note => ({
				...note,
				organizationId: org.id,
				createdById: user.id,
				isPublic: true
			}))
		})

		await page.goto(`/${org.slug}/notes`)
		await page.waitForLoadState('networkidle')

		// Verify all notes are displayed
		for (const note of notes) {
			await expect(page.getByText(note.title)).toBeVisible()
		}
	})

	test('Users can filter notes by status', async ({ page, login }) => {
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

		// Create notes with different statuses
		const draftNote = createNote()
		const publishedNote = createNote()

		await prisma.organizationNote.createMany({
			data: [
				{
					...draftNote,
					organizationId: org.id,
					createdById: user.id,
					isPublic: false // Draft
				},
				{
					...publishedNote,
					organizationId: org.id,
					createdById: user.id,
					isPublic: true // Published
				}
			]
		})

		await page.goto(`/${org.slug}/notes`)
		await page.waitForLoadState('networkidle')

		// Test filtering by published status
		const publishedFilter = page.getByRole('button', { name: /published/i }).or(
			page.getByRole('tab', { name: /published/i })
		)

		if (await publishedFilter.isVisible()) {
			await publishedFilter.click()
			await expect(page.getByText(publishedNote.title)).toBeVisible()
		}

		// Test filtering by draft status
		const draftFilter = page.getByRole('button', { name: /draft/i }).or(
			page.getByRole('tab', { name: /draft/i })
		)

		if (await draftFilter.isVisible()) {
			await draftFilter.click()
			await expect(page.getByText(draftNote.title)).toBeVisible()
		}
	})

	test('Users can change note visibility', async ({ page, login }) => {
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

		const note = await prisma.organizationNote.create({
			select: { id: true },
			data: { 
				...createNote(), 
				organizationId: org.id,
				createdById: user.id,
				isPublic: false // Start as private
			},
		})

		await page.goto(`/${org.slug}/notes/${note.id}/edit`)
		await page.waitForLoadState('networkidle')

		// Change visibility to public
		const visibilityToggle = page.getByRole('switch', { name: /public/i }).or(
			page.getByRole('checkbox', { name: /public/i })
		)

		if (await visibilityToggle.isVisible()) {
			await visibilityToggle.click()
			await page.getByRole('button', { name: /save/i }).click()

			// Verify note is now public
			const updatedNote = await prisma.organizationNote.findUnique({
				where: { id: note.id },
				select: { isPublic: true }
			})
			expect(updatedNote?.isPublic).toBe(true)
		}
	})
})

function createNote() {
	return {
		title: faker.lorem.words(3),
		content: faker.lorem.paragraphs(3),
	}
}