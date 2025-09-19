const { Client, GatewayIntentBits, Events, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Check for required environment variable
if (!process.env.DISCORD_BOT_TOKEN) {
    console.error('ERROR: DISCORD_BOT_TOKEN environment variable is required');
    process.exit(1);
}

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ] 
});

// Collection to store commands
client.commands = new Collection();

// Load commands from directories
const loadCommands = () => {
    const commandFolders = ['moderation', 'fun'];
    
    for (const folder of commandFolders) {
        const commandsPath = path.join(__dirname, 'commands', folder);
        if (!fs.existsSync(commandsPath)) {
            fs.mkdirSync(commandsPath, { recursive: true });
            continue;
        }
        
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                console.log(`Loaded command: ${command.data.name}`);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
};

// Load commands
loadCommands();

client.once(Events.ClientReady, async c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
    
    // Register slash commands
    try {
        console.log('Started refreshing application (/) commands.');
        const commands = client.commands.map(command => command.data.toJSON());
        await c.application.commands.set(commands);
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error refreshing commands:', error);
    }
});

// Handle slash command interactions
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Error executing command ${interaction.commandName}:`, error);
            
            const reply = { content: 'There was an error while executing this command!', ephemeral: true };
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(reply);
            } else {
                await interaction.reply(reply);
            }
        }
    } else if (interaction.isButton()) {
        // Handle button interactions
        try {
            const [commandName, action, ...params] = interaction.customId.split('_');
            const command = client.commands.get(commandName);
            
            if (command && command.handleButton) {
                await command.handleButton(interaction, action, params);
            } else {
                await interaction.reply({ 
                    content: 'This button interaction is no longer available.', 
                    ephemeral: true 
                });
            }
        } catch (error) {
            console.error('Error handling button interaction:', error);
            
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ 
                    content: 'There was an error processing this button!', 
                    ephemeral: true 
                });
            }
        }
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);