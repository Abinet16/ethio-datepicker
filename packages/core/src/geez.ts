const ONES = ['', '፩', '፪', '፫', '፬', '፭', '፮', '፯', '፰', '፱'];
const TENS = ['', '፲', '፳', '፴', '፵', '፶', '፷', '፸', '፹', '፺'];
const HUNDRED = '፻';
const TEN_THOUSAND = '፼';

/** Two-digit group (1–99) in Geez. */
const pair = (n: number) => TENS[Math.floor(n / 10)]! + ONES[n % 10]!;

/**
 * Convert a positive integer to Geez numerals, e.g. 2019 → ፳፻፲፱, 100 → ፻, 10000 → ፼.
 * Leading "one" is dropped before ፻ and ፼ (traditional form).
 */
export function toGeez(num: number): string {
  if (!Number.isInteger(num) || num < 1) throw new RangeError(`toGeez expects a positive integer, got ${num}`);
  // Split into base-100 groups, least significant first.
  const groups: number[] = [];
  for (let n = num; n > 0; n = Math.floor(n / 100)) groups.push(n % 100);
  let out = '';
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i]!;
    const sep = i === 0 ? '' : i % 2 === 1 ? HUNDRED : TEN_THOUSAND;
    if (g === 0) {
      // A zero ፼-level group still needs its ፼ when higher digits exist (e.g. 1,000,000).
      if (sep === TEN_THOUSAND && out) out += TEN_THOUSAND;
      continue;
    }
    const isLeading = i === groups.length - 1;
    const digits = g === 1 && sep && (isLeading || sep === HUNDRED) ? '' : pair(g);
    out += digits + sep;
  }
  return out;
}

const VALUES: Record<string, number> = {};
ONES.forEach((c, i) => c && (VALUES[c] = i));
TENS.forEach((c, i) => c && (VALUES[c] = i * 10));

/** Convert Geez numerals back to a number. Returns NaN for invalid input. */
export function fromGeez(str: string): number {
  if (!str) return NaN;
  let total = 0;
  let block = 0; // value below ፼
  let group = 0; // value below ፻
  for (const ch of str) {
    if (ch in VALUES) group += VALUES[ch]!;
    else if (ch === HUNDRED) {
      block += (group || 1) * 100;
      group = 0;
    } else if (ch === TEN_THOUSAND) {
      total = (total + block + group || 1) * 10000;
      block = 0;
      group = 0;
    } else return NaN;
  }
  return total + block + group;
}
