# States
 1. No battle
 1. Battle Initiation
    1. people rolling-in
 1. Active Battle
    1. Each round progressing forward
       1. All turns
          1. Notify channel of full order
          1. Notify user whose character is up
          1. Receptive not initiative modification commands
          1. Waiting for player to confirm end of turn (or receive "skip" command)
          1. Re-order people that haven't gone yet
          1. Checks if there's anyone left in the round
       1. No more turns
          1. Notify all players to regenerate motes
          1. Notify channel it's the top of the round
          1. Re-order entire list
          1. Start round over again
       1. Someone calls an end to the battle
          1. destroy list
          1. return to "no battle" state
