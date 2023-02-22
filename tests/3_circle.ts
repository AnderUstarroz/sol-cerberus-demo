import { sc_app_pda, sc_role_pda, sc_rule_pda } from "sol-cerberus-js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import {
  DEMO_PROGRAM,
  SC_APP_ID,
  SOL_CERBERUS,
  addressType,
  METAPLEX,
  USER_WITH_NFT1,
} from "./constants";
import { expect } from "chai";
import { demo_pda } from "./common";

describe("Circle master", () => {
  let appPda = null; // Populated on before() block
  let demoPda = null; // Populated on before() block
  let resource = "Circle";
  let allowedNft = null;
  let tokenAccountPda = null;
  let role = "CircleMaster";
  let rolePda = null;
  let addPerm = "Add";
  let addRulePda = null;
  let updatePerm = "Update";
  let updateRulePda = null;
  let deletePerm = "Delete";
  let deleteRulePda = null;

  before(async () => {
    appPda = await sc_app_pda(SC_APP_ID);
    demoPda = await demo_pda(SC_APP_ID);
    rolePda = await sc_role_pda(SC_APP_ID, role, USER_WITH_NFT1.publicKey);
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
    tokenAccountPda = await getAssociatedTokenAddress(
      allowedNft.mintAddress,
      USER_WITH_NFT1.publicKey
    );
  });
  it(`Assign "${role}" role to NFT`, async () => {
    const rolePda = await sc_role_pda(
      SC_APP_ID,
      role,
      USER_WITH_NFT1.publicKey
    );
    await SOL_CERBERUS.methods
      .assignRole({
        address: USER_WITH_NFT1.publicKey,
        role: role,
        addressType: addressType.Wallet,
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
        .addCircle("ff0000", 50)
        .accounts({
          demo: demoPda,
          solCerberusApp: appPda,
          solCerberusRule: null,
          solCerberusRole: null,
          solCerberusTokenAcc: tokenAccountPda,
          solCerberusMetadata: null,
          solCerberus: SOL_CERBERUS.programId,
          signer: USER_WITH_NFT1.publicKey,
        })
        .signers([USER_WITH_NFT1])
        .rpc(),
      DEMO_PROGRAM.methods
        .updateCircle("ff0000", 50)
        .accounts({
          demo: demoPda,
          solCerberusApp: appPda,
          solCerberusRule: null,
          solCerberusRole: null,
          solCerberusTokenAcc: tokenAccountPda,
          solCerberusMetadata: null,
          solCerberus: SOL_CERBERUS.programId,
          signer: USER_WITH_NFT1.publicKey,
        })
        .signers([USER_WITH_NFT1])
        .rpc(),
      DEMO_PROGRAM.methods
        .deleteCircle()
        .accounts({
          demo: demoPda,
          solCerberusApp: appPda,
          solCerberusRule: null,
          solCerberusRole: null,
          solCerberusTokenAcc: tokenAccountPda,
          solCerberusMetadata: null,
          solCerberus: SOL_CERBERUS.programId,
          signer: USER_WITH_NFT1.publicKey,
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
      .addCircle("ff0000", 50)
      .accounts({
        demo: demoPda,
        solCerberusApp: appPda,
        solCerberusRule: addRulePda,
        solCerberusRole: rolePda,
        solCerberusTokenAcc: tokenAccountPda,
        solCerberusMetadata: null,
        solCerberus: SOL_CERBERUS.programId,
        signer: USER_WITH_NFT1.publicKey,
      })
      .signers([USER_WITH_NFT1])
      .rpc();
    let demo = await DEMO_PROGRAM.account.demo.fetch(demoPda);
    expect(demo.circle.size).to.equal(50);
    expect(demo.circle.color).to.equal("ff0000");
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
      .updateCircle("0f0f0f", 60)
      .accounts({
        demo: demoPda,
        solCerberusApp: appPda,
        solCerberusRule: updateRulePda,
        solCerberusRole: rolePda,
        solCerberusTokenAcc: tokenAccountPda,
        solCerberusMetadata: null,
        solCerberus: SOL_CERBERUS.programId,
        signer: USER_WITH_NFT1.publicKey,
      })
      .signers([USER_WITH_NFT1])
      .rpc();
    let demo = await DEMO_PROGRAM.account.demo.fetch(demoPda);
    expect(demo.circle.size).to.equal(60);
    expect(demo.circle.color).to.equal("0f0f0f");
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
      .deleteCircle()
      .accounts({
        demo: demoPda,
        solCerberusApp: appPda,
        solCerberusRule: deleteRulePda,
        solCerberusRole: rolePda,
        solCerberusTokenAcc: tokenAccountPda,
        solCerberusMetadata: null,
        solCerberus: SOL_CERBERUS.programId,
        signer: USER_WITH_NFT1.publicKey,
      })
      .signers([USER_WITH_NFT1])
      .rpc();
    let demo = await DEMO_PROGRAM.account.demo.fetch(demoPda);
    expect(demo.circle).to.equal(null);
  });
});
