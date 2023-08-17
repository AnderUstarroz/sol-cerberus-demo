use crate::{state::demo::*, validation::shapes::valid_color};
use anchor_lang::prelude::*;
use sol_cerberus::program::SolCerberus;
use sol_cerberus::sol_cerberus_macros::sol_cerberus_accounts;

#[sol_cerberus_accounts]
#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"sol-cerberus-demo".as_ref(), demo.sol_cerberus_app.key().as_ref()], 
        bump = demo.bump
    )]
    pub demo: Box<Account<'info, Demo>>,
    /// CHECK: Validated on CPI call
    pub sol_cerberus_app: UncheckedAccount<'info>,
    /// CHECK: Validated on CPI call
    pub sol_cerberus_rule: Option<UncheckedAccount<'info>>,
    /// CHECK: Validated on CPI call
    pub sol_cerberus_role: Option<UncheckedAccount<'info>>,
    /// CHECK: Validated on CPI call
    pub sol_cerberus_token: Option<UncheckedAccount<'info>>,
    /// CHECK: Validated on CPI call
    pub sol_cerberus_metadata: Option<UncheckedAccount<'info>>,
    #[account(mut)]
    pub sol_cerberus_seed: Option<UncheckedAccount<'info>>,
    pub sol_cerberus: Program<'info, SolCerberus>,
    pub system_program: Program<'info, System>,
}

pub fn update(ctx: Context<Update>, shape: &str, color: &String, size: u16) -> Result<()> {
    let demo = &mut ctx.accounts.demo;
    valid_color(color)?;
    match shape {
        "square" => demo.square = Some(Square::new(size, color.clone())),
        "circle" => demo.circle = Some(Circle::new(size, color.clone())),
        _ => demo.triangle = Some(Triangle::new(size, color.clone())),
    }
    Ok(())
}
