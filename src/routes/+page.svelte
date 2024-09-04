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
  import {
    addInteractiveAreas,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    updateCanvasSize
  } from '$lib/shared/shared-tools';
  import { fish, mintWalrus } from '$lib/sdk/sdk';
  import Ice from '$lib/assets/ice-1080x720.png';

  const walletAdapter =
    PUBLIC_NODE_ENV === 'production' ? productionWalletAdapter : testnetWalletAdapter;

  const walrusObjectId =
    '0x7331fcc8beda6ad4509ea2a6c70c24e6b7d23945084533fb353aab5fd83a5b6a';

  let canvas;
  let fabricCanvas;
  let containerDiv;

  /**
   * Mount canvas
   */
  onMount(() => {
    let imgWidth, imgHeight;

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
      addInteractiveAreas(imgWidth, imgHeight, fabricCanvas);
    });

    /**
     * Event listeners
     */
    // Enable panning
    fabricCanvas.on('mouse:down', (opt) => handleMouseDown(opt, fabricCanvas));
    fabricCanvas.on('mouse:move', (opt) =>
      handleMouseMove(opt, fabricCanvas, imgWidth, imgHeight)
    );
    fabricCanvas.on('mouse:up', () => handleMouseUp(fabricCanvas));

    // Resize canvas when window is resized
    window.addEventListener('resize', () =>
      updateCanvasSize(fabricCanvas, containerDiv)
    );

    return () => {
      window.removeEventListener('resize', () =>
        updateCanvasSize(fabricCanvas, containerDiv)
      );
    };
  });
</script>

<ConnectButton {walletAdapter} />

<Button onclick={mintWalrus}>Mint walrus</Button>
<Button onclick={() => fish(walrusObjectId)}>Fish</Button>
<Button>Claim fish</Button>
<Button>Add penguin</Button>

<div bind:this={containerDiv} class="canvas-container relative">
  <canvas bind:this={canvas}></canvas>
</div>

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
