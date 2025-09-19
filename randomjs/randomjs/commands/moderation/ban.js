const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member from the server')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for banning')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('days')
                .setDescription('Number of days of messages to delete (0-7)')
                .setRequired(false)
                .setMinValue(0)
                .setMaxValue(7))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const deleteMessageDays = interaction.options.getInteger('days') || 0;
        
        // Check if user has permission
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({ 
                content: '❌ You need the "Ban Members" permission to use this command!', 
                ephemeral: true 
            });
        }
        
        const member = interaction.guild.members.cache.get(target.id);
        
        // Check if target is bannable (if they're in the server)
        if (member && !member.bannable) {
            return interaction.reply({ 
                content: '❌ I cannot ban this member. They may have higher permissions than me.', 
                ephemeral: true 
            });
        }
        
        // Check if user is trying to ban themselves
        if (target.id === interaction.user.id) {
            return interaction.reply({ 
                content: '❌ You cannot ban yourself!', 
                ephemeral: true 
            });
        }
        
        try {
            await interaction.guild.members.ban(target.id, { 
                reason: reason,
                deleteMessageSeconds: deleteMessageDays * 24 * 60 * 60
            });
            await interaction.reply({ 
                content: `✅ Successfully banned ${target.tag}\n**Reason:** ${reason}\n**Messages deleted:** ${deleteMessageDays} days` 
            });
        } catch (error) {
            console.error('Error banning member:', error);
            await interaction.reply({ 
                content: '❌ Failed to ban the member. Please try again.', 
                ephemeral: true 
            });
        }
    },
};