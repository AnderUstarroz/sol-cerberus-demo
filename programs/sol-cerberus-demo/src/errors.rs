use anchor_lang::error_code;

#[error_code]
pub enum Errors {
    #[msg("The user does not have enough privileges to perform this action")]
    Unauthorized,
    #[msg("Invalid color! The color must have 6 ASCII alphanumeric characters")]
    InvalidColor,
    #[msg("Shape already exists!")]
    ShapeAlreadyExists,
}
