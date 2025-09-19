const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('joke')
        .setDescription('Get a random joke'),
    
    async execute(interaction) {
        const jokes = [
            "Why don't scientists trust atoms? Because they make up everything!",
            "Why did the scarecrow win an award? He was outstanding in his field!",
            "Why don't eggs tell jokes? They'd crack each other up!",
            "What do you call a fake noodle? An impasta!",
            "Why did the math book look so sad? Because it had too many problems!",
            "What do you call a bear with no teeth? A gummy bear!",
            "Why can't a bicycle stand up by itself? It's two tired!",
            "What do you call a fish wearing a bowtie? Sofishticated!",
            "Why don't skeletons fight each other? They don't have the guts!",
            "What's the best thing about Switzerland? I don't know, but the flag is a big plus!",
            "Why did the coffee file a police report? It got mugged!",
            "What do you call a sleeping bull? A bulldozer!",
            "Why don't programmers like nature? It has too many bugs!",
            "What did the ocean say to the beach? Nothing, it just waved!",
            "Why do we tell actors to 'break a leg?' Because every play has a cast!"
        ];
        
        const joke = jokes[Math.floor(Math.random() * jokes.length)];
        
        await interaction.reply({
            content: `😄 **Random Joke**\n${joke}`
        });
    },
};