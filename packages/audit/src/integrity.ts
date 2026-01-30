/**
 * Audit Log Integrity Protection
 *
 * Provides HMAC-SHA256 based integrity verification for audit logs
 * to meet SOC 2 CC7.2 compliance requirements.
 */

import crypto from 'node:crypto'
import { prisma } from '@repo/database'
import { logger } from '@repo/observability'

// Default secret for development - MUST be overridden in production
const AUDIT_SECRET_KEY =
	process.env.AUDIT_LOG_SECRET_KEY || 'dev-audit-secret-change-in-production'

/**
 * Fields used for computing the integrity hash
 * These are the critical fields that cannot be modified without detection
 */
interface IntegrityFields {
	id: string
	action: string
	userId: string | null
	organizationId: string | null
	details: string
	metadata: string | null
	ipAddress: string | null
	userAgent: string | null
	resourceType: string | null
	resourceId: string | null
	targetUserId: string | null
	severity: string
	createdAt: Date
}

/**
 * Compute HMAC-SHA256 hash for audit log integrity
 *
 * Uses a deterministic JSON serialization of critical fields
 * to ensure consistent hash computation.
 */
export function computeIntegrityHash(fields: IntegrityFields): string {
	// Create deterministic payload by sorting keys
	const payload = JSON.stringify({
		action: fields.action,
		createdAt: fields.createdAt.toISOString(),
		details: fields.details,
		id: fields.id,
		ipAddress: fields.ipAddress,
		metadata: fields.metadata,
		organizationId: fields.organizationId,
		resourceId: fields.resourceId,
		resourceType: fields.resourceType,
		severity: fields.severity,
		targetUserId: fields.targetUserId,
		userAgent: fields.userAgent,
		userId: fields.userId,
	})

	const hmac = crypto.createHmac('sha256', AUDIT_SECRET_KEY)
	hmac.update(payload)
	return hmac.digest('hex')
}

/**
 * Verify the integrity of a single audit log entry
 */
export function verifyLogIntegrity(
	log: IntegrityFields & { integrityHash: string | null },
): boolean {
	if (!log.integrityHash) {
		// Logs without hash cannot be verified (legacy or pre-implementation)
		return false
	}

	const computedHash = computeIntegrityHash(log)
	return crypto.timingSafeEqual(
		Buffer.from(log.integrityHash, 'hex'),
		Buffer.from(computedHash, 'hex'),
	)
}

/**
 * Result of a batch integrity verification
 */
export interface IntegrityVerificationResult {
	totalLogs: number
	verifiedCount: number
	unverifiedCount: number
	missingHashCount: number
	tamperingDetected: boolean
	tamperedLogIds: string[]
	verificationTime: Date
}

/**
 * Verify integrity of multiple audit logs
 *
 * @param options - Filter options for which logs to verify
 * @returns Verification result with statistics
 */
export async function verifyLogsIntegrity(options: {
	organizationId?: string
	startDate?: Date
	endDate?: Date
	limit?: number
}): Promise<IntegrityVerificationResult> {
	const { organizationId, startDate, endDate, limit = 1000 } = options

	const logs = await prisma.auditLog.findMany({
		where: {
			...(organizationId && { organizationId }),
			...(startDate && { createdAt: { gte: startDate } }),
			...(endDate && { createdAt: { lte: endDate } }),
		},
		orderBy: { createdAt: 'desc' },
		take: limit,
	})

	const result: IntegrityVerificationResult = {
		totalLogs: logs.length,
		verifiedCount: 0,
		unverifiedCount: 0,
		missingHashCount: 0,
		tamperingDetected: false,
		tamperedLogIds: [],
		verificationTime: new Date(),
	}

	for (const log of logs) {
		if (!log.integrityHash) {
			result.missingHashCount++
			continue
		}

		const isValid = verifyLogIntegrity(log)
		if (isValid) {
			result.verifiedCount++
		} else {
			result.unverifiedCount++
			result.tamperingDetected = true
			result.tamperedLogIds.push(log.id)

			// Log critical security event
			logger.error(
				{ logId: log.id, action: log.action },
				'SECURITY ALERT: Audit log tampering detected!',
			)
		}
	}

	return result
}

/**
 * Generate an integrity report for compliance auditing
 */
export async function generateIntegrityReport(options: {
	organizationId?: string
	startDate: Date
	endDate: Date
}): Promise<{
	report: IntegrityVerificationResult
	summary: string
	complianceStatus: 'PASS' | 'FAIL' | 'PARTIAL'
}> {
	const report = await verifyLogsIntegrity(options)

	let complianceStatus: 'PASS' | 'FAIL' | 'PARTIAL'
	let summary: string

	if (report.tamperingDetected) {
		complianceStatus = 'FAIL'
		summary = `CRITICAL: Tampering detected in ${report.tamperedLogIds.length} audit log(s). Immediate investigation required.`
	} else if (report.missingHashCount > 0) {
		const hashCoverage =
			((report.verifiedCount / report.totalLogs) * 100).toFixed(1) + '%'
		complianceStatus = 'PARTIAL'
		summary = `${report.missingHashCount} logs without integrity hash (${hashCoverage} coverage). Consider backfilling hashes for full compliance.`
	} else if (report.totalLogs === 0) {
		complianceStatus = 'PASS'
		summary = 'No audit logs found in the specified time range.'
	} else {
		complianceStatus = 'PASS'
		summary = `All ${report.verifiedCount} audit logs verified successfully. No tampering detected.`
	}

	return { report, summary, complianceStatus }
}

/**
 * Backfill integrity hashes for existing logs
 * Use with caution - this should only be run once during migration
 */
export async function backfillIntegrityHashes(options: {
	batchSize?: number
	dryRun?: boolean
}): Promise<{ processed: number; updated: number }> {
	const { batchSize = 100, dryRun = true } = options

	let processed = 0
	let updated = 0
	let hasMore = true

	while (hasMore) {
		const logs = await prisma.auditLog.findMany({
			where: { integrityHash: null },
			take: batchSize,
		})

		if (logs.length === 0) {
			hasMore = false
			break
		}

		for (const log of logs) {
			const hash = computeIntegrityHash(log)
			processed++

			if (!dryRun) {
				await prisma.auditLog.update({
					where: { id: log.id },
					data: { integrityHash: hash },
				})
				updated++
			}
		}

		if (logs.length < batchSize) {
			hasMore = false
		}
	}

	return { processed, updated }
}
