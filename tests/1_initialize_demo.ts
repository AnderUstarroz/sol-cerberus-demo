import { sc_app_pda } from "sol-cerberus-js";
import { DEMO_PROGRAM, SC_APP, SOL_CERBERUS } from "./constants";
import { expect } from "chai";
import { demo_pda } from "./common";

describe("Initialize", () => {
  let appPDA = null; // Populated on before() block
  before(async () => {
    console.log(SOL_CERBERUS);
    appPDA = await sc_app_pda(SC_APP);
  });
  it("Create Sol Cerberus Access Control List", async () => {
    await SOL_CERBERUS.methods
      .initializeApp({
        id: SC_APP,
        recovery: null,
        name: "SolCerberusACL",
      })
      .accounts({
        app: appPDA,
      })
      .rpc();
    let app = await SOL_CERBERUS.account.app.fetch(appPDA);
    expect(app.id.toBase58()).to.equal(SC_APP.toBase58());
  });
  it("Initialize demo", async () => {
    let demoPda = await demo_pda(SC_APP);
    await DEMO_PROGRAM.methods
      .initializeDemo(SC_APP)
      .accounts({
        demo: demoPda,
      })
      .rpc();
    let demo = await DEMO_PROGRAM.account.demo.fetch(demoPda);
    expect(demo.solCerberusApp.toBase58()).to.equal(SC_APP.toBase58());
  });
});
