const { SlashCommandBuilder } = require('discord.js');
const { Users } = require('../../models/user.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('unfollow_activity')
        .setDescription('Removes a user from your following list.')
        .addUserOption(option =>
            option.setName('targetuser')
            .setDescription("The user you want to unfollow")
            .setRequired(true)),
    async execute(interaction) {

        const userToUnfollow = interaction.options.getUser('targetuser');

        if (userToUnfollow.bot) {
            await interaction.reply(`Cannot unfollow a bot.`);
            return;
        }

        if (userToUnfollow.id == interaction.user.id) {
            await interaction.reply(`Cannot unfollow yourself.`);
            return;
        }

        let currUser = await Users.findOne( { where: { user_id: interaction.user.id } });
        const userExists = await Users.findOne({ where: { user_id: userToUnfollow.id } });

        if (currUser && userExists) {

            let userFollowList = currUser.follow_list ? currUser.follow_list.split('#') : [];;

            userFollowList = userFollowList.filter(id => id !== userToUnfollow.id);

            const updatedFollowList = userFollowList.join('#');

            await Users.update({ follow_list: updatedFollowList }, { where : { user_id: interaction.user.id } });

            console.log(`${userExists.name} was removed from ${currUser.name}'s follow list`)
            await interaction.reply(`**${userExists.name}** was removed to your follow list`);

        } else {
            await interaction.reply(`User not found in database`);
        }

    }
};