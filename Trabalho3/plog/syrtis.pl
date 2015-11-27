:- use_module(library(random)).
:- use_module(library(sets)).
:- include('utils.pl').
:- include('board.pl').
:- include('game_logic.pl').
:- include('game_class.pl').
:- include('computer.pl').

:- dynamic win_reason/1.

syrtis :- start_game.

start_game :- write('Size of board (major/minor)? '), read(X), start_game(X).
start_game('major') :- confirmBoard(Game, 'major'), place_towers(Game).
start_game('minor') :- confirmBoard(Game, 'minor'), place_towers(Game).
start_game(X) :- write(X), write(' not a valid option'), nl, start_game.

confirmBoard(Game, Mode) :-
  createPvPgame(Temp, Mode),
  game_showBoard(Temp),
  write('Start game with this board? (y/n)'),
  read(Answer),
  (
    Answer = 'y' -> Game = Temp;
    Answer = 'n' -> confirmBoard(Game, Mode);
    nl,
    write('ERROR: Invalid option'), nl,
    confirmBoard(Game, Mode)
  ).
place_towers(Game) :-
  game_getBoard(Game, Board),
  first_tower(Board, B1),
  second_tower(B1, B2),
  third_tower(B2, B3),
  fourth_tower(B3, B4),
  game_setBoard(Game, B4, NewGame),
  game_loop(NewGame).

% Main game loop

game_end('White') :-  write('White won!'),nl, writeWinReason.
game_end('Black') :-  write('Black won!'),nl, writeWinReason.
game_end('quit') :- write('Quitting...'), nl.

check_game_end('quit') :- game_end('quit').
check_game_end(Game) :-
  check_completed_islands(Game, Winner),
  game_showBoard(Game),
  game_end(Winner).
check_game_end(Game) :-
  game_checkSinks(Game, Winner),
  game_showBoard(Game),
  game_end(Winner).
check_game_end(Game) :-
  game_checkPasses(Game, Winner),
  game_showBoard(Game),
  game_end(Winner).

check_completed_islands(Game, Winner) :-
  game_getBoard(Game, Board),
  (
    ((completed_island('white', Board) ; completed_island('round', Board)) ,
      (completed_island('black', Board) ; completed_island('square', Board)))
    -> game_checkInitiative(Game, Winner);
    (completed_island('white', Board) ; completed_island('round', Board))
  -> (assert(win_reason('Completed island')), Winner = 'White');
    (completed_island('black', Board) ; completed_island('square', Board))
  -> (assert(win_reason('Completed island')), Winner = 'Black');
    fail
  ).

game_loop(Game) :-
  check_game_end(Game).
game_loop(Game) :-
  clearScreen,
  showGameInfo(Game),
  gameMenu(Option),
  (
    Option = 1 -> moveTowerMenu(Game, NewGame);
    Option = 2 -> sinkTileMenu(Game, NewGame);
    Option = 3 -> slideTileMenu(Game, NewGame);
    Option = 4 -> pass(Game, NewGame);
    Option = 5 -> NewGame = 'quit';

    nl,
    write('ERROR: Invalid option.'), nl,
    NewGame = Game
  ),
  game_loop(NewGame).

gameMenu(Option):-
  write('1. Move tower'), nl,
  write('2. Sink tile'), nl,
  write('3. Slide tile'), nl,
  write('4. Pass'), nl,
  write('5. Quit'), nl,
  write('> '), read(Option).

% ------------- Move tower

moveTowerMenu(Game, NewGame) :-
  selectTower(X, Y, 'Which tower you want to move?', Game, T, Board),
  write('Where do you want to move the tower to?'), nl,
  get_coords(X2, Y2),
  isValidMove([X,Y], [X2,Y2], Board, T),
  moveTower(X,Y,X2,Y2,T,Board,NewBoard),
  game_setBoard(Game, NewBoard, G1),
  game_clearPasses(G1, G2),
  game_nextTurn(G2, NewGame).
moveTowerMenu(Game, Game) :- write('ERROR: Invalid move'), nl.

moveTower(X,Y,X2,Y2,Tower,Board,NewBoard) :-
  set_tower(X,Y,Board,0,N),
  set_tower(X2,Y2,N,Tower,NewBoard).
moveTower(_,_,_,_,_,Board,Board) :- write('Couldnt move tower'), nl.

isValidMove([X,Y], [X2,Y2], Board, Tower) :-
  get_tower(X2, Y2, Board, Dest), Dest =:= 0,
  getCurrIsland(X, Y, Tower, Board, CurrIsland),
  member([X2,Y2], CurrIsland).


% ------------- Sink tile

sinkTileMenu(Game, NewGame) :-
  selectTower(X, Y, 'Which tower you want to sink from?', Game, _, Board),
  write('Which tile you want to sink? (up/down/left/right)'), nl, read(Which),
  (
    Which == 'up' -> (XT is X, YT is Y - 1);
    Which == 'down' -> (XT is X, YT is Y + 1);
    Which == 'left' -> (XT is X - 1, YT is Y);
    Which == 'right' -> (XT is X + 1, YT is Y);

    nl,
    write('ERROR: Invalid direction'), nl,
    sinkTileMenu(Game, NewGame)
  ),
  isValidSink(XT, YT, Board),
  sinkTile(XT, YT, Board, NewBoard),
  game_setBoard(Game, NewBoard, G1),
  game_clearPasses(G1, G2),
  game_sink(G2, G3),
  game_nextTurn(G3, NewGame).
sinkTileMenu(Game, Game) :- write('ERROR: Invalid sink'), nl.

sinkTile(X, Y, Board, NewBoard) :-
  set_tile(X, Y, Board, 0, NewBoard).

isValidSink(X, Y, Board) :-
  get_tower(X, Y, Board, Tower), Tower =:= 0, % Not occupied
  checkFreeEdges([X,Y], Board, N),
  N < 4,
  sinkTile(X, Y, Board, NewBoard),
  check_if_connected(NewBoard).

% ------------- Move tile

slideTileMenu(Game, NewGame) :-
  selectTower(X, Y, 'Which tower you want to move from?', Game, _, Board),
  write('Where do you want to move the tile to?'), nl,
  get_coords(X2, Y2),
  isValidSlide([X,Y], [X2,Y2], Board),
  slideTile(X, Y, X2, Y2, Board, NewBoard),
  game_setBoard(Game, NewBoard, G1),
  game_clearPasses(G1, G2),
  game_nextTurn(G2, NewGame).
slideTileMenu(Game, Game) :- write('ERROR: Invalid slide'), nl.

slideTile(X, Y, X2, Y2, Board, NewBoard) :-
  get_tower(X, Y, Board, Tower), get_tile(X, Y, Board, Tile),
  set_tower(X, Y, Board, 0, B1), set_tile(X, Y, B1, 0, B2),
  set_tower(X2, Y2, B2, Tower, B3), set_tile(X2, Y2, B3, Tile, NewBoard).

isValidSlide([X,Y], [X2,Y2], Board) :-
  get_tile(X2, Y2, Board, Tile), Tile =:= 0,
  checkSlidingPath([X,Y], [X2,Y2], Board),
  slideTile(X, Y, X2, Y2, Board, NewBoard),
  check_if_connected(NewBoard).

% ------------- Pass

pass(Game, NewGame) :-
  game_pass(Game, NewGame).

% Utils

writeWinReason :-
  win_reason(X), write(X), nl.

showGameInfo(Game) :-
  game_showBoard(Game),
  game_printPlayers(Game),
  game_getTurn(Game, Turn),
  calcBoardValue(Game, Value),
  write('--------------------------'), nl,
  write('| It is '), write(Turn), write('\'s turn'), nl,
  write('| Board score: '), write(Value), nl,
  write('--------------------------'), nl.

selectTower(X, Y, Message, Game, Turn, Board) :-
  game_getTurn(Game, T),
  (
    T = 'white' -> Turn = 2;
    T = 'black' -> Turn = 1
    ),
  game_getBoard(Game, Board),
  write(Message), nl,
  get_coords(X, Y),
  get_tower(X, Y, Board, Tower), Tower =:= Turn.


getCurrIsland(X, Y, 1, Board, Island) :-
  check_black_island(X, Y, Board, I1),
  check_square_island(X, Y, Board, I2),
  append(I1, I2, Island).
getCurrIsland(X, Y, 2, Board, Island) :-
  check_white_island(X, Y, Board, I1),
  check_round_island(X, Y, Board, I2),
  append(I1, I2, Island).

get_coords(X, Y) :-
  write('X coord : '), read(X),
  write('Y coord : '), read(Y).

first_tower(Board, NewBoard) :-
  display_board(Board),
  write('Coordinates of first black tower: '), nl,
  get_coords(X, Y),
  check_if_valid_black_tile(X, Y, Board),
  place_tower(X, Y, 1, Board, NewBoard).

second_tower(Board, NewBoard) :-
  display_board(Board),
  write('Coordinates of second black tower: '), nl,
  get_coords(X, Y),
  check_if_valid_black_tile(X, Y, Board),
  place_tower(X, Y, 1, Board, NewBoard).

third_tower(Board, NewBoard) :-
  display_board(Board),
  write('Coordinates of first white tower: '), nl,
  get_coords(X, Y),
  check_if_valid_white_tile(X, Y, Board),
  place_tower(X, Y, 2, Board, NewBoard).

fourth_tower(Board, NewBoard) :-
  display_board(Board),
  write('Coordinates of second white tower: '), nl,
  get_coords(X, Y),
  check_if_valid_white_tile(X, Y, Board),
  place_tower(X, Y, 2, Board, NewBoard).

place_tower(X, Y, Tower, Board, NewBoard) :-
  check_if_no_tower(X, Y, Board),
  set_tower(X, Y, Board, Tower, NewBoard).

check_if_no_tower(X, Y, Board) :-
  get_tower(X, Y, Board, Tower),
  Tower =:= 0 .

check_if_valid_black_tile(X, Y, Board) :-
  get_tile(X, Y, Board, Tile),
  (Tile =:= 2 ; Tile =:= 3 ; Tile =:= 4).

check_if_valid_white_tile(X, Y, Board) :-
  get_tile(X, Y, Board, Tile),
  (Tile =:= 1 ; Tile =:= 2 ; Tile =:= 3).

load :- consult('syrtis.pl').