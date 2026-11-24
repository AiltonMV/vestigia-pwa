import { MathUtils } from 'three';

/** The game's view of the scene: how many quarter turns the player has made with Q / E. */
export interface GameView {
  turns: number;
}

/** Where the camera looks from before the first turn, as an angle on the island. */
const FIRST_YAW = MathUtils.degToRad(15);
const QUARTER_TURN = Math.PI / 2;

/**
 * Angle on the island the camera looks from after `turns` quarter turns (fractions mid-turn).
 * E turns the view clockwise seen from above, as in the game.
 */
export const headingYaw = (turns: number) => FIRST_YAW - turns * QUARTER_TURN;
