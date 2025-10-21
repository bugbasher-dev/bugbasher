import { faker } from '@faker-js/faker'
import { prisma } from '#app/utils/db.server.ts'
import { expect, test } from '#tests/playwright-utils.ts'

test.describe('Organization Management', () => {
	test('Users can create a new organization', async ({ page, login }) => {
		const user = await login()
		
		// Navigate to organizations page
		await page.goto('/organizations')
		await page.waitForLoadState('networkidle')

		// Click create organization button
		await page.getByRole('link', { name: /create organization/i }).click()
		await expect(page).toHaveURL('/organizations/create')

		// Fill in organization details
		const orgName = faker.company.name()
		const orgSlug = faker.helpers.slugify(orgName).toLowerCase()
		const orgDescription = faker.company.catchPhrase()

		await page.getByRole('textbox', { name: /name/i }).fill(orgName)
		await page.getByRole('textbox', { name: /slug/i }).fill(orgSlug)
		await page.getByRole('textbox', { name: /description/i }).fill(orgDescription)

		// Submit the form
		await page.getByRole('button', { name: /create organization/i }).click()

		// Verify organization was created and user is redirected
		await expect(page).toHaveURL(new RegExp(`/${orgSlug}`))
		await expect(page.getByText(orgName)).toBeVisible()

		// Verify organization exists in database
		const createdOrg = await prisma.organization.findFirst({
			where: { slug: orgSlug },
			include: { members: true }
		})
		expect(createdOrg).toBeTruthy()
		expect(createdOrg?.name).toBe(orgName)
		expect(createdOrg?.members).toHaveLength(1)
		expect(createdOrg?.members[0].userId).toBe(user.id)
	})

	test('Users can switch between organizations', async ({ page, login }) => {
		const user = await login()

		// Create two organizations for the user
		const org1 = await prisma.organization.create({
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

		const org2 = await prisma.organization.create({
			data: {
				name: faker.company.name(),
				slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
				description: faker.company.catchPhrase(),
				members: {
					create: {
						userId: user.id,
						role: 'MEMBER'
					}
				}
			}
		})

		// Navigate to first organization
		await page.goto(`/${org1.slug}`)
		await page.waitForLoadState('networkidle')

		// Verify we're in the first organization
		await expect(page.getByText(org1.name)).toBeVisible()

		// Switch to second organization using the organization switcher
		await page.getByRole('button', { name: /switch organization/i }).click()
		await page.getByRole('option', { name: org2.name }).click()

		// Verify we switched to the second organization
		await expect(page).toHaveURL(new RegExp(`/${org2.slug}`))
		await expect(page.getByText(org2.name)).toBeVisible()
	})

	test('Users can view organization settings', async ({ page, login }) => {
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

		// Navigate to organization settings
		await page.goto(`/${org.slug}/settings`)
		await page.waitForLoadState('networkidle')

		// Verify settings page loads with organization details
		await expect(page.getByDisplayValue(org.name)).toBeVisible()
		await expect(page.getByDisplayValue(org.slug)).toBeVisible()
		if (org.description) {
			await expect(page.getByDisplayValue(org.description)).toBeVisible()
		}
	})

	test('Users can update organization details', async ({ page, login }) => {
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

		// Navigate to organization settings
		await page.goto(`/${org.slug}/settings`)
		await page.waitForLoadState('networkidle')

		// Update organization details
		const newName = faker.company.name()
		const newDescription = faker.company.catchPhrase()

		await page.getByRole('textbox', { name: /name/i }).fill(newName)
		await page.getByRole('textbox', { name: /description/i }).fill(newDescription)

		// Save changes
		await page.getByRole('button', { name: /save changes/i }).click()

		// Verify success message or redirect
		await expect(page.getByText(/updated successfully/i)).toBeVisible()

		// Verify changes in database
		const updatedOrg = await prisma.organization.findUnique({
			where: { id: org.id }
		})
		expect(updatedOrg?.name).toBe(newName)
		expect(updatedOrg?.description).toBe(newDescription)
	})

	test('Users can view organization members', async ({ page, login }) => {
		const user = await login()

		// Create additional users
		const member1 = await prisma.user.create({
			data: {
				email: faker.internet.email(),
				username: faker.internet.username(),
				name: faker.person.fullName(),
				roles: { connect: { name: 'user' } }
			}
		})

		const member2 = await prisma.user.create({
			data: {
				email: faker.internet.email(),
				username: faker.internet.username(),
				name: faker.person.fullName(),
				roles: { connect: { name: 'user' } }
			}
		})

		// Create an organization with multiple members
		const org = await prisma.organization.create({
			data: {
				name: faker.company.name(),
				slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
				description: faker.company.catchPhrase(),
				members: {
					create: [
						{ userId: user.id, role: 'OWNER' },
						{ userId: member1.id, role: 'ADMIN' },
						{ userId: member2.id, role: 'MEMBER' }
					]
				}
			}
		})

		// Navigate to organization members page
		await page.goto(`/${org.slug}/settings/members`)
		await page.waitForLoadState('networkidle')

		// Verify all members are displayed
		await expect(page.getByText(user.name || user.username)).toBeVisible()
		await expect(page.getByText(member1.name || member1.username)).toBeVisible()
		await expect(page.getByText(member2.name || member2.username)).toBeVisible()

		// Verify roles are displayed
		await expect(page.getByText('OWNER')).toBeVisible()
		await expect(page.getByText('ADMIN')).toBeVisible()
		await expect(page.getByText('MEMBER')).toBeVisible()
	})

	test('Organization owners can remove members', async ({ page, login }) => {
		const user = await login()

		// Create additional user
		const member = await prisma.user.create({
			data: {
				email: faker.internet.email(),
				username: faker.internet.username(),
				name: faker.person.fullName(),
				roles: { connect: { name: 'user' } }
			}
		})

		// Create an organization with the member
		const org = await prisma.organization.create({
			data: {
				name: faker.company.name(),
				slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
				description: faker.company.catchPhrase(),
				members: {
					create: [
						{ userId: user.id, role: 'OWNER' },
						{ userId: member.id, role: 'MEMBER' }
					]
				}
			}
		})

		// Navigate to organization members page
		await page.goto(`/${org.slug}/settings/members`)
		await page.waitForLoadState('networkidle')

		// Find and click remove button for the member
		const memberRow = page.locator(`[data-testid="member-${member.id}"]`)
		await memberRow.getByRole('button', { name: /remove/i }).click()

		// Confirm removal in dialog
		await page.getByRole('button', { name: /confirm/i }).click()

		// Verify member is no longer displayed
		await expect(page.getByText(member.name || member.username)).not.toBeVisible()

		// Verify member is removed from database
		const orgMembers = await prisma.organizationMember.findMany({
			where: { organizationId: org.id }
		})
		expect(orgMembers).toHaveLength(1)
		expect(orgMembers[0].userId).toBe(user.id)
	})

	test('Users can leave an organization', async ({ page, login }) => {
		const user = await login()

		// Create another user as owner
		const owner = await prisma.user.create({
			data: {
				email: faker.internet.email(),
				username: faker.internet.username(),
				name: faker.person.fullName(),
				roles: { connect: { name: 'user' } }
			}
		})

		// Create an organization where user is a member
		const org = await prisma.organization.create({
			data: {
				name: faker.company.name(),
				slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
				description: faker.company.catchPhrase(),
				members: {
					create: [
						{ userId: owner.id, role: 'OWNER' },
						{ userId: user.id, role: 'MEMBER' }
					]
				}
			}
		})

		// Navigate to organization settings
		await page.goto(`/${org.slug}/settings`)
		await page.waitForLoadState('networkidle')

		// Click leave organization button
		await page.getByRole('button', { name: /leave organization/i }).click()

		// Confirm leaving in dialog
		await page.getByRole('button', { name: /leave/i }).click()

		// Verify user is redirected away from organization
		await expect(page).toHaveURL('/organizations')

		// Verify user is no longer a member in database
		const membership = await prisma.organizationMember.findFirst({
			where: { organizationId: org.id, userId: user.id }
		})
		expect(membership).toBeNull()
	})
})