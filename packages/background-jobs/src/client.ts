import { tasks } from '@trigger.dev/sdk/v3'
import { type transferS3Files } from './tasks/transfer-s3-files'
import { type imageProcessingTask } from './tasks/image-processing'
import { type videoProcessingTask } from './tasks/video-processing'
import { type auditIntegrityBackfill } from './tasks/audit-integrity-backfill'

export async function triggerVideoProcessing(
	payload: Parameters<typeof videoProcessingTask.trigger>[0],
) {
	const handle = await tasks.trigger<typeof videoProcessingTask>(
		'video-processing',
		payload,
	)
	return handle
}

export async function triggerImageProcessing(
	payload: Parameters<typeof imageProcessingTask.trigger>[0],
) {
	const handle = await tasks.trigger<typeof imageProcessingTask>(
		'image-processing',
		payload,
	)
	return handle
}

export async function triggerTransferS3Files(
	payload: Parameters<typeof transferS3Files.trigger>[0],
) {
	const handle = await tasks.trigger<typeof transferS3Files>(
		'transfer-s3-files-cross-account',
		payload,
	)
	return handle
}

/**
 * Trigger audit log integrity hash backfill job
 * SOC 2 CC7.2 Compliance - run once to add hashes to existing logs
 *
 * @param payload.dryRun - If true, only count logs without making changes (default: true)
 * @param payload.batchSize - Number of logs to process per batch (default: 100)
 */
export async function triggerAuditIntegrityBackfill(
	payload: Parameters<typeof auditIntegrityBackfill.trigger>[0],
) {
	const handle = await tasks.trigger<typeof auditIntegrityBackfill>(
		'audit-integrity-backfill',
		payload,
	)
	return handle
}
