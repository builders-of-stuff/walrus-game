import { PUBLIC_NODE_ENV } from '$env/static/public';
import { getObjectId } from '$lib/shared/shared-tools';
import { testnetWalletAdapter } from '@builders-of-stuff/svelte-sui-wallet-adapter';
import { Transaction } from '@mysten/sui/transactions';

const walletAdapter = testnetWalletAdapter;

/**
 * Mint walrus
 */
export const mintWalrus = async () => {
  if (!walletAdapter?.currentAccount?.address) {
    return;
  }

  const tx = new Transaction();

  const [walrus] = tx.moveCall({
    target: `${getObjectId('WALRUS_GAME_PACKAGE')}::walrus::mint`,
    arguments: []
  });

  tx.transferObjects([walrus], walletAdapter?.currentAccount?.address);

  try {
    const { bytes, signature } = await walletAdapter.signTransaction(tx as any, {});

    const executedTx = await walletAdapter.executeTransaction({
      bytes,
      signature
    });

    return executedTx;
  } catch (e) {
    console.log(e);
  }
};

/**
 * Claims fish from walrus clicking
 */
export const claimWalrusFish = async (walrusObjectId: string, cb: any) => {
  const rawFishCount = Number(localStorage.getItem('fishCount')) || 0;
  const tx = new Transaction();

  tx.moveCall({
    target: `${getObjectId('WALRUS_GAME_PACKAGE')}::walrus::claim_fish`,
    arguments: [tx.object(`${walrusObjectId}`), tx.pure.u64(rawFishCount)]
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

    cb();

    console.log('executedTx: ', executedTx);
    return executedTx;
  } catch (e) {
    console.log(e);
  }
};

export const claimAllFish = async (
  walrusObjectId: string,
  walrusRawFishCount: number,
  now: number,
  fishLastClaimedAt: number,
  cb: any
) => {
  const tx = new Transaction();

  tx.moveCall({
    target: `${getObjectId('WALRUS_GAME_PACKAGE')}::walrus::claim_fish`,
    arguments: [tx.object(`${walrusObjectId}`), tx.pure.u64(walrusRawFishCount)]
  });

  tx.moveCall({
    target: `${getObjectId('WALRUS_GAME_PACKAGE')}::walrus::claim_penguin_fish`,
    arguments: [
      tx.object(`${walrusObjectId}`),
      tx.pure.u64(now),
      tx.pure.u64(fishLastClaimedAt)
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

    cb();

    console.log('executedTx: ', executedTx);
    return { executedTx, fishLastClaimedAt: now };
  } catch (e) {
    console.log(e);
  }
};

export const resetWalrus = async (walrusObjectId: string) => {
  const tx = new Transaction();

  tx.moveCall({
    target: `${getObjectId('WALRUS_GAME_PACKAGE')}::walrus::reset_walrus`,
    arguments: [tx.object(`${walrusObjectId}`)]
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
    return executedTx;
  } catch (e) {
    console.log(e);
  }
};

/**
 * Buy penguin
 */
export const buyPenguins = async (
  walrusObjectId: string,
  penguinQuantity: number,
  cb: any
) => {
  const tx = new Transaction();

  tx.moveCall({
    target: `${getObjectId('WALRUS_GAME_PACKAGE')}::walrus::buy_penguins`,
    arguments: [tx.object(`${walrusObjectId}`), tx.pure.u64(penguinQuantity)]
  });

  try {
    const { bytes, signature } = await walletAdapter.signTransaction(tx as any, {});

    const executedTx = await walletAdapter.suiClient.executeTransactionBlock({
      transactionBlock: bytes,
      signature,
      options: {
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
        showInput: true,
        showRawInput: true
      }
    });

    cb();

    console.log('executedTx: ', executedTx);
    return executedTx;
  } catch (e) {
    console.log(e);
  }
};

/**
 * Burn walrus
 */
export const burnWalrus = async (walrusObjectId: string) => {
  const tx = new Transaction();

  tx.moveCall({
    target: `${getObjectId('WALRUS_GAME_PACKAGE')}::walrus::burn_walrus`,
    arguments: [tx.object(`${walrusObjectId}`)]
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
    return executedTx;
  } catch (e) {
    console.log(e);
  }
};
