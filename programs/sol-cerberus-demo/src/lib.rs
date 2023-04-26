use anchor_lang::prelude::*;
use errors::*;
use instructions::*;
use sol_cerberus::sol_cerberus_macros::rule;
use solana_program::pubkey;

pub mod errors;
pub mod instructions;
pub mod state;
pub mod validation;

declare_id!("testX83crd4vAgRrvmwXgVQ2r69uCpg8xzh8A5X124x");

// WARNING: Never use the following Pubkey on production!!!
const SOL_CERBERUS_APP_ID: Pubkey = pubkey!("testX83crd4vAgRrvmwXgVQ2r69uCpg8xzh8A5X124x");

#[program]
pub mod sol_cerberus_demo {

    use super::*;

    pub fn initialize_demo(ctx: Context<InitializeDemo>, sol_cerberus_app: Pubkey) -> Result<()> {
        instructions::initialize_demo::initialize_demo(ctx, sol_cerberus_app)
    }

    #[rule(Square, Add)]
    pub fn add_square(ctx: Context<Add>, color: String, size: u16) -> Result<()> {
        instructions::add::add(ctx, "square", &color, size)
    }

    #[rule(Circle, Add)]
    pub fn add_circle(ctx: Context<Add>, color: String, size: u16) -> Result<()> {
        instructions::add::add(ctx, "circle", &color, size)
    }

    #[rule(Triangle, Add)]
    pub fn add_triangle(ctx: Context<Add>, color: String, size: u16) -> Result<()> {
        instructions::add::add(ctx, "triangle", &color, size)
    }

    #[rule(Square, Update)]
    pub fn update_square(ctx: Context<Update>, color: String, size: u16) -> Result<()> {
        instructions::update::update(ctx, "square", &color, size)
    }

    #[rule(Circle, Update)]
    pub fn update_circle(ctx: Context<Update>, color: String, size: u16) -> Result<()> {
        instructions::update::update(ctx, "circle", &color, size)
    }

    #[rule(Triangle, Update)]
    pub fn update_triangle(ctx: Context<Update>, color: String, size: u16) -> Result<()> {
        instructions::update::update(ctx, "triangle", &color, size)
    }

    #[rule(Square, Delete)]
    pub fn delete_square(ctx: Context<Delete>) -> Result<()> {
        instructions::delete::delete(ctx, "square")
    }

    #[rule(Circle, Delete)]
    pub fn delete_circle(ctx: Context<Delete>) -> Result<()> {
        instructions::delete::delete(ctx, "circle")
    }

    #[rule(Triangle, Delete)]
    pub fn delete_triangle(ctx: Context<Delete>) -> Result<()> {
        instructions::delete::delete(ctx, "triangle")
    }
}
