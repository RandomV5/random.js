const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Game state storage
const activeGames = new Map();

class BlackjackGame {
    constructor(userId) {
        this.userId = userId;
        this.deck = this.createDeck();
        this.playerHand = [];
        this.dealerHand = [];
        this.gameOver = false;
        this.playerStands = false;
        
        // Deal initial cards
        this.playerHand.push(this.drawCard(), this.drawCard());
        this.dealerHand.push(this.drawCard(), this.drawCard());
    }
    
    createDeck() {
        const suits = ['♠️', '♥️', '♦️', '♣️'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const deck = [];
        
        for (const suit of suits) {
            for (const rank of ranks) {
                deck.push({ rank, suit, value: this.getCardValue(rank) });
            }
        }
        
        // Shuffle deck
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        
        return deck;
    }
    
    getCardValue(rank) {
        if (rank === 'A') return 11;
        if (['J', 'Q', 'K'].includes(rank)) return 10;
        return parseInt(rank);
    }
    
    drawCard() {
        return this.deck.pop();
    }
    
    calculateScore(hand) {
        let score = 0;
        let aces = 0;
        
        for (const card of hand) {
            score += card.value;
            if (card.rank === 'A') aces++;
        }
        
        // Adjust for aces
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }
        
        return score;
    }
    
    getHandString(hand, hideFirst = false) {
        return hand.map((card, index) => {
            if (hideFirst && index === 0) return '🎴';
            return `${card.rank}${card.suit}`;
        }).join(' ');
    }
    
    hit() {
        if (this.gameOver || this.playerStands) return false;
        this.playerHand.push(this.drawCard());
        
        if (this.calculateScore(this.playerHand) > 21) {
            this.gameOver = true;
        }
        
        return true;
    }
    
    stand() {
        this.playerStands = true;
        
        // Dealer draws until 17 or higher
        while (this.calculateScore(this.dealerHand) < 17) {
            this.dealerHand.push(this.drawCard());
        }
        
        this.gameOver = true;
        return true;
    }
    
    getResult() {
        const playerScore = this.calculateScore(this.playerHand);
        const dealerScore = this.calculateScore(this.dealerHand);
        
        if (playerScore > 21) return 'bust';
        if (dealerScore > 21) return 'win';
        if (playerScore === 21 && this.playerHand.length === 2) return 'blackjack';
        if (playerScore > dealerScore) return 'win';
        if (playerScore < dealerScore) return 'lose';
        return 'tie';
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blackjack')
        .setDescription('Play a game of blackjack against the dealer'),
    
    async execute(interaction) {
        const userId = interaction.user.id;
        
        // Check if user already has an active game
        if (activeGames.has(userId)) {
            return interaction.reply({
                content: '❌ You already have an active blackjack game! Finish it first.',
                ephemeral: true
            });
        }
        
        // Create new game
        const game = new BlackjackGame(userId);
        activeGames.set(userId, game);
        
        // Create game embed
        const embed = this.createGameEmbed(game);
        const buttons = this.createGameButtons(userId);
        
        await interaction.reply({
            embeds: [embed],
            components: [buttons]
        });
    },
    
    async handleButton(interaction, action, params) {
        const userId = interaction.user.id;
        const game = activeGames.get(userId);
        
        if (!game) {
            return interaction.reply({
                content: '❌ No active blackjack game found!',
                ephemeral: true
            });
        }
        
        // Check if it's the right user
        if (params[0] !== userId) {
            return interaction.reply({
                content: '❌ This is not your game!',
                ephemeral: true
            });
        }
        
        if (action === 'hit') {
            game.hit();
        } else if (action === 'stand') {
            game.stand();
        } else if (action === 'newgame') {
            activeGames.delete(userId);
            const newGame = new BlackjackGame(userId);
            activeGames.set(userId, newGame);
            
            const embed = this.createGameEmbed(newGame);
            const buttons = this.createGameButtons(userId);
            
            return interaction.update({
                embeds: [embed],
                components: [buttons]
            });
        }
        
        // Update game display
        const embed = this.createGameEmbed(game);
        const buttons = game.gameOver ? this.createEndGameButtons(userId) : this.createGameButtons(userId);
        
        // Clean up finished games
        if (game.gameOver) {
            setTimeout(() => activeGames.delete(userId), 300000); // 5 minutes
        }
        
        await interaction.update({
            embeds: [embed],
            components: [buttons]
        });
    },
    
    createGameEmbed(game) {
        const playerScore = game.calculateScore(game.playerHand);
        const dealerScore = game.calculateScore(game.dealerHand);
        const showDealerCards = game.gameOver || game.playerStands;
        
        const embed = new EmbedBuilder()
            .setColor(game.gameOver ? (game.getResult() === 'win' || game.getResult() === 'blackjack' ? 0x00ff00 : 0xff0000) : 0x0099ff)
            .setTitle('🃏 Blackjack')
            .addFields(
                {
                    name: '🎰 Dealer',
                    value: `${game.getHandString(game.dealerHand, !showDealerCards)}\n**Score: ${showDealerCards ? dealerScore : '?'}**`,
                    inline: true
                },
                {
                    name: '👤 You',
                    value: `${game.getHandString(game.playerHand)}\n**Score: ${playerScore}**`,
                    inline: true
                }
            );
        
        if (game.gameOver) {
            const result = game.getResult();
            let resultText = '';
            
            switch (result) {
                case 'blackjack':
                    resultText = '🎉 **BLACKJACK!** You win!';
                    break;
                case 'win':
                    resultText = '🎉 **You win!**';
                    break;
                case 'lose':
                    resultText = '😔 **You lose!**';
                    break;
                case 'bust':
                    resultText = '💥 **BUST!** You lose!';
                    break;
                case 'tie':
                    resultText = '🤝 **It\'s a tie!**';
                    break;
            }
            
            embed.addFields({ name: '🏆 Result', value: resultText, inline: false });
        }
        
        return embed;
    },
    
    createGameButtons(userId) {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`blackjack_hit_${userId}`)
                    .setLabel('Hit')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🃏'),
                new ButtonBuilder()
                    .setCustomId(`blackjack_stand_${userId}`)
                    .setLabel('Stand')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('✋')
            );
    },
    
    createEndGameButtons(userId) {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`blackjack_newgame_${userId}`)
                    .setLabel('New Game')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🔄')
            );
    }
};