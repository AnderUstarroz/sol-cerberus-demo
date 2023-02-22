import * as anchor from "@project-serum/anchor";
import {
  new_sc_app,
  SolCerberus,
  SOL_CERBERUS_PROGRAM_ID,
} from "sol-cerberus-js";
import SolCerberusIDL from "sol-cerberus-js/lib/idl.json";
import { SolCerberusDemo } from "../target/types/sol_cerberus_demo";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";

export const DEMO_PROGRAM = anchor.workspace
  .SolCerberusDemo as anchor.Program<SolCerberusDemo>;

export const PROVIDER = anchor.AnchorProvider.env();
export const PROVIDER_WALLET = (DEMO_PROGRAM.provider as anchor.AnchorProvider)
  .wallet as NodeWallet;

export const SOL_CERBERUS: anchor.Program<SolCerberus> = new anchor.Program(
  SolCerberusIDL as any,
  SOL_CERBERUS_PROGRAM_ID,
  PROVIDER
);
export const SC_APP = new_sc_app();
