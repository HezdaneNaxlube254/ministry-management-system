/**
 * Calculates the Levenshtein distance between two strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function findDuplicates(inputName: string, existingNames: string[]): string[] {
  const normalizedInput = normalizeName(inputName);
  const matches: string[] = [];

  for (const existing of existingNames) {
    const normalizedExisting = normalizeName(existing);
    
    if (normalizedInput === normalizedExisting) {
      matches.push(existing);
      continue;
    }

    const distance = levenshteinDistance(normalizedInput, normalizedExisting);
    const maxAllowedDistance = Math.floor(normalizedInput.length / 4);
    
    if (distance > 0 && distance <= Math.max(1, maxAllowedDistance)) {
      matches.push(existing);
    }
  }

  return matches;
}
