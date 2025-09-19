const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rps')
        .setDescription('Play Rock Paper Scissors against the bot'),
    
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('🪨📄✂️ Rock Paper Scissors')
            .setDescription('Choose your move!')
            .setFooter({ text: 'Make your choice below!' });
        
        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`rps_rock_${interaction.user.id}`)
                    .setLabel('Rock')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🪨'),
                new ButtonBuilder()
                    .setCustomId(`rps_paper_${interaction.user.id}`)
                    .setLabel('Paper')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📄'),
                new ButtonBuilder()
                    .setCustomId(`rps_scissors_${interaction.user.id}`)
                    .setLabel('Scissors')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('✂️')
            );
        
        await interaction.reply({
            embeds: [embed],
            components: [buttons]
        });
    },
    
    async handleButton(interaction, action, params) {
        const userId = interaction.user.id;
        
        // Check if it's the right user
        if (params[0] !== userId) {
            return interaction.reply({
                content: '❌ This is not your game!',
                ephemeral: true
            });
        }
        
        const choices = ['rock', 'paper', 'scissors'];
        const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
        
        const playerChoice = action;
        const botChoice = choices[Math.floor(Math.random() * choices.length)];
        
        let result = '';
        let color = 0x808080; // Gray for tie
        
        if (playerChoice === botChoice) {
            result = "🤝 **It's a tie!**";
            color = 0xffff00; // Yellow
        } else if (
            (playerChoice === 'rock' && botChoice === 'scissors') ||
            (playerChoice === 'paper' && botChoice === 'rock') ||
            (playerChoice === 'scissors' && botChoice === 'paper')
        ) {
            result = '🎉 **You win!**';
            color = 0x00ff00; // Green
        } else {
            result = '😔 **You lose!**';
            color = 0xff0000; // Red
        }
        
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('🪨📄✂️ Rock Paper Scissors - Results')
            .addFields(
                { name: '👤 Your Choice', value: `${emojis[playerChoice]} ${playerChoice.charAt(0).toUpperCase() + playerChoice.slice(1)}`, inline: true },
                { name: '🤖 Bot Choice', value: `${emojis[botChoice]} ${botChoice.charAt(0).toUpperCase() + botChoice.slice(1)}`, inline: true },
                { name: '🏆 Result', value: result, inline: false }
            );
        
        const newGameButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`rps_newgame_${userId}`)
                    .setLabel('Play Again')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔄')
            );
        
        if (action === 'newgame') {
            // Reset the game
            const resetEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('🪨📄✂️ Rock Paper Scissors')
                .setDescription('Choose your move!')
                .setFooter({ text: 'Make your choice below!' });
            
            const resetButtons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`rps_rock_${userId}`)
                        .setLabel('Rock')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('🪨'),
                    new ButtonBuilder()
                        .setCustomId(`rps_paper_${userId}`)
                        .setLabel('Paper')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('📄'),
                    new ButtonBuilder()
                        .setCustomId(`rps_scissors_${userId}`)
                        .setLabel('Scissors')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('✂️')
                );
            
            return interaction.update({
                embeds: [resetEmbed],
                components: [resetButtons]
            });
        }
        
        await interaction.update({
            embeds: [embed],
            components: [newGameButton]
        });
    }
};