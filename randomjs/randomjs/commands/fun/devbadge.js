const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('devbadge')
        .setDescription('Information about Discord\'s Active Developer Badge')
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Get information about the Active Developer Badge'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('ping')
                .setDescription('Simple ping command to maintain bot activity'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stats')
                .setDescription('Show bot statistics and uptime')),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        
        if (subcommand === 'info') {
            const infoEmbed = new EmbedBuilder()
                .setColor(0x5865f2)
                .setTitle('🏅 Discord Active Developer Badge')
                .setDescription('Learn about Discord\'s Active Developer Badge program!')
                .addFields(
                    {
                        name: '📋 Requirements',
                        value: '• Have a verified Discord application\n• Use slash commands in the past 30 days\n• Be the owner of the application',
                        inline: false
                    },
                    {
                        name: '🔗 How to Apply',
                        value: '1. Visit [Discord Developer Portal](https://discord.com/developers/applications)\n2. Go to your application\n3. Look for the "Active Developer Badge" section\n4. Click "Apply" if eligible',
                        inline: false
                    },
                    {
                        name: '⚡ Keep Active',
                        value: 'Use `/devbadge ping` regularly to maintain activity!\nBadge stays active as long as commands are used.',
                        inline: false
                    }
                )
                .setFooter({ text: 'Use /devbadge ping to help maintain your eligibility!' })
                .setTimestamp();
                
            await interaction.reply({ embeds: [infoEmbed] });
            
        } else if (subcommand === 'ping') {
            const responses = [
                '🏓 Pong! Keeping the bot active for that dev badge!',
                '✨ Still here and ready! Badge eligibility maintained!',
                '🚀 Bot is active and running! Dev badge status: Good!',
                '⚡ Ping successful! Your bot activity is logged!',
                '🎯 Direct hit! Bot remains active for developer badge!',
                '🔥 Bot is blazing and active! Badge requirements met!'
            ];
            
            const response = responses[Math.floor(Math.random() * responses.length)];
            const latency = Date.now() - interaction.createdTimestamp;
            
            await interaction.reply({
                content: `${response}\n\n📊 **Response Time:** ${latency}ms\n⏱️ **Bot Uptime:** ${Math.floor(interaction.client.uptime / 1000 / 60)} minutes`
            });
            
        } else if (subcommand === 'stats') {
            const uptime = interaction.client.uptime;
            const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
            const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
            
            const statsEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('📊 Bot Statistics')
                .setThumbnail(interaction.client.user.displayAvatarURL())
                .addFields(
                    {
                        name: '⏱️ Uptime',
                        value: `${days}d ${hours}h ${minutes}m`,
                        inline: true
                    },
                    {
                        name: '🏠 Servers',
                        value: `${interaction.client.guilds.cache.size}`,
                        inline: true
                    },
                    {
                        name: '👥 Users',
                        value: `${interaction.client.users.cache.size}`,
                        inline: true
                    },
                    {
                        name: '⚡ Commands',
                        value: `${interaction.client.commands.size}`,
                        inline: true
                    },
                    {
                        name: '🔗 Ping',
                        value: `${Math.round(interaction.client.ws.ping)}ms`,
                        inline: true
                    },
                    {
                        name: '🎯 Status',
                        value: '🟢 Active & Ready',
                        inline: true
                    }
                )
                .setFooter({ 
                    text: `Bot: ${interaction.client.user.tag}`,
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                .setTimestamp();
                
            await interaction.reply({ embeds: [statsEmbed] });
        }
    },
};