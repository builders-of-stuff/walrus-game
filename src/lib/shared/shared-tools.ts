import { fabric } from 'fabric';
import { bcs } from '@mysten/sui/bcs';
import {
  isValidSuiObjectId,
  isValidSuiAddress,
  fromB64,
  fromHEX,
  toHEX
} from '@mysten/sui/utils';
import baseX from 'base-x';

import Walrus from '$lib/assets/walrus-250.png';
import Penguin from '$lib/assets/penguin-150.png';
import Fish from '$lib/assets/fish-32.png';
import Fire from '$lib/assets/fire-40.png';

import { OBJECT_IDS, CANVAS_BG_HEIGHT, CANVAS_BG_WIDTH } from './shared.constant';

const BASE36 = '0123456789abcdefghijklmnopqrstuvwxyz';
const b36 = baseX(BASE36);

export const getObjectId = (key: string) => {
  return OBJECT_IDS[key];
};

export function getSubdomain(hostname: string) {
  const parts = hostname.split('.');

  if (parts.length > 2) {
    return parts[0];
  }

  return null;
}

export function subdomainToObjectId(subdomain: string): string | null {
  const objectId = '0x' + toHEX(b36.decode(subdomain.toLowerCase()));
  console.log(
    'obtained object id: ',
    objectId,
    isValidSuiObjectId(objectId),
    isValidSuiAddress(objectId)
  );
  return isValidSuiObjectId(objectId) ? objectId : null;
}

export function calculateRelativePosition(x, y, imgWidth, imgHeight) {
  return {
    // Using original size of PlayMat image
    left: (x / CANVAS_BG_WIDTH) * imgWidth,
    top: (y / CANVAS_BG_HEIGHT) * imgHeight
  };
}

export const updateCanvasSize = (fabricCanvas, containerDiv) => {
  fabricCanvas.setWidth(containerDiv.clientWidth);
  fabricCanvas.setHeight(containerDiv.clientHeight);
  fabricCanvas.renderAll();
};

/**
 * Event handlers
 */
export function handleMouseDown(opt, fabricCanvas) {
  const evt = opt.e;
  startDragging(evt.clientX, evt.clientY, fabricCanvas);
}

export function handleMouseMove(opt, fabricCanvas, imgWidth, imgHeight) {
  if (fabricCanvas.isDragging) {
    const evt = opt.e;
    moveCanvas(evt.clientX, evt.clientY, fabricCanvas, imgWidth, imgHeight);
  }
}

export function handleMouseUp(fabricCanvas) {
  fabricCanvas.isDragging = false;
}

export function startDragging(x, y, fabricCanvas) {
  fabricCanvas.isDragging = true;
  fabricCanvas.lastPosX = x;
  fabricCanvas.lastPosY = y;
}

export function moveCanvas(x, y, fabricCanvas, imgWidth, imgHeight) {
  const vpt = fabricCanvas.viewportTransform;

  // Calculate the new position
  let newX = vpt[4] + x - fabricCanvas.lastPosX;
  let newY = vpt[5] + y - fabricCanvas.lastPosY;

  // Limit the dragging within the image boundaries
  const maxX = 0;
  const minX = fabricCanvas.width - imgWidth;
  const maxY = 0;
  const minY = fabricCanvas.height - imgHeight;

  newX = Math.min(Math.max(newX, minX), maxX);
  newY = Math.min(Math.max(newY, minY), maxY);

  // Update the viewport transform
  vpt[4] = newX;
  vpt[5] = newY;

  fabricCanvas.requestRenderAll();
  fabricCanvas.lastPosX = x;
  fabricCanvas.lastPosY = y;

  fabricCanvas.forEachObject((obj) => {
    obj.setCoords();
  });
}

export function paintWalrus(imgWidth, imgHeight, fabricCanvas, clickCallback) {
  const walrusPosition = calculateRelativePosition(100, 200, imgWidth, imgHeight);

  fabric.Image.fromURL(Walrus, (img) => {
    // Set image properties
    img.set({
      left: walrusPosition.left,
      top: walrusPosition.top,
      scaleX: (0.5 * imgWidth) / CANVAS_BG_WIDTH,
      scaleY: (0.5 * imgHeight) / CANVAS_BG_HEIGHT,
      selectable: false,
      evented: true,
      hoverCursor: 'pointer'
    });

    const group = new fabric.Group([img], {
      selectable: false,
      evented: true,
      hoverCursor: 'pointer'
    }) as any;

    const originalTop = group.top;

    // Add hover effect
    group.on('mousedown', () => {
      group.animate('top', originalTop - 10, {
        duration: 200,
        onChange: fabricCanvas.renderAll.bind(fabricCanvas),
        easing: fabric.util.ease.easeOutCubic
      });
    });

    group.on('mouseup', () => {
      group.animate('top', originalTop, {
        duration: 200,
        onChange: fabricCanvas.renderAll.bind(fabricCanvas),
        easing: fabric.util.ease.easeOutCubic
      });

      clickCallback();

      addFishImage(fabricCanvas, group.left + group.width / 2, group.top);
    });

    group.on('mouseup', function () {});

    // Add the image to the canvas
    fabricCanvas.add(group);
    group.bringToFront();
    fabricCanvas.renderAll();
  });
}

export function paintFire(imgWidth, imgHeight, fabricCanvas, clickCallback) {
  const firePosition = calculateRelativePosition(230, 240, imgWidth, imgHeight);

  fabric.Image.fromURL(Fire, (img) => {
    // Set image properties
    img.set({
      left: firePosition.left,
      top: firePosition.top,
      scaleX: (1.5 * imgWidth) / CANVAS_BG_WIDTH,
      scaleY: (1.5 * imgHeight) / CANVAS_BG_HEIGHT,
      selectable: false,
      evented: true,
      hoverCursor: 'pointer'
    });

    const group = new fabric.Group([img], {
      selectable: false,
      evented: true,
      hoverCursor: 'pointer'
    }) as any;

    const originalTop = group.top;

    // Add hover effect
    group.on('mousedown', () => {
      // group.animate('top', originalTop - 10, {
      //   duration: 200,
      //   onChange: fabricCanvas.renderAll.bind(fabricCanvas),
      //   easing: fabric.util.ease.easeOutCubic
      // });
    });

    group.on('mouseup', () => {
      // group.animate('top', originalTop, {
      //   duration: 200,
      //   onChange: fabricCanvas.renderAll.bind(fabricCanvas),
      //   easing: fabric.util.ease.easeOutCubic
      // });

      clickCallback();
    });

    // Add the image to the canvas
    fabricCanvas.add(group);
    group.bringToFront();
    fabricCanvas.renderAll();
  });
}

function addFishImage(canvas, x, y) {
  fabric.Image.fromURL(Fish, (img: any) => {
    img.set({
      left: x,
      top: y,
      originX: 'center',
      originY: 'center',
      scaleX: 2,
      scaleY: 2,
      selectable: false,
      evented: false,
      opacity: 1
    });

    canvas.add(img);
    img.bringToFront();

    // Animate the fish image
    const animateFish = () => {
      img.animate(
        {
          top: img?.top - 50,
          opacity: 0
        },
        {
          duration: 1000,
          onChange: canvas.renderAll.bind(canvas),
          onComplete: () => {
            canvas.remove(img);
            canvas.renderAll();
          }
        }
      );
    };

    // Start the animation after a short delay
    setTimeout(animateFish, 20);
  });
}

/**
 * Penguin
 */
export function paintPenguin(imgWidth, imgHeight, fabricCanvas) {
  /**
   * Penguin
   */

  const penguinX = 300 + Math.random() * 100 * 5;
  const penguinY = 200 + Math.random() * 100 * 4;

  const penguinPosition = calculateRelativePosition(
    penguinX,
    penguinY,
    imgWidth,
    imgHeight
  );

  fabric.Image.fromURL(Penguin, (img) => {
    // Set image properties
    img.set({
      left: penguinPosition.left,
      top: penguinPosition.top,
      scaleX: (0.5 * imgWidth) / CANVAS_BG_WIDTH,
      scaleY: (0.5 * imgHeight) / CANVAS_BG_HEIGHT,
      selectable: false,
      evented: true,
      hoverCursor: 'pointer'
    });

    const group = new fabric.Group([img], {
      selectable: false,
      evented: true,
      hoverCursor: 'pointer'
    }) as any;

    // Add hover effect
    group.on('mousedown', () => {
      group.animate('top', group?.top - 10, {
        duration: 200,
        onChange: fabricCanvas.renderAll.bind(fabricCanvas),
        easing: fabric.util.ease.easeOutCubic
      });
    });

    group.on('mouseup', () => {
      group.animate('top', group?.top + 10, {
        duration: 200,
        onChange: fabricCanvas.renderAll.bind(fabricCanvas),
        easing: fabric.util.ease.easeOutCubic
      });
    });

    group.on('mouseup', function () {});

    // Add the image to the canvas
    fabricCanvas.add(group);
    group.bringToFront();
    fabricCanvas.renderAll();
  });
}
