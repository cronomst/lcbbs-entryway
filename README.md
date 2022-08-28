# "Bowling Solitaire" for Last Call BBS

This is a game of Bowling Solitaire meant to be played from "Netronics Connect!" in
Zachtronics' [Last Call BBS](https://www.zachtronics.com/last-call-bbs/). It is based on Sid Sackson's version described in the book "A Gamut of Games."

## Installation

Follow the instructions described on the [Zachtronics website](https://www.zachtronics.com/quickserve/) to install `entryway.js` from this repository into your Last Call BBS `servers` folder.

## Running the Game

This game will appear under "Netronics Connect!" as "Entryway BBS." Connect to this BBS and navigate the menus using the indicated keys to start the game.

## Playing the game

Each card on the field features a letter above it. Type the letter shown to select the card. Select combinations of up to 3 "pin" cards so that the last digit of their sums matches with one of the face-up cards in your hand (you may press a selected pin card's letter again to de-select it). Once your pin cards are selected, choose a card from your hand to play that card. If the last digit sum matches, the pin cards and card from your hand will be removed from play. When you have no more viable options, press the SPACE key to complete your roll.

Much like real bowling, clearing all pin cards from play on the first roll of a frame will score a strike. Likewise, clearing all pins by the second roll of a frame will result in a spare.

## Game Settings

On the "Bowling Solitaire" menu, there are two options to customize the game's difficulty.

### Hints

When turned ON, the "Hints" option will cause cards from your hand to flash when you have selected a 
combination of pin cards that can be played.

### Visible Discards

This game uses a deck of 20 cards, two each numbered 0 through 9. When "Visible Discards" is ON, cards
that have been played will be displayed at the bottom of the screen. This can be used to help you
determine the probable identity of the cards hidden under the face-up cards in your hand.