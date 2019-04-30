const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
 
client.on("ready", () => {
  console.log("I am ready!");
});

// ======================
// Global Variables
// ======================

const prefix = "@battlebot"; // Set the prefix
var battle_progress_state = 0; // Not in use just yet

var initiative_list = []; // full list of people in combat
// The list is an array of objects containing the following:
// user - the Discord user running the character
// character - the IC identity of the character (defaults to the "user")
// initiative - the character's Initiative value

// ======================
// Functions
// ======================

// test function
function myFunction(p1, p2) {
  return p1 * p2;
}

// for wiping the Initiative list at the end of battle
function wipeInitiative() {
  initiative_list = [];
  return 0;
}

// Add a new character into the Initiative List in the last slot (sets-up the object, assuming error-checking is handled)
function addNewCharacter(newuser, newcharacter, newinitiative) {
  // creates a new object from the arguments and puts it into the initiative order at the end
  initiative_list.push({user:newuser, character:newcharacter, initiative:newinitiative});
  // user - the Discord user running the character
  // character - the IC identity of the character (defaults to the "user")
  // initiative - the character's Initiative value
  return 0;
}

// Takes in the name of the character and returns the index in the Initiative List and -1 if it isn't found
function findCharacter(charactername) {
  var list_index = -1;
  var i;
  for (i = 0; i < initiative_list.length; ++i){
    if(initiative_list[i] == charactername) list_index = i;
  }
  return list_index;
}

// ======================
// Event Handlers
// ======================

client.on("message", (message) => {
  if (message.author.bot) return;
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
