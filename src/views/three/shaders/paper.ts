import { GLSL_NOISE } from './noise';

/**
 * Old field-notebook paper, baked once per resize: stains, grid, coffee rings, fibres, the
 * centre fold and burnt edges. Alpha holds the noise field the reveal front travels through.
 */
export const PAPER_FRAGMENT = /* glsl */ `
  ${GLSL_NOISE}
  varying vec2 vUv;
  uniform float uAspect, uPR, uSeed;

  void main() {
    vec2 uv = vUv;
    vec2 pu = vec2(uv.x * uAspect, uv.y);
    vec3 c = vec3(.925, .872, .76);

    // Uneven tone and big stains
    float n = fbm(pu * 2.4 + uSeed);
    c = mix(c, vec3(.86, .77, .60), smoothstep(.35, .85, n) * .75);
    float st = fbm(pu * 1.15 + 20. + uSeed);
    c = mix(c, vec3(.76, .62, .42), smoothstep(.6, .8, st) * .42);

    // Field notebook grid
    vec2 g = gl_FragCoord.xy / uPR / 26.;
    vec2 gd = abs(fract(g) - .5);
    float grid = smoothstep(.47, .5, max(gd.x, gd.y));
    c = mix(c, vec3(.55, .6, .66), grid * .09 * (.6 + .4 * noise(pu * 8.)));

    // Coffee rings
    vec2 rc = vec2(uAspect * .86, .22);
    float rr = .12;
    float d = length(pu - rc) + (fbm(pu * 9.) - .5) * .022;
    float ring = smoothstep(.011, 0., abs(d - rr));
    float inner = smoothstep(rr, rr - .03, d);
    c = mix(c, vec3(.58, .41, .24), ring * .42 + inner * .07);
    vec2 rc2 = vec2(uAspect * .80, .30);
    float d2 = length(pu - rc2) + (fbm(pu * 7. + 3.) - .5) * .03;
    c = mix(c, vec3(.6, .44, .27), smoothstep(.008, 0., abs(d2 - .095)) * .25 * step(pu.x, rc2.x + .02));

    // Splatters
    float sp = smoothstep(.985, 1., noise(pu * 38. + uSeed)) * step(.6, fbm(pu * 3.));
    c = mix(c, vec3(.6, .45, .28), sp * .35);

    // Fibres and grain
    float f = noise(vec2(pu.x * 28., pu.y * 480.)) * noise(vec2(pu.x * 420., pu.y * 24.));
    c *= 1. - .05 * f;
    c *= .975 + .05 * hash(gl_FragCoord.xy);

    // Centre fold
    float fx = uv.x - .5;
    c *= 1. - .07 * exp(-abs(fx) * 260.);
    c += .025 * exp(-abs(fx - .004) * 300.);

    // Aged edges
    vec2 vv = uv - .5;
    float v = dot(vv * vec2(1., 1.15), vv * vec2(1., 1.15));
    c = mix(c, vec3(.52, .37, .22), smoothstep(.16, .48, v + (fbm(pu * 5.) - .5) * .08) * .55);

    // Reveal field: paper appears first near the lighthouse, last at the corners
    float field = length((uv - vec2(.5, .58)) * vec2(uAspect, 1.)) * .8 + fbm(pu * 2.2 + 11.) * .72;
    gl_FragColor = vec4(c, clamp(field * .5, 0., 1.));
  }
`;
