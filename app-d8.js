const { Client, Collection, GatewayIntentBits } = require('discord.js');
const mongoose = require("mongoose");
const fs = require('fs');
require("dotenv/config");
const interact = require('./dsInteractions.js');
const dbCmds = require('./dbCmds.js');
const startup = require('./startup.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers], partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

client.commands = new Collection();
client.buttons = new Collection();

client.login(process.env.TOKEN);

const fileParts = __filename.split(/[\\/]/);
const fileName = fileParts[fileParts.length - 1];

client.once('ready', async () => {

	console.log(`[${fileName}] The client is starting up!`);
	mongoose.set("strictQuery", false);
	mongoose.connect(process.env.MONGO_URI, {
		keepAlive: true
	});
	console.log(`[${fileName}] Connected to mongo!`);

	const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js')); // Find all the files in the command folder that end with .js
	const cmdList = []; // Create an empty array for pushing each command file to
	for (const file of commandFiles) { // For each file in command files group
		const command = require(`./commands/${file}`); // Get the information that is in the file
		console.log(`[${fileName}] Added ${file}!`); // Log that the command was added
		cmdList.push(command); // push that command to the array
		client.commands[command.name] = command; // Save the command name and command information to the client
	}
	const allCommands = await client.guilds.cache.get(process.env.SERVER_ID).commands.set(cmdList) // Sets all the commands
		.catch(console.error);
	const cmdIDs = allCommands.keys();
	for (let i = 0; i < allCommands.size; i++) {
		const cmdID = cmdIDs.next().value;
		const cmdName = await allCommands.get(cmdID).name;
		let permission = client.commands[cmdName].permission;
		if (permission != undefined) { // If no permissions are given, don't update any permissions
			if (permission.length == undefined) { // If the permission isn't already an array (more than 1 permission), turn it into an array as that is what the function requires
				permission = [permission];
			}
			client.guilds.cache.get(process.env.SERVER_ID).commands.permissions.set({ command: cmdID, permissions: permission })
				.catch(console.error);
		}
	}

	interact(client); // Fire whenever an interaction is created
	console.log(`[${fileName}] Connected to ${client.guilds.cache.size} guild(s).`); // Lists the number of guilds that the client is connected to
	const keys = client.guilds.cache.keys(); // Gets the keys for the map object from the guilds object
	for (const entry of keys) { // For each guild
		console.log(`[${fileName}] Connected to guild ID ${entry}.`); // Log the guild Key (guild.id)
	}
	console.log(`[${fileName}] Client is ready.`);

	startup.startUp(client);
});