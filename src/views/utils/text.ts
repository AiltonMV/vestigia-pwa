export function countWords(text?: string): number {
  return text ? text.trim().split(/\s+/).length : 0;
}
