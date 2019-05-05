const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
 
client.on("ready", () => {
  console.log("I just rebooted!  I think I might have an upgrade!");
});

// ======================
// Global Variables
// ======================

const prefix = "@battlebot"; // Set the prefix
var battle_progress_state = 0; // Not in use just yet

var initiative_list = []; // full list of people in combat
// The list is an array of objects containing the following:
// user - the Discord user running the combatant
// combatant - the IC identity of the combatant (defaults to the "user")
// initiative - the combatant's Initiative value

// ======================
// Functions
// ======================

// Test function
function myFunction(p1, p2) {
  return p1 * p2;
}

// For wiping the Initiative list at the end of battle
function wipeInitiative() {
  initiative_list = [];
  return 0;
}

// Add a new combatant into the Initiative List in the last slot (sets-up the object, assuming error-checking is handled)
function addNewCombatant(newuser, newcombatant, newinitiative) {
  // creates a new object from the arguments and puts it into the initiative order at the end
  initiative_list.push({user:newuser, combatant:newcombatant, initiative:newinitiative});
  // user - the Discord user running the combatant
  // combatant - the IC identity of the combatant (defaults to the "user")
  // initiative - the combatant's Initiative value
  
  // returns the newly added combatant as an object
  return initiative_list[initiative_list.length - 1];
}

// Takes in the name of the combatant and returns the index in the Initiative List and -1 if it isn't found
function findCombatant(combatantname) {
  var list_index = -1;
  var i;
  for (i = 0; i < initiative_list.length; ++i){
    if(initiative_list[i] == combatantname) list_index = i;
  }
  return list_index;
}

// WORKING ON: Sorts array of combatant objects based on Initiative values.
// Take in an array of combatant objects.
// Returns that same array but sorted.
// https://www.w3schools.com/js/js_array_sort.asp (The Compare Function)
// function(a, b){return b.initiative - a.initiative} <== goal is from highest to lowest

// WORKING ON: Reorders full "initiative_list" after a specified index number based on initiative values of combatants.
// Take in an index number.  
// Returns nothing - directly modifies "initiative_list".
// https://www.w3schools.com/js/js_array_methods.asp
//  - initiative_list.slice(start_index) <== pass to reorder method
//  - initiative_list = initiative_list.slice(0, start_index).concat(resulting_array) <== assign back to original

// WORKING ON: Translates human text / aliases into more usable commands and arguments.
// Take in the message and the user that sent the message.
// Returns array of commands and arguments.
//  - const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
//  - const command = args.shift().toLowerCase();
// First commands:
//  - battle close
//  - combatant add [user] [combatant] [number]
//  - combatant remove [combatant]
//  - battle list simple
//  - battle list full
//  - combatant initiative add [combatant] [number]
//  - combatant initiative remove [combatant] [number]
//  - combatant initiative set [combatant] [number]

// WORKING ON: Removes a combatant from the Initiative List.
// Takes in a name of a combatant to be removed.
// Returns nothing - directly modifies "initiative_list".
//  - Opposite of "addNewCombatant(newuser, newcombatant, newinitiative)"
//  - findCombatant(combatantname)

// WORKING ON: Returns string with the full Initiative List for message display
// Takes in nothing.
// Returns formatted string of "initiative_list".

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
