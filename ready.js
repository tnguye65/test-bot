const { SlashCommandBuilder } = require('discord.js');
const { Users } = require('../../index.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('follow_activity')
        .setDescription('Adds a user to your following list and get notified when they start an activity.')
        .addUserOption(option =>
            option.setName('targetuser')
            .setDescription("The user you want to follow")
            .setRequired(true)),
    async execute(interaction) {

        const userToFollow = interaction.options.getUser('targetuser');

        let currUser = await Users.findOne( { where: { user_id: interaction.user.id } });
        const userExists = await Users.findOne({ where: { user_id: userToFollow.id } });

        if (currUser && userExists) {

            let userFollowList = currUser.follow_list ? currUser.follow_list.split('#') : [];;

            // Check if the user is already in the follow list
            if (userFollowList.includes(userExists.user_id.toString())) {
                await interaction.reply(`${userExists.name} is already in your follow list.`);
                return;
            }
            
            userFollowList.push(userExists.user_id.toString());

            // Convert the array back to a string separated by #
            const updatedFollowList = userFollowList.join('#');

            await Users.update({ follow_list: updatedFollowList }, { where : { user_id: interaction.user.id } });

            console.log(`${userExists.name} was added to ${currUser.name}'s follow list`)
            await interaction.reply(`${userExists.name} was added to your follow list`);

        } else {
            await interaction.reply(`User not found in database`);
        }

    }
};