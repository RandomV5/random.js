const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member from the server')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for kicking')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        
        // Check if user has permission
        if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.reply({ 
                content: '❌ You need the "Kick Members" permission to use this command!', 
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
        
        // Check if target is kickable
        if (!member.kickable) {
            return interaction.reply({ 
                content: '❌ I cannot kick this member. They may have higher permissions than me.', 
                ephemeral: true 
            });
        }
        
        // Check if user is trying to kick themselves
        if (member.id === interaction.user.id) {
            return interaction.reply({ 
                content: '❌ You cannot kick yourself!', 
                ephemeral: true 
            });
        }
        
        try {
            await member.kick(reason);
            await interaction.reply({ 
                content: `✅ Successfully kicked ${target.tag}\n**Reason:** ${reason}` 
            });
        } catch (error) {
            console.error('Error kicking member:', error);
            await interaction.reply({ 
                content: '❌ Failed to kick the member. Please try again.', 
                ephemeral: true 
            });
        }
    },
};