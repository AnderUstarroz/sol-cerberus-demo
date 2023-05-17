use crate::state::demo::*;
use crate::validation::demo::allowed_authority;
use crate::Errors;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteDemo<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        close = collector,
        constraint = allowed_authority(&authority.key(), &demo.authority)  @ Errors::Unauthorized,
        seeds = [b"sol-cerberus-demo".as_ref(), demo.sol_cerberus_app.key().as_ref()], 
        bump = demo.bump,
    )]
    pub demo: Box<Account<'info, Demo>>,
    /// CHECK: collector of the funds
    #[account(mut)]
    collector: AccountInfo<'info>,
}
