const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('mina')
        .setDescription('My girlfriend'),
    async execute(interaction) {
        const userId = '325627714587328512';
        const minaId = '706350751919767623';

        try {
            // Fetch the user by ID
            const user = await interaction.client.users.fetch(userId);

            // Check if the interaction is from the specified user
            if (interaction.user.id === user.id) {
                await interaction.reply(`@everyone I love my girlfriend ❤️`);
            } else if (interaction.user.id === minaId) {
                await interaction.reply(`@everyone I'm pretty cool!`);
            } else {
                await interaction.reply(`@everyone <@${user.id}>'s girlfriend is pretty cool!`);
            }
        } catch (error) {
            console.error(`Could not fetch user with ID ${userId}:`, error);
            await interaction.reply({ content: `There was an error fetching the user.`, ephemeral: true });
        }
    },
};
