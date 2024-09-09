const { Events, ChannelType } = require('discord.js');

module.exports = {
    name: Events.ChannelDelete,
    async execute(channel) {
        // Check if the deleted channel was an 'activity-alert' channel
        if (channel.type === ChannelType.GuildText && channel.name === 'activity-alert') {
            try {
                // Get the guild
                const guild = channel.guild;

                // Create the 'activity-alert' channel
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
                console.log(`Recreated activity-alert channel in ${guild.name}`);
            } catch (e) {
                console.error(`Could not recreate activity-alert channel: ${e}`);
            }
        }
    },
};
