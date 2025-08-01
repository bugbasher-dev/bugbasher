import { webcrypto as crypto } from 'node:crypto'
import { OrganizationInviteEmail } from '@repo/email'
import { prisma } from '#app/utils/db.server'
import { sendEmail } from '#app/utils/email.server'
import { markStepCompleted } from '#app/utils/onboarding'

export async function createOrganizationInvitation({
	organizationId,
	email,
	role = 'member',
	inviterId,
}: {
	organizationId: string
	email: string
	role?: string
	inviterId: string
}) {
	const token = crypto.randomUUID()
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days

	// Check if invitation already exists
	const existingInvitation = await prisma.organizationInvitation.findUnique({
		where: {
			email_organizationId: {
				email,
				organizationId,
			},
		},
	})

	const invitation = await prisma.organizationInvitation.upsert({
		where: {
			email_organizationId: {
				email,
				organizationId,
			},
		},
		update: {
			token,
			role,
			expiresAt,
			inviterId,
		},
		create: {
			email,
			organizationId,
			token,
			role,
			expiresAt,
			inviterId,
		},
	})

	// Track onboarding step completion for inviting members
	if (!existingInvitation) {
		try {
			await markStepCompleted(inviterId, organizationId, 'invite_members', {
				completedVia: 'member_invitation',
				invitedEmail: email,
				role,
			})
		} catch (error) {
			// Don't fail the invitation if onboarding tracking fails
			console.error('Failed to track member invitation onboarding step:', error)
		}
	}

	return { invitation, isNewInvitation: !existingInvitation }
}

export async function sendOrganizationInvitationEmail({
	invitation,
	organizationName,
	inviterName,
}: {
	invitation: { token: string; email: string }
	organizationName: string
	inviterName: string
}) {
	const baseUrl =
		process.env.NODE_ENV === 'production'
			? 'https://yourapp.com' // Replace with your actual domain
			: 'http://localhost:3001'

	const inviteUrl = `${baseUrl}/join/${invitation.token}`

	return sendEmail({
		to: invitation.email,
		subject: `You're invited to join ${organizationName}`,
		react: OrganizationInviteEmail({
			inviteUrl,
			organizationName,
			inviterName,
		}),
	})
}

export async function getOrganizationInvitations(organizationId: string) {
	return prisma.organizationInvitation.findMany({
		where: {
			organizationId,
			expiresAt: {
				gte: new Date(),
			},
		},
		include: {
			inviter: {
				select: {
					name: true,
					email: true,
				},
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
	})
}

export async function deleteOrganizationInvitation(invitationId: string) {
	return prisma.organizationInvitation.delete({
		where: {
			id: invitationId,
		},
	})
}

export async function getPendingInvitationsByEmail(email: string) {
	return prisma.organizationInvitation.findMany({
		where: {
			email: email.toLowerCase(),
			expiresAt: {
				gte: new Date(),
			},
		},
		include: {
			organization: true,
		},
		orderBy: {
			createdAt: 'desc',
		},
	})
}

export async function acceptInvitationByEmail(email: string, userId: string) {
	const invitations = await getPendingInvitationsByEmail(email)

	if (invitations.length === 0) {
		return []
	}

	const results = []

	for (const invitation of invitations) {
		// Check if user is already a member
		const existingMember = await prisma.userOrganization.findUnique({
			where: {
				userId_organizationId: {
					userId,
					organizationId: invitation.organizationId,
				},
			},
		})

		if (existingMember) {
			// Delete the invitation since user is already a member
			await prisma.organizationInvitation.delete({
				where: { id: invitation.id },
			})
			results.push({
				organization: invitation.organization,
				alreadyMember: true,
			})
		} else {
			// Add user to organization and delete invitation
			await prisma.$transaction([
				prisma.userOrganization.create({
					data: {
						userId,
						organizationId: invitation.organizationId,
						role: invitation.role,
						active: true,
					},
				}),
				prisma.organizationInvitation.delete({
					where: { id: invitation.id },
				}),
			])
			results.push({
				organization: invitation.organization,
				alreadyMember: false,
			})
		}
	}

	return results
}

export async function validateAndAcceptInvitation(
	token: string,
	userId: string,
) {
	const invitation = await prisma.organizationInvitation.findUnique({
		where: { token },
		include: {
			organization: true,
		},
	})

	if (!invitation) {
		throw new Error('Invitation not found')
	}

	if (invitation.expiresAt && invitation.expiresAt < new Date()) {
		throw new Error('Invitation has expired')
	}

	// Check if user is already a member
	const existingMember = await prisma.userOrganization.findUnique({
		where: {
			userId_organizationId: {
				userId,
				organizationId: invitation.organizationId,
			},
		},
	})

	if (existingMember) {
		// Delete the invitation since user is already a member
		await prisma.organizationInvitation.delete({
			where: { id: invitation.id },
		})
		return { organization: invitation.organization, alreadyMember: true }
	}

	// Add user to organization and delete invitation
	await prisma.$transaction([
		prisma.userOrganization.create({
			data: {
				userId,
				organizationId: invitation.organizationId,
				role: invitation.role,
				active: true,
			},
		}),
		prisma.organizationInvitation.delete({
			where: { id: invitation.id },
		}),
	])

	return { organization: invitation.organization, alreadyMember: false }
}

// Invite Link Functions
export async function createOrganizationInviteLink({
	organizationId,
	role = 'member',
	createdById,
}: {
	organizationId: string
	role?: string
	createdById: string
}) {
	const token = crypto.randomUUID()

	const inviteLink = await prisma.organizationInviteLink.upsert({
		where: {
			organizationId_createdById: {
				organizationId,
				createdById,
			},
		},
		update: {
			token,
			role,
			isActive: true,
		},
		create: {
			organizationId,
			token,
			role,
			createdById,
		},
	})

	return inviteLink
}

export async function getOrganizationInviteLink(organizationId: string, createdById: string) {
	return prisma.organizationInviteLink.findUnique({
		where: {
			organizationId_createdById: {
				organizationId,
				createdById,
			},
		},
	})
}

export async function getAllOrganizationInviteLinks(organizationId: string) {
	return prisma.organizationInviteLink.findMany({
		where: {
			organizationId,
			isActive: true,
		},
		include: {
			createdBy: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
	})
}

export async function deactivateOrganizationInviteLink(organizationId: string, createdById: string) {
	return prisma.organizationInviteLink.update({
		where: {
			organizationId_createdById: {
				organizationId,
				createdById,
			},
		},
		data: {
			isActive: false,
		},
	})
}

export async function validateInviteLink(token: string) {
	const inviteLink = await prisma.organizationInviteLink.findUnique({
		where: { token },
		include: {
			organization: true,
		},
	})

	if (!inviteLink) {
		throw new Error('Invite link not found')
	}

	if (!inviteLink.isActive) {
		throw new Error('Invite link is no longer active')
	}

	return inviteLink
}

export async function createInvitationFromLink(
	token: string,
	userEmail: string,
) {
	const inviteLink = await validateInviteLink(token)

	// Create a pending invitation for this user, including who invited them
	const invitation = await prisma.organizationInvitation.upsert({
		where: {
			email_organizationId: {
				email: userEmail.toLowerCase(),
				organizationId: inviteLink.organizationId,
			},
		},
		update: {
			role: inviteLink.role,
			token: crypto.randomUUID(),
			expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
			inviterId: inviteLink.createdById, // Track who invited them
		},
		create: {
			email: userEmail.toLowerCase(),
			organizationId: inviteLink.organizationId,
			role: inviteLink.role,
			token: crypto.randomUUID(),
			expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
			inviterId: inviteLink.createdById, // Track who invited them
		},
		include: {
			organization: true,
			inviter: {
				select: {
					name: true,
					email: true,
				},
			},
		},
	})

	return invitation
}

export async function validateAndAcceptInviteLink(
	token: string,
	userId: string,
) {
	const inviteLink = await prisma.organizationInviteLink.findUnique({
		where: { token },
		include: {
			organization: true,
		},
	})

	if (!inviteLink) {
		throw new Error('Invite link not found')
	}

	if (!inviteLink.isActive) {
		throw new Error('Invite link is no longer active')
	}

	// Check if user is already a member
	const existingMember = await prisma.userOrganization.findUnique({
		where: {
			userId_organizationId: {
				userId,
				organizationId: inviteLink.organizationId,
			},
		},
	})

	if (existingMember) {
		return { organization: inviteLink.organization, alreadyMember: true }
	}

	// Add user to organization
	await prisma.userOrganization.create({
		data: {
			userId,
			organizationId: inviteLink.organizationId,
			role: inviteLink.role,
			active: true,
		},
	})

	return { organization: inviteLink.organization, alreadyMember: false }
}
