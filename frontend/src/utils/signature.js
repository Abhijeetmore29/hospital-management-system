export function isSignatureImage(signature) {
  return typeof signature === 'string' && signature.startsWith('data:image/');
}
