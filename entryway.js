/**
 * Bowling Solitaire for "Last Call BBS"
 * 
 * By Kenneth Shook
 */

/**
 * Utility class for handling common drawing tasks
 */
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
    this.scores = [[],[]];
    this.selectedPins = [];
    this.player = 0;
    this.turn = 0;
    this.roll = 0;
    this.frame = 0;
    this.prevPinsDown = false;
    this.frameScores = [];
    this.gameOver = false;
    
    this.init = function() {
        this.deck = [];
        this.pins = [];
        this.hand = [];
        this.scores = [[],[]];
        this.selectedPins = [];
        this.player = 0;
        this.turn = 0;
        this.roll = 0;
        this.frame = 0;
        this.prevPinsDown = false;
        this.frameScores = [];
        this.gameOver = false;
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
        this.prevPinsDown = false;
        this.shuffleDeck();
        this.drawCards();
    };

    this.shuffleDeck = function() {
        for (let i=0; i<TOTAL_CARDS; i++) {
            //this.deck.push(0);
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
        this.deck.push(playedCard); // Add to deck for keeping track of trash

        for (let i=0; i<this.selectedPins.length; i++) {
            this.deck.push(this.pins[this.selectedPins[i]].value); // Add to deck for keeping track of trash
            this.pins[this.selectedPins[i]].value = -1;
        }
        this.nextTurn();
        if (this.getPinsDown() == TOTAL_PINS) {
            this.updateFrameScore();
            if (this.frame == 10) {
                this.handleLastFrameStrikesAndSpares();
            } else {
                this.nextFrame();
            }
        }
        return true;
    };

    this.handleLastFrameStrikesAndSpares = function() {
        if (this.roll == 0) {
            this.nextFrame();
            this.roll = 1;
            this.frame = 10;
        } else if (this.roll == 1) {
            this.nextFrame();
            this.roll = 2;
            this.frame = 10;
        } else {
            this.endGame();
        }
    }

    this.nextTurn = function() {
        this.turn++;
        this.selectedPins = [];
    };

    this.nextRoll = function() {
        this.selectedPins = [];
        this.roll++;
        if (this.roll > 1 && this.frame < 10) {
            this.nextFrame();
            return;
        } else if (this.roll > 1 && this.frame == 10 
                && this.frameScores[9].rolls[0] + this.frameScores[9].rolls[1] < 10) {
            this.endGame();
        } else if (this.roll > 2) {
            this.endGame();
            return;
        }

        for (let i=0; i<this.hand.length; i++) {
            if (this.hand[i].length > 0) {
                this.hand[i].shift();
            }
        }
    };

    this.endGame = function() {
        this.gameOver = true;
    };

    this.getFrame = function(scores) {
        return this.getCurrentFrame(scores, 0, 1, 0);
    };

    this.getCurrentFrame = function(scores, i, frame, roll) {
        if (i == scores.length) {
            return {"frame": frame, "roll": roll};
        }
        if (scores[i] == 10 && roll === 0 && frame < 10)
            return this.getCurrentFrame(scores, i+1, frame+1, 0);
        if (roll == 1 && frame < 10)
            return this.getCurrentFrame(scores, i+1, frame+1, 0);
        return this.getCurrentFrame(scores, i+1, frame, roll+1);
    };

    this.updateRoll = function(scores, value) {
        let frameData = this.getCurrentFrame(scores, 0, 1, 0);
        scores.push(value);
        if (frameData.frame < 10) {
            if (frameData.roll == 1 || value == 10) {
                return true;
            }
        }
        return false;
    };

    this.getFrameScores = function(scores) {
        let frame = 0;
        let roll = 0;
        let frameScores = [];
        for (let i=0; i<scores.length; i++) {
            frameScores[frame] = {
                'rolls': [],
                'total': false
            };
            if (frame == 9) {
                let r1 = i+1 < scores.length ? scores[i+1] : false;
                let r2 = i+2 < scores.length ? scores[i+2] : false;
                if (r1 !== false && r2 !== false) {
                    frameScores[frame] = {
                        'rolls': [scores[i], r1, r2],
                        'total': scores[i] + r1 + r2
                    };
                } else if (r1 !== false) {
                    frameScores[frame] = {
                        'rolls': [scores[i], r1],
                        'total': scores[i] + r1
                    };
                } else {
                    frameScores[frame] = {
                        'rolls': [scores[i]],
                        'total': false
                    };
                }
                return frameScores;
            }
            if (scores[i] == 10 && roll === 0 && frame < 9) {
                let r1 = i+1 < scores.length ? scores[i+1] : false;
                let r2 = i+2 < scores.length ? scores[i+2] : false;
                if (r1 !== false && r2 !== false) {
                    frameScores[frame] = {
                        'rolls': [10],
                        'total': 10 + r1 + r2
                    };
                } else {
                    frameScores[frame] = {
                        'rolls': [10],
                        'total': false
                    };
                }
                frame++;
                roll = 0;
            } else if (roll == 1 && frame < 9) {
                if (scores[i] + scores[i-1] == 10) {
                    // Spare
                    let r1 = i+1 < scores.length ? scores[i+1] : false;
                    if (r1 !== false) {
                        frameScores[frame] = {
                            'rolls': [scores[i-1], scores[i]],
                            'total': 10 + r1
                        };
                    } else {
                        // Spare with unknown follow-up roll
                        frameScores[frame] = {
                            'rolls': [scores[i-1], scores[i]],
                            'total': false
                        };
                    }
                } else {
                    frameScores[frame] = {
                        'rolls': [scores[i-1], scores[i]],
                        'total': scores[i] + scores[i-1]
                    };
                }
                frame++;
                roll = 0;
            } else {
                frameScores[frame].rolls.push(scores[i]);
                roll++;
            }
        }
        return frameScores;
    };

    this.updateFrameScore = function() {
        let p = this.player;
        let totalDownedPinCount = this.getPinsDown();
        
        if (this.prevPinsDown === false) {
            if (totalDownedPinCount < 10)
                this.prevPinsDown = totalDownedPinCount;
            this.updateRoll(this.scores[p], totalDownedPinCount);
        } else {
            this.updateRoll(this.scores[p], totalDownedPinCount - this.prevPinsDown);
            this.prevPinsDown = false;
        }
        this.frameScores = this.getFrameScores(this.scores[p])
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

    this.getTotalScore = function(player, frameNum) {
        let frameScores = this.getFrameScores(this.scores[player], []);
        let isGameTotal = false;
        if (!frameNum) {
            frameNum = 10;
            isGameTotal = true;
        } else if (frameNum-1 >= frameScores.length) {
            // Attemping to get a score for a frame that is not completed yet
            return false;
        }
        let runningTotal = 0;
        for (let i=1; i<=frameNum && i-1 < frameScores.length; i++) {
            let fs = frameScores[i-1];
            if (fs !== false && fs.total !== false) {
                runningTotal += fs.total;
            } else {
                if (isGameTotal == false)
                    return false;
            }
        }
        return runningTotal;
    };

    this.getFrameScore = function(player, frameNum) {
        if (frameNum < 1 || frameNum > 10) {
            return false;
        }
        let result = {
            "first": '',
            "second": '',
            "third": '',
            "total": false
        };
        this.frameScores = this.getFrameScores(this.scores[player]);
        if (frameNum-1 < this.frameScores.length) {
            let fs = this.frameScores[frameNum-1];
            if (fs === false) {
                return result;
            }
            if (fs.rolls.length > 0)
                result.first = fs.rolls[0];
            if (fs.rolls.length > 1)
                result.second = fs.rolls[1];
            if (fs.rolls.length > 2)
                result.third = fs.rolls[2];
            result.total = this.getTotalScore(player, frameNum);
        }
        return result;
    };

};

const SCREEN_WIDTH = 56;
const SCREEN_HEIGHT = 20;
const PIN_ORIGIN_X = 25;
const PIN_ORIGIN_Y = 3;
const STATE_LOGIN = 0;
const STATE_DOORS = 1;
const STATE_SETTINGS = 2;
const STATE_GAME = 3;
const STATE_GAMEOVER = 4;
const STATE_NOTES = 5;
const STATE_NOTE_LIST = 6;
const STATE_INSTRUCTIONS = 7;

let util = new TextUtil();
let gameData = new GameData();
let state = STATE_LOGIN;
let options = {"showHints": false, "visibleTrash": false, "players": 1, "storyPhase": 0};
let selectedNote = 0;

function getName() {
    return "Entryway BBS";
}

function onConnect() {
    loadOptions();
    util.setBlinkSpeed(1);
    gameData.init();
    state = STATE_LOGIN;
}

function onUpdate() {
    clearScreen();
    util.updateBlink();
    switch (state) {
        case STATE_LOGIN:
            drawLogin();
            break;
        case STATE_DOORS:
            drawDoorsMenu();
            break;
        case STATE_SETTINGS:
            drawSettingsMenu();
            break;
        case STATE_GAME:
            drawHand();
            drawPinCards();
            drawScore();
            drawTrash();
            util.draw("Press <~HSPACE~9> to end roll", 9,
                SCREEN_WIDTH/2 - 11, SCREEN_HEIGHT-2);
            break;
        case STATE_GAMEOVER:
            drawFinalScores();
            break;
        case STATE_NOTES:
            if (selectedNote) {
                drawNote(selectedNote);
            } else {
                drawNote();
            }
            break;
        case STATE_NOTE_LIST:
            drawNoteMenu();
            break;
        case STATE_INSTRUCTIONS:
            drawInstructions();
            break;
    }
}

function onInput(key) {
    let keyCode = String.fromCharCode(key).toUpperCase();
    switch (state) {
        case STATE_LOGIN:
            state = STATE_DOORS;
            break;
        case STATE_DOORS:
            if (key == "1".charCodeAt(0)) {
                state = STATE_SETTINGS;
            }
            if (key == "2".charCodeAt(0) && options.storyPhase > 0) {
                state = STATE_NOTE_LIST;
            }
            break;
        case STATE_SETTINGS:
            processSettingInput(key);
            break;
        case STATE_GAME:
            if (key == 27) {// Esc
                state = STATE_SETTINGS;
                return;
            }
            gameData.processInput(key);
            if (gameData.gameOver == true) {
                state = STATE_GAMEOVER;
            }
            break;
        case STATE_GAMEOVER:
            advanceStory();
            break;
        case STATE_NOTES:
            state = STATE_NOTE_LIST;
            break;
        case STATE_NOTE_LIST:
            if (keyCode == "1") {
                showNote(1);
            }
            if (keyCode == "2") {
                showNote(2);
            }
            if (keyCode == "3") {
                showNote(3);
            }
            if (keyCode == "Q") {
                selectedNote = 0;
                state = STATE_DOORS;
            }
            break;
        case STATE_INSTRUCTIONS:
            state = STATE_SETTINGS;
            break;
    }
}

function processSettingInput(key) {
    keyChar = String.fromCharCode(key).toUpperCase();
    if (keyChar == "S") { // Start game
        gameData.init();
        state = STATE_GAME;
    } else if (keyChar == "H") { // Hint toggle
        options.showHints = !options.showHints;
        saveOptions();
    } else if (keyChar == "V") { // Visible trash toggle
        options.visibleTrash = !options.visibleTrash;
        saveOptions();
    } else if (keyChar == "P") { // Player count toggle (not implemented)
    } else if (keyChar == "I") {
        state = STATE_INSTRUCTIONS;
    } else if (keyChar == "Q") {
        state = STATE_DOORS;
    } else if (keyChar == '!') { // Delete save data
        deleteOptions();
    }
}

function drawLogin() {
    let logo = "               ▟████████▛ ▟▛  ▟▛  ▟███▛\n" +
               "                   ▟▛    ▟▛  ▟▛  ▟▛\n" + 
               "                  ▟▛    ▟████▛  ▟███▛\n" +
               "                 ▟▛    ▟▛  ▟▛  ▟▛\n" +
               "                ▟▛    ▟▛  ▟▛  ▟████▛\n" + 
               "\n" +
               "~F ▄█████ ▄███  ▄██▄ ▄██▄  ██  ██ ██   ██  ███  ██    ██\n" +
               " ██     ██ ██  ██  ██ ██  ████  ██   ██ ██ ██  ██  ██\n" +
               " ██     ██ ██  ██  ████    ██   ██   ██ █████   ████\n" + 
               " █~B██~F█   █~B█ █~F█  █~B█~F  █~B█~F ██   ~B█~F█   ~B██ ~F█ █~B█ █~F█ ██    █~B█\n" +
               " ██     ██ ██  ▀▀  ▀▀ ▀▀   ▀▀    ▀▀ ▀▀  ██ ██    ██\n" +
               " ██     ██                                 ██    ██\n" +
               " ██████    ~H╔═════════════════════════════╗~B       ██\n" +
               "           ~H║~F      SysOp:  Arch Vile~H      ║\n" +
               "           ~H║~9       Winter Park, FL~H       ║\n" +
               "           ╚═════════════════════════════╝";

    util.draw(logo, 8, 0, 1);
    util.draw("Press any key to log in...", 16, 1, SCREEN_HEIGHT-2);
}

function drawDoorsMenu() {
    let menu;
    let opts;
    let memoLine;
    if (options.storyPhase < 1) {
        memoLine = "║<2> ...Coming soon...~6  ║ ~C~6                           ║\n";
        opts = '1';
    } else {
        memoLine = "║~A<~H2~A>~C ~HMemo Pad~6           ║ ~CMessages from the SysOp~6    ║\n";
        opts = '1,2'
    }
    menu = "~6╔════════════════════════════════════════════════════╗\n" +
             "║                 ~GD O O R   G A M E S~6                ║\n" +
             "╠═══════════════════════╦════════════════════════════╣\n" +
             "║~A<~H1~A>~C ~HBowling Solitaire~6  ║ ~CA game of solitaire played~6 ║\n" +
             "║                       ║ ~Cwith the rules of bowling.~6 ║\n" +
             "║                       ║                            ║\n" +
             memoLine +
             "║                       ║                            ║\n" +
             "╚═══════════════════════╩════════════════════════════╝";
    util.draw(menu, 6, 1, 5);
    util.draw("Choose (" + opts + "):_█_", 15, 1, SCREEN_HEIGHT-2);
}

function drawSettingsMenu() {
    let title = "B O W L I N G\n     S O L I T A I R E";
    let menu = "~7(~HS~7)~Ftart Game\n" +
               "~7(~HH~7)~Fints: " + (options.showHints ? "~HON~F" : "~8OFF~F") + "\n" +
               "~7(~HV~7)~Fisible Discards: " + (options.visibleTrash ? "~HON~F" : "~8OFF~F") + "\n" +
               //"~7(~HP~7)~Flayers: " + options.players + "\n" +
               "~7(~HI~7)~Fnstructions\n" +
               "~7(~HQ~7)~Fuit";
    let graphic = "\n" +
"~1██████████████▛~D ,;-. ~1▟███~D\n" +
"                ;  :     \n" +
"                ;. :     \n" +
"                 ;:      \n" +
"                ;══:     \n" +
"               ;;   :    \n" +
"       ,...   .;;    .   \n" +
"~1█▛~D  .;;'   `'-;;     :  ~1▟~D\n" +
"  .;;:         '.     : \n" +
" .;;:' ()        .    ' \n" +
" ;;:'            :    : \n" +
" ;;: ()  ()      :    : \n" +
" ;;::.           :════'  \n" +
" ';;::.          '   :   \n" +
"  ';;::.       .'---'    \n" +
"    '-;;:..,.-'          \n" +
"        '''              ";

    fillArea('█', 1, 0, 1, SCREEN_WIDTH, 1);
    fillArea('█', 1, 0, 8, SCREEN_WIDTH, 1);
    util.draw(title, 17, 2, 4);
    util.draw(graphic, 13, SCREEN_WIDTH-26, 0);
    util.draw(menu, 15, 1, 10);
    util.draw("Choose (S,H,V,I,Q):_█_", 15, 1, SCREEN_HEIGHT-2);
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
    drawText('H A N D', 12, 9, 11);
}

function drawPinCards() {
    drawText('P I N S', 12, PIN_ORIGIN_X + 11, PIN_ORIGIN_Y-1);
    for (let i=0; i<gameData.pins.length; i++) {
        let pin = gameData.pins[i];
        drawPinCard(i+1, pin.label, pin.value, gameData.isPinSelected(i), pin.available);
    }
}

function drawScore() {
    let row = 2;
    let col = 2;
    let startFrame = gameData.frame < 4 ? 0 : gameData.frame - 3;
    let endFrame = gameData.frame < 4 ? 2 : gameData.frame - 1;
    drawFrameScores(startFrame, endFrame, col, row);
}

function drawFrameScores(minFrame, maxFrame, x, y) {
    let player = 0;
    let frameLeft = "   ╔\n" +
                    "   ║\n" +
                    "╔══╬\n" +
                    "║P1║\n" +
                    "║  ║\n" +
                    "╚══╩";
    let frameCenter = "═══╦\n" +
                      "   ║\n" +
                      "═╦═╬\n" +
                      " ║ ║\n" +
                      "   ║\n" +
                      "═══╩";
    let frameRight = "╗\n" +
                     "║\n" +
                     "╬═══╗\n" +
                     "║   ║\n" +
                     "║   ║\n" +
                     "╩═══╝";
    let frameWidth = (maxFrame - minFrame + 1) * 4;
    util.draw(frameLeft, 15, x, y);
    
    for (let i=0; i<maxFrame - minFrame + 1; i++) {
        let frameNum = (minFrame + i + 1).toString();
        let frameData = gameData.getFrameScore(player, i + minFrame + 1);
        let frameSymbols = getFrameSymbols(frameData, frameNum);
        let frameTotal = frameData.total !== false ? gameData.getTotalScore(player, i + minFrame + 1) : '';
        let isEndOfGame = gameData.gameOver;
        // Frame border
        util.draw(frameCenter, 15, x + (4*(i+1)), y);
        if (frameNum == 10) {
            // Extend the 10th frame
            util.draw(frameCenter, 15, x + (4*(i+1)) + 2, y);
        }
        // Frame number
        util.draw(frameNum, frameNum == gameData.frame || isEndOfGame ? 17 : 5, x + (4*(i+1)+1), y+1);
        // Scores
        util.draw(frameSymbols.first.toString(), 15, x + (4*(i+1)), y+3);
        util.draw(frameSymbols.second.toString(), 15, x + (4*(i+1)+2), y+3);
        if (frameNum == 10) {
            util.draw(frameSymbols.third.toString(), 15, x + (4*(i+1)+4), y+3);
            util.draw(padString(frameTotal,5), 15, x + (4*(i+1)), y+4);
        } else {
            util.draw(padString(frameTotal,3), 15, x + (4*(i+1)), y+4);
        }
    }

    let runningTotal = gameData.getTotalScore(player);
    if (maxFrame == 9) {
        util.draw(frameRight, 15, x + frameWidth + 4 - 1 + 2, y);
        util.draw(padString(runningTotal !== false ? runningTotal : '0', 3), 15, x + frameWidth + 4 + 2, y+4);
    } else {
        util.draw(frameRight, 15, x + frameWidth + 4 - 1, y);
        util.draw(padString(runningTotal !== false ? runningTotal : '0', 3), 15, x + frameWidth + 4, y+4);
    }
}

function getFrameSymbols(frameData, frameNum) {
    let result = {
        "first": frameData.first,
        "second": frameData.second,
        "third": frameData.third
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
    if (frameNum == 10) {
        if (frameData.first == 10) {
            result.first = 'X';
            if (frameData.second == 10) {
                result.second = 'X';
                if (frameData.third == 10) {
                    result.third = 'X';
                }
            } else if (frameData.second + frameData.third == 10) {
                result.third = '/';
            }
        } else if (frameData.first + frameData.second == 10) {
            result.second = '/';
            if (frameData.third == 10) {
                result.third = 'X';
            }
        }
        return result;
    }
    if (frameData.first == 10) {
        result.first = '';
        result.second = 'X';
        return result;
    } else if (frameData.first + frameData.second == 10) {
        result.second = '/';
    }
    return result;
}

function showNote(num) {
    if (options.storyPhase >= num) {
        selectedNote = num;
        state = STATE_NOTES;
    }
}

function drawNote(num) {
    let noteIndex = num > 0 ? num-1 : options.storyPhase-1;
    let note = getNote(noteIndex);
    if (options.storyPhase < 4 && note !== false) {
        util.draw('~F<~H' + note.heading + '~F>', 15, 1, 1);
        drawTextWrapped(note.text, 13, 1, 3, SCREEN_WIDTH-2);
    }
    util.draw('Press any key to continue...', 9,
                SCREEN_WIDTH/2 - 14, SCREEN_HEIGHT-2);
}

function drawNoteMenu() {
    let maxNotes = options.storyPhase;
    let menu = '';
    let opts ='';
    for (let i=0; i<3; i++) {
        if (i < maxNotes) {
            let note = getNote(i);
            menu += '~F(~H' + (i+1) + '~F) ' + note.heading + "\n";
            opts += (i+1) + ',';
        } else {
            menu += '~6(' + (i+1) + ") ---\n";
        }
        menu += '~9══════════════════════════════\n';
    }
    opts += 'Q';
    menu += '~F(~HQ~F)~D Return to Doors Menu';
    util.draw('M E M O   P A D', 16, 2, 1);
    util.draw(menu, 15, 1, 3);
    util.draw("Choose (" + opts + "):_█_", 15, 1, SCREEN_HEIGHT-2);
}

function getNote(num) {
    let notes = [
        {
            'heading': 'The Entryway BBS',
            'text': 'I started The Entryway BBS the summer before my sophomore year of high ' +
                'school. I thought it would be a fun project. Plus, it could be a way to distribute the ' +
                "games and mods I made (it wasn't. I was notorious for never finishing them). " + 
                'My favorite BBS feature was the door games, though. ' +
                'Somewhere, I discovered a game called "Bowling Solitaire" that was an ' +
                'interesting diversion from the usual role-playing and space trading, so I ' +
                'installed it on The Entryway.'
        },
        {
            'heading': 'A Modest Success',
            'text': '"Bowling Solitaire" never gained a lot of popularity compared to the other door ' +
                'games, but it had a few dedicated players and I was always happy to see it ' +
                'running. ' +
                'As for the BBS itself, it did not take long for The ' +
                'Entryway to gain a few hundred users. Much to my surprise, several people even ' +
                'sent money to cover the costs of registering my shareware BBS software and ' +
                'door games! It told me that there were people that enjoyed what I had created ' +
                'and I found that immensely satisfying. I began to recognize the names of some of the ' +
                'regulars and had conversations with a lot of them. There were even a few that ' +
                'I got to know pretty well who eventually became friends outside of the BBS.'
        },
        {
            'heading': 'The Exit',
            'text': 'The Entryway remained active for just under four years. The waning days ' +
                'of the BBS era saw a migration of people from local BBSs to the Internet (including myself). ' +
                'But, even after I shut down the system, I remained friends with a handful of those regular users. ' +
                'And through those friends, I met others, and then others still, expanding into a great web of friends ' +
                'and acquaintances. These social connections, which would go on to influence my interests, my ' +
                'relationships, and even my career, all stem from this common root. Had that 15 year old kid not decided ' +
                'to tinker with BBS software as a little summer project, I cannot even imagine what direction my life might ' +
                'have taken or the person I would be today.'
        }
    ];

    if (num < 0 || num >= notes.length) {
        return false;
    }
    return notes[num];
}

function advanceStory() {
    let phase1ScoreTrigger = 50;
    let phase2ScoreTrigger = 100;
    if (options.storyPhase == 0) {
        options.storyPhase = 1;
        saveOptions();
        state = STATE_NOTES;
    } else if (options.storyPhase == 1 && gameData.getTotalScore(0) >= phase1ScoreTrigger) {
        options.storyPhase = 2;
        saveOptions();
        state = STATE_NOTES;
    } else if (options.storyPhase == 2 && gameData.getTotalScore(0) >= phase2ScoreTrigger) {
        options.storyPhase = 3;
        saveOptions();
        state = STATE_NOTES;
    } else {
        state = STATE_SETTINGS;
    }
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
        {"label": "X", "x": 0},
        {"label": "Y", "x": 8},
        {"label": "Z", "x": 16}
    ];
    if (available && options.showHints) {
        value = "_" + value + "_";
    }
    let row = 12;
    let col = 2;
    let card = cardData[pos-1];
    let cardFace = "~C╔═~H" + card.label + "~C═╗\n" +
                   "║ " + value + " ║";
    let cardMiddle = "╠═══╣";
    let cardBottom = "╚═══╝";
    let color=14

    util.draw(cardFace, 12, card.x + col, row);
    drawText(cardBottom, 12, card.x + col, row + 2);
    for (let i=1; i<stackSize-1; i++) {
        drawText(cardMiddle, 6, card.x + col, row + i + 2);
    }
    drawText(cardBottom, 6, card.x + col, row + stackSize + 1);
}

function drawTrash() {
    if (options.visibleTrash) {
        drawText("Discarded [" + gameData.deck.toString() + "]", 8, 0, SCREEN_HEIGHT-1);
    }
}

function drawFinalScores() {
    util.draw('F I N A L   S C O R E S', 16, SCREEN_WIDTH/2 - 12, 2);
    drawFrameScores(0, 9, 3, 4);
    util.draw('Press any key to continue...', 9,
                SCREEN_WIDTH/2 - 14, SCREEN_HEIGHT-2);
}

function drawInstructions() {
    let instructions = "~G1.~C Choose up to 3 adjacent pins. Pins available for\n" +
                       "   selection will have their key ~Hhighlighted~C.\n" +
                       "   (press the key of a selected pin to deselect all)\n\n" +
                       "~G2.~C If the last digit of the sum of the selected pins\n" +
                       "   matches a card in your hand, you may play that\n" +
                       "   card to remove those pins.\n\n" +
                       "~G3.~C If no hand card match any available pin sums, \n" +
                       "   press ~HSPACE~C to end your roll. If this is the\n" +
                       "   first roll of the frame, your visible hand cards\n" +
                       "   will be discarded and you will be given the chance\n" +
                       "   to pick up a spare.";
    util.draw('~F<~HBowling Solitaire Instructions~F>', 15, 1, 1);
    util.draw(instructions, 13, 1, 3);

    util.draw('Press any key to continue...', 9,
                SCREEN_WIDTH/2 - 14, SCREEN_HEIGHT-2);
}

function loadOptions() {
    let data = loadData();
    if (data != false) {
        options = JSON.parse(data);
    }
}

function saveOptions() {
    saveData(JSON.stringify(options));
}

function deleteOptions() {
    saveData('');
}

function padString(value, padding) {
    let padAmt = padding - value.toString().length;
    let result = value.toString();
    for (let i=0; i<padAmt; i++) {
        result = ' ' + result;
    }
    return result;
}