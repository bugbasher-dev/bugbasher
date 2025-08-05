import { setupServer } from 'msw/node'
import { handlers as tigrisHandlers } from './tigris'

export const server = setupServer(...tigrisHandlers)

// Start the server in development mode
if (process.env.AWS_ACCESS_KEY_ID === 'mock-access-key') {
	server.listen({
		onUnhandledRequest(request, print) {
			// Don't warn about unhandled requests that aren't to our mock storage
			if (!request.url.includes(process.env.AWS_ENDPOINT_URL_S3 || '')) {
				return
			}
			print.warning()
		},
	})
	console.info('🔶 Background jobs mock server started')
}
