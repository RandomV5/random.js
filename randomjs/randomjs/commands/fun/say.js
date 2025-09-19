const { SlashCommandBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Bot repeats your message in a specified channel.')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message for the bot to say')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the message in')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)),
    async execute(interaction) {
        const msg = interaction.options.getString('message');
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        await interaction.reply({ content: '✅ Message sent!', ephemeral: true });
        await channel.send(msg);
    }
};