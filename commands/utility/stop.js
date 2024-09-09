const { SlashCommandBuilder } = require('discord.js');
const { distube } = require('../../index.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops the current song/playback'),
    async execute(interaction) {

        const { channel } = interaction.member.voice;

        if (!channel) {
            await interaction.reply('You need to be in a voice channel to use this command.');
            return;
        }

        try {
            // Defer the reply to acknowledge the interaction
            await interaction.deferReply();
            
            // Stop playback using DisTube
            await distube.stop(interaction.guild);
            
            // Get the current voice connection and disconnect it
            const connection = getVoiceConnection(channel.guild.id);
            if (connection) {
                console.log('destroyed');
                connection.destroy();
            }

            console.log('Stopped playback and left the voice channel');
            await interaction.editReply('Stopped playback and left the voice channel');

        } catch (error) {
            console.error('Error stopping audio with DisTube:', error);
            await interaction.editReply('There was an error trying to stop the audio.');
        }
    }
};
