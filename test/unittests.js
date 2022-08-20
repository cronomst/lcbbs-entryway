var UnitTests = function() {
    
    this.output = "";
    this.run = function() {
        this.testUpdateFrameScore();
        this.testGetFrameScore();
        this.testPadString();
        this.testGetFrameSymbols();
        this.testGetTotalScore();
        this.testDerivedFramePrototype();

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
        game.init();
        game.scores = [
            [10,0, 5,4, 10,'', 10,'', 10,'', 0,0, 10,'', '','', '','']
        ];

        this.assertEquals(19, game.getFrameScore(0, 1).total, "Frame 1 total");
        this.assertEquals(9, game.getFrameScore(0, 2).total, "Frame 2 total");
        this.assertEquals(30, game.getFrameScore(0, 3).total, "Frame 3 total");
        this.assertEquals(20, game.getFrameScore(0, 4).total, "Frame 4 total");
        this.assertEquals(10, game.getFrameScore(0, 5).total, "Frame 5 total");
        this.assertEquals(0, game.getFrameScore(0, 6).total, "Frame 6 total");
        this.assertEquals('', game.getFrameScore(0, 7).total, "Frame 7 total");

        game.scores = [
            [1,0, 10,'', 1,2, '','', '','', '','', '','', '','', '','']
        ];
        this.assertEquals(1, game.getFrameScore(0, 1).total, "Frame 1 total");
        this.assertEquals(13, game.getFrameScore(0, 2).total, "Frame 2 total");
        this.assertEquals(3, game.getFrameScore(0, 3).total, "Frame 3 total");

        game.scores = [
            [1,0, 10,'', 3,0, 10,'', 10,'', 10,'', '','', '','', '','']
        ];
        this.assertEquals(1, game.getFrameScore(0, 1).total, "Frame 1 total");
        this.assertEquals(13, game.getFrameScore(0, 2).total, "Frame 2 total");
        this.assertEquals(3, game.getFrameScore(0, 3).total, "Frame 3 total");
        this.assertEquals(30, game.getFrameScore(0, 4).total, "Frame 4 total");

        game.scores = [
            [10,'', 10,'', '','', '','', '','', '','', '','', '','', '','']
        ];
        this.assertEquals('', game.getFrameScore(0, 1).total, "Frame 1 total");
        this.assertEquals('', game.getFrameScore(0, 2).total, "Frame 2 total");
        this.assertEquals('', game.getFrameScore(0, 3).total, "Frame 3 total");

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
            [10, 10, 10, 10, 10, 10, 10, 10, 10, 0,0]
        ];
        game.frame = 10;
        this.assertEquals(240, game.getTotalScore(0), "9 strikes");
    };

    this.testDerivedFramePrototype = function() {
        this.out('<h3>testDerivedFramePrototype</h3>');
        let game = new GameData();
        game.init();
        let scores = [];
        // Methods I would need:
        // - get current frame and roll - done
        // - get frame scores (including 10th frame) - done (but should be modified to return rolls, too)
        // - update score method, but with a return value indicating if there is a frame transition - done
        this.assertEquals(1, this.getCurrentFrame(scores, 0, 1, 0).frame, "Frame");
        this.assertEquals(0, this.getCurrentFrame(scores, 0, 1, 0).roll, "Roll");
        scores = [10, 9,1, 0,0, 5,5];
        this.assertEquals(5, this.getCurrentFrame(scores, 0, 1, 0).frame, "Frame");
        this.assertEquals(0, this.getCurrentFrame(scores, 0, 1, 0).roll, "Roll");
        scores = [10, 9,1, 0,0, 5];
        this.assertEquals(4, this.getCurrentFrame(scores, 0, 1, 0).frame, "Frame");
        this.assertEquals(1, this.getCurrentFrame(scores, 0, 1, 0).roll, "Roll");
        scores = [10, 10, 10, 10, 10, 10, 10, 10, 10];
        this.assertEquals(10, this.getCurrentFrame(scores, 0, 1, 0).frame, "Frame");
        this.assertEquals(0, this.getCurrentFrame(scores, 0, 1, 0).roll, "Roll");
        scores = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10,9];
        this.assertEquals(10, this.getCurrentFrame(scores, 0, 1, 0).frame, "Frame");
        this.assertEquals(2, this.getCurrentFrame(scores, 0, 1, 0).roll, "Roll");
        scores = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10,9,1];
        this.assertEquals(10, this.getCurrentFrame(scores, 0, 1, 0).frame, "Frame");
        this.assertEquals(3, this.getCurrentFrame(scores, 0, 1, 0).roll, "Roll");

        scores = [10];
        this.assertEquals(false, this.getFrameScores(scores)[0].total, "Frame 1 score");
        scores = [10, 5];
        this.assertEquals(false, this.getFrameScores(scores)[0].total, "Frame 1 score");
        this.assertEquals(5, this.getFrameScores(scores)[1].rolls[0], "Frame 2 rolls");
        this.assertEquals(false, this.getFrameScores(scores)[1].total, "Frame 2 total");
        scores = [10, 5,2];
        this.assertEquals(17, this.getFrameScores(scores)[0].total, "Frame 1 score");
        this.assertEquals(7, this.getFrameScores(scores)[1].total, "Frame 2 score");
        scores = [0,10, 5];
        this.assertEquals(15, this.getFrameScores(scores)[0].total, "Frame 1 score");
        scores = [0,9];
        this.assertEquals(9, this.getFrameScores(scores)[0].total, "Frame 1 score");
        scores = [0,0, 5,5, 10, 10, 10, 10, 10, 10, 10];
        this.assertEquals(30, this.getFrameScores(scores)[6].total, "Frame 7 score");
        this.assertEquals(false, this.getFrameScores(scores)[7].total, "Frame 8 score");
        this.assertEquals(false, this.getFrameScores(scores)[8].total, "Frame 9 score");
        scores = [0,0, 5,5, 10, 10, 10, 10, 10, 10, 10, 5,4];
        this.assertEquals(9, this.getFrameScores(scores)[9].total, "Frame 10 score");
        scores = [0,0, 5,5, 10, 10, 10, 10, 10, 10, 10, 10,10,10];
        this.assertEquals(30, this.getFrameScores(scores)[9].total, "Frame 10 score");
        scores = [0,0, 5,5, 10, 10, 10, 10, 10, 10, 10, 10,9,1];
        this.assertEquals(20, this.getFrameScores(scores)[9].total, "Frame 10 score");
        scores = [0,0, 5,5, 10, 10, 10, 10, 10, 10, 10, 9,1,5];
        this.assertEquals(15, this.getFrameScores(scores)[9].total, "Frame 10 score");
        scores = [0,0, 5,5, 10, 10, 10, 10, 10, 10, 10, 9,1,10];
        this.assertEquals(20, this.getFrameScores(scores)[9].total, "Frame 10 score");
        scores = [9,1];
        this.assertEquals(false, game.getFrameScores(scores)[0].total, "Frame 1 total");
        this.assertEquals(9, this.getFrameScores(scores)[0].rolls[0], "Frame 1 roll 1");
        this.assertEquals(1, this.getFrameScores(scores)[0].rolls[1], "Frame 1 roll 2");

        scores = [];
        isNextFrame = this.updateRoll(scores, 1);
        this.assertEquals(false, isNextFrame);
        this.assertEquals(1, scores[0]);
        isNextFrame = this.updateRoll(scores, 9);
        this.assertEquals(true, isNextFrame);
        this.assertEquals(9, scores[1]);
        isNextFrame = this.updateRoll(scores, 10);
        this.assertEquals(true, isNextFrame);
        this.assertEquals(10, scores[2]);

        scores = [0,0, 5,5, 10, 10, 10, 10, 10, 10, 10];
        isNextFrame = this.updateRoll(scores, 10);
        this.assertEquals(false, isNextFrame);
        isNextFrame = this.updateRoll(scores, 10);
        this.assertEquals(false, isNextFrame);
        isNextFrame = this.updateRoll(scores, 10);
        this.assertEquals(false, isNextFrame);

    };
    
    this.getCurrentFrame = function(scores, i, frame, roll) {
        let game = new GameData();
        game.init();
        return game.getCurrentFrame(scores, i, frame, roll);
    };

    this.getFrameScores = function(scores) {
        let game = new GameData();
        game.init();
        return game.getFrameScores(scores);
    };

    this.updateRoll = function(scores, value) {
        let game = new GameData();
        game.init();
        return game.updateRoll(scores, value);
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