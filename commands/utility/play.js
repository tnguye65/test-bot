const { SlashCommandBuilder } = require('discord.js');
const { distube } = require('../../index.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Streams YouTube URL in current voice channel')
        .addStringOption(option => 
            option.setName('url')
            .setDescription('The URL you want to stream')
            .setRequired(true)
        ),
    async execute(interaction) {
        const url = interaction.options.getString('url');
        const { channel } = interaction.member.voice;

        if (!channel) {
            await interaction.reply('You need to be in a voice channel to use this command.');
            return;
        }

        try {
            
            await interaction.deferReply();
            
            await distube.play(channel, url, {
                member: interaction.member,
                textChannel: interaction.channel,
            });

            console.log(`Now playing: ${url}`);
            await interaction.editReply(`Now playing: ${url}`);

        } catch (error) {
            console.error('Error playing audio with DisTube:', error);
            await interaction.editReply('There was an error trying to play the audio.');
        }
    }
};
