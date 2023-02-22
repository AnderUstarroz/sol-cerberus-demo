import * as anchor from "@project-serum/anchor";
import { DEMO_PROGRAM } from "./constants";

export async function demo_pda(scAppId: anchor.web3.PublicKey) {
  return (
    await anchor.web3.PublicKey.findProgramAddressSync(
      [anchor.utils.bytes.utf8.encode("sol-cerberus-demo"), scAppId.toBuffer()],
      DEMO_PROGRAM.programId
    )
  )[0];
}

export async function safe_airdrop(
  connection: anchor.web3.Connection,
  destination: anchor.web3.PublicKey,
  lamports = 100_000_000
) {
  // Maximum amount of Lamports per transaction (Devnet allows up to 2SOL per transaction)
  const maxSolPerTx = 2_000_000_000;
  let balance = await connection.getBalance(destination);
  while (balance < lamports) {
    try {
      const latestBlockHash = await connection.getLatestBlockhash();
      // Request Airdrop for user
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: await connection.requestAirdrop(
          destination,
          Math.min(lamports - balance, maxSolPerTx)
        ),
      });
      balance = await connection.getBalance(destination);
    } catch {}
  }
}
