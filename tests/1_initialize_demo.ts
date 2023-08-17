import { SolCerberus } from "sol-cerberus-js";
import {
  ALLOWED_WALLET,
  DEMO_PROGRAM,
  PROVIDER,
  SC_APP_ID,
  USER_WITH_NFT1,
  USER_WITH_NFT2,
} from "./constants";
import { expect } from "chai";
import { demo_pda, safe_airdrop } from "./common";
import * as anchor from "@project-serum/anchor";

describe("Initialize", () => {
  let solCerberus: SolCerberus = null; // Populated on before() block

  before(async () => {
    solCerberus = new SolCerberus(PROVIDER.connection, PROVIDER.wallet, {
      appId: SC_APP_ID,
    });
    // Request SOL to create NFTs on next tests
    safe_airdrop(
      PROVIDER.connection,
      PROVIDER.wallet.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL // 2 SOL
    );
    // Request SOL for the allowed wallet
    safe_airdrop(
      PROVIDER.connection,
      ALLOWED_WALLET.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL // 2 SOL
    );
    // Request SOL for the allowed NFT
    safe_airdrop(
      PROVIDER.connection,
      USER_WITH_NFT1.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL // 2 SOL
    );
    // Request SOL for the allowed NFT Collection
    safe_airdrop(
      PROVIDER.connection,
      USER_WITH_NFT2.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL // 2 SOL
    );
  });

  it("Create Role-Based Access Control (RBAC)", async () => {
    await solCerberus.initializeApp("SolCerberusRBAC", null, {
      cached: false,
    });
    let app = await solCerberus.getAppData();
    expect(app.id.toBase58()).to.equal(SC_APP_ID.toBase58());
  });

  it("Initialize demo", async () => {
    let demoPda = await demo_pda(SC_APP_ID);
    await DEMO_PROGRAM.methods
      .initializeDemo(SC_APP_ID)
      .accounts({
        demo: demoPda,
      })
      .rpc();
    let demo = await DEMO_PROGRAM.account.demo.fetch(demoPda);
    expect(demo.solCerberusApp.toBase58()).to.equal(SC_APP_ID.toBase58());
  });

  after(async () => {
    solCerberus.disconnect();
  });
});
