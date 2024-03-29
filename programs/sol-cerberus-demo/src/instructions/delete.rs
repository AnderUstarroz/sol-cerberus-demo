use crate::state::demo::*;
use anchor_lang::prelude::*;
use sol_cerberus::program::SolCerberus;
use sol_cerberus::sol_cerberus_macros::sol_cerberus_accounts;

#[sol_cerberus_accounts]
#[derive(Accounts)]
pub struct Delete<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"sol-cerberus-demo".as_ref(), demo.sol_cerberus_app.key().as_ref()], 
        bump = demo.bump
    )]
    pub demo: Box<Account<'info, Demo>>,
    pub system_program: Program<'info, System>,
}

pub fn delete(ctx: Context<Delete>, shape: &str) -> Result<()> {
    let demo = &mut ctx.accounts.demo;
    match shape {
        "square" => demo.square = None,
        "circle" => demo.circle = None,
        _ => demo.triangle = None,
    }
    Ok(())
}
