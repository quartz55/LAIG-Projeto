% ------------------ Game class

createPvPgame(Game, 'major') :-
  createMajorBoard(Board),
  createPlayer(Player1, 'white'), createPlayer(Player2, 'black'),
  Game = [Board, 'major', [Player1, Player2], 'white'].
createPvPgame(Game, 'minor') :-
  createMinorBoard(Board),
  createPlayer(Player1, 'white'), createPlayer(Player2, 'black'),
  Game = [Board, 'major', [Player1, Player2], 'white'].

% Gets
game_getBoard([Board|_], Board).
game_getTurn([_,_,_,Turn], Turn).
game_getPlayers([_,_,Players|_], Players).
game_getMode([_,Mode|_], Mode).

% Sets
game_setBoard([_|Game], Board, [Board|Game]).
game_setPlayers([Board, Mode, _|Game], Players, [Board, Mode, Players|Game]).

game_nextTurn([Board, Mode, Players, Turn], [Board, Mode, Players, NewTurn]) :-
  switchTurns(Turn, NewTurn).
game_showBoard([Board|_]) :- display_board(Board).

% Pass
game_whitePass([Board, Mode, [WhitePlayer,BlackPlayer], Turn], [Board, Mode, NewPlayers, Turn]) :-
  player_pass(WhitePlayer, NewWhite),
  NewPlayers = [NewWhite,BlackPlayer].
game_blackPass([Board, Mode, [WhitePlayer,BlackPlayer], Turn], [Board, Mode, NewPlayers, Turn]) :-
  player_pass(BlackPlayer, NewBlack),
  NewPlayers = [WhitePlayer,NewBlack].

game_pass(Game, NewGame) :- game_getTurn(Game, Turn), game_pass(Game, Turn, NewGame).
game_pass(Game, 'white', NewGame) :-
  game_whitePass(Game, Temp), game_nextTurn(Temp, NewGame).
game_pass(Game, 'black', NewGame) :-
  game_blackPass(Game, Temp), game_nextTurn(Temp, NewGame).

game_clearPasses(Game, NewGame) :- game_getTurn(Game, Turn), game_clearPasses(Game, Turn, NewGame).
game_clearPasses(Game, 'white', NewGame):-
  game_getPlayers(Game, [W,B]),
  player_clearPasses(W, NW),
  game_setPlayers(Game, [NW,B], NewGame).
game_clearPasses(Game, 'black', NewGame):-
  game_getPlayers(Game, [W,B]),
  player_clearPasses(B, NB),
  game_setPlayers(Game, [W,NB], NewGame).

% -- Initiative win (for passes)

game_checkPasses([_,_,[W,B]|_], Winner) :- % Both players pass
  player_getPasses(W, WP), player_getPasses(B, BP),
  WP > 0, BP > 0,
  game_checkInitiative(W, B, Winner).
game_checkPasses([_,_,[W,B]|_], Winner) :- % Player passes 4 times in a row
  player_getPasses(W, WP), player_getPasses(B, BP),
  (
    WP >= 4 -> Winner = 'Black';
    BP >= 4 -> Winner = 'White';
    fail
  ),
  assert(win_reason('4 passes in a row')).

game_checkInitiative([_,_,[W,B]|_], Winner) :- game_checkInitiative(W, B, Winner).
game_checkInitiative(W, B, Winner) :-
  player_getSinks(W, WS), player_getSinks(B, BS),
  (
    WS > BS -> Winner = 'White';
    BS > WS -> Winner = 'Black';
    Winner = 'White'
  ),
  assert(win_reason('Initiative')).


% Sink
game_whiteSink([Board, Mode, [WhitePlayer,BlackPlayer], Turn], [Board, Mode, NewPlayers, Turn]) :-
  player_sink(WhitePlayer, NewWhite), player_clearSinks(BlackPlayer, NewBlack),
  NewPlayers = [NewWhite,NewBlack].
game_blackSink([Board, Mode, [WhitePlayer,BlackPlayer], Turn], [Board, Mode, NewPlayers, Turn]) :-
  player_sink(BlackPlayer, NewBlack), player_clearSinks(WhitePlayer, NewWhite),
  NewPlayers = [NewWhite,NewBlack].

game_sink(Game, NewGame) :- game_getTurn(Game, Turn), game_sink(Game, Turn, NewGame).
game_sink(Game, 'white', NewGame) :-
  game_whiteSink(Game, NewGame).
game_sink(Game, 'black', NewGame) :-
  game_blackSink(Game, NewGame).

% -- Quicksand win
game_checkSinks([_,_,[W,B]|_], Winner) :-
  player_getSinks(W, WS), player_getSinks(B, BS), !,
  (
    WS >= 4 -> Winner = 'White';
    BS >= 4 -> Winner = 'Black';
    fail
  ),
  assert(win_reason('Quicksand')).

% Utils
game_printPlayers([_,_,[W,B]|_]) :-
  player_print(W),
  player_print(B).

switchTurns('white', 'black').
switchTurns('black', 'white').

% --------------- Player class
createPlayer(Player, Color) :-
  Player = ['human', Color, 0, 0].

% Gets
player_getPasses([_,_,Passes|_], Passes).
player_getSinks([_,_,_,Sinks], Sinks).

% Passes
player_pass([Type, Color, Passes, Sinks], [Type, Color, NewPasses, Sinks]) :- NewPasses is Passes + 1.
player_clearPasses([Type, Color, _, Sinks], [Type, Color, 0, Sinks]).

% Sinks
player_sink([Type, Color, Passes, Sinks], [Type, Color, Passes, NewSinks]) :- NewSinks is Sinks + 1.
player_clearSinks([Type, Color, Passes, _], [Type, Color, Passes, 0]).

% Utils
player_print([Type, Color, Passes, Sinks]) :-
  (
    Color == 'white' -> C = 'White';
    Color == 'black' -> C = 'Black'
  ),
  (
    Type == 'human' -> T = 'Human';
    Type == 'pc'    -> T = 'PC'
  ),
  write(C), write(' - '), write(T), write(' | '), write(Passes), write(' Passes | '),
  write(Sinks), write(' Sinks'), nl.

% Misc
createMajorBoard(Board) :-
  gen_major(Temp), !,
  \+ completed_island(Temp),
  Board = Temp.
createMajorBoard(B) :- createMajorBoard(B).

createMinorBoard(Board) :-
  gen_minor(Temp), !,
  \+ completed_island(Temp),
  Board = Temp.
createMinorBoard(B) :- createMinorBoard(B).