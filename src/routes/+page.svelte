<script lang="ts">
  import { fabric } from 'fabric';
  import {
    ConnectButton,
    testnetWalletAdapter,
    walletAdapter as productionWalletAdapter
  } from '@builders-of-stuff/svelte-sui-wallet-adapter';
  import { onMount, tick, untrack } from 'svelte';

  import { PUBLIC_NODE_ENV } from '$env/static/public';
  import { Transaction } from '@mysten/sui/transactions';

  import { Button } from '$lib/components/ui/button';
  import {
    paintPenguin,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    updateCanvasSize,
    getObjectId,
    paintWalrus
  } from '$lib/shared/shared-tools';
  import { buyPenguin, claimWalrusFish, mintWalrus, burnWalrus } from '$lib/sdk/sdk';
  import Ice from '$lib/assets/ice-1080x720.png';

  /**
   * - Walrus fishing label
   * - fishing localStorage integration
   * - Navbar update
   *   - Fish count
   *  - Claim fish integration
   *
   */

  const walletAdapter =
    PUBLIC_NODE_ENV === 'production' ? productionWalletAdapter : testnetWalletAdapter;

  const walrusObjectId =
    '0x7331fcc8beda6ad4509ea2a6c70c24e6b7d23945084533fb353aab5fd83a5b6a';

  let canvas;
  let fabricCanvas;
  let containerDiv;
  let imgWidth, imgHeight;

  let hasCheckedOwnedObjects = $state(false);

  let walrus = $state(null as any);

  const penguins = $derived(walrus?.penguins || []);
  const fishLastClaimedAt = $derived(walrus?.fishLastClaimedAt || 0);

  const handleMintWalrus = async () => {
    const mintResponse = (await mintWalrus()) as any;

    const walrusId = mintResponse?.objectChanges?.find?.((obj) => {
      return (
        obj?.objectType === `${getObjectId('OG_WALRUS_GAME_PACKAGE')}::walrus::Walrus`
      );
    })?.objectId;

    // wait 2 seconds b/c notFound error (syncing?)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const walrusObject = (await walletAdapter.suiClient.getObject({
      id: walrusId,
      options: {
        showContent: true,
        showDisplay: true,
        showOwner: true,
        showType: true,
        showStorageRebate: true
      }
    })) as any;

    walrus = walrusObject?.data?.content?.fields;

    if (walrus) {
      paintWalrus(imgWidth, imgHeight, fabricCanvas);
    }
  };

  const handleBurnWalrus = async () => {
    const burnResponse = (await burnWalrus(walrus.id?.id)) as any;

    console.log('burnResponse: ', burnResponse);
  };

  /**
   * Mount canvas
   */
  onMount(() => {
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

  /**
   * Fetch existing walrus upon connect
   */
  $effect(() => {
    if (!walletAdapter.isConnected || !!walrus?.id || hasCheckedOwnedObjects) {
      return;
    }

    untrack(() => {
      (async () => {
        const ownedObjects = await walletAdapter.suiClient.getOwnedObjects({
          owner: walletAdapter?.currentAccount?.address as any,
          filter: {
            StructType: `${getObjectId('OG_WALRUS_GAME_PACKAGE')}::walrus::Walrus`
          },
          options: {
            showContent: true,
            showDisplay: true,
            showOwner: true,
            showType: true,
            showStorageRebate: true
          }
        });

        const walrusId = ownedObjects?.data?.[0]?.data?.objectId;
        hasCheckedOwnedObjects = true;

        if (!walrusId) {
          return;
        }

        const object = (await walletAdapter.suiClient.getObject({
          id: walrusId,
          options: {
            showContent: true,
            showDisplay: true,
            showOwner: true,
            showType: true,
            showStorageRebate: true
          }
        })) as any;

        walrus = object?.data?.content?.fields;

        paintWalrus(imgWidth, imgHeight, fabricCanvas);
      })();
    });
  });
</script>

<ConnectButton {walletAdapter} />

<Button onclick={handleMintWalrus}>Mint walrus</Button>
<Button onclick={() => claimWalrusFish(walrusObjectId)}>Claim walrus fish</Button>
<Button onclick={() => buyPenguin(walrusObjectId)}>Buy penguin</Button>
<Button>Claim penguin fish</Button>
<Button onclick={handleBurnWalrus}>Burn walrus</Button>

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
