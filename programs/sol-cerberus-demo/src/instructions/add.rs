use crate::{errors::Errors, state::demo::*, validation::shapes::valid_color};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Add<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        seeds = [b"sol-cerberus-demo".as_ref(), demo.key().as_ref()], 
        bump = demo.bump
    )]
    pub demo: Box<Account<'info, Demo>>,
    pub system_program: Program<'info, System>,
}

pub fn add(ctx: Context<Add>, shape: &str, color: &String, size: u16) -> Result<()> {
    let demo = &mut ctx.accounts.demo;
    valid_color(color)?;
    match shape {
        "square" => {
            if !demo.square.is_none() {
                return err!(Errors::ShapeAlreadyExists);
            }
            demo.square = Some(Square::new(size, color.clone()))
        }
        "circle" => {
            if !demo.circle.is_none() {
                return err!(Errors::ShapeAlreadyExists);
            }
            demo.circle = Some(Circle::new(size, color.clone()))
        }
        _ => {
            if !demo.triangle.is_none() {
                return err!(Errors::ShapeAlreadyExists);
            }
            demo.triangle = Some(Triangle::new(size, color.clone()))
        }
    }
    Ok(())
}
