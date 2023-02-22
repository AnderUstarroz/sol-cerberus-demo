import { sc_app_pda } from "sol-cerberus-js";
import { DEMO_PROGRAM, PROVIDER, SC_APP_ID, SOL_CERBERUS } from "./constants";
import { expect } from "chai";
import { demo_pda, safe_airdrop } from "./common";
import * as anchor from "@project-serum/anchor";

describe("Initialize", () => {
  let appPda = null; // Populated on before() block
  before(async () => {
    appPda = await sc_app_pda(SC_APP_ID);
    // Request SOL to create NFTs on next tests
    safe_airdrop(
      PROVIDER.connection,
      PROVIDER.wallet.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL // 5 SOL
    );
  });

  it("Create Access Control List", async () => {
    await SOL_CERBERUS.methods
      .initializeApp({
        id: SC_APP_ID,
        recovery: null,
        name: "SolCerberusACL",
      })
      .accounts({
        app: appPda,
      })
      .rpc();
    let app = await SOL_CERBERUS.account.app.fetch(appPda);
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
});
