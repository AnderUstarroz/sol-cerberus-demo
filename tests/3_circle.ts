import {
  sc_app_pda,
  sc_role_pda,
  sc_rule_pda,
  addressType,
  SolCerberus,
  namespaces,
} from "sol-cerberus-js";
import {
  DEMO_PROGRAM,
  SC_APP_ID,
  METAPLEX,
  USER_WITH_NFT1,
  PROVIDER,
} from "./constants";
import { expect } from "chai";
import { demo_pda } from "./common";

describe("Circle master", () => {
  let solCerberus: SolCerberus = null; // Populated on before() block
  let appPda = null; // Populated on before() block
  let demoPda = null;
  let resource = "Circle";
  let allowedNft = null;
  let role = "CircleMaster";
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
    solCerberus.wallet = USER_WITH_NFT1.publicKey;
    appPda = await sc_app_pda(SC_APP_ID);
    demoPda = await demo_pda(SC_APP_ID);
    addRulePda = await sc_rule_pda(SC_APP_ID, role, resource, addPerm);
    updateRulePda = await sc_rule_pda(SC_APP_ID, role, resource, updatePerm);
    deleteRulePda = await sc_rule_pda(SC_APP_ID, role, resource, deletePerm);
    allowedNft = await METAPLEX.nfts().create({
      name: "Allowed NFT",
      sellerFeeBasisPoints: 0,
      uri: "https://arweave.net/nft1-hash",
      tokenOwner: USER_WITH_NFT1.publicKey,
      isMutable: true,
    });
    rolePda = await sc_role_pda(SC_APP_ID, role, allowedNft.mintAddress);
  });
  it(`Assign "${role}" role to NFT`, async () => {
    await solCerberus.program.methods
      .assignRole({
        address: allowedNft.mintAddress,
        role: role,
        addressType: addressType.NFT,
        expiresAt: null,
      })
      .accounts({
        app: appPda,
        role: rolePda,
      })
      .rpc();
    myRoles = await solCerberus.assignedRoles([allowedNft.mintAddress]);
  });

  it("Not allowed to: Add, Update, Delete", async () => {
    let results: any = await Promise.allSettled([
      DEMO_PROGRAM.methods
        .addCircle("ff0000", 50)
        .accounts({
          demo: demoPda,
          signer: USER_WITH_NFT1.publicKey,
          ...(await solCerberus.accounts(myRoles, "Circle", "Add")),
        })
        .signers([USER_WITH_NFT1])
        .rpc(),
      DEMO_PROGRAM.methods
        .updateCircle("ff0000", 50)
        .accounts({
          demo: demoPda,
          signer: USER_WITH_NFT1.publicKey,
          ...(await solCerberus.accounts(myRoles, "Circle", "Update")),
        })
        .signers([USER_WITH_NFT1])
        .rpc(),
      DEMO_PROGRAM.methods
        .deleteCircle()
        .accounts({
          demo: demoPda,
          signer: USER_WITH_NFT1.publicKey,
          ...(await solCerberus.accounts(myRoles, "Circle", "Delete")),
        })
        .signers([USER_WITH_NFT1])
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
        namespace: namespaces.Default,
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
      .addCircle("ff0000", 50)
      .accounts({
        demo: demoPda,
        signer: USER_WITH_NFT1.publicKey,
        ...(await solCerberus.accounts(myRoles, "Circle", "Add")),
      })
      .signers([USER_WITH_NFT1])
      .rpc();
    let demo = await DEMO_PROGRAM.account.demo.fetch(demoPda);
    expect(demo.circle.size).to.equal(50);
    expect(demo.circle.color).to.equal("ff0000");
  });

  it("Allow Update", async () => {
    await solCerberus.program.methods
      .addRule({
        namespace: namespaces.Default,
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
      .updateCircle("0f0f0f", 60)
      .accounts({
        demo: demoPda,
        signer: USER_WITH_NFT1.publicKey,
        ...(await solCerberus.accounts(myRoles, "Circle", "Update")),
      })
      .signers([USER_WITH_NFT1])
      .rpc();
    let demo = await DEMO_PROGRAM.account.demo.fetch(demoPda);
    expect(demo.circle.size).to.equal(60);
    expect(demo.circle.color).to.equal("0f0f0f");
  });
  it("Allow Delete", async () => {
    await solCerberus.program.methods
      .addRule({
        namespace: namespaces.Default,
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
      .deleteCircle()
      .accounts({
        demo: demoPda,
        signer: USER_WITH_NFT1.publicKey,
        ...(await solCerberus.accounts(myRoles, "Circle", "Delete")),
      })
      .signers([USER_WITH_NFT1])
      .rpc();
    let demo = await DEMO_PROGRAM.account.demo.fetch(demoPda);
    expect(demo.circle).to.equal(null);
  });
  after(async () => {
    solCerberus.destroy();
  });
});
