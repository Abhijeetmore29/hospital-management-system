export function isImageDataUrl(value) {
  return typeof value === 'string' && value.startsWith('data:image/');
}
