/**
 * CSS.escape polyfill for environments that don't support it
 * Based on the CSS.escape specification
 */
export function cssEscape(value: string): string {
  if (typeof CSS !== 'undefined' && CSS.escape) {
    return CSS.escape(value);
  }

  // Polyfill implementation
  const string = String(value);
  const length = string.length;
  let index = -1;
  let codeUnit: number;
  let result = '';
  const firstCodeUnit = string.charCodeAt(0);

  if (length === 0) {
    return '';
  }

  // If the first character is a '-' followed by nothing, a digit, or another '-', escape it
  if (length === 1 && firstCodeUnit === 0x002d /* - */) {
    return '\\' + string;
  }

  while (++index < length) {
    codeUnit = string.charCodeAt(index);

    // Note: there's no need to special-case astral symbols, surrogate
    // pairs, or lone surrogates.

    // If the character is NULL (U+0000), use U+FFFD REPLACEMENT CHARACTER
    if (codeUnit === 0x0000) {
      result += '\uFFFD';
      continue;
    }

    if (
      // If the character is in the range [\1-\1F] (U+0001 to U+001F) or is
      // U+007F
      (codeUnit >= 0x0001 && codeUnit <= 0x001f) ||
      codeUnit === 0x007f ||
      // If the character is the first character and is in the range [0-9]
      // (U+0030 to U+0039)
      (index === 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
      // If the character is the second character and is in the range [0-9]
      // (U+0030 to U+0039) and the first character is a `-` (U+002D)
      (index === 1 &&
        codeUnit >= 0x0030 &&
        codeUnit <= 0x0039 &&
        firstCodeUnit === 0x002d)
    ) {
      // Escape as code point
      result += '\\' + codeUnit.toString(16) + ' ';
      continue;
    }

    // If the character is the first character and is a `-` (U+002D), and
    // there is no second character
    if (index === 0 && codeUnit === 0x002d && length === 1) {
      result += '\\' + string.charAt(index);
      continue;
    }

    // If the character is not printable ASCII, escape it
    if (
      codeUnit >= 0x0080 ||
      codeUnit === 0x002d /* - */ ||
      codeUnit === 0x005f /* _ */ ||
      (codeUnit >= 0x0030 && codeUnit <= 0x0039) /* 0-9 */ ||
      (codeUnit >= 0x0041 && codeUnit <= 0x005a) /* A-Z */ ||
      (codeUnit >= 0x0061 && codeUnit <= 0x007a) /* a-z */
    ) {
      // No escape needed for these
      result += string.charAt(index);
      continue;
    }

    // Otherwise, escape the character
    result += '\\' + string.charAt(index);
  }

  return result;
}
