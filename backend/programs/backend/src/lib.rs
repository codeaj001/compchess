use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("7ufJg8P34GqNMXSwKz5XhGisPhmGCeVtMCZt8RtVbCuB");

#[program]
pub mod backend {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Program Initialized");
        Ok(())
    }

    pub fn create_game(ctx: Context<CreateGame>, bet_amount: u64) -> Result<()> {
        let game = &mut ctx.accounts.game;
        game.player_one = *ctx.accounts.player_one.key;
        game.stake_amount = bet_amount;
        game.status = GameStatus::Waiting;
        msg!("Game created with stake amount: {}", bet_amount);
        Ok(())
    }

    pub fn join_game(ctx: Context<JoinGame>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        require!(game.status == GameStatus::Waiting, GameError::GameNotWaiting);

        game.player_two = Some(*ctx.accounts.player_two.key);
        game.status = GameStatus::Ongoing;

        msg!("Game started between {} and {}", game.player_one, game.player_two.unwrap());
        Ok(())
    }

    pub fn settle_game(ctx: Context<SettleGame>, winner: Pubkey) -> Result<()> {
        let game = &mut ctx.accounts.game;
        require!(game.status == GameStatus::Ongoing, GameError::GameNotStarted);

        game.winner = Some(winner);
        game.status = GameStatus::Completed;

        msg!("Game settled. Winner: {}", winner);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct CreateGame<'info> {
    #[account(
        init, 
        payer = player_one, 
        space = 8 +  // discriminator
        32 +         // player_one (Pubkey)
        33 +         // player_two (Option<Pubkey>)
        8 +          // stake_amount (u64)
        1 +          // status (GameStatus enum)
        33           // winner (Option<Pubkey>)
    )]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub player_one: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct JoinGame<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub player_two: Signer<'info>,
}

#[derive(Accounts)]
pub struct SettleGame<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
}

#[account]
pub struct Game {
    pub player_one: Pubkey,
    pub player_two: Option<Pubkey>,
    pub stake_amount: u64,
    pub status: GameStatus,
    pub winner: Option<Pubkey>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum GameStatus {
    Waiting,
    Ongoing,
    Completed,
}

#[error_code]
pub enum GameError {
    #[msg("Game is not in waiting status.")]
    GameNotWaiting,
    #[msg("Game has not started yet.")]
    GameNotStarted,
}