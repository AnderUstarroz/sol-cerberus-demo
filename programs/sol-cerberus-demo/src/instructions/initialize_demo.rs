use crate::state::demo::*;
use anchor_lang::prelude::*;

// SPACE SIZE:
// + 8 discriminator
// + 32 authority (Pubkey)
// + 32 sol_cerberus_app (Pubkey)
// + 1 bump
// + 1 + (4 + 6) + 2 Option<Square>
// + 1 + (4 + 6) + 2 Option<Circle>
// + 1 + (4 + 6) + 2 Option<Triangle>
// total = 8 + 32  + 32 + 1 + 1 + 4 + 6 + 2 + 1 + 4 + 6 + 2 + 1 + 4 + 6 + 2 = 112
#[derive(Accounts)]
#[instruction(sol_cerberus_app: Pubkey)]
pub struct InitializeDemo<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = 112,
        seeds = [b"sol-cerberus-demo".as_ref(), sol_cerberus_app.key().as_ref()], 
        bump
    )]
    pub demo: Box<Account<'info, Demo>>,
    pub system_program: Program<'info, System>,
}

pub fn initialize_demo(ctx: Context<InitializeDemo>, sol_cerberus_app: Pubkey) -> Result<()> {
    let demo = &mut ctx.accounts.demo;
    demo.authority = ctx.accounts.authority.key();
    demo.sol_cerberus_app = sol_cerberus_app;
    demo.bump = *ctx.bumps.get("demo").unwrap();
    demo.square = None;
    demo.circle = None;
    demo.triangle = None;
    Ok(())
}
