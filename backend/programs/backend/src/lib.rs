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
        game.created_at = Clock::get()?.unix_timestamp; // NEW: Save game creation time
        msg!("Game created with stake amount: {}", bet_amount, game.created_at);
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
    
        // Ensure the game is ongoing
        require!(game.status == GameStatus::Ongoing, GameError::GameNotStarted);
        
        // Ensure winner is a valid participant
        require!(
            winner == game.player_one || game.player_two == Some(winner),
            GameError::InvalidWinner
        );
    
        // Mark game as completed
        game.winner = Some(winner);
        game.status = GameStatus::Completed;
    
        // Calculate total stake and platform fee
        let total_stake = game.stake_amount * 2;
        let platform_fee = total_stake / 20; // 5% fee
        let winner_reward = total_stake - platform_fee;
    
        // Verify winner token account ownership
        require!(
            ctx.accounts.winner_token_account.owner == winner,
            GameError::InvalidWinnerAccount
        );
    
        // Transfer tokens to winner
        let winner_transfer = Transfer {
            from: ctx.accounts.escrow_account.to_account_info(),
            to: ctx.accounts.winner_token_account.to_account_info(),
            authority: ctx.accounts.escrow_account.to_account_info(),
        };
    
        let treasury_transfer = Transfer {
            from: ctx.accounts.escrow_account.to_account_info(),
            to: ctx.accounts.treasury_account.to_account_info(),
            authority: ctx.accounts.escrow_account.to_account_info(),
        };
    
        let seeds = &[
            b"escrow",
            game.player_one.as_ref(),
            &[ctx.bumps.escrow_account],
        ];
        let signer_seeds = &[&seeds[..]];
    
        // Transfer winner reward
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                winner_transfer,
                signer_seeds,
            ),
            winner_reward,
        )?;
    
        // Transfer platform fee to treasury
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                treasury_transfer,
                signer_seeds,
            ),
            platform_fee,
        )?;
    
        msg!(
            "Game settled. Winner: {} received {} tokens. Platform Fee: {}",
            winner,
            winner_reward,
            platform_fee
        );
    
        Ok(())
    }
    

    pub fn deposit_stake(ctx: Context<DepositStake>) -> Result<()> {
        let game = &mut ctx.accounts.game;
    
        // Check if game is in "Waiting" or "Ongoing" state
        require!(
            game.status == GameStatus::Waiting || game.status == GameStatus::Ongoing,
            GameError::GameNotWaiting
        );
    
        let deposit_amount = game.stake_amount;
    
        // Transfer tokens to the escrow account
        let cpi_accounts = Transfer {
            from: ctx.accounts.player_token_account.to_account_info(),
            to: ctx.accounts.escrow_account.to_account_info(),
            authority: ctx.accounts.player.to_account_info(),
        };
    
        let cpi_context = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
        );
    
        token::transfer(cpi_context, deposit_amount)?;
    
        // If player two deposits, game status moves to "Ongoing"
        if game.status == GameStatus::Waiting {
            game.status = GameStatus::Ongoing;
        }
    
        msg!(
            "Stake of {} deposited by player: {}",
            deposit_amount,
            ctx.accounts.player.key()
        );
    
        Ok(())
    }
    
    
    // Added this to initialize the escrow
    pub fn initialize_escrow(ctx: Context<InitializeEscrow>) -> Result<()> {
        let game = &ctx.accounts.game;
        
        let bump = ctx.bumps.escrow_account;
        let seeds = &[b"escrow", game.player_one.as_ref(), &[bump]];
        
        let signer_seeds = &[&seeds[..]];
    
        // Create the escrow account
        token::set_authority(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::SetAuthority {
                    account_or_mint: ctx.accounts.escrow_account.to_account_info(),
                    current_authority: ctx.accounts.payer.to_account_info(),
                },
                signer_seeds,
            ),
            token::AuthorityType::AccountOwner,
            Some(ctx.accounts.escrow_account.key()),
        )?;
    
        msg!("Escrow account initialized for game between {}", game.player_one);
        
        Ok(())
    }
    
    #[derive(Accounts)]
    pub struct InitializeEscrow<'info> {
        #[account(mut)]
        pub payer: Signer<'info>,
    
        #[account(mut)]
        pub game: Account<'info, Game>,
    
        #[account(
            init,
            payer = payer,
            seeds = [b"escrow", game.player_one.as_ref()],
            bump,
            token::mint = token_mint,
            token::authority = payer
        )]
        pub escrow_account: Account<'info, TokenAccount>,
    
        pub token_mint: Account<'info, Mint>,
    
        pub system_program: Program<'info, System>,
        pub token_program: Program<'info, Token>,
        pub rent: Sysvar<'info, Rent>,
    }
    // Cancellation of game
    pub fn cancel_game(ctx: Context<CancelGame>) -> Result<()> {
        let game = &mut ctx.accounts.game;
    
        // Ensure the game is still waiting for a second player
        require!(game.status == GameStatus::Waiting, GameError::GameNotWaiting);
    
         // Check if 24 hours have passed
        let current_time = Clock::get()?.unix_timestamp;
        let time_elapsed = current_time - game.created_at;
        require!(time_elapsed >= 86_400, GameError::GameNotExpired); // 24 hours = 86,400 seconds

        // Mark the game as cancelled
        game.status = GameStatus::Completed;
    
        // Refund Player One's stake
        let refund_amount = game.stake_amount;
    
        let refund_transfer = Transfer {
            from: ctx.accounts.escrow_account.to_account_info(),
            to: ctx.accounts.player_one_token_account.to_account_info(),
            authority: ctx.accounts.escrow_account.to_account_info(),
        };
    
        let seeds = &[
            b"escrow",
            game.player_one.as_ref(),
            &[ctx.bumps.escrow_account],
        ];
        let signer_seeds = &[&seeds[..]];
    
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                refund_transfer,
                signer_seeds,
            ),
            refund_amount,
        )?;
    
        msg!("Game canceled. {} refunded {} tokens", game.player_one, refund_amount);
        
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
        space = 8 +
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
    
    #[account(
        mut,
        seeds = [b"escrow", game.player_one.as_ref()],
        bump
    )]
    pub escrow_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub winner_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub treasury_account: Account<'info, TokenAccount>, // Platform fee goes here

    #[account(mut)]
    pub winner: Signer<'info>,

    pub token_program: Program<'info, Token>,
}


#[derive(Accounts)]
pub struct DepositStake<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,

    #[account(mut)]
    pub player_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"escrow", game.player_one.as_ref()],
        bump
    )]
    pub escrow_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub player: Signer<'info>,

    pub token_program: Program<'info, Token>,
}


// Struct for initializing escrow function
#[derive(Accounts)]
pub struct InitializeEscrow<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub game: Account<'info, Game>,

    #[account(
        init,
        payer = payer,
        seeds = [b"escrow", game.player_one.as_ref()],
        bump,
        token::mint = token_mint,
        token::authority = payer
    )]
    pub escrow_account: Account<'info, TokenAccount>,

    pub token_mint: Account<'info, Mint>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

// Game cancellation context
#[derive(Accounts)]
pub struct CancelGame<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    
    #[account(
        mut,
        seeds = [b"escrow", game.player_one.as_ref()],
        bump
    )]
    pub escrow_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub player_one_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub player_one: Signer<'info>, // Only Player One can cancel

    pub token_program: Program<'info, Token>,
}


#[account]
pub struct Game {
    pub player_one: Pubkey,
    pub player_two: Option<Pubkey>,
    pub stake_amount: u64,
    pub status: GameStatus,
    pub winner: Option<Pubkey>,
    pub created_at: i64, // NEW: Store game creation timestamp
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
    #[msg("Invalid winner.")]
    InvalidWinner,
    #[msg("Invalid winner token account.")]
    InvalidWinnerAccount,
    #[msg("Game has not yet expired.")]
    GameNotExpired, // NEW ERROR
}
