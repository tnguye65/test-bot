const { Events, ChannelType } = require('discord.js');
const { Users } = require('../models/user.js');

// Map to store user activities with timestamps
const activityCache = new Map();

module.exports = {
    name: Events.PresenceUpdate,
    async execute(oldPresence, newPresence) {
        // Get the guild from newPresence or oldPresence
        const guild = newPresence.guild || oldPresence.guild;

        // Find the activity-alert channel
        const activityChannel = guild.channels.cache.find(channel => channel.name === 'activity-alert' && channel.type === ChannelType.GuildText);

        if (!activityChannel || !newPresence.activities) return;

        const now = Date.now();
        const userId = newPresence.user.id;

        newPresence.activities.forEach(async activity => {
            let messageContent = '';

            if (activity.type === 0) { // Playing a game
                messageContent = `<@${userId}> is playing ${activity.name}`;
            } else if (activity.type === 3) { // Watching something
                messageContent = `<@${userId}> is watching ${activity.name}`;
            }

            // If there's a message to send, check the cache
            if (messageContent) {
                // Check if the user has an activity cached
                if (activityCache.has(userId)) {
                    let userActivities = activityCache.get(userId);
                    const recentActivity = userActivities.find(entry => entry.activity === messageContent && (now - entry.timestamp) < 30 * 60 * 1000); // 30 minutes

                    if (recentActivity) {
                        // If the activity was recorded in the last 30 minutes, skip sending
                        return;
                    }

                    // Remove outdated activities
                    userActivities = userActivities.filter(entry => (now - entry.timestamp) < 30 * 60 * 1000);
                    userActivities.push({ activity: messageContent, timestamp: now });
                    activityCache.set(userId, userActivities);
                } else {
                    // Create a new cache entry for the user
                    activityCache.set(userId, [{ activity: messageContent, timestamp: now }]);
                }

                // Notify followers
                const followersToNotify = [];
                for (const member of guild.members.cache.values()) {  // Use the guild object here
                    // Check if the member is in the database
                    const userRecord = await Users.findOne({ where: { user_id: member.user.id } });

                    if (userRecord && userRecord.follow_list) {
                        // Check if the userId is in this member's follow list
                        if (userRecord.follow_list.includes(userId)) {
                            followersToNotify.push(member.user);
                        }
                    }
                }

                // Send the message to the channel and/or followers
                if (followersToNotify.length > 0) {
                    for (const follower of followersToNotify) {
                        // Send a DM to the follower
                        try {
                            await follower.send(messageContent);
                        } catch (error) {
                            console.error(`Could not send DM to ${follower.tag}:`, error);
                        }
                    }
                } else {
                    // Send the message to the activity-alert channel
                    activityChannel.send(messageContent);
                }
            }
        });
    },
};
