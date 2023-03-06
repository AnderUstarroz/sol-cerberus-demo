import {
  sc_app_pda,
  sc_role_pda,
  sc_rule_pda,
  SolCerberus,
} from "sol-cerberus-js";
import {
  DEMO_PROGRAM,
  SC_APP_ID,
  addressType,
  METAPLEX,
  USER_WITH_NFT2,
  PROVIDER_WALLET,
  PROVIDER,
} from "./constants";
import { expect } from "chai";
import { demo_pda } from "./common";

describe("Triangle master", () => {
  let solCerberus: SolCerberus = null; // Populated on before() block
  let appPda = null; // Populated on before() block
  let demoPda = null;
  let resource = "Triangle";
  let collection = null;
  let nftAllowedCollection = null;
  let role = "TriangleMaster";
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
    solCerberus.wallet = USER_WITH_NFT2.publicKey;
    appPda = await sc_app_pda(SC_APP_ID);
    demoPda = await demo_pda(SC_APP_ID);
    addRulePda = await sc_rule_pda(SC_APP_ID, role, resource, addPerm);
    updateRulePda = await sc_rule_pda(SC_APP_ID, role, resource, updatePerm);
    deleteRulePda = await sc_rule_pda(SC_APP_ID, role, resource, deletePerm);
    collection = await METAPLEX.nfts().create({
      name: "Collection",
      sellerFeeBasisPoints: 0,
      uri: "https://arweave.net/collection1-hash",
      isMutable: true,
      isCollection: true,
    });
    nftAllowedCollection = await METAPLEX.nfts().create({
      name: "Allowed collection",
      sellerFeeBasisPoints: 0,
      uri: "https://arweave.net/nft2-hash",
      tokenOwner: USER_WITH_NFT2.publicKey,
      isMutable: true,
      collection: collection.mintAddress,
      collectionAuthority: PROVIDER_WALLET.payer, // This will set the Collection verified flag to true
    });
    rolePda = await sc_role_pda(SC_APP_ID, role, collection.mintAddress);
  });
  it(`Assign "${role}" role to NFT collection address`, async () => {
    await solCerberus.program.methods
      .assignRole({
        address: collection.mintAddress,
        role: role,
        addressType: addressType.Collection,
        expiresAt: null,
      })
      .accounts({
        app: appPda,
        role: rolePda,
      })
      .rpc();
    myRoles = await solCerberus.assignedRoles([collection.mintAddress], {
      [collection.mintAddress]: nftAllowedCollection.mintAddress,
    });
  });

  it("Not allowed to: Add, Update, Delete", async () => {
    let results: any = await Promise.allSettled([
      DEMO_PROGRAM.methods
        .addTriangle("ff0000", 50)
        .accounts({
          demo: demoPda,
          signer: USER_WITH_NFT2.publicKey,
          ...(await solCerberus.accounts(myRoles, "Triangle", "Add")),
        })
        .signers([USER_WITH_NFT2])
        .rpc(),
      DEMO_PROGRAM.methods
        .updateTriangle("ff0000", 50)
        .accounts({
          demo: demoPda,
          signer: USER_WITH_NFT2.publicKey,
          ...(await solCerberus.accounts(myRoles, "Triangle", "Update")),
        })
        .signers([USER_WITH_NFT2])
        .rpc(),
      DEMO_PROGRAM.methods
        .deleteTriangle()
        .accounts({
          demo: demoPda,
          signer: USER_WITH_NFT2.publicKey,
          ...(await solCerberus.accounts(myRoles, "Triangle", "Delete")),
        })
        .signers([USER_WITH_NFT2])
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
      .addTriangle("ff0000", 50)
      .accounts({
        demo: demoPda,
        signer: USER_WITH_NFT2.publicKey,
        ...(await solCerberus.accounts(myRoles, "Triangle", "Add")),
      })
      .signers([USER_WITH_NFT2])
      .rpc();
    let demo = await DEMO_PROGRAM.account.demo.fetch(demoPda);
    expect(demo.triangle.size).to.equal(50);
    expect(demo.triangle.color).to.equal("ff0000");
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
      .updateTriangle("0f0f0f", 60)
      .accounts({
        demo: demoPda,
        signer: USER_WITH_NFT2.publicKey,
        ...(await solCerberus.accounts(myRoles, "Triangle", "Update")),
      })
      .signers([USER_WITH_NFT2])
      .rpc();
    let demo = await DEMO_PROGRAM.account.demo.fetch(demoPda);
    expect(demo.triangle.size).to.equal(60);
    expect(demo.triangle.color).to.equal("0f0f0f");
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
      .deleteTriangle()
      .accounts({
        demo: demoPda,
        signer: USER_WITH_NFT2.publicKey,
        ...(await solCerberus.accounts(myRoles, "Triangle", "Delete")),
      })
      .signers([USER_WITH_NFT2])
      .rpc();
    let demo = await DEMO_PROGRAM.account.demo.fetch(demoPda);
    expect(demo.triangle).to.equal(null);
  });
  after(async () => {
    solCerberus.destroy();
  });
});
