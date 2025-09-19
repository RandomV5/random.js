const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Delete a specified number of messages')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .addUserOption(option =>
            option.setName('target')
                .setDescription('Only delete messages from this user')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const target = interaction.options.getUser('target');
        
        // Check if user has permission
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ 
                content: '❌ You need the "Manage Messages" permission to use this command!', 
                ephemeral: true 
            });
        }
        
        // Check if bot has permission
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ 
                content: '❌ I need the "Manage Messages" permission to delete messages!', 
                ephemeral: true 
            });
        }
        
        try {
            await interaction.deferReply({ ephemeral: true });
            
            // Fetch messages
            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            
            let messagesToDelete = [];
            const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
            
            // Select messages based on criteria
            if (target) {
                // Get up to 'amount' messages from the target user that are newer than 14 days
                const userMessages = messages.filter(msg => 
                    msg.author.id === target.id && msg.createdTimestamp > twoWeeksAgo
                );
                messagesToDelete = Array.from(userMessages.values()).slice(0, amount);
            } else {
                // Get the most recent 'amount' messages that are newer than 14 days
                const recentMessages = messages.filter(msg => msg.createdTimestamp > twoWeeksAgo);
                messagesToDelete = Array.from(recentMessages.values()).slice(0, amount);
            }
            
            if (messagesToDelete.length === 0) {
                return interaction.followUp({ 
                    content: '❌ No messages found to delete. Messages must be newer than 14 days.',
                    ephemeral: true 
                });
            }
            
            // Convert to Collection for bulkDelete
            const { Collection } = require('discord.js');
            const toDelete = new Collection(messagesToDelete.map(m => [m.id, m]));
            
            // Bulk delete messages
            const deleted = await interaction.channel.bulkDelete(toDelete, true);
            
            const targetText = target ? ` from ${target.tag}` : '';
            await interaction.followUp({ 
                content: `✅ Successfully deleted ${deleted.size} messages${targetText}`,
                ephemeral: true 
            });
            
        } catch (error) {
            console.error('Error deleting messages:', error);
            await interaction.followUp({ 
                content: '❌ Failed to delete messages. Please try again.',
                ephemeral: true 
            });
        }
    },
};