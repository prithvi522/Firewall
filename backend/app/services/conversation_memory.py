"""conversation_memory
Provides an in-memory rolling conversation memory for multi-turn
threat accumulation. This simple implementation is suitable for demo
and hackathon purposes and stores recent messages per session id.
"""
from collections import deque
from typing import Deque, Dict, List, Tuple

# Configure how many turns to keep in memory per session
DEFAULT_WINDOW = 20

# message is a tuple of (role, text)
class ConversationMemory:
    def __init__(self, window: int = DEFAULT_WINDOW):
        self.window = window
        self._store: Dict[str, Deque[Tuple[str, str]]] = {}

    def add_message(self, session_id: str, role: str, text: str) -> None:
        """Add a message to the session memory."""
        if session_id not in self._store:
            self._store[session_id] = deque(maxlen=self.window)
        self._store[session_id].append((role, text))

    def get_history(self, session_id: str) -> List[Tuple[str, str]]:
        """Return the recent messages for a session."""
        return list(self._store.get(session_id, []))

    def summarize(self, session_id: str, max_chars: int = 1000) -> str:
        """Return a naive summary (concatenate recent messages and truncate).

        For production, plug in an LLM-based summarizer.
        """
        history = self.get_history(session_id)
        joined = "\n".join(f"{r}: {t}" for r, t in history)
        return joined[:max_chars]

    def clear(self, session_id: str) -> None:
        """Clear conversation for a session."""
        if session_id in self._store:
            del self._store[session_id]


# Expose a singleton for simple use across the app
global_memory = ConversationMemory()
