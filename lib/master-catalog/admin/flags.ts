export function isCatalogAdminEnabled(value: unknown): boolean {
  if (value === true) return true
  if (value === false || value == null) return false
  if (typeof value === 'string') {
    return value.trim().toLowerCase() === 'true'
  }
  if (typeof value === 'number') {
    return value === 1
  }
  return false
}
