import ColorConverter from 'cie-rgb-color-converter';

import { HueColor } from 'types/hue';
import { MAX_COLOR_VALUE } from 'constants/govee';

export const convertHueToGovee = (hueColor: HueColor) => {
  const { x, y } = hueColor.xy;
  const rgb = ColorConverter.xyBriToRgb(x, y, 75);
  const govee = (rgb.r * 256 + rgb.g) * 256 + rgb.b;

  console.info('Updating color', { govee, hueColor, rgb });

  if (govee > MAX_COLOR_VALUE) {
    return 0;
  }

  return govee;
};
