// Player-name rules for the leaderboard: length, allowed characters, and a profanity check.
// The check runs twice: on the name as typed, and with spaces and punctuation removed, so "s h i t" and
// "S.H.I.T" are caught too. The obscenity library also handles leetspeak ("sh1t") and look-alike letters.
import { RegExpMatcher, DataSet, englishDataset, englishRecommendedTransformers, pattern } from 'obscenity';

// Words the stock English list misses. |x| = whole word only, so "Sussex", "grape" and "therapist" stay allowed.
const EXTRA_PATTERNS = [
  pattern`phuck`, pattern`phuk`, pattern`|fuk|`, pattern`|fuq|`, pattern`|fux|`, pattern`biatch`, pattern`kunt`,
  pattern`|sex|`, pattern`|sexy|`, pattern`|porn|`, pattern`|cum|`, pattern`|nude|`, pattern`|rape|`, pattern`|rapist|`,
  pattern`hitler`, pattern`|nazi|`, pattern`|kkk|`, pattern`|heil|`
];
// Names that could pass as the site speaking.
const RESERVED = ['admin', 'moderator', 'official'];

const dataset = new DataSet().addAll(englishDataset);
EXTRA_PATTERNS.forEach((p, i) => dataset.addPhrase(ph => ph.setMetadata({ originalWord: 'extra' + i }).addPattern(p)));
const matcher = new RegExpMatcher({ ...dataset.build(), ...englishRecommendedTransformers });

export const NAME_MIN = 2;
export const NAME_MAX = 16;
const ALLOWED = /^[\p{L}\p{N}][\p{L}\p{M}\p{N} '_-]*$/u;

// Same player, same key: case and repeated spaces do not matter.
export function nameKey(name) {
  return name.toLowerCase().replace(/\s+/g, ' ');
}

function squeeze(name) {
  return name.replace(/[^\p{L}\p{N}]/gu, '');
}

// Returns { name } (cleaned) or { error } (a message to show the player).
export function checkName(raw) {
  if (typeof raw !== 'string') return { error: 'Please enter a name.' };
  const name = raw.normalize('NFKC').replace(/\s+/g, ' ').trim();
  const length = [...name].length;
  if (length < NAME_MIN) return { error: `Use at least ${NAME_MIN} characters.` };
  if (length > NAME_MAX) return { error: `Use at most ${NAME_MAX} characters.` };
  if (!ALLOWED.test(name)) return { error: 'Use letters, numbers, spaces, - or _ only.' };
  const squeezed = squeeze(name);
  const lower = squeezed.toLowerCase();
  if (matcher.hasMatch(name) || matcher.hasMatch(squeezed) || RESERVED.some(r => lower.includes(r))) {
    return { error: 'Please choose a different name.' };
  }
  return { name };
}
