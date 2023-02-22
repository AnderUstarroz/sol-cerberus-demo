import {
  nft_metadata_pda,
  sc_app_pda,
  sc_role_pda,
  sc_rule_pda,
} from "sol-cerberus-js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import {
  DEMO_PROGRAM,
  SC_APP_ID,
  SOL_CERBERUS,
  addressType,
  METAPLEX,
  USER_WITH_NFT2,
  PROVIDER_WALLET,
} from "./constants";
import { expect } from "chai";
import { demo_pda } from "./common";

describe("Triangle master", () => {
  let appPda = null; // Populated on before() block
  let demoPda = null; // Populated on before() block
  let resource = "Triangle";
  let collection = null;
  let nftAllowedCollection = null;
  let tokenAccountPda = null;
  let role = "TriangleMaster";
  let rolePda = null;
  let addPerm = "Add";
  let addRulePda = null;
  let updatePerm = "Update";
  let updateRulePda = null;
  let deletePerm = "Delete";
  let deleteRulePda = null;
  let metadataPDA = null;

  before(async () => {
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
    tokenAccountPda = await getAssociatedTokenAddress(
      nftAllowedCollection.mintAddress,
      USER_WITH_NFT2.publicKey
    );
    metadataPDA = await nft_metadata_pda(nftAllowedCollection.mintAddress);
  });
  it(`Assign "${role}" role to NFT collection address`, async () => {
    await SOL_CERBERUS.methods
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
  });

  it("Not allowed to: Add, Update, Delete", async () => {
    let results: any = await Promise.allSettled([
      DEMO_PROGRAM.methods
        .addTriangle("ff0000", 50)
        .accounts({
          demo: demoPda,
          solCerberusApp: appPda,
          solCerberusRule: null,
          solCerberusRole: null,
          solCerberusTokenAcc: tokenAccountPda,
          solCerberusMetadata: metadataPDA,
          solCerberus: SOL_CERBERUS.programId,
          signer: USER_WITH_NFT2.publicKey,
        })
        .signers([USER_WITH_NFT2])
        .rpc(),
      DEMO_PROGRAM.methods
        .updateTriangle("ff0000", 50)
        .accounts({
          demo: demoPda,
          solCerberusApp: appPda,
          solCerberusRule: null,
          solCerberusRole: null,
          solCerberusTokenAcc: tokenAccountPda,
          solCerberusMetadata: metadataPDA,
          solCerberus: SOL_CERBERUS.programId,
          signer: USER_WITH_NFT2.publicKey,
        })
        .signers([USER_WITH_NFT2])
        .rpc(),
      DEMO_PROGRAM.methods
        .deleteTriangle()
        .accounts({
          demo: demoPda,
          solCerberusApp: appPda,
          solCerberusRule: null,
          solCerberusRole: null,
          solCerberusTokenAcc: tokenAccountPda,
          solCerberusMetadata: metadataPDA,
          solCerberus: SOL_CERBERUS.programId,
          signer: USER_WITH_NFT2.publicKey,
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
    await SOL_CERBERUS.methods
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

    await DEMO_PROGRAM.methods
      .addTriangle("ff0000", 50)
      .accounts({
        demo: demoPda,
        solCerberusApp: appPda,
        solCerberusRule: addRulePda,
        solCerberusRole: rolePda,
        solCerberusTokenAcc: tokenAccountPda,
        solCerberusMetadata: metadataPDA,
        solCerberus: SOL_CERBERUS.programId,
        signer: USER_WITH_NFT2.publicKey,
      })
      .signers([USER_WITH_NFT2])
      .rpc();
    let demo = await DEMO_PROGRAM.account.demo.fetch(demoPda);
    expect(demo.triangle.size).to.equal(50);
    expect(demo.triangle.color).to.equal("ff0000");
  });

  it("Allow Update", async () => {
    await SOL_CERBERUS.methods
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

    await DEMO_PROGRAM.methods
      .updateTriangle("0f0f0f", 60)
      .accounts({
        demo: demoPda,
        solCerberusApp: appPda,
        solCerberusRule: updateRulePda,
        solCerberusRole: rolePda,
        solCerberusTokenAcc: tokenAccountPda,
        solCerberusMetadata: metadataPDA,
        solCerberus: SOL_CERBERUS.programId,
        signer: USER_WITH_NFT2.publicKey,
      })
      .signers([USER_WITH_NFT2])
      .rpc();
    let demo = await DEMO_PROGRAM.account.demo.fetch(demoPda);
    expect(demo.triangle.size).to.equal(60);
    expect(demo.triangle.color).to.equal("0f0f0f");
  });
  it("Allow Delete", async () => {
    await SOL_CERBERUS.methods
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

    await DEMO_PROGRAM.methods
      .deleteTriangle()
      .accounts({
        demo: demoPda,
        solCerberusApp: appPda,
        solCerberusRule: deleteRulePda,
        solCerberusRole: rolePda,
        solCerberusTokenAcc: tokenAccountPda,
        solCerberusMetadata: metadataPDA,
        solCerberus: SOL_CERBERUS.programId,
        signer: USER_WITH_NFT2.publicKey,
      })
      .signers([USER_WITH_NFT2])
      .rpc();
    let demo = await DEMO_PROGRAM.account.demo.fetch(demoPda);
    expect(demo.triangle).to.equal(null);
  });
});
