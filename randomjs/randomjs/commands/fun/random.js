const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('Get random facts or generate random numbers')
        .addSubcommand(subcommand =>
            subcommand
                .setName('fact')
                .setDescription('Get a random fun fact'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('number')
                .setDescription('Generate a random number')
                .addIntegerOption(option =>
                    option.setName('min')
                        .setDescription('Minimum number (default: 1)')
                        .setRequired(false))
                .addIntegerOption(option =>
                    option.setName('max')
                        .setDescription('Maximum number (default: 100)')
                        .setRequired(false))),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        
        if (subcommand === 'fact') {
            const facts = [
                "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still edible!",
                "Octopuses have three hearts and blue blood!",
                "A group of flamingos is called a 'flamboyance'!",
                "Bananas are berries, but strawberries aren't!",
                "A shrimp's heart is in its head!",
                "There are more possible games of chess than atoms in the observable universe!",
                "Wombat poop is cube-shaped!",
                "A jiffy is an actual unit of time - it's 1/100th of a second!",
                "The shortest war in history lasted only 38-45 minutes!",
                "Dolphins have names for each other!",
                "A cloud can weigh more than a million pounds!",
                "Your nose can remember 50,000 different scents!",
                "Bubble wrap was originally invented as wallpaper!",
                "A group of pandas is called an 'embarrassment'!",
                "Sea otters hold hands when they sleep so they don't drift apart!"
            ];
            
            const fact = facts[Math.floor(Math.random() * facts.length)];
            
            await interaction.reply({
                content: `🧠 **Random Fun Fact**\n${fact}`
            });
            
        } else if (subcommand === 'number') {
            const min = interaction.options.getInteger('min') || 1;
            const max = interaction.options.getInteger('max') || 100;
            
            if (min >= max) {
                return interaction.reply({
                    content: '❌ The minimum number must be less than the maximum number!',
                    ephemeral: true
                });
            }
            
            const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
            
            await interaction.reply({
                content: `🎲 **Random Number**\nRange: ${min} - ${max}\nResult: **${randomNumber}**`
            });
        }
    },
};