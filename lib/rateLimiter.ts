interface LockoutState {
  attempts: number;
  lockoutUntil: number | null;
}

// In-memory store for tracking failed login attempts
const lockoutStore = new Map<string, LockoutState>();
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Checks if the given key (IP or email) is currently locked out
 */
export function checkLoginLockout(key: string): { locked: boolean; remainingMs?: number; remainingAttempts?: number } {
  const record = lockoutStore.get(key);
  if (!record) {
    return { locked: false, remainingAttempts: MAX_ATTEMPTS };
  }

  const now = Date.now();
  if (record.lockoutUntil && record.lockoutUntil > now) {
    const remainingMs = record.lockoutUntil - now;
    return { locked: true, remainingMs };
  }

  // If lockout timer expired, clear record
  if (record.lockoutUntil && record.lockoutUntil <= now) {
    lockoutStore.delete(key);
    return { locked: false, remainingAttempts: MAX_ATTEMPTS };
  }

  const remainingAttempts = Math.max(0, MAX_ATTEMPTS - record.attempts);
  return { locked: false, remainingAttempts };
}

/**
 * Records a failed login attempt for key (IP or email)
 */
export function recordFailedLogin(key: string): { locked: boolean; remainingAttempts: number; remainingMinutes: number } {
  const now = Date.now();
  let record = lockoutStore.get(key);

  if (!record) {
    record = { attempts: 1, lockoutUntil: null };
  } else {
    record.attempts += 1;
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockoutUntil = now + LOCKOUT_DURATION_MS;
    lockoutStore.set(key, record);
    return { locked: true, remainingAttempts: 0, remainingMinutes: 15 };
  }

  lockoutStore.set(key, record);
  const remaining = MAX_ATTEMPTS - record.attempts;
  return { locked: false, remainingAttempts: remaining, remainingMinutes: 0 };
}

/**
 * Resets failed attempts upon successful login
 */
export function resetLoginLockout(key: string) {
  lockoutStore.delete(key);
}
