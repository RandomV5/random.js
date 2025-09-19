const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Roll a dice')
        .addIntegerOption(option =>
            option.setName('sides')
                .setDescription('Number of sides on the dice (default: 6)')
                .setRequired(false)
                .setMinValue(2)
                .setMaxValue(1000))
        .addIntegerOption(option =>
            option.setName('count')
                .setDescription('Number of dice to roll (default: 1)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(20)),
    
    async execute(interaction) {
        const sides = interaction.options.getInteger('sides') || 6;
        const count = interaction.options.getInteger('count') || 1;
        
        const rolls = [];
        let total = 0;
        
        for (let i = 0; i < count; i++) {
            const roll = Math.floor(Math.random() * sides) + 1;
            rolls.push(roll);
            total += roll;
        }
        
        let result = `🎲 **Dice Roll Results**\n`;
        result += `**Dice:** ${count}d${sides}\n`;
        
        if (count === 1) {
            result += `**Result:** ${rolls[0]}`;
        } else {
            result += `**Rolls:** ${rolls.join(', ')}\n**Total:** ${total}`;
        }
        
        await interaction.reply({ content: result });
    },
};