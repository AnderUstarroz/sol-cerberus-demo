use anchor_lang::error_code;

#[error_code]
pub enum Errors {
    #[msg("Invalid color! The color must have 6 ASCII alphanumeric characters")]
    InvalidColor,
    #[msg("Shape already exists!")]
    ShapeAlreadyExists,
}
