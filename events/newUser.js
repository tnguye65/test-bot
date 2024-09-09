const { Events } = require('discord.js');
const { Users } = require('../models/user.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {

        try {
            
            let existingUser = await Users.findOne( { where: { user_id: member.user.id } } );

            if (!existingUser) {

                await Users.create({
                    user_id: member.user.id,
                    name: member.user.username,
                    follow_list: '',
                    recent_activity: '',
                    frequent_activity: ''
                });

                console.log(`Added new user to database: ${member.user.username}`);

            } else {
                console.log(`User already exists in database: ${member.user.username}`);   
            }
        } catch(e) {
            console.error('Error adding user to database:', e);
        }

    }
}