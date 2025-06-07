interface AuthLogEntry {
  timestamp: string
  event: string
  username?: string
  email?: string
  errorCode?: string
  errorMessage?: string
  metadata?: Record<string, any>
}

class AuthLogger {
  private logs: AuthLogEntry[] = []
  private readonly MAX_LOGS = 1000

  private createLogEntry(event: string, data: Partial<AuthLogEntry> = {}): AuthLogEntry {
    return {
      timestamp: new Date().toISOString(),
      event,
      ...data,
    }
  }

  logSignInAttempt(username: string, metadata?: Record<string, any>) {
    const entry = this.createLogEntry("sign_in_attempt", {
      username,
      metadata,
    })
    this.addLog(entry)
    console.log("[AUTH] Sign-in attempt for user:", username)
  }

  logSignInSuccess(username: string, email?: string) {
    const entry = this.createLogEntry("sign_in_success", {
      username,
      email,
    })
    this.addLog(entry)
    console.log("[AUTH] Successful sign-in for user:", username)
  }

  logSignInFailure(username: string, errorCode: string, errorMessage: string, metadata?: Record<string, any>) {
    const entry = this.createLogEntry("sign_in_failure", {
      username,
      errorCode,
      errorMessage,
      metadata,
    })
    this.addLog(entry)
    console.warn("[AUTH] Failed sign-in for user:", username, "Error:", errorCode, errorMessage)
  }

  logRateLimitTriggered(identifier: string, remainingTime: number) {
    const entry = this.createLogEntry("rate_limit_triggered", {
      username: identifier,
      metadata: { remainingTime },
    })
    this.addLog(entry)
    const seconds = Math.ceil(remainingTime / 1000)
    console.warn("[AUTH] Rate limit triggered for:", identifier, "Blocked for", seconds, "seconds")
  }

  private addLog(entry: AuthLogEntry) {
    this.logs.push(entry)

    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS)
    }
  }

  getLogs(filter?: Partial<AuthLogEntry>): AuthLogEntry[] {
    if (!filter) return [...this.logs]

    return this.logs.filter((log) => {
      return Object.entries(filter).every(([key, value]) => log[key as keyof AuthLogEntry] === value)
    })
  }

  getRecentFailures(username: string, minutes = 30): AuthLogEntry[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000).toISOString()
    return this.logs.filter(
      (log) => log.event === "sign_in_failure" && log.username === username && log.timestamp > cutoff,
    )
  }
}

export const authLogger = new AuthLogger()
