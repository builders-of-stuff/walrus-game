import { OBJECT_IDS, CANVAS_BG_HEIGHT, CANVAS_BG_WIDTH } from './shared.constant';

export const getObjectId = (key: string) => {
  return OBJECT_IDS[key];
};

import {} from './shared.constant';

export function calculateRelativePosition(x, y, imgWidth, imgHeight) {
  return {
    // Using original size of PlayMat image
    left: (x / CANVAS_BG_WIDTH) * imgWidth,
    top: (y / CANVAS_BG_HEIGHT) * imgHeight
  };
}
