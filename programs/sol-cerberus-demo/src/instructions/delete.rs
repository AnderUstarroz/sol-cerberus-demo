use crate::state::demo::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Delete<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        seeds = [b"sol-cerberus-demo".as_ref(), demo.key().as_ref()], 
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
