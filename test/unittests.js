var UnitTests = function() {
    
    this.output = "";
    this.run = function() {
        this.testUpdateFrameScore();
        this.testGetFrameScore();
        this.testPadString();
        this.testGetFrameSymbols();
        this.testGetTotalScore();

        this.displayOutput();
    };

    this.out = function(text) {
        this.output += text;
    };

    this.assertEquals = function(expected, actual, message = "") {
        let passed = (expected === actual);
        if (passed) {
            this.out('<div class="assert pass">' + message + ' - Expected:[' + expected + ']===Actual:[' + actual + ']</div>');
        } else {
            this.out('<div class="assert fail">' + message + ' - Expected:[' + expected + ']===Actual:[' + actual + ']</div>');
        }
    };

    this.assertUndefined = function(actual, message = "") {
        let passed = (typeof actual === 'undefined');
        if (passed) {
            this.out('<div class="assert pass">' + message + ' - Expected:[undefined]===Actual:[' + actual + ']</div>');
        } else {
            this.out('<div class="assert fail">' + message + ' - Expected:[undefined]===Actual:[' + actual + ']</div>');
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

        game.nextRoll();
        this.knockDownPins(game, 4);
        game.updateFrameScore();
        this.assertEquals(4, game.scores[0][2], "4 pins first roll of second frame");
        game.nextRoll();
        game.updateFrameScore();
        this.assertEquals(0, game.scores[0][3], "0 pins second roll of second frame");

        game.nextRoll();
        this.knockDownPins(game, 9);
        game.updateFrameScore();
        this.assertEquals(9, game.scores[0][4], "9 pins first roll of third frame");
        game.nextRoll();
        game.pins[9].value = -1;
        game.updateFrameScore();
        this.assertEquals(1, game.scores[0][5], "1 pin second roll of third frame");

        game.nextRoll();
        this.knockDownPins(game, 10);
        game.updateFrameScore();
        this.assertEquals(10, game.scores[0][6], "Strike on fourth frame");

    };

    this.testGetFrameScore = function() {
        this.out('<h3>testGetFrameScore</h3>');
        let game = new GameData();
        let actual;
        game.init();
        game.scores = [
            [5,4, 10,0, 9,1, 1,0, 0,0]
        ];
        actual = game.getFrameScore(1);
        this.assertEquals("", actual.first, "No scores yet on first roll of first frame");
        
        game.nextRoll();
        actual = game.getFrameScore(1);
        this.assertEquals(5, actual.first, "Score set after first roll of first frame");
        this.assertEquals("", actual.second, "No score yet on second of first frame");

        game.nextRoll();
        actual = game.getFrameScore(1);
        this.assertEquals(5, actual.first, "Score set after first roll of first frame");
        this.assertEquals(4, actual.second, "Score set after second roll of first frame");
        this.assertEquals(9, actual.total, "End of first frame, so total is set");
        actual = game.getFrameScore(2);
        this.assertEquals("", actual.first, "No scores yet on first roll of second frame");

        game.roll = 0;
        game.frame = 3;
        actual = game.getFrameScore(2);
        this.assertEquals(10, actual.first, "Strike, so first roll is 10");
        this.assertEquals(0, actual.second, "Strike, so 0 for second roll");
        this.assertEquals("", actual.total, "Get score for frame 2 strike while on beginning of frame 3, so no total yet");

        game.frame = 4;
        actual = game.getFrameScore(2);
        this.assertEquals(20, actual.total, "Get score for frame 2 strike while on beginning of frame 4, so total available");

        game.frame = 5;
        actual = game.getFrameScore(3);
        this.assertEquals("", actual.total, "Get score for frame 3 spare while on beginning of frame 4, so no total yet");
        game.roll = 1;
        actual = game.getFrameScore(3);
        this.assertEquals(11, actual.total, "Get score for frame 3 spare while on 2nd roll of of frame 4, so total available");

        game.frame = 1;
        game.roll = 0;
        actual = game.getFrameScore(0);
        this.assertEquals(false, actual, "Out of bounds frame score request should be false");

        game.init();
        game.scores = [
            [10,0, 10,0, 9,1, 9,0]
        ];
        game.frame = 5;
        game.roll = 0;
        this.assertEquals(29, game.getFrameScore(1).total, "Strike, strike, spare");
        this.assertEquals(20, game.getFrameScore(2).total, "Strike, spare");
        this.assertEquals(19, game.getFrameScore(3).total, "Spare, 9");

    };

    this.testPadString = function() {
        this.out('<h3>testPadString</h3>');
        this.assertEquals("  5", padString(5, 3), "Pad number");
        this.assertEquals(" X", padString("X", 2), "Pad string");
        this.assertEquals("abc", padString("abc", 1), "Pad too long string");
    };

    this.testGetFrameSymbols = function() {
        this.out('<h3>testGetFrameSymbols</h3>');
        let actual = getFrameSymbols({"first": 10, "second": 0, "third": 0});
        this.assertEquals('X', actual.second, "Strike is an X");
        this.assertEquals('', actual.first, "First box of strike is a blank");

        actual = getFrameSymbols({"first": 5, "second": "", "third": ""});
        this.assertEquals(5, actual.first, "5 should just be itself");
    };

    this.testGetTotalScore = function() {
        this.out('<h3>testGetTotalScore</h3>');
        let game = new GameData();
        game.init();
        game.scores = [
            [10,0, 10,0, 10,0, 10,0, 10,0, 10,0, 10,0, 10,0, 10,0, 0,0]
        ];
        game.frame = 10;
        this.assertEquals(240, game.getTotalScore(0), "9 strikes (need to fix my scoring system)");
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