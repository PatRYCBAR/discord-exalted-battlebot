const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
 
client.on("ready", () => {
  console.log("I am ready!");
});
 
// Set the prefix
const prefix = "!";
client.on("message", (message) => {
  if (message.author.bot) return;
  // This is where we'll put our code.
  if (message.content.indexOf(config.prefix) !== 0) return;
 
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
 
  if(command === 'ping') {
    message.channel.send('Pong!');
  } else
  if(command === 'foo') {
    message.channel.send('Bar!');
  } else
  if (command === 'blah') {
    message.channel.send('Meh.');
  }
});
 
client.login(config.token);
