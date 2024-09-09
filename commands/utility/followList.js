const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Users } = require('../../models/user.js');
const { getUsernameById } = require('../../index.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('follow_list')
        .setDescription(`Retrieves the user's follow list.`),
    async execute(interaction) {

        if (interaction.user.bot) {
            return;
        }

        // Checking the database
        let currUser = await Users.findOne( { where: { user_id: interaction.user.id } });

        if (currUser) {

            let userFollowList = currUser.follow_list ? currUser.follow_list.split('#') : [];
            let userLinks = [];

            for (const id of userFollowList) {
                try {
                    const username = await getUsernameById(id);
                    if (username) {
                        // Create a clickable mention link
                        const userLink = `**${username}**`;
                        userLinks.push(userLink);
                    } else {
                        console.log('User not found for ID:', id);
                    }
                } catch (error) {
                    console.error('Error fetching username:', error);
                }
            }

            // Create the embed
            const embed = new EmbedBuilder()
                .setAuthor({ name: `${interaction.user.username}'s Follow List`, iconURL: `${interaction.user.avatarURL({ dynamic: true, size: 64 })}`} )
                .setDescription(userLinks.length > 0 ? userLinks.join('\n') : 'Your follow list is empty.')
                .setColor('#0099ff'); // Optional: set a color for the embed

            await interaction.reply({ embeds: [embed] });

        } else {
            await interaction.reply(`User not found in database.`);
        }
    }
};
