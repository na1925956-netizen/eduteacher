/** Resolves a path inside /public against the deployed base (works under a GitHub Pages sub-path). */
export function publicPath(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}

/** Absolute URL of a public file — needed by external viewers such as Office Online. */
export function absolutePublicUrl(path: string): string {
  return new URL(publicPath(path), window.location.href).href;
}

export function isLocalHost(): boolean {
  return ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
}

export function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
}
