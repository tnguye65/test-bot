const { Events, ChannelType } = require('discord.js');

module.exports = {
    name: Events.GuildCreate,
    async execute(guild) {

        try {

            const activityChannel = guild.channels.cache.find(channel => channel.name === 'activity-alert' && channel.type === ChannelType.GuildText);

            if (!activityChannel) {
                guild.channels.create({
                    name: 'activity-alert',
                    type: ChannelType.GuildText,
                    topic: 'Tracks user activity changes',
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone, // Allows everyone to see the channel
                            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
                        }
                    ]
                });
                console.log(`Created activity-alert channel in ${guild.name}`);

            } else {
                console.log(`activity-alert channel already exists in ${guild.name}`);
            }
        } catch(e) {
            console.error(`Could not create activity-alert channel: ${e}`);
        }
    },
};
