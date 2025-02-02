use anchor_lang::prelude::*;

declare_id!("8brJBSiwY7xxT3enKcEu7KvMs4h1Xe2hfqXRoW6KRnjr");

#[program]
pub mod backend {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
