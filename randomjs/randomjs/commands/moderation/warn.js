const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a member')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to warn')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the warning')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason');
        
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
        
        // Check if user is trying to warn themselves
        if (member.id === interaction.user.id) {
            return interaction.reply({ 
                content: '❌ You cannot warn yourself!', 
                ephemeral: true 
            });
        }
        
        // Create warning embed for the channel
        const warningEmbed = new EmbedBuilder()
            .setColor(0xffaa00)
            .setTitle('⚠️ Member Warned')
            .addFields(
                { name: 'Member', value: `${target.tag} (${target.id})`, inline: true },
                { name: 'Moderator', value: interaction.user.tag, inline: true },
                { name: 'Reason', value: reason, inline: false }
            )
            .setTimestamp();
        
        // Try to DM the user about the warning
        let dmSent = false;
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor(0xffaa00)
                .setTitle('⚠️ You have been warned')
                .setDescription(`You have been warned in **${interaction.guild.name}**`)
                .addFields(
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setTimestamp();
                
            await target.send({ embeds: [dmEmbed] });
            dmSent = true;
        } catch (error) {
            console.log(`Could not send DM to ${target.tag}: ${error.message}`);
        }
        
        // Send the warning message
        const dmStatus = dmSent ? '✅ User has been notified via DM.' : '⚠️ Could not send DM to user.';
        
        await interaction.reply({ 
            embeds: [warningEmbed],
            content: dmStatus
        });
    },
};