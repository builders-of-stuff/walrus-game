import { fabric } from 'fabric';

import Walrus from '$lib/assets/walrus-250.png';
import Penguin from '$lib/assets/penguin-150.png';

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

/**
 * Interactive areas
 */
export function addInteractiveAreas(imgWidth, imgHeight, fabricCanvas) {
  /**
   * Walrus
   */
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

  /**
   * Penguin
   */
  const penguinPosition = calculateRelativePosition(100, 100, imgWidth, imgHeight);

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
