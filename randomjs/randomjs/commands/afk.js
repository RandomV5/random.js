const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const TOKEN = 'your-bot-token';
const CLIENT_ID = 'your-client-id';
const GUILD_ID = 'your-guild-id';

const commands = [
  new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Set your AFK status')
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for going AFK')
        .setRequired(false))
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );
  console.log('✅ Slash command registered');
})();
const afkMap = new Map();

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'afk') {
    const reason = interaction.options.getString('reason') || 'AFK';
    afkMap.set(interaction.user.id, {
      reason,
      timestamp: Date.now(),
    });

    await interaction.reply(`You are now AFK: ${reason}`);
  }
});
client.on('messageCreate', async message => {
  message.mentions.users.forEach(user => {
    if (afkMap.has(user.id)) {
      const { reason } = afkMap.get(user.id);
      message.reply(`${user.username} is currently AFK: ${reason}`);
    }
  });

  if (afkMap.has(message.author.id)) {
    afkMap.delete(message.author.id);
    message.reply('Welcome back! You are no longer AFK.');
  }
});

