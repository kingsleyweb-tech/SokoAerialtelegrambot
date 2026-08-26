export interface SessionMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface Session {
  chatId: number;
  lastInteractionTime: number; // timestamp in milliseconds
  isFirstTimeUser: boolean;
  history: SessionMessage[];
  currentTopic?: string;
  lastBotMessageId?: number;
}

const sessions = new Map<number, Session>();
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Retrieves the session for a given chat ID.
 * If no session exists, creates a default initial session.
 */
export function getSession(chatId: number): Session {
  let session = sessions.get(chatId);
  if (!session) {
    session = {
      chatId,
      lastInteractionTime: 0, // 0 signifies brand new session
      isFirstTimeUser: true,
      history: [],
    };
    sessions.set(chatId, session);
  }
  return session;
}

/**
 * Updates the session with partial values.
 */
export function updateSession(chatId: number, update: Partial<Session>): Session {
  const session = getSession(chatId);
  const updated = { ...session, ...update };
  sessions.set(chatId, updated);
  return updated;
}

/**
 * Resets the active conversation context (history, active topics, template state)
 * but preserves user-specific identity flags like isFirstTimeUser = false.
 */
export function resetSession(chatId: number): Session {
  const session = getSession(chatId);
  const updated: Session = {
    chatId,
    lastInteractionTime: 0,
    isFirstTimeUser: false, // They are no longer a brand new user after a reset
    history: [],
    currentTopic: undefined,
    lastBotMessageId: undefined,
  };
  sessions.set(chatId, updated);
  return updated;
}

/**
 * Passively checks if the user's session has expired due to 15+ minutes of inactivity.
 * If expired, resets the active conversation history and returns wasReset = true.
 */
export function checkInactivityAndReset(chatId: number): { wasReset: boolean; session: Session } {
  const session = getSession(chatId);
  const now = Date.now();

  // If there was a previous interaction and the duration exceeds the timeout limit
  if (session.lastInteractionTime > 0 && now - session.lastInteractionTime >= INACTIVITY_TIMEOUT) {
    const newSession = resetSession(chatId);
    return { wasReset: true, session: newSession };
  }

  return { wasReset: false, session };
}

/**
 * Updates the session's last interaction timestamp to the current time.
 */
export function refreshSessionTimestamp(chatId: number): void {
  const now = Date.now();
  updateSession(chatId, { lastInteractionTime: now });
}
