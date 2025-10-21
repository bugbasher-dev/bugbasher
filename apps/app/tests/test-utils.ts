import { faker } from '@faker-js/faker'
import { prisma } from '#app/utils/db.server.ts'

export async function createTestOrganization(userId: string, role: 'admin' | 'member' | 'viewer' | 'guest' = 'admin') {
	const roleId = `org_role_${role}`
	
	return await prisma.organization.create({
		data: {
			name: faker.company.name(),
			slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
			description: faker.company.catchPhrase(),
			users: {
				create: {
					userId,
					organizationRoleId: roleId
				}
			}
		}
	})
}

export async function createTestOrganizationWithMultipleUsers(users: Array<{ userId: string; role?: 'admin' | 'member' | 'viewer' | 'guest' }>) {
	return await prisma.organization.create({
		data: {
			name: faker.company.name(),
			slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
			description: faker.company.catchPhrase(),
			users: {
				create: users.map(user => ({
					userId: user.userId,
					organizationRoleId: `org_role_${user.role || 'member'}`
				}))
			}
		}
	})
}