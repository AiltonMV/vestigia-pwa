import {
  DepthTexture,
  HalfFloatType,
  LinearFilter,
  Mesh,
  MeshNormalMaterial,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  UnsignedByteType,
  UnsignedIntType,
  Vector2,
  WebGLRenderTarget,
  type FogExp2,
  type PerspectiveCamera,
  type TextureDataType,
  type WebGLRenderer,
} from 'three';
import type { StoryFrame } from '@/views/story/StoryClock';
import { LAYERS } from './sceneLayout';
import type { SceneLook } from './SceneLook';
import { COMPOSITE_FRAGMENT } from './shaders/composite';
import { FULLSCREEN_VERTEX } from './shaders/noise';
import { PAPER_FRAGMENT } from './shaders/paper';

const EXPOSURE = 1.15;
/** Below/above these the notebook (or the night) is fully hidden, so its passes are skipped. */
const SKETCH_VISIBLE = 0.0005;
const NIGHT_VISIBLE = 0.9999;
/** How often per second the pencil lines "boil" (redraw with a new tremor). */
const BOIL_RATE = 6;

function createTarget(type: TextureDataType, samples: number, withDepth = false) {
  const target = new WebGLRenderTarget(2, 2, {
    type,
    samples,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
  });
  if (withDepth) {
    target.depthTexture = new DepthTexture(2, 2);
    target.depthTexture.type = UnsignedIntType;
  }
  return target;
}

function fullscreenScene(material: ShaderMaterial, geometry: PlaneGeometry) {
  const scene = new Scene();
  scene.add(new Mesh(geometry, material));
  return scene;
}

/**
 * Renders the scene in up to three passes and composes them into the final image:
 * night (HDR, sky, sea, rain, beam), day (clean albedo) and normals + depth. The last two only
 * run while the notebook is on screen.
 */
export class RenderPipeline {
  private readonly night: WebGLRenderTarget;
  private readonly day = createTarget(UnsignedByteType, 4);
  private readonly normals = createTarget(UnsignedByteType, 0, true);
  private readonly paper = createTarget(UnsignedByteType, 0);
  private readonly normalMaterial = new MeshNormalMaterial();
  private readonly quad = new PlaneGeometry(2, 2);
  private readonly ortho = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly paperMaterial: ShaderMaterial;
  private readonly compositeMaterial: ShaderMaterial;
  private readonly paperScene: Scene;
  private readonly compositeScene: Scene;

  constructor(gl: WebGLRenderer) {
    const floatColor = gl.extensions.has('EXT_color_buffer_float');
    this.night = createTarget(floatColor ? HalfFloatType : UnsignedByteType, 4);

    this.paperMaterial = new ShaderMaterial({
      uniforms: { uAspect: { value: 1 }, uPR: { value: 1 }, uSeed: { value: Math.random() * 10 } },
      vertexShader: FULLSCREEN_VERTEX,
      fragmentShader: PAPER_FRAGMENT,
    });
    this.compositeMaterial = new ShaderMaterial({
      uniforms: {
        tNight: { value: this.night.texture },
        tDay: { value: this.day.texture },
        tNormal: { value: this.normals.texture },
        tDepth: { value: this.normals.depthTexture },
        tPaper: { value: this.paper.texture },
        uTexel: { value: new Vector2() },
        uPR: { value: 1 },
        uAspect: { value: 1 },
        uSketch: { value: 0 },
        uTime: { value: 0 },
        uBoil: { value: 0 },
        uNear: { value: 0.1 },
        uFar: { value: 140 },
        uGlitch: { value: 0 },
        uExposure: { value: EXPOSURE },
      },
      vertexShader: FULLSCREEN_VERTEX,
      fragmentShader: COMPOSITE_FRAGMENT,
    });
    this.paperScene = fullscreenScene(this.paperMaterial, this.quad);
    this.compositeScene = fullscreenScene(this.compositeMaterial, this.quad);
  }

  resize(gl: WebGLRenderer, width: number, height: number, pixelRatio: number) {
    const bufferWidth = Math.floor(width * pixelRatio);
    const bufferHeight = Math.floor(height * pixelRatio);
    for (const target of [this.night, this.day, this.normals, this.paper]) {
      target.setSize(bufferWidth, bufferHeight);
    }
    const aspect = width / height;
    const composite = this.compositeMaterial.uniforms;
    composite.uTexel.value.set(1 / bufferWidth, 1 / bufferHeight);
    composite.uPR.value = pixelRatio;
    composite.uAspect.value = aspect;
    this.paperMaterial.uniforms.uAspect.value = aspect;
    this.paperMaterial.uniforms.uPR.value = pixelRatio;

    // The paper only changes with the screen size, so it's baked once here.
    gl.setRenderTarget(this.paper);
    gl.render(this.paperScene, this.ortho);
    gl.setRenderTarget(null);
  }

  render(
    gl: WebGLRenderer,
    scene: Scene,
    camera: PerspectiveCamera,
    look: SceneLook,
    frame: StoryFrame,
    lampPulse: number,
  ) {
    const fog = scene.fog as FogExp2 | null;
    const { sketch } = frame;
    // Shadows are the same in every pass: compute them once per frame.
    gl.shadowMap.needsUpdate = true;

    if (sketch < NIGHT_VISIBLE) {
      look.apply('night', fog, frame.flash, lampPulse);
      camera.layers.set(LAYERS.solid);
      camera.layers.enable(LAYERS.night);
      camera.layers.enable(LAYERS.title);
      gl.setRenderTarget(this.night);
      gl.setClearColor(0x000000, 1);
      gl.clear();
      gl.render(scene, camera);
    }

    if (sketch > SKETCH_VISIBLE) {
      look.apply('day', fog, frame.flash, lampPulse);
      camera.layers.set(LAYERS.solid);
      camera.layers.enable(LAYERS.title);
      gl.setRenderTarget(this.day);
      gl.setClearColor(0xffffff, 0);
      gl.clear();
      gl.render(scene, camera);

      camera.layers.set(LAYERS.solid);
      scene.overrideMaterial = this.normalMaterial;
      gl.setRenderTarget(this.normals);
      gl.setClearColor(0x000000, 0);
      gl.clear();
      gl.render(scene, camera);
      scene.overrideMaterial = null;
    }

    const uniforms = this.compositeMaterial.uniforms;
    uniforms.uSketch.value = sketch;
    uniforms.uTime.value = frame.time;
    uniforms.uGlitch.value = frame.glitch;
    uniforms.uBoil.value = frame.reducedMotion ? 0 : Math.floor(frame.time * BOIL_RATE) * 1.37;
    uniforms.uNear.value = camera.near;
    uniforms.uFar.value = camera.far;
    gl.setRenderTarget(null);
    gl.render(this.compositeScene, this.ortho);
  }

  dispose() {
    for (const target of [this.night, this.day, this.normals, this.paper]) target.dispose();
    this.normalMaterial.dispose();
    this.paperMaterial.dispose();
    this.compositeMaterial.dispose();
    this.quad.dispose();
  }
}
