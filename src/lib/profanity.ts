// Chat profanity filter.
//
// `censorText` masks bad words with asterisks (preserving length so the line
// keeps its shape). It's applied in two places (see RoomChat):
//   • at RENDER time — so every viewer sees a clean line regardless of what's
//     stored or how it got there (covers old messages and any direct-API
//     inserts), and
//   • at SEND time — so the stored message is clean too.
//
// Matching is case-insensitive and uses word boundaries to avoid the
// "Scunthorpe problem" (e.g. "class", "assassin", "shiitake" are NOT censored).
// It tolerates elongated spellings ("shiiit", "fuuuck") and common inflections
// (plural / -ed / -ing / -er). Extend BAD_WORDS below to tune the dictionary.

// Base dictionary (lowercase, no inflections — plurals/®-ing etc. are handled
// by the trailing-suffix allowance in the matcher). Keep this list maintainable;
// it is the single source of truth for the filter.
const BAD_WORDS = [
  // common profanity
  "fuck", "shit", "bitch", "bastard", "asshole", "dickhead", "douche", "douchebag",
  "wanker", "bollocks", "bugger", "prick", "twat", "slut", "whore", "skank",
  "cock", "dick", "pussy", "cunt", "wank", "jerkoff", "jackass", "dumbass",
  "smartass", "arsehole", "motherfucker", "fucker", "fuckface", "shithead",
  "shitface", "piss", "pissed", "crap", "bullshit", "horseshit", "damn",
  "goddamn", "goddam", "bloody",
  // sexual
  "boobs", "tits", "titties", "blowjob", "handjob", "boner", "cum", "jizz",
  "dildo", "porn", "porno", "nudes",
  // slurs (severe — always masked)
  "nigger", "nigga", "faggot", "fag", "retard", "retarded", "spic", "chink",
  "kike", "wetback", "tranny", "coon", "dyke", "paki",
];

// Escape regex metacharacters in a literal character/word.
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Build a pattern for one word that allows each letter to repeat, so elongated
// spellings are caught: "shit" -> s+h+i+t+ matches "shit", "shiiit", "shitt".
// (Letters must stay consecutive — no separator tolerance — so innocent
// cross-word sequences like "this hit" are never matched.)
function fuzzyWord(word: string): string {
  return word
    .split("")
    .map((ch) => `${escapeRegExp(ch)}+`)
    .join("");
}

// One combined regex, longest words first so overlapping matches prefer the
// longer term. Word-boundary-anchored to avoid censoring innocent substrings.
const PATTERN = new RegExp(
  `\\b(?:${[...BAD_WORDS]
    .sort((a, b) => b.length - a.length)
    .map(fuzzyWord)
    .join("|")})(?:s|es|ed|ing|er|ers|in|in')?\\b`,
  "gi",
);

/** Replace any bad word in `text` with asterisks of the same length. */
export function censorText(text: string): string {
  if (!text) return text;
  return text.replace(PATTERN, (match) => "*".repeat(match.length));
}
