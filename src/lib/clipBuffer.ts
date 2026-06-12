// Rolling stream-clip buffer (client only).
//
// Records the live <MediaStream> with MediaRecorder into timestamped chunks,
// entirely in the viewer's browser — no server egress, no storage costs.
// Because a WebM file is only valid from its first chunk (init segment), we
// can't just drop old chunks to bound memory. Instead the recorder ROTATES:
// every SEGMENT_MS it finalises the current segment and starts a new one,
// keeping at most one previous segment. A clip of the last N minutes is then
// cut (stream-copy, no re-encode) from [previous +] current via ffmpeg.wasm
// in ClipControls.
//
// Memory: ~5MB/min at the configured bitrates; worst case (full previous +
// full current segment) ≈ 40 min ≈ 200MB, then the previous segment is freed.
// Buffering starts when the viewer opens the room — you can't clip moments
// from before you arrived.

const SEGMENT_MS = 20 * 60_000; // rotation period = max clip window
const TIMESLICE_MS = 2_000;

// First supported container wins (Safari records MP4, Chrome/Firefox WebM).
const MIME_CANDIDATES = [
  'video/webm;codecs=vp8,opus',
  "video/webm",
  "video/mp4",
];

export type ClipSource = { blob: Blob; durationMs: number };

export class ClipBuffer {
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private segmentStart = 0;
  private previous: ClipSource | null = null;
  private rotateTimer: ReturnType<typeof setTimeout> | null = null;
  private stopped = true;
  readonly mimeType: string;
  startedAt = 0; // when buffering began (for the UI)

  constructor(private stream: MediaStream) {
    this.mimeType =
      MIME_CANDIDATES.find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
  }

  static supported(): boolean {
    return (
      typeof MediaRecorder !== "undefined" &&
      MIME_CANDIDATES.some((m) => MediaRecorder.isTypeSupported(m))
    );
  }

  get extension(): string {
    return this.mimeType.includes("mp4") ? "mp4" : "webm";
  }

  start() {
    if (!this.mimeType || !this.stopped) return;
    this.stopped = false;
    this.startedAt = Date.now();
    this.startSegment();
  }

  private startSegment() {
    this.chunks = [];
    this.segmentStart = Date.now();
    const rec = new MediaRecorder(this.stream, {
      mimeType: this.mimeType,
      videoBitsPerSecond: 600_000,
      audioBitsPerSecond: 64_000,
    });
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
      // Once the current segment alone covers the max window, the previous
      // one can never be needed again — free its memory early.
      if (this.previous && Date.now() - this.segmentStart >= SEGMENT_MS) {
        this.previous = null;
      }
    };
    rec.start(TIMESLICE_MS);
    this.recorder = rec;
    this.rotateTimer = setTimeout(() => this.rotate(), SEGMENT_MS);
  }

  private rotate() {
    const rec = this.recorder;
    if (!rec || this.stopped) return;
    const segStart = this.segmentStart;
    rec.onstop = () => {
      this.previous = {
        blob: new Blob(this.chunks, { type: this.mimeType }),
        durationMs: Date.now() - segStart,
      };
      if (!this.stopped) this.startSegment();
    };
    rec.stop();
  }

  /**
   * Snapshot the buffer for a clip of the last `windowMs`. Flushes pending
   * data first. Returns the segments to feed ffmpeg (oldest first) and how
   * much to cut from the front; null if nothing is buffered yet.
   */
  async snapshot(
    windowMs: number,
  ): Promise<{ sources: ClipSource[]; trimFromStartMs: number } | null> {
    const rec = this.recorder;
    if (!rec || rec.state === "inactive") return null;
    rec.requestData();
    // requestData delivers asynchronously — give it a beat.
    await new Promise((r) => setTimeout(r, 250));
    if (this.chunks.length === 0 && !this.previous) return null;

    const currentMs = Date.now() - this.segmentStart;
    const current: ClipSource = {
      blob: new Blob(this.chunks, { type: this.mimeType }),
      durationMs: currentMs,
    };

    if (currentMs >= windowMs || !this.previous) {
      return {
        sources: [current],
        trimFromStartMs: Math.max(0, currentMs - windowMs),
      };
    }
    const totalMs = this.previous.durationMs + currentMs;
    return {
      sources: [this.previous, current],
      trimFromStartMs: Math.max(0, totalMs - windowMs),
    };
  }

  /** Total buffered duration right now (ms) — for enabling menu options. */
  bufferedMs(): number {
    if (this.stopped) return 0;
    const currentMs = Date.now() - this.segmentStart;
    return currentMs + (this.previous?.durationMs ?? 0);
  }

  stop() {
    this.stopped = true;
    if (this.rotateTimer) clearTimeout(this.rotateTimer);
    this.rotateTimer = null;
    if (this.recorder && this.recorder.state !== "inactive") {
      this.recorder.onstop = null;
      this.recorder.stop();
    }
    this.recorder = null;
    this.chunks = [];
    this.previous = null;
  }
}
