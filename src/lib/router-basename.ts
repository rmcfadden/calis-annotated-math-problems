export function routerBasename(baseUrl: string): string {
  return baseUrl.replace(/\/$/, '') || '/'
}
