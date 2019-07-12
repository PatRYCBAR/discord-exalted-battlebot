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
var DebugLevel = 2;

var initiative_list = []; // full list of people in combat
// The list is an array of objects containing the following:
// user - the Discord user running the combatant
// combatant - the IC identity of the combatant (defaults to the "user")
// initiative - the combatant's Initiative value

// Reference codes for commands:
//  - battle close
//  - combatant add
//  - combatant remove
//  - battle list
//  - combatant initiative
//  - battle sort
var CMD_seed = 0;
const CMD = {
  bad_command           : -1,
  battle_close          : ++CMD_seed,
  combatant_add         : ++CMD_seed,
  combatant_remove      : ++CMD_seed,
  battle_list           : ++CMD_seed,
  combatant_initiative  : ++CMD_seed,
  battle_sort           : ++CMD_seed,
  help                  : ++CMD_seed,
  
  // nonsense / testing commands
  CMD_list              : ++CMD_seed,
  ping                  : ++CMD_seed,
  blah                  : ++CMD_seed
}

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

// Summary: Removes a combatant from the Initiative List.
// Input / Changes: Takes in a name of a combatant to be removed.  Directly modifies "initiative_list".
// Returns: Combatant that was removed or -1 (if not found)
function removeCombatant(combatantname){
  var output = -1;
  
  // find the index of the combatant to be removed
  var i = findCombatant(combatantname);
  
  // remove the combatant (if they were found)
  if (i != -1){
    output = initiative_list.splice(i, 1);
    output = output[0];
  }
  
  return output;
}

// Summary: Modifies the Initivative value of a combatant by a multiplier then an addition / subtraction.
// Input / Changes: Takes in:
//                     - a name of a combatant to be modified
//                     - what the Initiative value will be multiplied by (typically 1 to add or subtract or 0 to set)
//                     - what will be added to the Initative value (negative numbers to subtact)
//                  Directly modifies "initiative_list".
// Returns: Combatant that was modified or -1 (if not found)
function changeCombatantInitiative(combatantname, multInitiative, addToInitiative){
  var output = -1;
  
  // find the index of the combatant to be changed
  var i = findCombatant(combatantname);
  
  // change the combatant (if they were found)
  if (i != -1){
    var newInitiative = initiative_list[i].initiative;
    newInitiative = newInitiative * multInitiative;
    newInitiative = newInitiative + addToInitiative;
    
    initiative_list[i].initiative = newInitiative;
    output = initiative_list[i];
  }
  
  return output;
}

// Summary: Returns string with the full Initiative List for message display
// Input / Changes: Takes in boolean to determine if it will be the default display or "full display".
// Returns: formatted string of "initiative_list".
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

// Summary: Initiates program to provide helpful information and stores old help version that might be useful in the future.
// Input / Changes: Takes in the version of help desired.
// Returns: nothing (the method takes input / sends information directly)
function helpMode(version){
  // original help version - a bunch of commands
  if (version == 1) message.channel.send('<b>You could try:</b>' + '</br>'
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
  // not so much a help as a debug of all the potential commands and their numberical equivalents
  else if (version == -1) message.channel.send("<b>List of CMD IDs:</b>" + "</br>" +
                                               "ping = " + CMD.ping + "</br>" +
                                               "blah = " + CMD.blah + "</br>" +
                                               "CMD_list = " + CMD.CMD_list + "</br>" +
                                               "battle_close = " + CMD.battle_close + "</br>" +
                                               "combatant_add = " + CMD.combatant_add + "</br>" +
                                               "combatant_remove = " + CMD.combatant_remove + "</br>" +
                                               "battle_list = " + CMD.battle_list + "</br>" +
                                               "combatant_initiative = " + CMD.combatant_initiative + "</br>" +
                                               "battle_sort = " + CMD.battle_sort + "</br>" +
                                               "help = " + CMD.help + "</br>" +
                                               "bad_command = " + CMD.bad_command);
}

// Summary: Sends appropriate output during an appropriate level of debug.
// Input / Changes: Takes in:
//                         - a number that indicates the "level" of debug at which point the output would be sent
//                         - a boolean value or expression to indicate when the output would be sent
//                         - a string that would be output
//                  Utilizes global variable that states the current variable that the program is up to
// Returns: nothing (outputs the information to the console directly)
function DEBUG(atThisLevel, whenThisHappens, sayThis){
  if ((DebugLevel >= atThisLevel) && (whenThisHappens)) message.channel.send(sayThis);
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
    DEBUG(3,true,'battle closing!');
    wipeInitiative();
    DEBUG(1,true,'battle closed!');
  } else
  if(command === 'combatant add') {
    DEBUG(3,true,'adding combatant!');
    addNewCombatant(args[0], args[1], parseInt(args[2]));
    DEBUG(1,true,'combatant added!');
  } else
  if(command === 'combatant remove') {
    DEBUG(1,true,'removing combatant: ' + args[0] + '!');
    
    // find the index of the character to be removed
    var removed = removeCombatant(args[0]);
    
    DEBUG(2,(removed != -1),'combatant removal SUCCESSFUL! ' + removed.combatant + ' (' + removed.user + ')');
    DEBUG(2,(removed == -1),'combatant removal FAILED!');
  } else
  if(command === 'battle list') {
    DEBUG(2,true,'here comes the initiative');
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
    DEBUG(2,true,'changing initiative for: ' + args[1] + '!');
    
    var modified = -1;
    
    // make sure that the arg was a number
    var init_change = parseInt(args[2]);
    if (init_change.toString() != "NaN"){
      if (args[0] == "add"){
        modified = changeCombatantInitiative(args[1], 1, init_change);
      } else
      if ((args[0] == "remove") || (args[0] == "subtract") || (args[0] == "sub")){
        modified = changeCombatantInitiative(args[1], 1, (-1 * init_change));
      } else
      if (args[0] == "set"){
        modified = changeCombatantInitiative(args[1], 0, init_change);
      } else DEBUG(2,true,'initiative change FAILED because ' + args[0] + ' is not a valid sub-command.');
    } else DEBUG(2,true,'initiative change FAILED because ' + args[2] + ' is not a number.');
    
    DEBUG(1,(modified != -1),'combatant initiative change SUCCESSFUL! ' + modified.initiative + ' : ' + modified.combatant + ' (' + modified.user + ')');
    DEBUG(1,(modified == -1),'initiative change FAILED because character was not found!');
  } else
  if(command === 'battle sort') {
    DEBUG(2,true,'Sorting battle!');
    
    // Preparing first argument to be used
    if (args.length == 0) args.push("0");
    args[0] = parseInt(args[0]);
    if (args[0].toString() == "NaN") args[0] = 0;
    
    // Sorting from specified position
    sortInitiativeList(args[0]);
    DEBUG(1,true,'Battle sorted!');
  } else
  if(command === 'help') {
    helpMode(1);
  } else
  if(command === 'sample') {
    DEBUG(2,true,'<b>Setting-up sample as though the following commands were run:</b>' + '</br>'
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
    DEBUG(1,true,'Sample setup completed!');
  } else
  if(command === 'cmd list') {
    helpMode(-1);
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
