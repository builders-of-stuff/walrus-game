import { PUBLIC_NODE_ENV } from '$env/static/public';
import { getObjectId } from '$lib/shared/shared-tools';
import {
  testnetWalletAdapter,
  walletAdapter as productionWalletAdapter
} from '@builders-of-stuff/svelte-sui-wallet-adapter';
import { Transaction } from '@mysten/sui/transactions';

const walletAdapter =
  PUBLIC_NODE_ENV === 'production' ? productionWalletAdapter : testnetWalletAdapter;

export const mintWalrus = async () => {
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

export const fish = async (walrusObjectId: string) => {
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
