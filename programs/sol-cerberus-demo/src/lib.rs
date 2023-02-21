use anchor_lang::prelude::*;
use errors::*;
use instructions::*;

pub mod errors;
pub mod instructions;
pub mod state;
pub mod validation;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod sol_cerberus_demo {

    use super::*;

    pub fn initialize_demo(ctx: Context<InitializeDemo>, sol_cerberus_app: Pubkey) -> Result<()> {
        instructions::initialize_demo::initialize_demo(ctx, sol_cerberus_app)
    }

    pub fn add_square(ctx: Context<Add>, color: String, size: u16) -> Result<()> {
        instructions::add::add(ctx, "square", &color, size)
    }

    pub fn add_circle(ctx: Context<Add>, color: String, size: u16) -> Result<()> {
        instructions::add::add(ctx, "circle", &color, size)
    }

    pub fn add_triangle(ctx: Context<Add>, color: String, size: u16) -> Result<()> {
        instructions::add::add(ctx, "triangle", &color, size)
    }

    pub fn update_square(ctx: Context<Update>, color: String, size: u16) -> Result<()> {
        instructions::update::update(ctx, "square", &color, size)
    }

    pub fn update_circle(ctx: Context<Update>, color: String, size: u16) -> Result<()> {
        instructions::update::update(ctx, "circle", &color, size)
    }

    pub fn update_triangle(ctx: Context<Update>, color: String, size: u16) -> Result<()> {
        instructions::update::update(ctx, "triangle", &color, size)
    }

    pub fn delete_square(ctx: Context<Delete>) -> Result<()> {
        instructions::delete::delete(ctx, "square")
    }

    pub fn delete_circle(ctx: Context<Delete>) -> Result<()> {
        instructions::delete::delete(ctx, "circle")
    }

    pub fn delete_triangle(ctx: Context<Delete>) -> Result<()> {
        instructions::delete::delete(ctx, "triangle")
    }
}
