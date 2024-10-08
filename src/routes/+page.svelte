<script lang="ts">
  import { fabric } from 'fabric';
  import {
    ConnectButton,
    testnetWalletAdapter
  } from '@builders-of-stuff/svelte-sui-wallet-adapter';
  import { ShoppingCart } from 'lucide-svelte';
  import { onMount, untrack } from 'svelte';

  import { page } from '$app/stores';
  import { PUBLIC_NODE_ENV } from '$env/static/public';

  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as HoverCard from '$lib/components/ui/hover-card';
  import { Input } from '$lib/components/ui/input';

  import {
    paintPenguin,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    updateCanvasSize,
    getObjectId,
    paintWalrus,
    paintFire,
    subdomainToObjectId,
    getSubdomain
  } from '$lib/shared/shared-tools';
  import { PENGUIN_PRICE, PENGUIN_FISHING_POWER } from '$lib/shared/shared.constant';
  import {
    claimWalrusFish,
    mintWalrus,
    burnWalrus,
    buyPenguins,
    claimAllFish,
    resetWalrus
  } from '$lib/sdk/sdk';

  import Ice from '$lib/assets/ice-1080x720.png';
  import RawFish from '$lib/assets/fish-32.png';
  import Fish from '$lib/assets/cooked-fish-32.png';
  import Penguin from '$lib/assets/penguin-150.png';

  /**
   * - walrus game walrus fetching integration
   * - deploy
   * - video
   */

  const walletAdapter = testnetWalletAdapter;

  let canvas;
  let fabricCanvas;
  let containerDiv;
  let imgWidth, imgHeight;

  let hasMounted = $state(false);
  let hasCheckedOwnedObjects = $state(false);
  let isShopOpen = $state(false);
  let paintedPenguins = $state(0);
  let penguinBuyQuantity = $state(1);

  let walrus = $state(null as any);
  let fishCount = $state(0);
  // from walrus
  let rawFishCount = $state(0);
  let penguinRawFishCount = $state(0);

  const walrusFishingPower = $derived(Number(walrus?.total_fishing_power) || 0);
  const penguins = $derived(Number(walrus?.penguins) || 0);
  const penguinBuyCost = $derived(Number(penguinBuyQuantity) * PENGUIN_PRICE);
  const canBuyPenguins = $derived(fishCount >= penguinBuyCost);
  // e.g 1726326078992
  const fishLastClaimedAt = $derived.by(() => {
    if (!(penguins > 0)) {
      return null;
    }

    const hasClaimedPenguinFish = Number(walrus?.fish_last_claimed_at) > 0;

    return hasClaimedPenguinFish
      ? Number(walrus?.fish_last_claimed_at)
      : Number(localStorage.getItem(`${walrus?.id?.id}-initialPenguinCreatedAt`)) ||
          null;
  });

  const handleBuyPenguins = async (buyQuantity: number = 1) => {
    await buyPenguins(walrus.id?.id, buyQuantity, () => {
      if (!(penguins > 0)) {
        const walrusId = walrus.id?.id;
        const initialPenguinCreatedAt = localStorage.getItem(
          `${walrusId}-initialPenguinCreatedAt`
        );

        if (!initialPenguinCreatedAt) {
          localStorage.setItem(
            `${walrusId}-initialPenguinCreatedAt`,
            Date.now().toString()
          );
        }
      }

      fishCount -= buyQuantity * PENGUIN_PRICE;
      walrus.penguins = Number(walrus?.penguins) + buyQuantity;
      walrus.total_fishing_power =
        walrusFishingPower + buyQuantity * PENGUIN_FISHING_POWER;
      isShopOpen = false;
    });
  };

  const handleClaimWalrusFish = async () => {
    await claimWalrusFish(walrus.id?.id, () => {
      fishCount += rawFishCount;
      rawFishCount -= rawFishCount;
    });
  };

  const handleClaimAllFish = async () => {
    const now = Date.now();

    if (penguinRawFishCount > 0 && penguins > 0) {
      await claimAllFish(
        walrus.id?.id,
        rawFishCount,
        now,
        fishLastClaimedAt as number,
        () => {
          fishCount += rawFishCount + penguinRawFishCount;
          rawFishCount -= rawFishCount;
          penguinRawFishCount -= penguinRawFishCount;
          walrus.fish_last_claimed_at = now;
        }
      );
    } else {
      await handleClaimWalrusFish();
    }
  };

  const handleMintWalrus = async () => {
    const mintResponse = (await mintWalrus()) as any;

    const walrusId = mintResponse?.objectChanges?.find?.((obj) => {
      return (
        obj?.objectType === `${getObjectId('WALRUS_GAME_PACKAGE')}::walrus::Walrus`
      );
    })?.objectId;

    // wait 2 seconds b/c notFound error (syncing?)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Works but incredibly slow, even more than the manual setTimeout
    // await walletAdapter?.suiClient.waitForTransaction({ digest: mintResponse.digest });

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
      paintWalrus(imgWidth, imgHeight, fabricCanvas, handleWalrusClick);
      paintFire(imgWidth, imgHeight, fabricCanvas, handleClaimAllFish);
      isShopOpen = false;
    }
  };

  const handleBurnWalrus = async () => {
    const burnResponse = (await burnWalrus(walrus.id?.id)) as any;

    console.log('burnResponse: ', burnResponse);
  };

  function handleWalrusClick() {
    rawFishCount += 1;
  }

  /**
   * ===========================================================================================================================
   */
  $effect(() => {
    console.log('page: ', $page);

    // const objectId = subdomainToObjectId();
  });

  $effect(() => {
    console.log('walrus: ', $state.snapshot(walrus));
  });

  onMount(() => {
    rawFishCount = Number(localStorage.getItem('fishCount')) || 0;

    /**
     * Mount canvas
     */
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

      console.log('---');
      console.log('fabricCanvas: ', fabricCanvas);
      console.log('fabricCanvas.width: ', fabricCanvas.width);
      console.log('img: ', img);
      console.log('img.width: ', img.width);
      console.log('scaleFactor: ', scaleFactor);
      console.log('---');

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
      hasMounted = true;
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
   * Sync rawFishCount with localStorage
   */
  $effect(() => {
    localStorage.setItem('fishCount', rawFishCount.toString());
  });

  /**
   * Set penguinRawFishCount
   */
  $effect(() => {
    if (!fishLastClaimedAt) {
      return;
    }

    const interval = setInterval(() => {
      const timeDifference = Date.now() - Number(fishLastClaimedAt);

      penguinRawFishCount = Math.round((timeDifference * walrusFishingPower) / 60000);
    }, 1000);

    return () => clearInterval(interval);
  });

  /**
   * Penguin painting
   */
  $effect(() => {
    if (!(walrus?.penguins > 0) || walrus?.penguins === paintedPenguins) {
      return;
    }

    const penguinsToPaint = Number(walrus?.penguins) - paintedPenguins;

    Array(Number(penguinsToPaint))
      .fill('snoot snoot')
      .forEach((_, i) => {
        paintPenguin(imgWidth, imgHeight, fabricCanvas);
        paintedPenguins += 1;
      });
  });

  const isAdminMode = localStorage.getItem('isAdminMode') === 'true';

  /**
   * Fetch existing walrus upon connect
   */
  $effect(() => {
    const walrusId = subdomainToObjectId(getSubdomain($page.url.hostname) as any);

    // if (!walletAdapter.isConnected || !!walrus?.id || hasCheckedOwnedObjects) {
    //   return;
    // }

    if (!walrusId || !!walrus?.id || hasCheckedOwnedObjects || !hasMounted) {
      return;
    }
    console.log('hasMounted: ', hasMounted);

    untrack(() => {
      (async () => {
        // const ownedObjects = await walletAdapter.suiClient.getOwnedObjects({
        //   owner: walletAdapter?.currentAccount?.address as any,
        //   filter: {
        //     StructType: `${getObjectId('WALRUS_GAME_PACKAGE')}::walrus::Walrus`
        //   },
        //   options: {
        //     showContent: true,
        //     showDisplay: true,
        //     showOwner: true,
        //     showType: true,
        //     showStorageRebate: true
        //   }
        // });

        // const walrusId = ownedObjects?.data?.[0]?.data?.objectId;
        // hasCheckedOwnedObjects = true;

        const walrusId = subdomainToObjectId(getSubdomain($page.url.hostname) as any);

        console.log('$page.url: ', $page.url);
        console.log('walrusId: ', walrusId);
        console.log(
          'getSubdomain($page.url.hostname): ',
          getSubdomain($page.url.hostname)
        );

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

        console.log('object: ', object);

        /**
         * - Set walrus
         * - Set fishCount
         * - Set lastClaimedAt anchor (if needed)
         */
        walrus = object?.data?.content?.fields;
        fishCount = Number(walrus?.fish_count);

        hasCheckedOwnedObjects = true;

        /**
         * For pre-first time penguin anchoring last claimed time
         */
        const hasClaimedPenguinFish = Number(walrus.fish_last_claimed_at) > 0;
        if (!hasClaimedPenguinFish && penguins > 0) {
          const walrusId = walrus.id?.id;
          const initialPenguinCreatedAt = localStorage.getItem(
            `${walrusId}-initialPenguinCreatedAt`
          );

          if (!initialPenguinCreatedAt) {
            localStorage.setItem(
              `${walrusId}-initialPenguinCreatedAt`,
              Date.now().toString()
            );
          }
        }

        console.log('imgWidth: ', imgWidth);
        console.log('imgHeight: ', imgHeight);
        paintWalrus(imgWidth, imgHeight, fabricCanvas, handleWalrusClick);
        paintFire(imgWidth, imgHeight, fabricCanvas, handleClaimAllFish);
      })();
    });
  });
</script>

<div class="mx-2 my-2 flex justify-between">
  <div class="flex gap-1">
    <!-- Shop -->

    <Dialog.Root bind:open={isShopOpen}>
      <Dialog.Trigger>
        <Button class="flex items-center gap-2">
          <ShoppingCart size={18} />
          Shop
        </Button>
      </Dialog.Trigger>
      <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
          <Dialog.Title class="mb-4 text-center text-2xl font-bold"
            >The Walrus Shop</Dialog.Title
          >
        </Dialog.Header>
        <div class="grid gap-4">
          <div class="grid grid-cols-1 gap-4">
            {#if isAdminMode}
              <Button
                variant="outline"
                class="flex h-24 flex-col items-center justify-center"
                onclick={handleMintWalrus}
              >
                <img
                  src="/path-to-walrus-icon.png"
                  alt="Walrus"
                  class="mb-2 h-12 w-12"
                />
                Mint Walrus
              </Button>
            {/if}
            <div
              class="flex h-24 flex-col items-center justify-center rounded-md border p-2"
            >
              <img src={Penguin} alt="Penguin" class="mb-2 h-12 w-12" />
              <div class="flex items-center">
                <Input
                  type="number"
                  min="1"
                  class="mx-2 w-14 text-center"
                  bind:value={penguinBuyQuantity}
                />
              </div>
            </div>
          </div>
          <Button
            disabled={!canBuyPenguins}
            class="w-full"
            onclick={() => handleBuyPenguins(penguinBuyQuantity)}
          >
            Buy {penguinBuyQuantity} Penguin{penguinBuyQuantity > 1 ? 's' : ''} for {penguinBuyCost}
            <img src={Fish} alt="fishstick" class="h-12 w-12" />
            (cooked fish)
          </Button>
        </div>
        <Dialog.Footer class="mt-4">
          <Button variant="outline" onclick={() => (isShopOpen = false)}
            >Close Shop</Button
          >
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>

    <!-- Raw fish -->
    <HoverCard.Root openDelay={200}>
      <HoverCard.Trigger>
        <Badge variant="secondary" class="flex items-center gap-1">
          {rawFishCount + penguinRawFishCount}
          <img src={RawFish} alt="Fish" class="h-8 w-8" />
        </Badge>
      </HoverCard.Trigger>
      <HoverCard.Content>Raw fish</HoverCard.Content>
    </HoverCard.Root>

    <!-- Cooked fish -->
    <HoverCard.Root openDelay={200}>
      <HoverCard.Trigger>
        <Badge variant="secondary" class="flex items-center gap-1">
          {fishCount} <img src={Fish} alt="Fish" class="h-8 w-8" />
        </Badge>
      </HoverCard.Trigger>
      <HoverCard.Content>Cooked fish</HoverCard.Content>
    </HoverCard.Root>

    <!-- Penguins -->
    <HoverCard.Root openDelay={200}>
      <HoverCard.Trigger>
        <Badge variant="secondary" class="flex items-center gap-1">
          {penguins} <img src={Penguin} alt="Fish" class="h-8 w-8" />
        </Badge>
      </HoverCard.Trigger>
      <HoverCard.Content>Penguins</HoverCard.Content>
    </HoverCard.Root>

    <!-- Admin stuff -->
    {#if isAdminMode}
      <Button onclick={() => resetWalrus(walrus.id?.id)}>Reset walrus</Button>
      <Button onclick={handleBurnWalrus}>Burn walrus</Button>
    {/if}
  </div>

  <!-- Connect -->
  <div class="flex gap-1">
    <ConnectButton {walletAdapter} />
  </div>
</div>

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
