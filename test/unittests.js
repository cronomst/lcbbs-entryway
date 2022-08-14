var UnitTests = function() {
    
    this.output = "";
    this.run = function() {
        this.testUpdateFrameScore();

        this.displayOutput();
    };

    this.out = function(text) {
        this.output += text;
    };

    this.assertEquals = function(expected, actual, message = "") {
        let passed = (expected === actual);
        if (passed) {
            this.out('<div class="assert pass">' + message + ' Expected:[' + expected + ']===Actual:[' + actual + ']<div>');
        } else {
            this.out('<div class="assert fail">' + message + ' Expected:[' + expected + ']===Actual:[' + actual + ']<div>');
        }
    };

    this.assertUndefined = function(actual, message = "") {
        let passed = (typeof actual === 'undefined');
        if (passed) {
            this.out('<div class="assert pass">' + message + ' Expected:[undefined]===Actual:[' + actual + ']<div>');
        } else {
            this.out('<div class="assert fail">' + message + ' Expected:[undefined]===Actual:[' + actual + ']<div>');
        }
    }

    this.displayOutput = function() {
        document.getElementById("output").innerHTML = this.output;
    };

    this.testUpdateFrameScore = function() {
        this.out('<h3>testUpdateFrameScore</h3>');
        let game = new GameData();
        game.init();
        game.pins[0].value = -1;
        game.pins[1].value = -1;

        game.updateFrameScore();
        this.assertEquals(2, game.scores[0][0], "2 pins first roll of first frame");
        game.nextRoll();
        game.pins[2].value = -1;
        game.updateFrameScore();
        this.assertEquals(1, game.scores[0][1], "1 pin second roll of first frame");
        this.assertEquals(3, game.scores[0][2], "3 total pins for the first frame");

        game.nextRoll();
        this.knockDownPins(game, 4);
        game.updateFrameScore();
        this.assertEquals(4, game.scores[0][3], "4 pins first roll of second frame");
        game.nextRoll();
        game.updateFrameScore();
        this.assertEquals(0, game.scores[0][4], "0 pins second roll of second frame");
        this.assertEquals(4, game.scores[0][5], "4 total pins for the second frame");

        game.nextRoll();
        this.knockDownPins(game, 9);
        game.updateFrameScore();
        this.assertEquals(9, game.scores[0][6], "9 pins first roll of third frame");
        game.nextRoll();
        game.pins[9].value = -1;
        game.updateFrameScore();
        this.assertEquals(1, game.scores[0][7], "1 pin second roll of third frame");
        this.assertEquals(-1, game.scores[0][8], "Spare, so no total score for third frame");

        game.nextRoll();
        this.knockDownPins(game, 10);
        game.updateFrameScore();
        this.assertEquals(10, game.scores[0][9], "Strike on fourth frame");

    };

    this.knockDownPins = function(game, count) {
        for (let i=0; i<count; i++) {
            game.pins[i].value = -1;
        }
    };
};

function runUnitTests() {
    let unitTests = new UnitTests();
    unitTests.run();
}