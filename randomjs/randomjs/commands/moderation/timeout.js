const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a member (mute them for a specified duration)')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to timeout')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Timeout duration in minutes (1-1440)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(1440))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for timeout')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        
        // Check if user has permission
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({ 
                content: '❌ You need the "Moderate Members" permission to use this command!', 
                ephemeral: true 
            });
        }
        
        // Fetch member to ensure they exist
        let member;
        try {
            member = await interaction.guild.members.fetch(target.id);
        } catch (error) {
            return interaction.reply({ 
                content: '❌ User not found in this server!', 
                ephemeral: true 
            });
        }
        
        // Check if target is moderatable
        if (!member.moderatable) {
            return interaction.reply({ 
                content: '❌ I cannot timeout this member. They may have higher permissions than me.', 
                ephemeral: true 
            });
        }
        
        // Check if user is trying to timeout themselves
        if (member.id === interaction.user.id) {
            return interaction.reply({ 
                content: '❌ You cannot timeout yourself!', 
                ephemeral: true 
            });
        }
        
        try {
            const timeoutMs = duration * 60 * 1000; // Convert minutes to milliseconds
            await member.timeout(timeoutMs, reason);
            
            const timeoutUntil = new Date(Date.now() + timeoutMs);
            await interaction.reply({ 
                content: `✅ Successfully timed out ${target.tag} for ${duration} minutes\n**Reason:** ${reason}\n**Timeout ends:** <t:${Math.floor(timeoutUntil.getTime() / 1000)}:R>` 
            });
        } catch (error) {
            console.error('Error timing out member:', error);
            await interaction.reply({ 
                content: '❌ Failed to timeout the member. Please try again.', 
                ephemeral: true 
            });
        }
    },
};