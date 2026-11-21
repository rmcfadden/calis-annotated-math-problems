const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']

export function imageExtFromFile(file: { type: string }): string {
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  if (file.type === 'image/svg+xml') return 'svg'
  return 'jpg'
}

export function isAllowedImageType(type: string): boolean {
  return type === '' || ALLOWED.includes(type)
}
