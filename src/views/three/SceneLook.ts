import {
  Color,
  type DirectionalLight,
  type FogExp2,
  type HemisphereLight,
  type MeshStandardMaterial,
  type PointLight,
} from 'three';

export const NIGHT_FOG_DENSITY = 0.034;

interface Look {
  sky: Color;
  ground: Color;
  hemisphere: number;
  sunColor: Color;
  sun: number;
  lamp: number;
  fog: number;
  /** Multiplier for glowing materials (lamp, windows). */
  emissive: number;
  /** Lightning only lights up the night. */
  storm: boolean;
}

const LOOKS = {
  night: {
    sky: new Color('#1b3352'),
    ground: new Color('#020509'),
    hemisphere: 0.55,
    sunColor: new Color('#9db4d6'),
    sun: 0.75,
    lamp: 14,
    fog: NIGHT_FOG_DENSITY,
    emissive: 1,
    storm: true,
  },
  day: {
    sky: new Color('#fffaf0'),
    ground: new Color('#b9a88e'),
    hemisphere: 1.9,
    sunColor: new Color('#fff2dc'),
    sun: 2.4,
    lamp: 0,
    fog: 0,
    emissive: 0,
    storm: false,
  },
} satisfies Record<string, Look>;

export type LookMode = keyof typeof LOOKS;

/**
 * The same lights and materials render the scene twice: as the stormy night, and as a clean
 * daylight model the notebook drawing is traced from. This switches them between both looks.
 */
export class SceneLook {
  private hemisphere: HemisphereLight | null = null;
  private sun: DirectionalLight | null = null;
  private lamp: PointLight | null = null;
  /** 1 while rendering the daylight pass; shared as a uniform by materials that react to it. */
  readonly day = { value: 0 };
  private readonly emissive = new Map<MeshStandardMaterial, number>();

  setHemisphere(light: HemisphereLight | null) {
    this.hemisphere = light;
  }

  setSun(light: DirectionalLight | null) {
    this.sun = light;
  }

  setLamp(light: PointLight | null) {
    this.lamp = light;
  }

  addEmissive(material: MeshStandardMaterial, base: number) {
    this.emissive.set(material, base);
    return () => void this.emissive.delete(material);
  }

  apply(mode: LookMode, fog: FogExp2 | null, flash: number, lampPulse: number) {
    const look: Look = LOOKS[mode];
    const storm = look.storm ? flash : 0;
    if (this.hemisphere) {
      this.hemisphere.color.copy(look.sky);
      this.hemisphere.groundColor.copy(look.ground);
      this.hemisphere.intensity = look.hemisphere + storm * 3.5;
    }
    if (this.sun) {
      this.sun.color.copy(look.sunColor);
      this.sun.intensity = look.sun + storm * 2.5;
    }
    if (this.lamp) this.lamp.intensity = look.lamp * lampPulse;
    if (fog) fog.density = look.fog;
    const glow = look.emissive * (look.emissive ? lampPulse : 1);
    for (const [material, base] of this.emissive) material.emissiveIntensity = base * glow;
    this.day.value = mode === 'day' ? 1 : 0;
  }
}
