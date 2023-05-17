use crate::PROGRAM_AUTHORITY;
use anchor_lang::prelude::*;

pub fn allowed_authority(authority: &Pubkey, app_authority: &Pubkey) -> bool {
    return authority.key() == app_authority.key() || authority.key() == PROGRAM_AUTHORITY.key();
}
