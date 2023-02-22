use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Default, Clone, Debug)]
pub struct Square {
    pub size: u16,
    pub color: String,
}

impl Square {
    pub const fn new(size: u16, color: String) -> Self {
        Self {
            size: size,
            color: color,
        }
    }
}

// How to implement derive
//https://web.mit.edu/rust-lang_v1.25/arch/amd64_ubuntu1404/share/doc/rust/html/book/first-edition/procedural-macros.html

#[derive(AnchorSerialize, AnchorDeserialize, Default, Clone, Debug)]
pub struct Circle {
    pub size: u16,
    pub color: String,
}

impl Circle {
    pub const fn new(size: u16, color: String) -> Self {
        Self {
            size: size,
            color: color,
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Default, Clone, Debug)]
pub struct Triangle {
    pub size: u16,
    pub color: String,
}
impl Triangle {
    pub const fn new(size: u16, color: String) -> Self {
        Self {
            size: size,
            color: color,
        }
    }
}

#[account]
pub struct Demo {
    pub authority: Pubkey,
    pub sol_cerberus_app: Pubkey,
    pub bump: u8,
    pub square: Option<Square>,
    pub circle: Option<Circle>,
    pub triangle: Option<Triangle>,
}
