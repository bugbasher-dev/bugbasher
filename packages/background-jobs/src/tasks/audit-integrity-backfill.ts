/**
 * One-time background job to backfill integrity hashes for existing audit logs
 *
 * This job adds HMAC-SHA256 integrity hashes to audit logs that were created
 * before the integrity protection feature was implemented.
 *
 * SOC 2 CC7.2 Compliance - Log Integrity Protection
 *
 * Usage:
 *   - Trigger manually: await auditIntegrityBackfill.trigger({ dryRun: true })
 *   - Or run via Trigger.dev dashboard
 *
 * IMPORTANT: Run with dryRun: true first to see how many logs would be updated.
 */

import { task, logger } from '@trigger.dev/sdk/v3'
import { backfillIntegrityHashes } from '@repo/audit'

export const auditIntegrityBackfill = task({
	id: 'audit-integrity-backfill',
	// Long-running task - may process many records
	maxDuration: 3600, // 1 hour max
	run: async (payload: { dryRun?: boolean; batchSize?: number }) => {
		const { dryRun = true, batchSize = 100 } = payload

		logger.info('Starting audit log integrity hash backfill', {
			dryRun,
			batchSize,
		})

		if (dryRun) {
			logger.warn(
				'DRY RUN MODE: No changes will be made. Set dryRun: false to apply changes.',
			)
		}

		try {
			const result = await backfillIntegrityHashes({
				batchSize,
				dryRun,
			})

			logger.info('Audit log integrity backfill completed', {
				processed: result.processed,
				updated: result.updated,
				dryRun,
			})

			return {
				success: true,
				processed: result.processed,
				updated: result.updated,
				dryRun,
				timestamp: new Date().toISOString(),
			}
		} catch (error) {
			logger.error('Audit log integrity backfill failed', { error })
			throw error
		}
	},
})
