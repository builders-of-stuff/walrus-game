<script lang="ts">
  import { fabric } from 'fabric';
  import {
    ConnectButton,
    testnetWalletAdapter,
    walletAdapter as productionWalletAdapter
  } from '@builders-of-stuff/svelte-sui-wallet-adapter';
  import { onMount } from 'svelte';

  import { PUBLIC_NODE_ENV } from '$env/static/public';
  import { Transaction } from '@mysten/sui/transactions';

  import { Button } from '$lib/components/ui/button';
  import { calculateRelativePosition, getObjectId } from '$lib/shared/shared-tools';
  import { fish, mintWalrus } from '$lib/sdk/sdk';
  import Penguin from '$lib/assets/penguin-150.png';
  import Walrus from '$lib/assets/walrus-250.png';
  import Ice from '$lib/assets/ice-1080x720.png';
  import { CANVAS_BG_HEIGHT, CANVAS_BG_WIDTH } from '$lib/shared/shared.constant';

  const walletAdapter =
    PUBLIC_NODE_ENV === 'production' ? productionWalletAdapter : testnetWalletAdapter;

  const walrusObjectId =
    '0x7331fcc8beda6ad4509ea2a6c70c24e6b7d23945084533fb353aab5fd83a5b6a';

  let canvas;
  let fabricCanvas;
  let containerDiv;

  onMount(() => {
    let imgWidth, imgHeight;

    const updateCanvasSize = () => {
      fabricCanvas.setWidth(containerDiv.clientWidth);
      fabricCanvas.setHeight(containerDiv.clientHeight);
      fabricCanvas.renderAll();
    };

    fabricCanvas = new fabric.Canvas(canvas, {
      width: window.innerWidth,
      height: window.innerHeight,
      selection: false,
      interactive: false,
      enablePointerEvents: true
      // allowTouchScrolling: false
    });

    // Load your background image
    fabric.Image.fromURL(Ice, (img: any) => {
      img.set({
        originX: 'left',
        originY: 'top'
      });

      // Scale image to be larger than the canvas
      const scaleFactor = Math.max(
        (fabricCanvas.width / img.width) * 1,
        (fabricCanvas.height / img.height) * 1
      );

      imgWidth = img.width * scaleFactor;
      imgHeight = img.height * scaleFactor;

      img.scale(scaleFactor);

      fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas));

      // Center the image
      fabricCanvas.viewportTransform[4] =
        (fabricCanvas.width - img.width * scaleFactor) / 2;
      fabricCanvas.viewportTransform[5] =
        (fabricCanvas.height - img.height * scaleFactor) / 2;

      fabricCanvas.renderAll();
      addInteractiveAreas(imgWidth, imgHeight);
    });

    /**
     * Event listeners
     */
    // Enable panning
    fabricCanvas.on('mouse:down', handleMouseDown);
    fabricCanvas.on('mouse:move', handleMouseMove);
    fabricCanvas.on('mouse:up', handleMouseUp);

    function handleMouseDown(opt) {
      const evt = opt.e;
      startDragging(evt.clientX, evt.clientY);
    }

    function handleMouseMove(opt) {
      if (fabricCanvas.isDragging) {
        const evt = opt.e;
        moveCanvas(evt.clientX, evt.clientY);
      }
    }

    function handleMouseUp() {
      fabricCanvas.isDragging = false;
    }

    function startDragging(x, y) {
      fabricCanvas.isDragging = true;
      fabricCanvas.lastPosX = x;
      fabricCanvas.lastPosY = y;
    }

    function moveCanvas(x, y) {
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

    // Resize canvas when window is resized
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  });

  /**
   * Interactive areas
   */
  function addInteractiveAreas(imgWidth, imgHeight) {
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

      group.on('mouseup', function () {
        console.log('up');
      });

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

      group.on('mouseup', function () {
        console.log('up');
      });

      // Add the image to the canvas
      fabricCanvas.add(group);
      group.bringToFront();
      fabricCanvas.renderAll();
    });
  }
</script>

<div bind:this={containerDiv} class="canvas-container relative">
  <canvas bind:this={canvas}></canvas>
</div>

<ConnectButton {walletAdapter} />

<Button onclick={mintWalrus}>Mint walrus</Button>
<Button onclick={() => fish(walrusObjectId)}>Fish</Button>
<Button>Claim fish</Button>
<Button>Add penguin</Button>

<style>
  .canvas-container {
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
  canvas {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
  :global(.nav-item) {
    @apply font-semibold text-gray-800 transition-all duration-300 ease-in-out hover:text-blue-600;
    font-family: 'Helvetica', sans-serif;
  }
</style>
