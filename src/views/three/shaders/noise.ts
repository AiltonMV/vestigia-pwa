/** Hash, value noise and fractal noise shared by the GLSL shaders. */
export const GLSL_NOISE = /* glsl */ `
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3. - 2. * f);
    return mix(
      mix(hash(i), hash(i + vec2(1., 0.)), u.x),
      mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0., a = .5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= .5; }
    return v;
  }
`;

/** Vertex shader for full-screen quads (a 2×2 plane drawn straight in clip space). */
export const FULLSCREEN_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }
`;
