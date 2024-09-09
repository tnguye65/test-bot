const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Events, ChannelType } = require('discord.js');
const { DisTube } = require('distube');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const {sequelize, Users} = require('./models/user.js'); // Import the Users model

require('dotenv').config({ path: './credentials/.env' }); // This loads the environment variables
// Assign the variables correctly from process.env
const token = process.env.token;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.once(Events.ClientReady, async readyClient => {
    await sequelize.sync({ force: true });
	console.log(`Logged in as ${readyClient.user.tag}!`);

    // Iterate through all guilds the bot is a member of
    for (const guild of readyClient.guilds.cache.values()) {
        try {
            // Check if 'activity-alert' channel exists
            let activityChannel = guild.channels.cache.find(channel => channel.name === 'activity-alert' && channel.type === ChannelType.GuildText);

            if (!activityChannel) {
                // Create the 'activity-alert' channel if it doesn't exist
                await guild.channels.create({
                    name: 'activity-alert',
                    type: ChannelType.GuildText,
                    topic: 'Tracks user activity changes',
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone.id, // Role ID for everyone
                            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
                        }
                    ]
                });
                console.log(`Created activity-alert channel in ${guild.name}`);
            } else {
                console.log(`activity-alert channel already exists in ${guild.name}`);
            }
        } catch (e) {
            console.error(`Could not create activity-alert channel in ${guild.name}: ${e}`);
        }

        for (const member of guild.members.cache.values()) {

            const userExists = await Users.findOne({ where: { user_id: member.user.id } });

            if (!userExists && !member.user.bot) {

                try {

                    const newUser = await Users.create({
                        user_id: member.user.id,
                        name: member.user.username,
                        follow_list: '',
                        recent_activities: '',
                        frequent_activites: ''
                    });

                    console.log(`${newUser.name} was added to the database`);

                } catch (e) {
                    if (e.name === 'SequelizeUniqueConstraintError') {
                        console.log('That tag already exists.');
                    }
        
                    console.log('Something went wrong with adding a tag.');
                }

            }

        }
    }
});

const distube = new DisTube(client, {
    emitNewSongOnly: true,
    plugins: [new YtDlpPlugin()]
});

async function getUsernameById(userId) {
    try {
        const user = await client.users.fetch(userId);
        return user.username;
    } catch (error) {
        console.error(`Failed to fetch user: ${error}`);
        return null;
    }
}

module.exports = { client, Users, getUsernameById, distube };

/* !--------- INSTANTIATING SLASH COMMANDS FROM COMMANDS/UTILITY FOLDER ---------! */

client.commands = new Collection();
client.cooldowns = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

/* !-----------------------------------------------------------------------------! */

/* !-------------------EVENT HANDLING FROM EVENTS FOLDER ------------------------! */

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

/* !-----------------------------------------------------------------------------! */

client.login(token);

