import { auditService, AuditAction } from '@repo/audit'
import { data } from 'react-router'
import { z } from 'zod'
import { revokeRefreshToken, verifyAccessToken } from '#app/utils/jwt.server.ts'
import { type Route } from './+types/auth.logout.ts'

const LogoutSchema = z.object({
	refreshToken: z.string().optional(),
})

export async function action({ request }: Route.ActionArgs) {
	try {
		// Try to get user ID from authorization header for logging
		let userId: string | undefined
		const authHeader = request.headers.get('Authorization')
		if (authHeader?.startsWith('Bearer ')) {
			const token = authHeader.slice(7)
			try {
				const payload = verifyAccessToken(token)
				userId = payload?.sub
			} catch {
				// Token verification failed, continue without userId
			}
		}

		const body = await request.json()
		const result = LogoutSchema.safeParse(body)

		if (result.success && result.data.refreshToken) {
			// Revoke the refresh token
			await revokeRefreshToken(result.data.refreshToken)
		}

		// Log logout event (SOC 2 CC7.2)
		void auditService.logAuth(
			AuditAction.USER_LOGOUT,
			userId,
			'User logged out via API',
			{ source: 'api' },
			request,
			true,
		)

		return data({
			success: true,
			data: { message: 'Logged out successfully' },
		})
	} catch (error) {
		console.error('Logout error:', error)
		return data(
			{
				success: false,
				error: 'logout_failed',
				message: 'Failed to logout',
			},
			{ status: 500 },
		)
	}
}

export async function loader() {
	return data(
		{
			success: false,
			error: 'method_not_allowed',
			message: 'Use POST method for logout',
		},
		{ status: 405 },
	)
}
