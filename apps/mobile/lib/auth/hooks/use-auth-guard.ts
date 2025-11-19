import { useRouter, type Href } from 'expo-router'
import { useCallback, useEffect } from 'react'
import { type User } from '../../../types'
import { useAuth } from './use-auth'

/**
 * Hook for protecting  mockAuthSession.AuthRequest.mockImplementation(() => mockRequest as unknown)to sign-in if user is not authenticated
 */
export function useAuthGuard(options?: {
	redirectTo?: string
	requireAuth?: boolean
}) {
	const { isAuthenticated, isLoading, user } = useAuth()
	const router = useRouter()

	const { redirectTo = '/(auth)/sign-in', requireAuth = true } = options || {}

	useEffect(() => {
		// Don't redirect while loading
		if (isLoading) return

		if (requireAuth && !isAuthenticated) {
			router.replace(redirectTo as Href)
		}
	}, [isAuthenticated, isLoading, requireAuth, redirectTo, router])

	return {
		isAuthenticated,
		isLoading,
		user,
		canAccess: !requireAuth || isAuthenticated,
	}
}

/**
 * Hook for protecting routes that should only be accessible to unauthenticated users
 * Redirects authenticated users to the main app
 */
export function useGuestGuard(options?: { redirectTo?: string }) {
	const { isAuthenticated, isLoading, user } = useAuth()
	const router = useRouter()

	const { redirectTo = '/(tabs)' } = options || {}

	useEffect(() => {
		// Don't redirect while loading
		if (isLoading) return

		if (isAuthenticated) {
			router.replace(redirectTo as Href)
		}
	}, [isAuthenticated, isLoading, redirectTo, router])

	return {
		isAuthenticated,
		isLoading,
		user,
		canAccess: !isAuthenticated,
	}
}

/**
 * Hook for conditional authentication guard
 * Allows for more complex authentication logic
 */
export function useConditionalAuthGuard(
	condition: (user: User | null, isAuthenticated: boolean) => boolean,
	options?: {
		redirectTo?: string
		onRedirect?: () => void
	},
) {
	const { isAuthenticated, isLoading, user } = useAuth()
	const router = useRouter()

	const { redirectTo = '/(auth)/sign-in', onRedirect } = options || {}

	useEffect(() => {
		// Don't redirect while loading
		if (isLoading) return

		const shouldRedirect = !condition(user, isAuthenticated)

		if (shouldRedirect) {
			onRedirect?.()
			router.replace(redirectTo as Href)
		}
	}, [
		isAuthenticated,
		isLoading,
		user,
		condition,
		redirectTo,
		onRedirect,
		router,
	])

	return {
		isAuthenticated,
		isLoading,
		user,
		canAccess: condition(user, isAuthenticated),
	}
}

/**
 * Hook for role-based authentication guard
 * Protects routes based on user roles or permissions
 */
export function useRoleGuard(
	allowedRoles: string[],
	options?: {
		redirectTo?: string
		getUserRole?: (user: unknown) => string | string[]
		errors?: unknown
		[key: string]: unknown | string[]
	},
) {
	const { isAuthenticated, isLoading, user } = useAuth()
	const router = useRouter()

	const {
		redirectTo = '/(auth)/sign-in',
		getUserRole = (user: User) =>
			(user as unknown as { role?: string | string[] })?.role || [],
	} = options || {}

	const hasAccess = useCallback(() => {
		if (!isAuthenticated || !user) return false

		const userRoles = getUserRole(user)
		const roles = Array.isArray(userRoles) ? userRoles : [userRoles]

		return allowedRoles.some((role) => roles.includes(role))
	}, [isAuthenticated, user, allowedRoles, getUserRole])

	useEffect(() => {
		// Don't redirect while loading
		if (isLoading) return

		if (!hasAccess()) {
			router.replace(redirectTo as Href)
		}
	}, [
		isAuthenticated,
		isLoading,
		user,
		allowedRoles,
		redirectTo,
		router,
		hasAccess,
	])

	return {
		isAuthenticated,
		isLoading,
		user,
		canAccess: hasAccess(),
		userRoles: user ? getUserRole(user) : [],
	}
}
