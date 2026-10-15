import { GLSL_NOISE } from './noise';

/**
 * Final image. At night: HDR tone mapping, vignette, film grain and radio interference.
 * On paper: graphite contours (normals, depth and luminance edges) with a hand tremor, cross
 * hatching in the shadows and a watercolour wash that bleeds, granulates and pools at its
 * edges. A wet front sweeps the reveal: first the paper, then the pencil, then the colour.
 */
export const COMPOSITE_FRAGMENT = /* glsl */ `
  ${GLSL_NOISE}
  varying vec2 vUv;
  uniform sampler2D tNight, tDay, tNormal, tDepth, tPaper;
  uniform vec2 uTexel;
  uniform float uPR, uAspect, uSketch, uTime, uBoil, uNear, uFar, uGlitch, uExposure;

  vec3 aces(vec3 x) { return clamp((x * (2.51 * x + .03)) / (x * (2.43 * x + .59) + .14), 0., 1.); }
  vec3 toSRGB(vec3 c) {
    c = clamp(c, 0., 1.);
    return mix(c * 12.92, 1.055 * pow(c, vec3(1. / 2.4)) - .055, step(.0031308, c));
  }
  float linearDepth(vec2 uv) {
    float z = texture2D(tDepth, uv).x;
    return uNear * uFar / (uFar - z * (uFar - uNear));
  }
  float lum(vec3 c) { return dot(c, vec3(.299, .587, .114)); }
  mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

  float edgeAt(vec2 uv) {
    vec2 o = uTexel * uPR * 1.1;
    vec2 ax = vec2(o.x, 0.), ay = vec2(0., o.y);
    vec3 n1 = texture2D(tNormal, uv + ax).rgb, n2 = texture2D(tNormal, uv - ax).rgb;
    vec3 n3 = texture2D(tNormal, uv + ay).rgb, n4 = texture2D(tNormal, uv - ay).rgb;
    float ne = length(n1 - n2) + length(n3 - n4);
    float d0 = linearDepth(uv);
    float de = (abs(linearDepth(uv + ax) - linearDepth(uv - ax)) + abs(linearDepth(uv + ay) - linearDepth(uv - ay))) / max(d0, .001);
    vec4 c1 = texture2D(tDay, uv + ax), c2 = texture2D(tDay, uv - ax);
    vec4 c3 = texture2D(tDay, uv + ay), c4 = texture2D(tDay, uv - ay);
    float le = abs(lum(c1.rgb) - lum(c2.rgb)) + abs(lum(c3.rgb) - lum(c4.rgb));
    float ae = abs(c1.a - c2.a) + abs(c3.a - c4.a);
    return clamp(smoothstep(.38, .85, ne) + smoothstep(.025, .07, de) + smoothstep(.07, .2, le) * .75 + smoothstep(.25, .7, ae), 0., 1.);
  }

  float hatch(vec2 p, float ang, float sp) {
    vec2 q = rot(ang) * p;
    q.x += (noise(q * .018 + uBoil * .7) - .5) * 5.;
    float d = abs(fract(q.x / sp) - .5) * sp;
    float line = 1. - smoothstep(.3, 1.05, d);
    float brk = smoothstep(.2, .35, noise(vec2(floor(q.x / sp) * 3.17, q.y * .022 + ang * 10.)));
    return line * brk;
  }

  void main() {
    vec2 uv = vUv;

    // Night, with torn scanlines and RGB split while the radio interference lasts
    vec2 guv = uv;
    if (uGlitch > .001) {
      float row = floor(uv.y * 70.), tt = floor(uTime * 18.);
      float on = step(.9, hash(vec2(tt, row * .37)));
      guv.x += (hash(vec2(row, tt)) - .5) * .035 * uGlitch * on;
    }
    vec3 night = texture2D(tNight, guv).rgb;
    if (uGlitch > .001) {
      night.r = mix(night.r, texture2D(tNight, guv + vec2(.004 * uGlitch, 0.)).r, .8);
      night.b = mix(night.b, texture2D(tNight, guv - vec2(.003 * uGlitch, 0.)).b, .8);
    }
    vec3 nCol = toSRGB(aces(night * uExposure));
    vec2 vv = uv - .5;
    nCol *= 1. - dot(vv, vv) * .95;
    nCol += (hash(gl_FragCoord.xy + fract(uTime * 7.) * 91.) - .5) * .03;
    if (uSketch <= .0005) { gl_FragColor = vec4(nCol, 1.); return; }

    // Reveal front
    vec4 pp = texture2D(tPaper, uv);
    vec3 paper = pp.rgb;
    float field = pp.a * 2.;
    float t = mix(-.35, 2.2, uSketch);
    float paperM = smoothstep(field, field + .07, t);
    if (paperM <= 0.) { gl_FragColor = vec4(nCol, 1.); return; }
    float lineM = smoothstep(field, field + .12, t - .10);
    float washM = smoothstep(field, field + .2, t - .26);
    float rim = paperM * (1. - paperM) * 4.;
    vec2 pu = vec2(uv.x * uAspect, uv.y);

    // Watercolour: the pigment drifts away from the pencil line
    vec2 bl = (vec2(noise(pu * 5.5 + 3.), noise(pu * 5.5 + 9.)) - .5) * .016;
    vec4 dB = texture2D(tDay, uv + bl);
    vec2 r = uTexel * uPR * 7.;
    float ab = 0.;
    ab += texture2D(tDay, uv + bl + vec2(r.x, 0.)).a; ab += texture2D(tDay, uv + bl - vec2(r.x, 0.)).a;
    ab += texture2D(tDay, uv + bl + vec2(0., r.y)).a; ab += texture2D(tDay, uv + bl - vec2(0., r.y)).a;
    ab += texture2D(tDay, uv + bl + r * .7).a; ab += texture2D(tDay, uv + bl - r * .7).a;
    ab += texture2D(tDay, uv + bl + vec2(r.x, -r.y) * .7).a; ab += texture2D(tDay, uv + bl + vec2(-r.x, r.y) * .7).a;
    ab /= 8.;
    vec3 pig = toSRGB(dB.rgb);
    pig = mix(vec3(1.), pig, .9);
    float gran = noise(gl_FragCoord.xy * .42 / uPR) * .55 + noise(pu * 95.) * .45;
    pig *= 1. - .14 * gran * dB.a;
    float pool = dB.a * (1. - ab);
    pig *= 1. - .55 * pool;
    pig = mix(pig, pig * pig, .35 * smoothstep(.42, .8, fbm(pu * 3.2 + 5.)));
    vec3 col = paper * mix(vec3(1.), pig, dB.a * washM);

    // Graphite: two wobbly passes of the contour plus hatching in the dark areas
    float bt = uBoil;
    vec2 w1 = (vec2(noise(pu * 8. + bt * 3.1), noise(pu * 8. + 17. + bt * 3.1)) - .5) * .0042;
    vec2 w2 = (vec2(noise(pu * 12. + 40. + bt * 2.3), noise(pu * 12. + 60. + bt * 2.3)) - .5) * .0075;
    float e1 = edgeAt(uv + w1), e2 = edgeAt(uv + w2);
    vec2 fp = gl_FragCoord.xy / uPR;
    float graph = .5 + .5 * noise(rot(.5) * fp * vec2(1.3, .09));
    float e = max(e1, e2 * .5) * graph;
    vec4 dS = texture2D(tDay, uv + w1);
    float L = lum(toSRGB(dS.rgb));
    float dark = (1. - L) * dS.a;
    float hv = hatch(fp, .8, 6.5) * smoothstep(.4, .62, dark) + hatch(fp, -.72, 5.) * smoothstep(.6, .82, dark);
    hv *= .55 * graph;
    float ink = clamp(e * .95 + hv, 0., 1.) * lineM;
    col = mix(col, vec3(.16, .15, .155), ink);

    // Wet edge of the reveal
    col = mix(col, col * vec3(.6, .46, .32), rim * .6);
    col += (hash(gl_FragCoord.xy * 1.3 + fract(uTime) * 13.) - .5) * .018;
    gl_FragColor = vec4(mix(nCol, col, paperM), 1.);
  }
`;
