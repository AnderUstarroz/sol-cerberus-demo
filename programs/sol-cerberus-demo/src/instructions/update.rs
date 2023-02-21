use crate::{state::demo::*, validation::shapes::valid_color};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        seeds = [b"sol-cerberus-demo".as_ref(), demo.key().as_ref()], 
        bump = demo.bump
    )]
    pub demo: Box<Account<'info, Demo>>,
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
