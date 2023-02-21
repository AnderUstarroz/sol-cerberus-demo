use crate::Errors;
use anchor_lang::prelude::*;

pub fn valid_color(color: &String) -> Result<()> {
    if color.as_bytes().len() != 6 {
        return err!(Errors::InvalidColor);
    }
    for char in color.chars() {
        if !char.is_ascii_alphanumeric() {
            return err!(Errors::InvalidColor);
        }
    }
    Ok(())
}
