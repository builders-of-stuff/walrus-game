<script lang="ts">
  import { PUBLIC_NODE_ENV } from '$env/static/public';
  import {
    ConnectButton,
    testnetWalletAdapter,
    walletAdapter as productionWalletAdapter
  } from '@builders-of-stuff/svelte-sui-wallet-adapter';
  import { Transaction } from '@mysten/sui/transactions';

  import { Button } from '$lib/components/ui/button';
  import { getObjectId } from '$lib/shared/shared-tools';

  const walletAdapter =
    PUBLIC_NODE_ENV === 'production' ? productionWalletAdapter : testnetWalletAdapter;

  const walrusObjectId =
    '0x7331fcc8beda6ad4509ea2a6c70c24e6b7d23945084533fb353aab5fd83a5b6a';

  /**
   * Mint walrus
   */
  const handleMintWalrus = async () => {
    const tx = new Transaction();

    tx.moveCall({
      target: `${getObjectId('WALRUS_GAME_PACKAGE')}::walrus::mint`,
      arguments: []
    });

    try {
      const { bytes, signature } = await walletAdapter.signTransaction(tx as any, {});

      const executedTx = await walletAdapter.executeTransaction({
        bytes,
        signature
      });

      console.log(executedTx);
    } catch (e) {
      console.log(e);
    }
  };

  const handleFish = async () => {
    const tx = new Transaction();

    tx.moveCall({
      target: `${getObjectId('WALRUS_GAME_PACKAGE')}::walrus::claim_fish`,
      arguments: [
        tx.object(`${walrusObjectId}`),
        tx.pure.u64(10),
        tx.pure.u64(Date.now())
      ]
    });

    try {
      const { bytes, signature } = await walletAdapter.signTransaction(tx as any, {});

      const executedTx = await walletAdapter.suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature: signature,
        options: {
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
          showInput: true,
          showRawInput: true
        }
      });

      console.log('executedTx: ', executedTx);
    } catch (e) {
      console.log(e);
    }
  };
</script>

<ConnectButton {walletAdapter} />

<Button onclick={handleMintWalrus}>Mint walrus</Button>
<Button onclick={handleFish}>Fish</Button>
<Button>Claim fish</Button>
<Button>Add penguin</Button>
