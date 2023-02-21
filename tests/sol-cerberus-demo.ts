import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SolCerberusDemo } from "../target/types/sol_cerberus_demo";

describe("sol-cerberus-demo", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SolCerberusDemo as Program<SolCerberusDemo>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
