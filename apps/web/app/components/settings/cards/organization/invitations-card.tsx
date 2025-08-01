import { OrganizationInvitations } from '#app/components/organization-invitations'

interface OrganizationInvitation {
	id: string
	email: string
	role: string
	createdAt: Date
	inviter?: { name: string | null; email: string } | null
}

interface OrganizationInviteLink {
	id: string
	token: string
	role: string
	isActive: boolean
	createdAt: Date
}

export function InvitationsCard({
	pendingInvitations,
	inviteLink,
	actionData,
}: {
	pendingInvitations: OrganizationInvitation[]
	inviteLink?: OrganizationInviteLink | null
	actionData?: any
}) {
	return (
		<OrganizationInvitations
			pendingInvitations={pendingInvitations}
			inviteLink={inviteLink}
			actionData={actionData}
		/>
	)
}
