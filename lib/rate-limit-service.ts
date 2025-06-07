interface RateLimitEntry {
  attempts: number
  lastAttempt: number
  blockedUntil?: number
}

class RateLimitService {
  private attempts = new Map<string, RateLimitEntry>()
  private readonly MAX_ATTEMPTS = 5
  private readonly BLOCK_DURATION = 900000
  private readonly ATTEMPT_WINDOW = 300000

  isBlocked(identifier: string): boolean {
    const entry = this.attempts.get(identifier)
    if (!entry) return false

    if (entry.blockedUntil && Date.now() < entry.blockedUntil) {
      return true
    }

    if (entry.blockedUntil && Date.now() >= entry.blockedUntil) {
      this.attempts.delete(identifier)
      return false
    }

    return false
  }

  recordAttempt(identifier: string, success: boolean) {
    const now = Date.now()
    let entry = this.attempts.get(identifier)

    if (!entry) {
      entry = { attempts: 0, lastAttempt: now }
    }

    if (now - entry.lastAttempt > this.ATTEMPT_WINDOW) {
      entry.attempts = 0
    }

    if (success) {
      this.attempts.delete(identifier)
      return { blocked: false, remainingAttempts: this.MAX_ATTEMPTS }
    }

    entry.attempts += 1
    entry.lastAttempt = now

    if (entry.attempts >= this.MAX_ATTEMPTS) {
      entry.blockedUntil = now + this.BLOCK_DURATION
      this.attempts.set(identifier, entry)
      return {
        blocked: true,
        remainingAttempts: 0,
        blockDuration: this.BLOCK_DURATION,
      }
    }

    this.attempts.set(identifier, entry)
    return {
      blocked: false,
      remainingAttempts: this.MAX_ATTEMPTS - entry.attempts,
    }
  }

  getRemainingBlockTime(identifier: string): number {
    const entry = this.attempts.get(identifier)
    if (!entry?.blockedUntil) return 0

    const remaining = entry.blockedUntil - Date.now()
    return Math.max(0, remaining)
  }
}

export const rateLimitService = new RateLimitService()
