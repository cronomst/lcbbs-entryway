let TextUtil  = function() {
    const TOK_TEXT = 0;
    const TOK_COLOR = 1;
    const TOK_NEWLINE = 2;
    const TOK_BLINK = 3;
    const BLINK_ON = 1;
    const BLINK_OFF = 0;
    const BLINK_SPEED_FASTER = 14;
    const BLINK_SPEED_SLOW = 30;
    const BLINK_SPEED_FASTEST = 6;

    this.blinkCounter = 0;
    this.blinkThreshold = BLINK_SPEED_SLOW;
    this.blinkState = BLINK_OFF;

    /**
     * Draw text that supports new lines and color codes.
     * 
     * Include a "\n" in the text for a new line.
     * Use "~" followed by a character in the set [0-9,A-H] to change the color
     * to a value between 0 and 17 respectively.
     * Use "_" in the text string to turn blinking on or off.
     * 
     * @example
     * draw("This is ~2DARK~C.\nThis is ~HBRIGHT~C.\nThis _blinks_.", 13, 0, 0);
     * 
     * @param {string} text Text to be displayed
     * @param {int} defaultColor Initial color to use
     * @param {int} x Text column start position
     * @param {int} y Text row start position
     */
    this.draw = function(text, defaultColor, x, y) {
        let tokens = this.tokenizeText(text);
        let posX = x;
        let posY = y;
        let color = defaultColor;
        let blinking = false;
        
        for (let i=0; i<tokens.length; i++) {
            let token = tokens[i];
            switch (token.op) {
                case TOK_TEXT:
                    if (!blinking || this.blinkState == BLINK_ON) {
                        drawText(token.value, color, posX, posY);
                    }
                    posX+= token.value.length;
                    break;
                case TOK_COLOR:
                    color = token.value;
                    break;
                case TOK_NEWLINE:
                    posY++;
                    posX = x;
                    break;
                case TOK_BLINK:
                    blinking = !blinking;
                    break;
            }
        }
    };

    /**
     * Set text blinking rate to one of three different speeds
     * 
     * @param {int} speed 0 for slow, 1 for faster, 2 for fastest. Any other value has no effect.
     */
    this.setBlinkSpeed = function(speed) {
        switch (speed) {
            case 0:
                  this.blinkThreshold = BLINK_SPEED_SLOW;
                  break;
            case 1:
                this.blinkThreshold = BLINK_SPEED_FASTER;
                break;
            case 2:
                this.blinkThreshold = BLINK_SPEED_FASTEST;
                break;
        }
    };

    /**
     * Must be called once per onUpdate() if using the blinking text functionality
     */
     this.updateBlink = function() {
        this.blinkCounter++;
        if (this.blinkCounter > this.blinkThreshold) {
            this.blinkCounter = 0;
        }
        if (this.blinkCounter > this.blinkThreshold / 2) {
            this.blinkState = 1;
        } else {
            this.blinkState = 0;
        }
    };
    
    this.tokenizeText = function(text) {
        let tokens = [];
        let textStart = 0;
        let textLen = 0;
        let pos = 0;
        while (pos < text.length) {
            if (text.charAt(pos) == "~") {
                textLen = this.handleTextToken(text, textStart, textLen, tokens);
                pos++
                let color = text.charAt(pos);
                if (color == "A") color = 10;
                if (color == "B") color = 11;
                if (color == "C") color = 12;
                if (color == "D") color = 13;
                if (color == "E") color = 14;
                if (color == "F") color = 15;
                if (color == "G") color = 16;
                if (color == "H") color = 17;
                tokens.push({"op": TOK_COLOR, "value": color});
                textStart = pos+1;
            } else if (text.charAt(pos) == "\n") {
                textLen = this.handleTextToken(text, textStart, textLen, tokens);
                tokens.push({"op": TOK_NEWLINE});
                textStart = pos+1;
            } else if (text.charAt(pos) == "_") {
                textLen = this.handleTextToken(text, textStart, textLen, tokens);
                tokens.push({"op": TOK_BLINK});
                textStart = pos+1;
            } else {
                textLen++;
            }
            pos++;
        }
        this.handleTextToken(text, textStart, textLen, tokens);
        return tokens;
    };
    
    this.handleTextToken = function(text, textStart, textLen, tokens) {
        if (textLen > 0) {
            let textToken = {"op": TOK_TEXT, "value": text.substring(textStart, textLen + textStart)};
            textLen = 0;
            tokens.push(textToken);
        }
        return textLen;
    };
}

let GameData = function() {
    const TOTAL_PINS = 10;
    const TOTAL_CARDS = 20;
    const MAX_SELECTED_PINS = 3;
    const PIN_ADJACENCY = [
        [1,2],
        [0,2,3,4],
        [0,1,4,5],
        [1,4,6,7],
        [1,2,3,5,7,8],
        [2,4,8,9],
        [3,7],
        [3,4,6,8],
        [4,5,7,9],
        [5,8]
    ];

    this.deck = [];
    this.pins = [];
    this.hand = [];
    this.scores = [];
    this.selectedPins = [];
    this.player = 0;
    this.turn = 0;
    this.roll = 0;
    this.frame = 0;
    
    this.init = function() {
        this.scores = [[]];
        this.nextFrame();
        this.updateAvailable();
    };

    this.nextFrame = function() {
        this.frame++;
        this.deck = [];
        this.pins = [];
        this.hand = [[],[],[]];
        this.selectedPins = [];
        this.turn = 0;
        this.roll = 0;
        this.shuffleDeck();
        this.drawCards();
    };

    this.shuffleDeck = function() {
        for (let i=0; i<TOTAL_CARDS; i++) {
            this.deck.push((i+1) % TOTAL_PINS);
        }
        for (let i=this.deck.length-1; i>0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = this.deck[i];
            this.deck[i] = this.deck[j];
            this.deck[j] = temp;
        }
    };

    this.drawCards = function() {
        // Pins
        for (let i=0; i<TOTAL_PINS; i++) {
            let value = this.deck.pop();
            let card = {
                "value": value,
                "label": String.fromCharCode("A".charCodeAt(0) + i),
                "available": false
            };
            this.pins.push(card);
        }
        // Hand
        for (let i=0; i<5; i++) {
            this.hand[0].push(this.deck.pop());
        }
        for (let i=0; i<3; i++) {
            this.hand[1].push(this.deck.pop());
        }
        for (let i=0; i<2; i++) {
            this.hand[2].push(this.deck.pop());
        }
    };

    this.updateAvailable = function() {
        if (this.turn == 0 && this.getTotalPinsSelected() == 0) {
            this.pins[0].available = true;
            this.pins[1].available = true;
            this.pins[2].available = true;
            this.pins[3].available = true;
            this.pins[4].available = false;
            this.pins[5].available = true;
            return;
        } 
        for (let i=0; i<TOTAL_PINS; i++) {
            this.pins[i].available = this.isPinAvailable(i);
        }
    };

    this.isPinAvailable = function(pos) {
        let pin = this.pins[pos];
        let adjacent = PIN_ADJACENCY[pos];
        let totalPinsSelected = this.getTotalPinsSelected();
        
        // Back pins are never available on first turn
        if (this.turn == 0 && pos > 5) {
            return false;
        }
        // Removed pins are not available
        if (pin.value < 0) {
            return false;
        }
        // Selected pins are always available (to be deselected)
        if (this.isPinSelected(pos)) {
            return true;
        }

        // Adjacent pins are available as long as we don't already have the max number of pins selected
        for (let i=0; i<adjacent.length; i++) {
            if (this.pins[adjacent[i]].value < 0
                && totalPinsSelected == 0) {
                return true;
            }

            if (this.isPinSelected(adjacent[i]) == true
                && totalPinsSelected < MAX_SELECTED_PINS) {
                return true;
            }
        }
        return false;
    };

    this.getTotalPinsSelected = function() {
        return this.selectedPins.length;
    };

    this.processInput = function(keyCode) {
        let key = String.fromCharCode(keyCode).toUpperCase();

        for (let i=0; i<this.pins.length; i++) {
            if (key == this.pins[i].label && this.pins[i].available) {
                if (this.isPinSelected(i) == false) {
                    this.selectedPins.push(i);
                } else {
                    this.deselectPin(i);
                }
            }
        }
        if (key == "X") {
            this.playCard(0);
        }
        if (key == "Y") {
            this.playCard(1);
        }
        if (key == "Z") {
            this.playCard(2);
        }
        if (key == " ") {
            this.updateFrameScore();
            this.nextRoll();
        }
        this.updateAvailable();
    };

    this.isPinSelected = function(pos) {
        for (let i=0; i<this.selectedPins.length; i++) {
            if (this.selectedPins[i] == pos) {
                return true;
            }
        }
        return false;
    };

    this.deselectPin = function(pos) {
        // For now, just deselect everything because the logic below
        // doesn't work when only one item remains and it should
        // not be selectable on its own.
        this.selectedPins = [];

        // this.selectedPins.splice(this.selectedPins.indexOf(pos), 1);
        // // Remove another selection if we break the adjacency rule
        // if (this.selectedPins.length > 1) {
        //     leftPin = this.selectedPins[0];
        //     rightPin = this.selectedPins[1];
        //     if (PIN_ADJACENCY[leftPin].indexOf(rightPin) < 0) {
        //         this.selectedPins.pop();
        //     }
        // }
    };

    this.getSelectedPinSum = function() {
        if (this.selectedPins.length < 1) {
            return -1;
        }
        let sum = 0;
        for (let i=0; i<this.selectedPins.length; i++) {
            sum += this.pins[this.selectedPins[i]].value;
        }
        return sum % 10;
    };

    this.playCard = function(handPos) {
        if (this.hand[handPos][0] !== this.getSelectedPinSum()) {
            return false;
        }
        let playedCard = this.hand[handPos].shift();
        for (let i=0; i<this.selectedPins.length; i++) {
            this.pins[this.selectedPins[i]].value = -1;
        }
        this.nextTurn();
        if (this.getPinsDown() == TOTAL_PINS) {
            // TODO: Trigger strike/spare
        }
        return true;
    };

    this.nextTurn = function() {
        this.turn++;
        this.selectedPins = [];
    };

    this.nextRoll = function() {
        this.selectedPins = [];
        this.roll++;
        if (this.roll > 1) {
            this.nextFrame();
            return;
        }

        for (let i=0; i<this.hand.length; i++) {
            if (this.hand[i].length > 0) {
                this.hand[i].shift();
            }
        }
    };

    this.updateFrameScore = function() {
        let p = this.player;
        let totalDownedPinCount = this.getPinsDown();
        let frameDownedPinCount = totalDownedPinCount;
        let scoreRollIndex = (this.frame-1) * 2 + this.roll;

        if (this.roll == 1) {
            frameDownedPinCount -= this.scores[p][scoreRollIndex-1];
        }
        this.scores[p][scoreRollIndex] = frameDownedPinCount;
    };

    this.getPinsDown = function() {
        let totalDownedPinCount = 0;
        for (let i=0; i<this.pins.length; i++) {
            if (this.pins[i].value < 0) {
                totalDownedPinCount++;
            }
        }
        return totalDownedPinCount;
    };

    this.getFrameScore = function(frameNum) {
        if (frameNum < 1 || frameNum > 10) {
            return false;
        }
        let result = {
            "first": "",
            "second": "",
            "third": "",
            "total": ""
        };
        let frameIndex = frameNum - 1;
        let p = this.player;
        let roll1 = this.scores[p][frameIndex*2];
        let roll2 = this.scores[p][frameIndex*2 + 1];
        let nextFrameRoll1Index = (frameIndex+1)*2;
        let nextFrameRoll2Index = (frameIndex+1)*2 + 1;
        if (this.frame > frameNum) {
            // frame in the past
            result.first = roll1;
            result.second = roll2;
            let total = result.first + result.second;
            if (total < 10) {
                result.total = total;
            }
            if (result.first == 10 && frameNum + 1 < this.frame) {
                result.total = 10 + this.scores[p][nextFrameRoll1Index] + this.scores[p][nextFrameRoll2Index]
            } else if (total == 10 && this.roll > 0) {
                result.total = 10 + this.scores[p][nextFrameRoll1Index];
            }
        } else if (this.frame == frameNum) {
            // current frame
            if (this.roll == 1) {
                result.first = roll1;
            }
        }

        return result;
    };

};

let util = new TextUtil();
let gameData = new GameData();
var debugText = "";

const SCREEN_WIDTH = 56;
const SCREEN_HEIGHT = 20;
const PIN_ORIGIN_X = 24;
const PIN_ORIGIN_Y = 3;


function getName() {
    return "Entryway BBS";
}

function onConnect() {
    util.setBlinkSpeed(1);
    gameData.init();
}

function onUpdate() {
    clearScreen();
    util.updateBlink();
    drawHand();
    drawPinCards();
    drawScore();
    //drawLogin();
    util.draw("Press ~FSPACE~9 to end roll", 9,
        SCREEN_WIDTH/2 - 11, SCREEN_HEIGHT-2);
    //debugText = gameData.getSelectedPinSum();
    drawText(debugText, 3, 0, SCREEN_HEIGHT-1);
}

function onInput(key) {
    gameData.processInput(key);
}

function drawLogin() {
    let logo = "               ██████████ ██  ██  █████\n" +
               "                   ██    ██  ██  ██\n" + 
               "                  ██    ██████  █████\n" +
               "                 ██    ██  ██  ██\n" +
               "                ██    ██  ██  ██████\n" + 
               "\n" +
               "~F ▄█████ ▄███  ▄██▄ ▄██▄  ██  ██ ██   ██  ███  ██    ██\n" +
               " ██     ██ ██  ██  ██ ██  ████  ██   ██ ██ ██  ██  ██\n" +
               " ██     ██ ██  ██  ████    ██   ██   ██ █████   ████\n" + 
               " █~B██~F█   █~B█ █~F█  █~B█~F  █~B█~F ██   ~B█~F█   ~B██ ~F█ █~B█ █~F█ ██    █~B█\n" +
               " ██     ██ ██  ▀▀  ▀▀ ▀▀   ▀▀    ▀▀ ▀▀  ██ ██    ██\n" +
               " ██     ██                                 ██    ██\n" +
               " ██████    ~H╔═════════════════════════════╗~B       ██\n" +
               "           ~H║~F      SysOp:  Arch Vile~H      ║\n" +
               "           ╚═════════════════════════════╝";

    util.draw(logo, 10, 0, 0);
}

function drawHand() {
    let sum = gameData.getSelectedPinSum();
    for (let i=0; i<gameData.hand.length; i++) {
        let isAvailable = (gameData.hand[i][0] == sum)
        drawHandCard(i+1,
            gameData.hand[i][0],
            gameData.hand[i].length,
            isAvailable);
    }
}

function drawPinCards() {
    for (let i=0; i<this.gameData.pins.length; i++) {
        let pin = gameData.pins[i];
        drawPinCard(i+1, pin.label, pin.value, gameData.isPinSelected(i), pin.available);
    }
}

function drawScore() {
    let row = 3;
    let col = 1;
    let initials = "P1";
    let frameLeft;
    let frameRight;
    let box1 = " ";
    let box2 = " ";
    let box3 = " ";
    let box4 = " ";
    let frameScore1 = "   ";
    let frameScore2 = "   ";
    let frameData = gameData.getFrameScore(gameData.frame);
    let prevFrameData = gameData.getFrameScore(gameData.frame-1);
    let frameSymbols = getFrameSymbols(frameData);
    let prevFrameSymbols = getFrameSymbols(prevFrameData);

    
    if (gameData.frame == 1) {
        frameLeft = "~H1~F";
        frameRight = "~52~F";
        box1 = padString(frameSymbols.first, 1);
        box2 = padString(frameSymbols.second, 1);
    } else {
        frameLeft = "~5" + (gameData.frame - 1) + "~F";
        frameRight = "~H" + gameData.frame + "~F";
        box1 = padString(prevFrameSymbols.first, 1);
        box2 = padString(prevFrameSymbols.second, 1);
        box3 = padString(frameSymbols.first, 1);
        box4 = padString(frameSymbols.second, 1);
        frameScore1 = padString(prevFrameData.total, 3);
        frameScore2 = padString(frameData.total, 3);
    }
    let frameSegment = "   ╔═══╦═══╗\n" +
                       "   ║ " + frameLeft + " ║ " + frameRight + " ║\n" +
                       "╔══╬═╦═╬═╦═╣\n" +
                       "║" + initials + "║" + box1 + "║" + box2 + "║" + box3 + "║" + box4 + "║\n" +
                       "║  ║" + frameScore1 + "║" + frameScore2 + "║\n" +
                       "╚══╩═══╩═══╝";
    util.draw(frameSegment, 15, col, row);
}

function getFrameSymbols(frameData) {
    let result = {
        "first": frameData.first,
        "second": frameData.second,
        "third": frameData.third
    }
    if (frameData.first == 10) {
        result.first = 'X';
        return result;
    } else if (frameData.first + frameData.second == 10) {
        result.second = '/';
    }
    if (frameData.first === 0) {
        result.first = '-';
    }
    if (frameData.second === 0) {
        result.second = '-';
    }
    if (frameData.third === 0) {
        result.third = '-';
    }
    return result;
}


/**
 * Pin position numbers
 *     7 8 9 10
 *      4 5 6
 *       2 3
 *        1
 * @param {*} pos 
 * @param {*} label 
 * @param {*} value 
 * @param {*} selected 
 * @param {*} available 
 * @returns 
 */
function drawPinCard(pos, label, value, selected, available) {
    // Cards with values less than 0 have been removed from play, so we don't draw them.
    if (value < 0) {
        return;
    }
    let cardWidth = 5;
    let cardHeight= 3;
    let cardPadding = 3;
    let cardPos = [
        { "x": 12, "y": 3 * cardHeight },
        { "x": 8, "y": 2 * cardHeight },
        { "x": 8 + cardWidth + cardPadding, "y": 2 * cardHeight },
        { "x": 4, "y": 1 * cardHeight },
        { "x": 4 + cardWidth + cardPadding, "y": 1 * cardHeight },
        { "x": 4 + cardWidth*2 + cardPadding*2, "y": 1 * cardHeight },
        { "x": 0, "y": 0 },
        { "x": cardWidth + cardPadding, "y": 0 },
        { "x": cardWidth*2 + cardPadding*2, "y": 0 },
        { "x": cardWidth*3 + cardPadding*3, "y": 0 },
    ];

    let thisCardPos = cardPos[pos-1];
    let boxColor = selected ? 16 : 5
    let labelColor = available ? 17 : 5
    drawBox(boxColor, PIN_ORIGIN_X + thisCardPos.x, PIN_ORIGIN_Y + thisCardPos.y,
        cardWidth, cardHeight);
    drawText(value, 16, PIN_ORIGIN_X + thisCardPos.x + 2, PIN_ORIGIN_Y + thisCardPos.y+1);
    drawText(label, labelColor, PIN_ORIGIN_X + thisCardPos.x + 2, PIN_ORIGIN_Y + thisCardPos.y);
}

function drawHandCard(pos, value, stackSize, available) {
    if (pos < 1 || pos > 3 || stackSize < 1 || stackSize > 5) {
        return;
    }
    let cardData = [
        {
            "label": "X",
            "x": 0
        },
        {
            "label": "Y",
            "x": 8
        },
        {
            "label": "Z",
            "x": 16
        }
    ];
    if (available) {
        value = "_" + value + "_";
    }
    let row = 12;
    let col = 3;
    let card = cardData[pos-1];
    let cardFace = "~F╔═~H" + card.label + "~F═╗\n" +
                   "║ " + value + " ║";
    let cardMiddle = "╠═══╣";
    let cardBottom = "╚═══╝";
    let color=15

    util.draw(cardFace, color, card.x + col, row);
    for (let i=0; i<stackSize-1; i++) {
        drawText(cardMiddle, color, card.x + col, row + i + 2);
    }
    drawText(cardBottom, color, card.x + col, row + stackSize + 1);
}

function padString(value, padding) {
    let padAmt = padding - value.toString().length;
    let result = value.toString();
    for (let i=0; i<padAmt; i++) {
        result = ' ' + result;
    }
    return result;
}