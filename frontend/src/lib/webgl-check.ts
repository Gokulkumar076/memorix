/**
 * Cheap synchronous check for WebGL availability. Used to skip mounting
 * any <Canvas> entirely on systems where WebGL is disabled/unsupported,
 * avoiding the THREE.WebGLRenderer constructor throw altogether.
 */
export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    return !!gl
  } catch {
    return false
  }
}
