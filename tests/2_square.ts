import {
  sc_app_pda,
  sc_role_pda,
  sc_rule_pda,
  SolCerberus,
} from "sol-cerberus-js";
import {
  DEMO_PROGRAM,
  SC_APP_ID,
  ALLOWED_WALLET,
  addressType,
  PROVIDER,
} from "./constants";
import { expect } from "chai";
import { demo_pda } from "./common";

describe("Square master", () => {
  let solCerberus: SolCerberus = null; // Populated on before() block
  let appPda = null;
  let demoPda = null;
  let resource = "Square";
  let role = "SquareMaster";
  let rolePda = null;
  let addPerm = "Add";
  let addRulePda = null;
  let updatePerm = "Update";
  let updateRulePda = null;
  let deletePerm = "Delete";
  let deleteRulePda = null;
  let myRoles = null;

  before(async () => {
    solCerberus = new SolCerberus(SC_APP_ID, PROVIDER);
    appPda = await sc_app_pda(SC_APP_ID);
    demoPda = await demo_pda(SC_APP_ID);
    rolePda = await sc_role_pda(SC_APP_ID, role, ALLOWED_WALLET.publicKey);
    addRulePda = await sc_rule_pda(SC_APP_ID, role, resource, addPerm);
    updateRulePda = await sc_rule_pda(SC_APP_ID, role, resource, updatePerm);
    deleteRulePda = await sc_rule_pda(SC_APP_ID, role, resource, deletePerm);
  });
  it(`Assign "${role}" role to Wallet`, async () => {
    await solCerberus.program.methods
      .assignRole({
        address: ALLOWED_WALLET.publicKey,
        role: role,
        addressType: addressType.Wallet,
        expiresAt: null,
      })
      .accounts({
        app: appPda,
        role: rolePda,
      })
      .rpc();
    myRoles = await solCerberus.assignedRoles([ALLOWED_WALLET.publicKey]);
  });

  it("Not allowed to: Add, Update, Delete", async () => {
    let results: any = await Promise.allSettled([
      DEMO_PROGRAM.methods
        .addSquare("ff0000", 50)
        .accounts({
          demo: demoPda,
          signer: ALLOWED_WALLET.publicKey,
          ...(await solCerberus.accounts(myRoles, "Square", "Add")),
        })
        .signers([ALLOWED_WALLET])
        .rpc(),
      DEMO_PROGRAM.methods
        .updateSquare("ff0000", 50)
        .accounts({
          demo: demoPda,
          signer: ALLOWED_WALLET.publicKey,
          ...(await solCerberus.accounts(myRoles, "Square", "Update")),
        })
        .signers([ALLOWED_WALLET])
        .rpc(),
      DEMO_PROGRAM.methods
        .deleteSquare()
        .accounts({
          demo: demoPda,
          signer: ALLOWED_WALLET.publicKey,
          ...(await solCerberus.accounts(myRoles, "Square", "Delete")),
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
  });

  it("Allow Add", async () => {
    await solCerberus.program.methods
      .addRule({
        namespace: 0,
        role: role,
        resource: resource,
        permission: addPerm,
        expiresAt: null,
      })
      .accounts({
        app: appPda,
        rule: addRulePda,
      })
      .rpc();

    await solCerberus.fetchPerms();
    await DEMO_PROGRAM.methods
      .addSquare("ff0000", 50)
      .accounts({
        demo: demoPda,
        signer: ALLOWED_WALLET.publicKey,
        ...(await solCerberus.accounts(myRoles, "Square", "Add")),
      })
      .signers([ALLOWED_WALLET])
      .rpc();
    let demo = await DEMO_PROGRAM.account.demo.fetch(demoPda);
    expect(demo.square.size).to.equal(50);
    expect(demo.square.color).to.equal("ff0000");
  });

  it("Allow Update", async () => {
    await solCerberus.program.methods
      .addRule({
        namespace: 0,
        role: role,
        resource: resource,
        permission: updatePerm,
        expiresAt: null,
      })
      .accounts({
        app: appPda,
        rule: updateRulePda,
      })
      .rpc();
    await solCerberus.fetchPerms();
    await DEMO_PROGRAM.methods
      .updateSquare("0f0f0f", 60)
      .accounts({
        demo: demoPda,
        signer: ALLOWED_WALLET.publicKey,
        ...(await solCerberus.accounts(myRoles, "Square", "Update")),
      })
      .signers([ALLOWED_WALLET])
      .rpc();
    let demo = await DEMO_PROGRAM.account.demo.fetch(demoPda);
    expect(demo.square.size).to.equal(60);
    expect(demo.square.color).to.equal("0f0f0f");
  });
  it("Allow Delete", async () => {
    await solCerberus.program.methods
      .addRule({
        namespace: 0,
        role: role,
        resource: resource,
        permission: deletePerm,
        expiresAt: null,
      })
      .accounts({
        app: appPda,
        rule: deleteRulePda,
      })
      .rpc();
    await solCerberus.fetchPerms();
    await DEMO_PROGRAM.methods
      .deleteSquare()
      .accounts({
        demo: demoPda,
        signer: ALLOWED_WALLET.publicKey,
        ...(await solCerberus.accounts(myRoles, "Square", "Delete")),
      })
      .signers([ALLOWED_WALLET])
      .rpc();
    let demo = await DEMO_PROGRAM.account.demo.fetch(demoPda);
    expect(demo.square).to.equal(null);
  });
  after(async () => {
    solCerberus.destroy();
  });
});
