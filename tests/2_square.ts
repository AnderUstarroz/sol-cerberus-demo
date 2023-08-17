import { SolCerberus, addressTypes } from "sol-cerberus-js";
import { DEMO_PROGRAM, SC_APP_ID, ALLOWED_WALLET, PROVIDER } from "./constants";
import { expect } from "chai";
import { demo_pda } from "./common";

describe("Square master", () => {
  let solCerberus: SolCerberus = null; // Populated on before() block
  let demoPda = null;
  let resource = "Square";
  let role = "SquareMaster";
  let addPerm = "Add";
  let updatePerm = "Update";
  let deletePerm = "Delete";

  before(async () => {
    solCerberus = new SolCerberus(PROVIDER.connection, PROVIDER.wallet, {
      appId: SC_APP_ID,
    });
    demoPda = await demo_pda(SC_APP_ID);
  });

  it(`Assign "${role}" role to Wallet`, async () => {
    await solCerberus.assignRole(
      role,
      addressTypes.Wallet,
      ALLOWED_WALLET.publicKey
    );
  });

  it("Not allowed to: Add, Update, Delete", async () => {
    await solCerberus.login({ wallet: ALLOWED_WALLET.publicKey });
    let results: any = await Promise.allSettled([
      DEMO_PROGRAM.methods
        .addSquare("ff0000", 50)
        .accounts({
          demo: demoPda,
          signer: ALLOWED_WALLET.publicKey,
          ...(await solCerberus.accounts("Square", "Add")),
        })
        .signers([ALLOWED_WALLET])
        .rpc(),
      DEMO_PROGRAM.methods
        .updateSquare("ff0000", 50)
        .accounts({
          demo: demoPda,
          signer: ALLOWED_WALLET.publicKey,
          ...(await solCerberus.accounts("Square", "Update")),
        })
        .signers([ALLOWED_WALLET])
        .rpc(),
      DEMO_PROGRAM.methods
        .deleteSquare()
        .accounts({
          demo: demoPda,
          signer: ALLOWED_WALLET.publicKey,
          ...(await solCerberus.accounts("Square", "Delete")),
        })
        .signers([ALLOWED_WALLET])
        .rpc(),
    ]);
    // Assert Add, Update, Delete are Unauthorized:
    expect(3).to.equal(
      results.filter(
        (e) =>
          e.status === "rejected" &&
          e.reason.error.errorCode.code === "Unauthorized"
      ).length
    );
    // Login as authority to create "Add", "Update" and "Delete" rules
    await solCerberus.login({ wallet: PROVIDER.wallet.publicKey });
    await solCerberus.addRule(role, resource, addPerm);
    await solCerberus.addRule(role, resource, updatePerm);
    await solCerberus.addRule(role, resource, deletePerm);
    // Login back as the allowed wallet
    await solCerberus.login({ wallet: ALLOWED_WALLET.publicKey });
    await solCerberus.fetchPerms();
  });

  it("Allow Add", async () => {
    await DEMO_PROGRAM.methods
      .addSquare("ff0000", 50)
      .accounts({
        demo: demoPda,
        signer: ALLOWED_WALLET.publicKey,
        ...(await solCerberus.accounts("Square", "Add")),
      })
      .signers([ALLOWED_WALLET])
      .rpc();
    let demo = await DEMO_PROGRAM.account.demo.fetch(demoPda);
    expect(demo.square.size).to.equal(50);
    expect(demo.square.color).to.equal("ff0000");
  });

  it("Allow Update", async () => {
    await DEMO_PROGRAM.methods
      .updateSquare("0f0f0f", 60)
      .accounts({
        demo: demoPda,
        signer: ALLOWED_WALLET.publicKey,
        ...(await solCerberus.accounts("Square", "Update")),
      })
      .signers([ALLOWED_WALLET])
      .rpc();
    let demo = await DEMO_PROGRAM.account.demo.fetch(demoPda);
    expect(demo.square.size).to.equal(60);
    expect(demo.square.color).to.equal("0f0f0f");
  });
  it("Allow Delete", async () => {
    await DEMO_PROGRAM.methods
      .deleteSquare()
      .accounts({
        demo: demoPda,
        signer: ALLOWED_WALLET.publicKey,
        ...(await solCerberus.accounts("Square", "Delete")),
      })
      .signers([ALLOWED_WALLET])
      .rpc();
    let demo = await DEMO_PROGRAM.account.demo.fetch(demoPda);
    expect(demo.square).to.equal(null);
  });

  after(async () => {
    solCerberus.disconnect();
  });
});
