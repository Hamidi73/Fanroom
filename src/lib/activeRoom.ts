// The viewer's "active room" — the room they most recently had open. Stored in
// localStorage so the global MiniPlayer (root layout) can keep the stream
// playing as a floating window while they browse the rest of the site, and so
// hosts keep broadcasting between pages. Cleared when they leave/dismiss.

export type ActiveRoomRole = "host" | "member" | "preview";

export type ActiveRoom = {
  roomId: string;
  title: string;
  role: ActiveRoomRole;
};

const KEY = "fr-active-room";
const EVT = "fr-active-room-change";

function emit(): void {
  window.dispatchEvent(new Event(EVT));
}

export function getActiveRoom(): ActiveRoom | null {
  const raw = getActiveRoomRaw();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ActiveRoom;
    return parsed && typeof parsed.roomId === "string" ? parsed : null;
  } catch {
    return null;
  }
}

/** Raw stored value — referentially stable, for useSyncExternalStore. */
export function getActiveRoomRaw(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** Subscribe to active-room changes (same tab via custom event, others via storage). */
export function subscribeActiveRoom(cb: () => void): () => void {
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function setActiveRoom(room: ActiveRoom): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(room));
    emit();
  } catch {
    /* storage unavailable — mini-player just won't persist */
  }
}

export function clearActiveRoom(roomId?: string): void {
  try {
    if (roomId && getActiveRoom()?.roomId !== roomId) return; // someone else's room
    window.localStorage.removeItem(KEY);
    emit();
  } catch {
    /* ignore */
  }
}
