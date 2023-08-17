import { SolCerberus, addressTypes } from "sol-cerberus-js";
import {
  DEMO_PROGRAM,
  SC_APP_ID,
  METAPLEX,
  USER_WITH_NFT2,
  PROVIDER_WALLET,
  PROVIDER,
} from "./constants";
import { expect } from "chai";
import { demo_pda } from "./common";

describe("Triangle master", () => {
  let solCerberus: SolCerberus = null; // Populated on before() block
  let demoPda = null;
  let resource = "Triangle";
  let collection = null;
  let nft = null;
  let role = "TriangleMaster";
  let addPerm = "Add";
  let updatePerm = "Update";
  let deletePerm = "Delete";

  before(async () => {
    solCerberus = new SolCerberus(PROVIDER.connection, PROVIDER.wallet, {
      appId: SC_APP_ID,
    });
    demoPda = await demo_pda(SC_APP_ID);
    collection = await METAPLEX.nfts().create({
      name: "Collection",
      sellerFeeBasisPoints: 0,
      uri: "https://arweave.net/collection1-hash",
      isMutable: true,
      isCollection: true,
    });
    nft = await METAPLEX.nfts().create({
      name: "Allowed collection",
      sellerFeeBasisPoints: 0,
      uri: "https://arweave.net/nft2-hash",
      tokenOwner: USER_WITH_NFT2.publicKey,
      isMutable: true,
      collection: collection.mintAddress,
      collectionAuthority: PROVIDER_WALLET.payer, // This will set the Collection verified flag to true
    });
  });
  it(`Assign "${role}" role to NFT collection address`, async () => {
    await solCerberus.assignRole(
      role,
      addressTypes.Collection,
      collection.mintAddress
    );
  });

  it("Not allowed to: Add, Update, Delete", async () => {
    await solCerberus.login({
      wallet: USER_WITH_NFT2.publicKey,
      nfts: [[nft.mintAddress, collection.mintAddress]],
    });
    let results: any = await Promise.allSettled([
      DEMO_PROGRAM.methods
        .addTriangle("ff0000", 50)
        .accounts({
          demo: demoPda,
          signer: USER_WITH_NFT2.publicKey,
          ...(await solCerberus.accounts("Triangle", "Add")),
        })
        .signers([USER_WITH_NFT2])
        .rpc(),
      DEMO_PROGRAM.methods
        .updateTriangle("ff0000", 50)
        .accounts({
          demo: demoPda,
          signer: USER_WITH_NFT2.publicKey,
          ...(await solCerberus.accounts("Triangle", "Update")),
        })
        .signers([USER_WITH_NFT2])
        .rpc(),
      DEMO_PROGRAM.methods
        .deleteTriangle()
        .accounts({
          demo: demoPda,
          signer: USER_WITH_NFT2.publicKey,
          ...(await solCerberus.accounts("Triangle", "Delete")),
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
    // Login as authority to create "Add", "Update" and "Delete" rules
    await solCerberus.login({ wallet: PROVIDER.wallet.publicKey });
    await solCerberus.addRule(role, resource, addPerm);
    await solCerberus.addRule(role, resource, updatePerm);
    await solCerberus.addRule(role, resource, deletePerm);
    // Login back as the allowed wallet
    await solCerberus.login({
      wallet: USER_WITH_NFT2.publicKey,
      nfts: [[nft.mintAddress, collection.mintAddress]],
    });
    await solCerberus.fetchPerms();
  });

  it("Allow Add", async () => {
    await DEMO_PROGRAM.methods
      .addTriangle("ff0000", 50)
      .accounts({
        demo: demoPda,
        signer: USER_WITH_NFT2.publicKey,
        ...(await solCerberus.accounts("Triangle", "Add")),
      })
      .signers([USER_WITH_NFT2])
      .rpc();
    let demo = await DEMO_PROGRAM.account.demo.fetch(demoPda);
    expect(demo.triangle.size).to.equal(50);
    expect(demo.triangle.color).to.equal("ff0000");
  });

  it("Allow Update", async () => {
    await DEMO_PROGRAM.methods
      .updateTriangle("0f0f0f", 60)
      .accounts({
        demo: demoPda,
        signer: USER_WITH_NFT2.publicKey,
        ...(await solCerberus.accounts("Triangle", "Update")),
      })
      .signers([USER_WITH_NFT2])
      .rpc();
    let demo = await DEMO_PROGRAM.account.demo.fetch(demoPda);
    expect(demo.triangle.size).to.equal(60);
    expect(demo.triangle.color).to.equal("0f0f0f");
  });

  it("Allow Delete", async () => {
    await DEMO_PROGRAM.methods
      .deleteTriangle()
      .accounts({
        demo: demoPda,
        signer: USER_WITH_NFT2.publicKey,
        ...(await solCerberus.accounts("Triangle", "Delete")),
      })
      .signers([USER_WITH_NFT2])
      .rpc();
    let demo = await DEMO_PROGRAM.account.demo.fetch(demoPda);
    expect(demo.triangle).to.equal(null);
  });

  after(async () => {
    solCerberus.disconnect();
  });
});
