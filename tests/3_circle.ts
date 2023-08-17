import { SolCerberus, addressTypes, namespaces } from "sol-cerberus-js";
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
  let demoPda = null;
  let role = "CircleMaster";
  let resource = "Circle";
  let allowedNft = null;
  let addPerm = "Add";
  let updatePerm = "Update";
  let deletePerm = "Delete";

  before(async () => {
    solCerberus = new SolCerberus(PROVIDER.connection, PROVIDER.wallet, {
      appId: SC_APP_ID,
    });
    demoPda = await demo_pda(SC_APP_ID);
    allowedNft = await METAPLEX.nfts().create({
      name: "Allowed NFT",
      sellerFeeBasisPoints: 0,
      uri: "https://arweave.net/nft1-hash",
      tokenOwner: USER_WITH_NFT1.publicKey,
      isMutable: true,
    });
  });
  it(`Assign "${role}" role to NFT`, async () => {
    await solCerberus.assignRole(
      role,
      addressTypes.NFT,
      allowedNft.mintAddress
    );
  });

  it("Not allowed to: Add, Update, Delete", async () => {
    await solCerberus.login({
      wallet: USER_WITH_NFT1.publicKey,
      nfts: [[allowedNft.mintAddress, allowedNft.mintAddress]],
    });
    let results: any = await Promise.allSettled([
      DEMO_PROGRAM.methods
        .addCircle("ff0000", 50)
        .accounts({
          demo: demoPda,
          signer: USER_WITH_NFT1.publicKey,
          ...(await solCerberus.accounts("Circle", "Add")),
        })
        .signers([USER_WITH_NFT1])
        .rpc(),
      DEMO_PROGRAM.methods
        .updateCircle("ff0000", 50)
        .accounts({
          demo: demoPda,
          signer: USER_WITH_NFT1.publicKey,
          ...(await solCerberus.accounts("Circle", "Update")),
        })
        .signers([USER_WITH_NFT1])
        .rpc(),
      DEMO_PROGRAM.methods
        .deleteCircle()
        .accounts({
          demo: demoPda,
          signer: USER_WITH_NFT1.publicKey,
          ...(await solCerberus.accounts("Circle", "Delete")),
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
    // Login as authority to create "Add", "Update" and "Delete" rules
    await solCerberus.login({ wallet: PROVIDER.wallet.publicKey });
    await solCerberus.addRule(role, resource, addPerm);
    await solCerberus.addRule(role, resource, updatePerm);
    await solCerberus.addRule(role, resource, deletePerm);
    // Login back as the allowed wallet
    await solCerberus.login({
      wallet: USER_WITH_NFT1.publicKey,
      nfts: [[allowedNft.mintAddress, allowedNft.mintAddress]],
    });
    await solCerberus.fetchPerms();
  });

  it("Allow Add", async () => {
    const coco = await solCerberus.accounts("Circle", "Add");
    await DEMO_PROGRAM.methods
      .addCircle("ff0000", 50)
      .accounts({
        demo: demoPda,
        signer: USER_WITH_NFT1.publicKey,
        ...(await solCerberus.accounts("Circle", "Add")),
      })
      .signers([USER_WITH_NFT1])
      .rpc();
    let demo = await DEMO_PROGRAM.account.demo.fetch(demoPda);
    expect(demo.circle.size).to.equal(50);
    expect(demo.circle.color).to.equal("ff0000");
  });

  it("Allow Update", async () => {
    await DEMO_PROGRAM.methods
      .updateCircle("0f0f0f", 60)
      .accounts({
        demo: demoPda,
        signer: USER_WITH_NFT1.publicKey,
        ...(await solCerberus.accounts("Circle", "Update")),
      })
      .signers([USER_WITH_NFT1])
      .rpc();
    let demo = await DEMO_PROGRAM.account.demo.fetch(demoPda);
    expect(demo.circle.size).to.equal(60);
    expect(demo.circle.color).to.equal("0f0f0f");
  });
  it("Allow Delete", async () => {
    await DEMO_PROGRAM.methods
      .deleteCircle()
      .accounts({
        demo: demoPda,
        signer: USER_WITH_NFT1.publicKey,
        ...(await solCerberus.accounts("Circle", "Delete")),
      })
      .signers([USER_WITH_NFT1])
      .rpc();
    let demo = await DEMO_PROGRAM.account.demo.fetch(demoPda);
    expect(demo.circle).to.equal(null);
  });
  after(async () => {
    solCerberus.disconnect();
  });
});
