/** Whether the browser can create a WebGL 2 context (required by the 3D scene). */
export function supportsWebGL2(): boolean {
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
}
