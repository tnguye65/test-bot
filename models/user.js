// Require Sequelize
const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

const Users = sequelize.define('users', {
	user_id: {
		type: Sequelize.STRING,
		unique: true,
        primaryKey: true,
        allowNull: false
	},
    name: Sequelize.STRING,
	follow_list: Sequelize.STRING,
	recent_activities: Sequelize.STRING,
	frequent_activites: Sequelize.STRING
});

module.exports = { sequelize, Users };
