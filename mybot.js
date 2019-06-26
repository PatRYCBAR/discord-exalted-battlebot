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
  var namecheck = "";
  for (i = 0; i < initiative_list.length; ++i){
    namecheck = initiative_list[i].combatant;
    
    // Compensating for if the combatant is just going by the user's name
    if (namecheck == "@user") namecheck = initiative_list[i].user;
    
    if (namecheck == combatantname) list_index = i;
  }
  return list_index;
}

// WORKING ON: Sorts array of combatant objects based on Initiative values.
// Take in an array of combatant objects.
// Returns that same array but sorted.
// https://www.w3schools.com/js/js_array_sort.asp (The Compare Function)
// function(a, b){return b.initiative - a.initiative} <== goal is from highest to lowest
function sortByInitiative(combatantlist) {
  // function(a, b){return b.initiative - a.initiative} <== goal is from highest to lowest
  combatantlist.sort(function(a, b){return b.initiative - a.initiative});
  
  return combatantlist;
}

// WORKING ON: Reorders full "initiative_list" after a specified index number based on initiative values of combatants.
// Take in an index number.  
// Returns nothing - directly modifies "initiative_list".
// https://www.w3schools.com/js/js_array_methods.asp
//  - initiative_list.slice(start_index) <== pass to reorder method
//  - initiative_list = initiative_list.slice(0, start_index).concat(resulting_array) <== assign back to original
function sortInitiativeList(start_index) {
  initiative_list = initiative_list.slice(0, start_index).concat(sortByInitiative(initiative_list.slice(start_index)));
}

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
//  - battle sort [number]
function parseCommands(messagetext) {
  var args = messagetext.slice(prefix.length).trim().split(/ +/g);
  var command = "";
  if(args.length > 0) command = args.shift().toLowerCase();
  if(args.length > 0) command = command + " " + args.shift().toLowerCase();
  
  /*for (i = 0; i < initiative_list.length; ++i){
    if(initiative_list[i] == combatantname) list_index = i;
  }*/ // what is this?
  
  //format output
  args.unshift(command)
 
  return args;
}

// WORKING ON: Removes a combatant from the Initiative List.
// Takes in a name of a combatant to be removed.
// Returns nothing - directly modifies "initiative_list".
//  - Opposite of "addNewCombatant(newuser, newcombatant, newinitiative)"
//  - findCombatant(combatantname)

// WORKING ON: Returns string with the full Initiative List for message display
// Takes in boolean to determine if it will be the default display or "full display".
// Returns formatted string of "initiative_list".
function printInitiative(full) {
  var output = "";
  if (initiative_list.length == 0) output = "-empty-";
  
  for (i = 0; i < initiative_list.length; ++i){
    if (full) output = output + initiative_list[i].initiative + " : " + initiative_list[i].combatant + " (" + initiative_list[i].user + ")";
    if (!full) {
      output = output + initiative_list[i].initiative + " : ";
      if (initiative_list[i].combatant === '@user') {
        output = output + initiative_list[i].user;
      } else {
        output = output + initiative_list[i].combatant + " (" + initiative_list[i].user + ")";
      }
    }
    if (i != initiative_list.length - 1) output = output + "</br>";
  }
  
  return output;
}

// ======================
// Event Handlers
// ======================

// REFERED TO AS "MAIN METHOD"
client.on("message", (message) => {
  if (message.author.bot) return;
  // if (message.content.indexOf(config.prefix) !== 0) return; // For once there's an actual config file
  if (message.content.indexOf(prefix) !== 0) return;
  
  const args = parseCommands(message.content); 
  const command = args.shift();
  
  // Process commands
  // First commands:
  //  - battle close
  //  - combatant add [user] [combatant] [number]
  //  - combatant remove [combatant]
  //  - battle list simple
  //  - battle list full
  //  - combatant initiative add [combatant] [number]
  //  - combatant initiative remove [combatant] [number]
  //  - combatant initiative set [combatant] [number]
  //  - battle sort [number]
  if(command === 'battle close') {
    message.channel.send('battle closing!');
    wipeInitiative();
    message.channel.send('battle closed!');
  } else
  if(command === 'combatant add') {
    //message.channel.send('adding combatant!');
    addNewCombatant(args[0], args[1], parseInt(args[2]));
    message.channel.send('combatant added!');
  } else
  if(command === 'combatant remove') {
    message.channel.send('removing combatant: ' + args[0] + '!');
    
    // find the index of the character to be removed
    var i = findCombatant(args[0]);
    
    // remove the character (if they were found)
    if (i != -1) initiative_list.splice(i, 1);
    
    if (i != -1) message.channel.send('combatant removal SUCCESSFUL!');
    else message.channel.send('combatant removal FAILED!');
  } else
  if(command === 'battle list') {
    message.channel.send('here comes the initiative');
    if (args[0] === 'simple') {
      message.channel.send(printInitiative(false));
    } else
    if (args[0] === 'full') {
      message.channel.send(printInitiative(true));
    } else {
      message.channel.send(printInitiative(false));
    }
  } else
  if(command === 'combatant initiative') {
    message.channel.send('changing initiative for: ' + args[1] + '!');
    
    // find the index of the combatant to have their initiative changed
    var i = findCombatant(args[1]);
    
    // check that the combatant was found
    if (i != -1){
      // make sure that the arg was a number
      var init_change = parseInt(args[2]);
      if (init_change.toString() != "NaN"){
        // select the right modification type to the combatant's initiative
        if (args[0] == "add"){
          initiative_list[i].initiative = initiative_list[i].initiative + init_change;
          message.channel.send('initiative change SUCCESSFUL!');
        } else
        if ((args[0] == "remove") || (args[0] == "subtract") || (args[0] == "sub")){
          initiative_list[i].initiative = initiative_list[i].initiative - init_change;
          message.channel.send('initiative change SUCCESSFUL!');
        } else
        if (args[0] == "set"){
          initiative_list[i].initiative = init_change;
          message.channel.send('initiative change SUCCESSFUL!');
        } else message.channel.send('initiative change FAILED because ' + args[0] + ' is not a valid argument.')
      } else message.channel.send('initiative change FAILED because ' + args[2] + ' is not a number.');
    } else message.channel.send('initiative change FAILED because of failure to identify combatant');
  } else
  if(command === 'battle sort') {
    message.channel.send('Sorting battle!');
    
    // Preparing first argument to be used
    if (args.length == 0) args.push("0");
    args[0] = parseInt(args[0]);
    if (args[0].toString() == "NaN") args[0] = 0;
    
    // Sorting from specified position
    sortInitiativeList(args[0]);
    message.channel.send('Battle sorted!');
  } else
  if(command === 'help') {
    message.channel.send('<b>You could try:</b>' + '</br>'
                         + '@battlebot battle close' + '</br>'
                         + '@battlebot combatant add Elwin @user 7' + '</br>'
                         + '@battlebot combatant add Zashi @user 13' + '</br>'
                         + '@battlebot combatant add ST Peplos 8' + '</br>'
                         + '@battlebot combatant add ST Big_Bad 20' + '</br>'
                         + '@battlebot combatant add Nadia @user 11' + '</br>'
                         + '@battlebot battle list' + '</br>'
                         + '@battlebot battle sort' + '</br>'
                         + '@battlebot combatant initiative add Nadia 7' + '</br>'
                         + '@battlebot combatant initiative sub Big_Bad 6' + '</br>'
                         + '@battlebot combatant initiative set Elwin 3');
  } else
  if(command === 'sample') {
    message.channel.send('<b>Setting-up sample as though the following commands were run:</b>' + '</br>'
                         + '@battlebot battle close' + '</br>'
                         + '@battlebot combatant add Elwin @user 7' + '</br>'
                         + '@battlebot combatant add Zashi @user 13' + '</br>'
                         + '@battlebot combatant add ST Peplos 8' + '</br>'
                         + '@battlebot combatant add ST Big_Bad 20' + '</br>'
                         + '@battlebot combatant add Nadia @user 11');
    wipeInitiative();
    addNewCombatant("Elwin", "@user", 7);
    addNewCombatant("Zashi", "@user", 13);
    addNewCombatant("ST", "Peplos", 8);
    addNewCombatant("ST", "Big_Bad", 20);
    addNewCombatant("Nadia", "@user", 11);
    message.channel.send('Sample setup completed!');
  } else
  if(command === 'ping') {
    message.channel.send('Pong!');
  } else
  if (command === 'blah') {
    message.channel.send('meh.');
  } else {
    message.channel.send('Command not recognized. Try:</br>@battlebot help');
  }
});
 
client.login(config.token);
//
