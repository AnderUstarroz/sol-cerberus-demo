import * as anchor from "@project-serum/anchor";
import { SolCerberus, SOL_CERBERUS_PROGRAM_ID } from "sol-cerberus-js";
import { SolCerberusDemo } from "../target/types/sol_cerberus_demo";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { keypairIdentity, Metaplex } from "@metaplex-foundation/js";

export const DEMO_PROGRAM = anchor.workspace
  .SolCerberusDemo as anchor.Program<SolCerberusDemo>;

export const PROVIDER = anchor.AnchorProvider.env();
export const PROVIDER_WALLET = (DEMO_PROGRAM.provider as anchor.AnchorProvider)
  .wallet as NodeWallet;

export const SC_APP_ID = new anchor.web3.PublicKey(
  "3cJ5FiDpAYuFj2JQR3W3q1NDR7KrzKXFarJP7pqmRtko"
);

export const ALLOWED_WALLET: anchor.web3.Keypair =
  anchor.web3.Keypair.generate();
export const USER_WITH_NFT1: anchor.web3.Keypair =
  anchor.web3.Keypair.generate();
export const USER_WITH_NFT2: anchor.web3.Keypair =
  anchor.web3.Keypair.generate();

export const METAPLEX = new Metaplex(DEMO_PROGRAM.provider.connection).use(
  keypairIdentity(PROVIDER_WALLET.payer)
);
