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
  import { fish, mintWalrus } from '$lib/sdk/sdk';

  const walletAdapter =
    PUBLIC_NODE_ENV === 'production' ? productionWalletAdapter : testnetWalletAdapter;

  const walrusObjectId =
    '0x7331fcc8beda6ad4509ea2a6c70c24e6b7d23945084533fb353aab5fd83a5b6a';
</script>

<ConnectButton {walletAdapter} />

<Button onclick={mintWalrus}>Mint walrus</Button>
<Button onclick={() => fish(walrusObjectId)}>Fish</Button>
<Button>Claim fish</Button>
<Button>Add penguin</Button>
