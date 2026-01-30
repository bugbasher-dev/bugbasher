import { type LoaderFunctionArgs } from 'react-router'

/**
 * OAuth 2.0 Protected Resource Metadata (RFC 9728)
 *
 * This endpoint provides protected resource metadata for MCP clients.
 * MCP clients use this to discover the authorization server location.
 *
 * Route: /.well-known/oauth-protected-resource
 */
export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url)

	// Use X-Forwarded-Proto to get correct protocol behind proxy
	const forwardedProto =
		request.headers.get('X-Forwarded-Proto') ||
		request.headers.get('x-forwarded-proto')
	const protocol =
		forwardedProto === 'https' || url.hostname.includes('epic-startup.me')
			? 'https:'
			: url.protocol

	const baseUrl = `${protocol}//${url.host}`

	return Response.json(
		{
			// The resource identifier (this MCP server)
			resource: `${baseUrl}/mcp`,
			// The authorization server(s) that protect this resource
			authorization_servers: [`${baseUrl}`],
			// Scopes supported by this resource (optional)
			scopes_supported: ['mcp:read', 'mcp:write'],
			// Bearer token methods supported
			bearer_methods_supported: ['header'],
		},
		{
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'public, max-age=3600',
			},
		},
	)
}
