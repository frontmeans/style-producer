/**
 * @packageDocumentation
 * @module @frontmeans/style-producer
 */
import { StypColor, StypRGB } from './color';

/**
 * Mixes two colors.
 *
 * Both the `weight` and the relative opacity of each color determines how much of each color is in the result.
 *
 * @category CSS Value
 * @param color1  First color to mix
 * @param color2  Second color to mix.
 * @param weight  A number between `0` and `1`. A larger weight indicates that more of `color1` should be used, and a
 * smaller weight indicates that more of `color2` should be used.
 *
 * @returns Mixed color.
 */
export function mixStypColors(color1: StypColor, color2: StypColor, weight: number): StypColor {

  const w = weight * 2 - 1;
  const rgba1 = color1.rgb;
  const rgba2 = color2.rgb;
  const aDiff = rgba1.a - rgba2.a;
  const w1 = (((w * aDiff === -1) ? w : (w + aDiff) / (1 + w * aDiff)) + 1) / 2.0;
  const w2 = 1 - w1;
  return new StypRGB(
      {
        r: rgba1.r * w1 + rgba2.r * w2,
        g: rgba1.g * w1 + rgba2.g * w2,
        b: rgba1.b * w1 + rgba2.b * w2,
        a: rgba1.a * weight + rgba2.a * (1 - weight),
      },
      color1,
  );
}
