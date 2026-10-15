/** Accessibility props for a control inside a `FormField` (links it to its error message). */
export const fieldA11y = (id: string, error?: string) => ({
  id,
  'aria-invalid': error ? true : undefined,
  'aria-describedby': error ? `${id}-error` : undefined,
});
