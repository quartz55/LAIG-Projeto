var SCENES = [
    "scene1/scene1.lsx",
    "scene1/scene2.lsx",
];
var DEFAULT_SCENE = SCENES[0];

var GAME_STATE = {
    PLACING_TOWER: 0,
    PICK_BLACK1: 1,
    PICK_BLACK2: 2,
    PICK_WHITE1: 3,
    PICK_WHITE2: 4,
    MAIN_MENU: 5,
    MOVE_FROM: 6,
    MOVE_TO: 7,
    SINK_FROM: 8,
    SINK_TO: 9,
    PASSING: 10,
    ANIMATING: 11,
    SWITCHING_PLAYER: 12,
    NEXT_TURN: 13
};

var COLOR = {
    BLACK: [0.12, 0.12, 0.12],
    WHITE: [0.91, 0.91, 0.91],
    YELLOW: [1, 0.99, 0.6],
    RED: [1, 0.31, 0.3],

    PURE_RED: [1, 0, 0],
    PURE_GREEN: [0, 1, 0],
    PURE_BLUE: [0, 0, 1],
    PURE_YELLOW: [1, 1, 0],
    PURE_PURPLE: [1, 0, 1],
    PURE_CYAN: [0, 1, 1],
    PURE_BLACK: [0, 0, 0],
    PURE_WHITE: [1, 1, 1]
};

var MSG_TYPES = {
    WARNING: [COLOR.BLACK, COLOR.YELLOW],
    ERROR: [COLOR.WHITE, COLOR.RED],
    INFO: [COLOR.BLACK, COLOR.WHITE]
};

var MAX_UNDO_LEVELS = 10;

function Message (type, text) {
    this.type = type;
    this.text = text;
    this.change = function (type, text) {
        this.type = type;
        this.text = text;
    };
}

function Game(boardType) {
    this.state = GAME_STATE.PICK_BLACK1;
    this.messages = [new Message("INFO", "Place first black tower")];
    this.infoMessage = this.messages[0];
    this.undoStack = [];

    this.scene = new LSXscene();
    this.interface = new Interface();
    this.interface.setScene(this.scene);
    this.interface.game = this;

    this.app = new CGFapplication(document.body);
    this.app.init();
    this.app.setScene(this.scene);
    this.app.setInterface(this.interface);

    // this.interface.setActiveCamera(this.scene.camera);

    var filename = getUrlVars().file || DEFAULT_SCENE;

    var self = this;
    this.scene.onPickObj = function(obj, id) {
        self.piecePicked(obj, id);
    };

    boardType = boardType || "Major";
    PLOG.sendRequest(String.format("create{0}Game", boardType), function(data) {
        var response = PLOG.getRequestResponse(data);
        self.loadGame(response);
        self.parser = new LSXParser(filename, self.scene,
                                    function() {
                                        this.scene.onGraphLoaded();
                                        self.scene.loadBoard(self.board);
                                    });
        self.app.run();
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
                self.addMessage("ERROR", "No player tower in that position");
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
            self.changeState( GAME_STATE.MOVE_TO );
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
                self.addMessage("ERROR", "Invalid move");
                return;
            }

            // Animation for tower
            var delta = [1.5*( self.pickedPiece[0]-piece.x ), 0, 1.5*( self.pickedPiece[1]-piece.y )];
            var anim = new LinearAnimation("moveAnim", 1.5, [delta,[0,0,0]], 2.5);
            anim.ondone(function () {
                self.changeState(GAME_STATE.SWITCHING_PLAYER);
            });
            self.scene.anims.moveAnim = anim;

            self.saveGameState();
            self.loadGame(response);
            var t = self.board.getTower([piece.x, piece.y]);
            t.animations.push("moveAnim");
            self.changeState(GAME_STATE.ANIMATING);
            self.scene.loadBoard(self.board);
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
                self.addMessage("ERROR", "No player tower in that position");
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
                                     self.addMessage("ERROR", "No available sinks from that position");
                                     return;
                                 }
                                 self.highlightPieces(sinks);
                             });
            self.changeState( GAME_STATE.SINK_TO );
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
                self.addMessage("ERROR", "Invalid sink");
                return;
            }

            // Animation for piece
            var anim = new LinearAnimation("sinkAnim", 1, [[0,0,0],[0,15,0]], 0);
            anim.ondone(function () {
                self.saveGameState();
                self.loadGame(response);
                self.scene.loadBoard(self.board);
                self.changeState(GAME_STATE.SWITCHING_PLAYER);
            });
            var p = self.board.getPieceID([piece.x, piece.y]);
            self.scene.pickData[p][0].anims.push(anim);
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
                self.addMessage("ERROR", "Invalid placement");
                return;
            }
            self.board = new Board(board);

            self.changeState(GAME_STATE.PLACING_TOWER);

            var anim = new LinearAnimation("moveAnim", 0.8, [[0,10,0],[0,0,0]]);
            anim.ondone(function () {
                self.changeState(GAME_STATE.PICK_BLACK2);
            });
            self.scene.anims.moveAnim = anim;
            var t = self.board.getTower([piece.x, piece.y]);
            t.animations.push("moveAnim");

            self.scene.loadBoard(self.board);
        });
        break;
    case GAME_STATE.PICK_BLACK2:
        reqString = "placeBlackTower(" + piece.x + "," + piece.y + "," +
            this.board.stringify() + ")";
        PLOG.sendRequest(reqString, function(data) {
            var board = PLOG.getArrayResponse(data);
            if (board + "" == self.board.board + "") {
                self.addMessage("ERROR", "Invalid placement");
                return;
            }
            self.board = new Board(board);

            var anim = new LinearAnimation("moveAnim", 0.8, [[0,10,0],[0,0,0]]);
            anim.ondone(function () {
                self.changeState(GAME_STATE.PICK_WHITE1);
            });
            self.scene.anims.moveAnim = anim;

            var t = self.board.getTower([piece.x, piece.y]);
            t.animations.push("moveAnim");

            self.scene.loadBoard(self.board);
            self.changeState(GAME_STATE.PLACING_TOWER);
        });
        break;
    case GAME_STATE.PICK_WHITE1:
        reqString = "placeWhiteTower(" + piece.x + "," + piece.y + "," +
            this.board.stringify() + ")";
        PLOG.sendRequest(reqString, function(data) {
            var board = PLOG.getArrayResponse(data);
            if (board + "" == self.board.board + "") {
                self.addMessage("ERROR", "Invalid placement");
                return;
            }
            self.board = new Board(board);

            var anim = new LinearAnimation("moveAnim", 0.8, [[0,10,0],[0,0,0]]);
            anim.ondone(function () {
                self.changeState(GAME_STATE.PICK_WHITE2);
            });
            self.scene.anims.moveAnim = anim;

            var t = self.board.getTower([piece.x, piece.y]);
            t.animations.push("moveAnim");

            self.scene.loadBoard(self.board);
            self.changeState(GAME_STATE.PLACING_TOWER);
        });
        break;
    case GAME_STATE.PICK_WHITE2:
        reqString = "placeWhiteTower(" + piece.x + "," + piece.y + "," +
            this.board.stringify() + ")";
        PLOG.sendRequest(reqString, function(data) {
            var board = PLOG.getArrayResponse(data);
            if (board + "" == self.board.board + "") {
                self.addMessage("ERROR", "Invalid placement");
                return;
            }
            self.board = new Board(board);

            var anim = new LinearAnimation("moveAnim", 0.8, [[0,10,0],[0,0,0]]);
            anim.ondone(function () {
                self.changeState(GAME_STATE.MAIN_MENU);
            });
            self.scene.anims.moveAnim = anim;

            var t = self.board.getTower([piece.x, piece.y]);
            t.animations.push("moveAnim");

            self.scene.loadBoard(self.board);
            self.changeState(GAME_STATE.PLACING_TOWER);
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
    this.updateHUD();
    var self = this;
    PLOG.sendRequest(String.format("checkWin({0})",this.stringify()), function (data) {
        var winner = PLOG.getRequestResponse(data);
        if (winner != 'null') {
            window.location = "winner_"+winner.toLowerCase()+".html";
        }
    });
};

Game.prototype.addMessage = function(type, text) {
    this.messages.push(new Message(type, text));
    this.updateHUD();
};

Game.prototype.updateHUD = function() {
    this.scene.hud.clear();
    this.scene.hud.position = [-2.95, 1.8];

    if (this.state > GAME_STATE.PICK_WHITE2) {
        // White player info
        this.scene.hud.setFgColor(COLOR.BLACK);
        this.scene.hud.setBgColor(COLOR.WHITE);
        this.scene.hud.add("White player | " + this.whitePlayer.type);
        this.scene.hud.add("Passes " + this.whitePlayer.passes, [0, -1]);
        this.scene.hud.add("Sinks " + this.whitePlayer.sinks, [0, -2]);

        // Black player info
        this.scene.hud.setFgColor(COLOR.WHITE);
        this.scene.hud.setBgColor(COLOR.BLACK);
        this.scene.hud.add("Black player | " + this.blackPlayer.type, [0, -4]);
        this.scene.hud.add("Passes " + this.blackPlayer.passes, [0, -5]);
        this.scene.hud.add("Sinks " + this.blackPlayer.sinks, [0, -6]);
    }

    // Messages
    for (var i = 0; i < this.messages.length; ++i) {
        var msg = this.messages[i];
        this.scene.hud.setFgColor(MSG_TYPES[msg.type][0]);
        this.scene.hud.setBgColor(MSG_TYPES[msg.type][1]);
        this.scene.hud.add(msg.text, [0, -30+i]);
    }

    // Player turn
    if (this.state > GAME_STATE.PICK_WHITE2) {
        if (this.turn == "white") {
            this.scene.hud.setFgColor(COLOR.BLACK);
            this.scene.hud.setBgColor(COLOR.WHITE);
        } else {
            this.scene.hud.setFgColor(COLOR.WHITE);
            this.scene.hud.setBgColor(COLOR.BLACK);
        }
        this.scene.hud.add("It is " + this.turn + "'s turn", [0, -31]);
    }
};

Game.prototype.update = function(gameStr) {
    this.loadGame(gameStr);
};

Game.prototype.highlightPieces = function(positions) {
    for (var i = 0; i < positions.length; ++i) {
        var tower = this.board.getTowerID(positions[i]);
        if (tower) this.scene.highlightPiece(tower);

        var id = this.board.getPieceID(positions[i]);
        this.scene.highlightPiece(id);
    }
};

Game.prototype.changeState = function(nextState) {
    switch (nextState) {
    case GAME_STATE.PICK_BLACK2:
        if (this.state == GAME_STATE.PICK_BLACK1 ||
            this.state == GAME_STATE.PLACING_TOWER)
            this.infoMessage.change("INFO", "Place second black tower");
        else return false;
        break;
    case GAME_STATE.PICK_WHITE1:
        if (this.state == GAME_STATE.PICK_BLACK2 ||
            this.state == GAME_STATE.PLACING_TOWER)
            this.infoMessage.change("INFO", "Place first white tower");
        else return false;
        break;
    case GAME_STATE.PICK_WHITE2:
        if (this.state == GAME_STATE.PICK_WHITE1 ||
            this.state == GAME_STATE.PLACING_TOWER)
            this.infoMessage.change("INFO", "Place second white tower");
        else return false;
        break;
    case GAME_STATE.MAIN_MENU:
        if (this.board.towers.length < 4 || this.state == GAME_STATE.ANIMATING ||
           this.state == GAME_STATE.SWITCHING_PLAYER) {
            return false;
        }
        this.scene.clearHighlights();
        this.infoMessage.change("INFO", "Pick a move");
        console.log("Main menu");
        break;
    case GAME_STATE.MOVE_FROM:
        if (this.changeState(GAME_STATE.MAIN_MENU)) {
            this.infoMessage.change("INFO", "Select a tower to move");
        }
        else return false;
        break;
    case GAME_STATE.MOVE_TO:
        if (this.changeState(GAME_STATE.MOVE_FROM)) {
            this.infoMessage.change("INFO", "Select a tile to move to");
        }
        else return false;
        break;
    case GAME_STATE.SINK_FROM:
        if (this.changeState(GAME_STATE.MAIN_MENU)) {
            this.infoMessage.change("INFO", "Select a tower to sink from");
        }
        else return false;
        break;
    case GAME_STATE.SINK_TO:
        if (this.changeState(GAME_STATE.SINK_FROM)) {
            this.infoMessage.change("INFO", "Select a tile to sink");
        }
        else return false;
        break;
    case GAME_STATE.ANIMATING:
        if (this.state == GAME_STATE.SINK_TO || this.state == GAME_STATE.MOVE_TO ||
            this.state <= GAME_STATE.PICK_WHITE2) {
            this.infoMessage.change("INFO", "");
        }
        else return false;
        break;
    case GAME_STATE.PLACING_TOWER:
        if (this.state <= GAME_STATE.PICK_WHITE2) {
            this.infoMessage.change("INFO", "");
        }
        else return false;
        break;
    case GAME_STATE.PASSING:
        if (this.changeState(GAME_STATE.MAIN_MENU)) {
            var self = this;
            PLOG.sendRequest("passTurn(" + this.stringify() + ")", function(data) {
                var res = PLOG.getRequestResponse(data);
                self.saveGameState();
                self.loadGame(res);
                self.scene.loadBoard(self.board);
                self.changeState(GAME_STATE.SWITCHING_PLAYER);
            });
        }
        else return false;
        break;
    case GAME_STATE.SWITCHING_PLAYER:
        var self = this;
        this.infoMessage.change("WARNING", "Switching player");
        this.scene.rotateView(2, function() {
            self.changeState(GAME_STATE.NEXT_TURN);
        });
        break;
    case GAME_STATE.NEXT_TURN:
        this.state = GAME_STATE.NEXT_TURN;
        this.changeState(GAME_STATE.MAIN_MENU);
        break;
    }

    this.messages.splice(1, this.messages.length);
    this.state = nextState;
    this.updateHUD();
    return true;
};

Game.prototype.saveGameState = function() {
    this.undoStack.push({
        game: this.stringify(),
        state: GAME_STATE.MOVE_FROM
    });
    if (this.undoStack.length > MAX_UNDO_LEVELS)
        this.undoStack.shift();
};

Game.prototype.undo = function() {
    if (this.undoStack.length === 0) {
        this.addMessage("ERROR", "No more actions to undo");
        return;
    }
    if (this.state != GAME_STATE.ANIMATING && this.state != GAME_STATE.SWITCHING_PLAYER) {
        var prevState = this.undoStack.pop();
        this.state = prevState.state;
        this.loadGame(prevState.game);
        this.scene.loadBoard(this.board);
        this.changeState(GAME_STATE.SWITCHING_PLAYER);
    }
};

Game.prototype.setScene = function(scene) {
    var self = this;
    this.parser = new LSXParser(scene, this.scene,
                                function() {
                                    this.scene.onGraphLoaded();
                                    self.scene.loadBoard(self.board);
                                });
};

Game.prototype.cancelMenu = function() {
    this.changeState(GAME_STATE.MAIN_MENU);
};

Game.prototype.moveMenu = function() {
    this.changeState(GAME_STATE.MOVE_FROM);
};

Game.prototype.sinkMenu = function() {
    this.changeState(GAME_STATE.SINK_FROM);
};

Game.prototype.passMenu = function() {
    this.changeState(GAME_STATE.PASSING);
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
