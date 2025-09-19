const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Store active games per user
const activeGames = new Map();

class GuessGame {
    constructor(userId, min = 1, max = 100) {
        this.userId = userId;
        this.min = min;
        this.max = max;
        this.target = Math.floor(Math.random() * (max - min + 1)) + min;
        this.attempts = 0;
        this.maxAttempts = Math.ceil(Math.log2(max - min + 1)) + 3; // Fair number of attempts
        this.gameOver = false;
        this.won = false;
        this.currentGuess = Math.floor((min + max) / 2); // Start with middle value
    }
    
    makeGuess(guess) {
        this.attempts++;
        
        if (guess === this.target) {
            this.gameOver = true;
            this.won = true;
            return 'correct';
        }
        
        // Check if max attempts reached before continuing
        if (this.attempts >= this.maxAttempts) {
            this.gameOver = true;
            this.won = false;
            return guess < this.target ? 'higher_gameover' : 'lower_gameover';
        }
        
        if (guess < this.target) {
            this.min = Math.max(this.min, guess + 1);
            return 'higher';
        } else {
            this.max = Math.min(this.max, guess - 1);
            return 'lower';
        }
    }
    
    getScore() {
        if (!this.won) return 0;
        const range = this.max - this.min + 1;
        const efficiency = Math.max(0, (this.maxAttempts - this.attempts) / this.maxAttempts);
        return Math.floor(1000 * efficiency * Math.log2(range));
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guess')
        .setDescription('Play a number guessing game with the bot')
        .addIntegerOption(option =>
            option.setName('min')
                .setDescription('Minimum number (default: 1)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(9999))
        .addIntegerOption(option =>
            option.setName('max')
                .setDescription('Maximum number (default: 100)')
                .setRequired(false)
                .setMinValue(2)
                .setMaxValue(10000)),
    
    async execute(interaction) {
        const userId = interaction.user.id;
        const min = interaction.options.getInteger('min') || 1;
        const max = interaction.options.getInteger('max') || 100;
        
        if (min >= max) {
            return interaction.reply({
                content: '❌ The minimum number must be less than the maximum number!',
                ephemeral: true
            });
        }
        
        if (max - min < 1) {
            return interaction.reply({
                content: '❌ The range must be at least 2 numbers!',
                ephemeral: true
            });
        }
        
        // Check if user already has an active game
        if (activeGames.has(userId)) {
            return interaction.reply({
                content: '❌ You already have an active guessing game! Finish it first.',
                ephemeral: true
            });
        }
        
        // Create new game
        const game = new GuessGame(userId, min, max);
        activeGames.set(userId, game);
        
        const embed = this.createGameEmbed(game);
        const buttons = this.createGameButtons(userId, game);
        
        await interaction.reply({
            embeds: [embed],
            components: buttons
        });
    },
    
    async handleButton(interaction, action, params) {
        const userId = interaction.user.id;
        const game = activeGames.get(userId);
        
        if (!game) {
            return interaction.reply({
                content: '❌ No active guessing game found!',
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
        
        if (action === 'guess') {
            const guess = parseInt(params[1]);
            const result = game.makeGuess(guess);
            
            let resultText = '';
            switch (result) {
                case 'correct':
                    resultText = `🎉 **Correct!** The number was ${game.target}!`;
                    break;
                case 'higher':
                    resultText = `📈 **Higher!** The number is greater than ${guess}`;
                    break;
                case 'lower':
                    resultText = `📉 **Lower!** The number is less than ${guess}`;
                    break;
                case 'higher_gameover':
                    resultText = `📈 **Higher!** But you're out of attempts. The number was ${game.target}!`;
                    break;
                case 'lower_gameover':
                    resultText = `📉 **Lower!** But you're out of attempts. The number was ${game.target}!`;
                    break;
            }
            
            // Update current guess for next buttons
            if (!game.gameOver) {
                game.currentGuess = Math.floor((game.min + game.max) / 2);
            }
            
            const embed = this.createGameEmbed(game, resultText);
            const buttons = game.gameOver ? this.createEndGameButtons(userId) : this.createGameButtons(userId, game);
            
            // Clean up finished games
            if (game.gameOver) {
                setTimeout(() => activeGames.delete(userId), 300000); // 5 minutes
            }
            
            await interaction.update({
                embeds: [embed],
                components: buttons
            });
            
        } else if (action === 'newgame') {
            activeGames.delete(userId);
            
            // Get original range from the finished game
            const newGame = new GuessGame(userId, 1, 100); // Default range for new game
            activeGames.set(userId, newGame);
            
            const embed = this.createGameEmbed(newGame);
            const buttons = this.createGameButtons(userId, newGame);
            
            return interaction.update({
                embeds: [embed],
                components: buttons
            });
        }
    },
    
    createGameEmbed(game, lastResult = null) {
        const embed = new EmbedBuilder()
            .setTitle('🎯 Number Guessing Game')
            .addFields(
                { name: '🎲 Range', value: `${game.min} - ${game.max}`, inline: true },
                { name: '🔄 Attempts', value: `${game.attempts}/${game.maxAttempts}`, inline: true },
                { name: '🎯 Status', value: game.gameOver ? 'Game Over' : 'Guessing...', inline: true }
            );
        
        if (game.gameOver) {
            embed.setColor(game.won ? 0x00ff00 : 0xff0000);
            
            if (game.won) {
                const score = game.getScore();
                embed.addFields(
                    { name: '🎉 Result', value: `You won in ${game.attempts} attempts!`, inline: false },
                    { name: '⭐ Score', value: `${score} points`, inline: true }
                );
            } else {
                embed.addFields(
                    { name: '😔 Result', value: `Game over! The number was **${game.target}**`, inline: false }
                );
            }
        } else {
            embed.setColor(0x0099ff);
            embed.setDescription('I\'m thinking of a number in the range above. Can you guess it?');
        }
        
        if (lastResult) {
            embed.addFields({ name: '💬 Last Guess', value: lastResult, inline: false });
        }
        
        return embed;
    },
    
    createGameButtons(userId, game) {
        const buttons = [];
        const range = game.max - game.min + 1;
        
        if (range <= 10) {
            // Show all numbers if range is small
            for (let i = game.min; i <= game.max; i++) {
                buttons.push(
                    new ButtonBuilder()
                        .setCustomId(`guess_guess_${userId}_${i}`)
                        .setLabel(`${i}`)
                        .setStyle(ButtonStyle.Primary)
                );
            }
        } else {
            // Show strategic options for larger ranges
            const low = game.min;
            const mid = Math.floor((game.min + game.max) / 2);
            const high = game.max;
            
            buttons.push(
                new ButtonBuilder()
                    .setCustomId(`guess_guess_${userId}_${low}`)
                    .setLabel(`${low}`)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`guess_guess_${userId}_${mid}`)
                    .setLabel(`${mid}`)
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`guess_guess_${userId}_${high}`)
                    .setLabel(`${high}`)
                    .setStyle(ButtonStyle.Secondary)
            );
            
            // Add quarter points for very large ranges
            if (range > 20) {
                const lowMid = Math.floor((game.min + mid) / 2);
                const highMid = Math.floor((mid + game.max) / 2);
                
                buttons.splice(1, 0,
                    new ButtonBuilder()
                        .setCustomId(`guess_guess_${userId}_${lowMid}`)
                        .setLabel(`${lowMid}`)
                        .setStyle(ButtonStyle.Secondary)
                );
                
                buttons.splice(3, 0,
                    new ButtonBuilder()
                        .setCustomId(`guess_guess_${userId}_${highMid}`)
                        .setLabel(`${highMid}`)
                        .setStyle(ButtonStyle.Secondary)
                );
            }
        }
        
        // Split into rows of 5 buttons max
        const rows = [];
        for (let i = 0; i < buttons.length; i += 5) {
            rows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
        }
        
        return rows;
    },
    
    createEndGameButtons(userId) {
        return [new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`guess_newgame_${userId}`)
                    .setLabel('New Game')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🔄')
            )];
    }
};