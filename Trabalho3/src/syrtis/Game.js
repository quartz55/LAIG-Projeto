var SCENES = [
    "scene1/scene1.lsx",
    "scene1/scene2.lsx",
];
var DEFAULT_SCENE = SCENES[0];

var GAME_STATE = {
    PICK_BLACK1: 0,
    PICK_BLACK2: 1,
    PICK_WHITE1: 2,
    PICK_WHITE2: 3,
    MAIN_MENU: 4,
    MOVE_FROM: 5,
    MOVE_TO: 6,
    SINK_FROM: 7,
    SINK_TO: 8,
    PASSING: 9
};

var MAX_UNDO_LEVELS = 10;

function Game() {
    this.state = GAME_STATE.PICK_BLACK1;
    this.undoStack = [];

    this.scene = new LSXscene();
    this.interface = new Interface();
    this.interface.setScene(this.scene);
    this.interface.game = this;

    var app = new CGFapplication(document.body);
    app.init();
    app.setScene(this.scene);
    app.setInterface(this.interface);


    // this.interface.setActiveCamera(this.scene.camera);

    var filename = getUrlVars().file || DEFAULT_SCENE;

    var self = this;
    this.scene.onPickObj = function(obj, id) {
        self.piecePicked(obj, id);
    };

    PLOG.sendRequest("createMajorGame", function(data) {
        var response = PLOG.getRequestResponse(data);
        self.loadGame(response);
        self.parser = new LSXParser(filename, self.scene,
            function() {
                this.scene.onGraphLoaded();
                self.scene.loadBoard(self.board);
            });
        app.run();
    });
}

Game.prototype.piecePicked = function(obj, id) {
    var tower = this.board.getTower(id);
    var piece, pickedIDs = [];
    if (tower) {
        piece = this.board.getPiece([tower.x, tower.y]);
        pickedIDs.push(this.board.getPieceID([tower.x, tower.y]));
    } else piece = this.board.getPiece(id);

    pickedIDs.push(id);

    var self = this;
    var reqString;

    switch (this.state) {
        ////////////////
        // MOVE TOWER //
        ////////////////
        case GAME_STATE.MOVE_FROM:
            reqString = "getPlayerTower(" + piece.x + "," + piece.y + "," +
                this.stringify() + ")";
            PLOG.sendRequest(reqString, function(data) {
                var tower = PLOG.getIntResponse(data);
                if (!tower) {
                    alert("No player tower in that position");
                    return;
                }
                for (var i = 0; i < pickedIDs.length; ++i)
                    self.scene.highlightPiece(pickedIDs[i], true);

                self.pickedPiece = [piece.x, piece.y];
                PLOG.sendRequest("getValidMoves(" +
                    piece.x + "," + piece.y + "," +
                    self.stringify() + ")",
                    function(data) {
                        var moves = PLOG.getRequestResponse(data);
                        moves = JSON.parse(moves);
                        self.highlightPieces(moves);
                    });
                self.state = GAME_STATE.MOVE_TO;
            });
            break;
        case GAME_STATE.MOVE_TO:
            reqString = String.format("moveTower({0},{1},{2},{3},{4})",
                this.pickedPiece[0], this.pickedPiece[1],
                piece.x, piece.y,
                this.stringify());
            PLOG.sendRequest(reqString, function(data) {
                var response = data.target.response;
                if (response == self.stringify()) {
                    alert('Invalid move');
                    return;
                }
                self.saveState();
                self.loadGame(response);
                self.scene.loadBoard(self.board);
                self.state = GAME_STATE.MAIN_MENU;
            });
            break;

            ///////////////
            // SINK TILE //
            ///////////////
        case GAME_STATE.SINK_FROM:
            reqString = "getPlayerTower(" + piece.x + "," + piece.y + "," +
                this.stringify() + ")";
            PLOG.sendRequest(reqString, function(data) {
                var tower = PLOG.getIntResponse(data);
                if (!tower) {
                    alert("No player tower in that position");
                    return;
                }
                for (var i = 0; i < pickedIDs.length; ++i)
                    self.scene.highlightPiece(pickedIDs[i], true);

                self.pickedPiece = [piece.x, piece.y];
                PLOG.sendRequest("getValidSinks(" +
                    piece.x + "," + piece.y + "," +
                    self.stringify() + ")",
                    function(data) {
                        var sinks = PLOG.getRequestResponse(data);
                        sinks = JSON.parse(sinks);
                        if (sinks.length === 0) {
                            alert('No available sinks from that position');
                            return;
                        }
                        self.highlightPieces(sinks);
                    });
                self.state = GAME_STATE.SINK_TO;
            });
            break;
        case GAME_STATE.SINK_TO:
            reqString = String.format("sinkTile({0},{1},{2},{3},{4})",
                this.pickedPiece[0], this.pickedPiece[1],
                piece.x, piece.y,
                this.stringify());
            PLOG.sendRequest(reqString, function(data) {
                var response = data.target.response;
                if (response == self.stringify()) {
                    alert('Invalid sink');
                    return;
                }
                self.saveState();
                self.loadGame(response);
                self.scene.loadBoard(self.board);
                self.state = GAME_STATE.MAIN_MENU;
            });
            break;

            //////////////////
            // PLACE TOWERS //
            //////////////////
        case GAME_STATE.PICK_BLACK1:
            reqString = "placeBlackTower(" + piece.x + "," + piece.y + "," +
                this.board.stringify() + ")";
            PLOG.sendRequest(reqString, function(data) {
                var board = PLOG.getArrayResponse(data);
                if (board + "" == self.board.board + "") {
                    alert('Invalid placement');
                    return;
                }
                self.board = new Board(board);
                self.scene.loadBoard(self.board);
                self.state = GAME_STATE.PICK_BLACK2;
            });
            break;
        case GAME_STATE.PICK_BLACK2:
            reqString = "placeBlackTower(" + piece.x + "," + piece.y + "," +
                this.board.stringify() + ")";
            PLOG.sendRequest(reqString, function(data) {
                var board = PLOG.getArrayResponse(data);
                if (board + "" == self.board.board + "") {
                    alert('Invalid placement');
                    return;
                }
                self.board = new Board(board);
                self.scene.loadBoard(self.board);
                self.state = GAME_STATE.PICK_WHITE1;
            });
            break;
        case GAME_STATE.PICK_WHITE1:
            reqString = "placeWhiteTower(" + piece.x + "," + piece.y + "," +
                this.board.stringify() + ")";
            PLOG.sendRequest(reqString, function(data) {
                var board = PLOG.getArrayResponse(data);
                if (board + "" == self.board.board + "") {
                    alert('Invalid placement');
                    return;
                }
                self.board = new Board(board);
                self.scene.loadBoard(self.board);
                self.state = GAME_STATE.PICK_WHITE2;
            });
            break;
        case GAME_STATE.PICK_WHITE2:
            reqString = "placeWhiteTower(" + piece.x + "," + piece.y + "," +
                this.board.stringify() + ")";
            PLOG.sendRequest(reqString, function(data) {
                var board = PLOG.getArrayResponse(data);
                if (board + "" == self.board.board + "") {
                    alert('Invalid placement');
                    return;
                }
                self.board = new Board(board);
                self.scene.loadBoard(self.board);
                self.state = GAME_STATE.MAIN_MENU;
            });
            break;

        default:
            console.error("No picking can be done atm");
            break;
    }
};

Game.prototype.loadGame = function(gameStr) {
    var gameObj = Game.parseString(gameStr);

    this.board = new Board(gameObj.board);
    this.type = gameObj.type;
    this.whitePlayer = new Player(gameObj.players.white);
    this.blackPlayer = new Player(gameObj.players.black);
    this.turn = gameObj.turn;
};

Game.prototype.update = function(gameStr) {
    this.loadGame(gameStr);
};

Game.prototype.stringify = function() {
    return String.format(
        "[{0},{1},[{2},{3}],{4}]",
        this.board.stringify(),
        this.type,
        this.whitePlayer.stringify(), this.blackPlayer.stringify(),
        this.turn
    );
};

Game.prototype.saveState = function() {
    this.undoStack.push({
        game: this.stringify(),
        state: GAME_STATE.MOVE_FROM
    });
    if (this.undoStack.length > MAX_UNDO_LEVELS)
        this.undoStack.shift();
};

Game.prototype.undo = function() {
    if (this.undoStack.length === 0) return;
    var prevState = this.undoStack.pop();
    this.state = prevState.state;
    this.loadGame(prevState.game);
    this.scene.loadBoard(this.board);
};

Game.prototype.mainMenu = function() {
    if (this.state > GAME_STATE.PICK_WHITE2) {
        this.state = GAME_STATE.MAIN_MENU;
        this.scene.clearHighlights();
    }
};

Game.prototype.moveMenu = function() {
    if (this.state == GAME_STATE.MAIN_MENU)
        this.state = GAME_STATE.MOVE_FROM;
};

Game.prototype.sinkMenu = function() {
    if (this.state == GAME_STATE.MAIN_MENU)
        this.state = GAME_STATE.SINK_FROM;
};

Game.prototype.passMenu = function() {
    if (this.state == GAME_STATE.MAIN_MENU) {
        this.state = GAME_STATE.PASSING;
        var self = this;
        PLOG.sendRequest("passTurn(" + this.stringify() + ")", function(data) {
            var res = PLOG.getRequestResponse(data);
            self.loadGame(res);
            self.scene.loadBoard(self.board);
            self.state = GAME_STATE.MAIN_MENU;
        });
    }
};

Game.prototype.highlightPieces = function(positions) {
    for (var i = 0; i < positions.length; ++i) {
        var tower = this.board.getTowerID(positions[i]);
        if (tower) this.scene.highlightPiece(tower);

        var id = this.board.getPieceID(positions[i]);
        this.scene.highlightPiece(id);
    }
};

// Static
Game.parseString = function(str) {
    var JSONstr = str.replace(/([a-zA-Z]+)/gim, "\"$1\"");
    var array = JSON.parse(JSONstr);
    var obj = {
        board: array[0],
        type: array[1],
        players: Game.parsePlayers(array[2]),
        turn: array[3]
    };
    return obj;
};

Game.parsePlayers = function(players) {
    var playersObj = {
        white: {
            type: players[0][0],
            color: players[0][1],
            passes: players[0][2],
            sinks: players[0][3]
        },
        black: {
            type: players[1][0],
            color: players[1][1],
            passes: players[1][2],
            sinks: players[1][3]
        }
    };

    return playersObj;
};
