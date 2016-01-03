% -------------- Winning conditions

% Completed islands

completed_island(Board) :- completed_island('white', Board).
completed_island(Board) :- completed_island('black', Board).
completed_island(Board) :- completed_island('round', Board).
completed_island(Board) :- completed_island('square', Board).

completed_island('white', Board) :-
  get_white_tile(X, Y, Board), !,
  check_white_island(X, Y, Board, Island), !,
  get_list_size(Island, NIsland),
  number_of_tiles(Board, [_,1], N), number_of_tiles(Board, [_,2], N1), NWhites is N+N1, !,
  NIsland =:= NWhites.

completed_island('black', Board) :-
  get_black_tile(X, Y, Board), !,
  check_black_island(X, Y, Board, Island), !,
  get_list_size(Island, NIsland),
  number_of_tiles(Board, [_,3], N), number_of_tiles(Board, [_,4], N1), NWhites is N+N1, !,
  NIsland =:= NWhites.

completed_island('round', Board) :-
  get_round_tile(X, Y, Board), !,
  check_round_island(X, Y, Board, Island), !,
  get_list_size(Island, NIsland),
  number_of_tiles(Board, [_,1], N), number_of_tiles(Board, [_,3], N1), NWhites is N+N1, !,
  NIsland =:= NWhites.

completed_island('square', Board) :-
  get_square_tile(X, Y, Board), !,
  check_square_island(X, Y, Board, Island), !,
  get_list_size(Island, NIsland),
  number_of_tiles(Board, [_,2], N), number_of_tiles(Board, [_,4], N1), NWhites is N+N1, !,
  NIsland =:= NWhites.

% -------------- Check if board is connected

check_if_connected(Board) :-
  number_of_tiles(Board, N),
  check_if_connected(Board, N2), !,
  N =:= N2.

check_if_connected(Board, N) :-
  get_valid_tile(X, Y, Board),
  reachable_tiles(X, Y, Board, Reachable), !,
  get_list_size(Reachable, N).

reachable_tiles(X, Y, Board, Reachable) :-
  reachable_tiles_rec([[X,Y]], [], Board, [], Reachable).

reachable_tiles_rec([], _, _, Final, Final).
reachable_tiles_rec([CurrTile|T], Visited, Board, Reachable, F) :-
  member(CurrTile, Visited), !,
  reachable_tiles_rec(T, Visited, Board, Reachable, F).
reachable_tiles_rec([[X,Y]|T], Visited, Board, Reachable, F) :-
  get_matrix_elem(X, Y, Board, CurrTile),
  CurrTile \= [_,0],
  neighbours(X, Y, Neighbours),
  append(T, Neighbours, NT), append(Visited, [[X,Y]], NV), append(Reachable, [[X,Y]], NR),
  reachable_tiles_rec(NT, NV, Board, NR, F).
reachable_tiles_rec([CurrTile|T], Visited, Board, Reachable, F) :-
  reachable_tiles_rec(T, [CurrTile|Visited], Board, Reachable, F).



% ------------- Check islands

% White
check_white_island(X, Y, Board, Island) :-
  search_white_island([[X,Y]], [], Board, [], Island).

search_white_island([], _, _, Island, Island).
search_white_island([CurrTile|T], Visited, Board, Island, F) :-
  member(CurrTile, Visited), !,
  search_white_island(T, Visited, Board, Island, F).
search_white_island([[X,Y]|T], Visited, Board, Island, F) :-
  get_matrix_elem(X, Y, Board, [_|Tile]), (Tile =:= 1 ; Tile =:= 2),
  neighbours(X, Y, Neighbours),
  append(T, Neighbours, NS), append(Visited, [[X,Y]], NV), append(Island, [[X,Y]], NI),
  search_white_island(NS, NV, Board, NI, F).
search_white_island([Tile|T], Visited, Board, Island, F) :-
  search_white_island(T, [Tile|Visited], Board, Island, F).

% Black
check_black_island(X, Y, Board, Island) :-
  search_black_island([[X,Y]], [], Board, [], Island).

search_black_island([], _, _, Island, Island).
search_black_island([CurrTile|T], Visited, Board, Island, F) :-
  member(CurrTile, Visited), !,
  search_black_island(T, Visited, Board, Island, F).
search_black_island([[X,Y]|T], Visited, Board, Island, F) :-
  get_matrix_elem(X, Y, Board, [_|Tile]), (Tile =:= 3 ; Tile =:= 4),
  neighbours(X, Y, Neighbours),
  append(T, Neighbours, NS), append(Visited, [[X,Y]], NV), append(Island, [[X,Y]], NI),
  search_black_island(NS, NV, Board, NI, F).
search_black_island([Tile|T], Visited, Board, Island, F) :-
  search_black_island(T, [Tile|Visited], Board, Island, F).


% Round
check_round_island(X, Y, Board, Island) :-
  search_round_island([[X,Y]], [], Board, [], Island).

search_round_island([], _, _, Island, Island).
search_round_island([CurrTile|T], Visited, Board, Island, F) :-
  member(CurrTile, Visited), !,
  search_round_island(T, Visited, Board, Island, F).
search_round_island([[X,Y]|T], Visited, Board, Island, F) :-
  get_matrix_elem(X, Y, Board, [_|Tile]), (Tile =:= 1 ; Tile =:= 3),
  neighbours(X, Y, Neighbours),
  append(T, Neighbours, NS), append(Visited, [[X,Y]], NV), append(Island, [[X,Y]], NI),
  search_round_island(NS, NV, Board, NI, F).
search_round_island([Tile|T], Visited, Board, Island, F) :-
  search_round_island(T, [Tile|Visited], Board, Island, F).

% Square
check_square_island(X, Y, Board, Island) :-
  search_square_island([[X,Y]], [], Board, [], Island).

search_square_island([], _, _, Island, Island).
search_square_island([CurrTile|T], Visited, Board, Island, F) :-
  member(CurrTile, Visited), !,
  search_square_island(T, Visited, Board, Island, F).
search_square_island([[X,Y]|T], Visited, Board, Island, F) :-
  get_matrix_elem(X, Y, Board, [_|Tile]), (Tile =:= 2 ; Tile =:= 4),
  neighbours(X, Y, Neighbours),
  append(T, Neighbours, NS), append(Visited, [[X,Y]], NV), append(Island, [[X,Y]], NI),
  search_square_island(NS, NV, Board, NI, F).
search_square_island([Tile|T], Visited, Board, Island, F) :-
  search_square_island(T, [Tile|Visited], Board, Island, F).

% ------------------------- Make sliding path

checkSlidingPath([X,Y], Destiny, Board) :-
  checkBoardBorders(X0, X1, Y0, Y1, Board),
  set_tile(X,Y,Board,0,Temp), !,
  makeSlidingPath([[X,Y]], [], Destiny, [], Temp, [X0, X1, Y0, Y1]).

makeSlidingPath(_, _, [X1,Y1], Path, _, _) :-
  get_list_last(Path, Dest), \+ Dest \= [X1, Y1].
makeSlidingPath([Curr|T], Visited, Destiny, Path, Board, Borders) :-
  member(Curr, Visited), !,
  makeSlidingPath(T, Visited, Destiny, Path, Board, Borders).
makeSlidingPath([[X,Y]|T], Visited, Destiny, Path, Board, Borders) :-
  get_tile(X,Y,Board,Tile), Tile =:= 0,
  isInsideBorders([X,Y], Borders),
  neighbours(X,Y,Neighbours),
  append(T, Neighbours, NT), append(Path, [[X,Y]], NP),
  makeSlidingPath(NT, [[X,Y]|Visited], Destiny, NP, Board, Borders).
makeSlidingPath([Curr|T], Visited, Destiny, Path, Board, Borders) :-
  makeSlidingPath(T, [Curr|Visited], Destiny, Path, Board, Borders).

isInsideBorders([X,Y], [X0, X1, Y0, Y1]) :-
  X >= X0, X =< X1, Y >= Y0, Y =< Y1.

% ------------------------- Utils

checkFreeEdges([X,Y], Board, N) :-
  neighbours(X, Y, Neighbours),
  checkFreeEdges(Neighbours, Board, [], ValidTiles),
  get_list_size(ValidTiles, N).

checkFreeEdges([], _, Final, Final).
checkFreeEdges([[X,Y]|T], Board, Valid, F) :-
  get_tile(X,Y,Board,Tile),
  Tile \= 0,
  checkFreeEdges(T, Board, [[X,Y]|Valid], F).
checkFreeEdges([_|T], Board, Valid, F) :- checkFreeEdges(T, Board, Valid, F).

neighbours(X, Y, [N, S, E, W]) :-
  NY is Y - 1, SY is Y + 1, EX is X + 1, WX is X -1,
  N = [X, NY], S = [X, SY], E = [EX, Y], W = [WX, Y].

checkBoardBorders(X0, X1, Y0, Y1, Board) :-
  checkLeftBorder(X0, Board), checkRightBorder(X1, Board),
  checkTopBorder(Y0, Board), checkBottomBorder(Y1, Board).

% Left border
checkLeftBorder(X0, Board) :-
  checkLeftBorder(X0, 0, Board).
checkLeftBorder(X0, N, Board) :-
  checkEmptyCollum(N, Board),
  N1 is N + 1,
  checkLeftBorder(X0, N1, Board).
checkLeftBorder(X0, X0, _).

% Right border
checkRightBorder(X1, Board) :-
  get_matrix_size(Board, S),
  S1 is S - 1,
  checkRightBorder(X1, S1, Board).
checkRightBorder(X1, N, Board) :-
  checkEmptyCollum(N, Board),
  N1 is N - 1,
  checkLeftBorder(X1, N1, Board).
checkRightBorder(X1, X1, _).

% Top border
checkTopBorder(Y0, Board) :-
  checkTopBorder(Y0, 0, Board).
checkTopBorder(Y0, N, Board) :-
  checkEmptyLine(N, Board),
  N1 is N + 1,
  checkLeftBorder(Y0, N1, Board).
checkTopBorder(Y0, Y0, _).

% Bottom border
checkBottomBorder(Y1, Board) :-
  get_matrix_size(Board, S),
  S1 is S - 1,
  checkBottomBorder(Y1, S1, Board).
checkBottomBorder(Y1, N, Board) :-
  checkEmptyLine(N, Board),
  N1 is N - 1,
  checkLeftBorder(Y1, N1, Board).
checkBottomBorder(Y1, Y1, _).

checkEmptyCollum(N, Board) :-
  checkEmptyCollum(N, 0, Board).
checkEmptyCollum(_, N, Board) :- get_matrix_size(Board, Size), N >= Size.
checkEmptyCollum(N, Acc, Board) :-
  get_tile(N, Acc, Board, Tile), Tile =:= 0,
  Acc1 is Acc + 1, checkEmptyCollum(N, Acc1, Board).

checkEmptyLine(N, Board) :-
  checkEmptyLine(N, 0, Board).
checkEmptyLine(_, N, Board) :- get_matrix_size(Board, Size), N >= Size.
checkEmptyLine(N, Acc, Board) :-
  get_tile(Acc, N, Board, Tile), Tile =:= 0,
  Acc1 is Acc + 1, checkEmptyLine(Acc1, N, Board).

get_valid_tile(X, Y, Board) :- get_valid_tile(0, 0, X, Y, Board, _).
get_valid_tile(X, Y, Board, Tile) :- get_valid_tile(0, 0, X, Y, Board, Tile).

get_valid_tile(_, _, _, _, [], _).
get_valid_tile(X, Y, X1, Y1, [H|_], Tile) :-
  get_valid_tile_line(X, Y, X1, Y1, H, Tile),
  X1 \= -1, Y1 \= -1.
get_valid_tile(X, Y, X1, Y1, [_|T], Tile) :-
  YN is Y + 1,
  get_valid_tile(X, YN, X1, Y1, T, Tile).


get_valid_tile_line(_, _, -1, -1, [], _).
get_valid_tile_line(X, Y, X, Y, [Curr|_], Tile) :-
 Curr \= [_,0],
 \+ Curr \= Tile.
get_valid_tile_line(X, Y, X1, Y1, [_|T], Tile) :-
  XN is X + 1,
  get_valid_tile_line(XN, Y, X1, Y1, T, Tile).

get_towers(Board, Towers, Tower) :-
  get_towers(0, Board, [], Towers, Tower).

get_towers(_, [], Final, Final, _).
get_towers(Y, [H|Xs], Towers, Final, Tower) :-
  get_towers_aux(0, Y, H, [], Temp, Tower),
  append(Towers, Temp, NT),
  Y1 is Y + 1,
  get_towers(Y1, Xs, NT, Final, Tower).

get_towers_aux(_, _, [], F, F, _).
get_towers_aux(X, Y, [[Tower,_]|T], Towers, F, Tower) :-
  X1 is X + 1,
  get_towers_aux(X1, Y, T, [[X,Y]|Towers], F, Tower).
get_towers_aux(X, Y, [_|T], Towers, F, Tower) :-
  X1 is X + 1,
  get_towers_aux(X1, Y, T, Towers, F, Tower).

get_white_tile(X, Y, Board) :- get_valid_tile(X, Y, Board, [_,1]), X \= -1.
get_white_tile(X, Y, Board) :- get_valid_tile(X, Y, Board, [_,2]), X \= -1.

get_black_tile(X, Y, Board) :- get_valid_tile(X, Y, Board, [_,3]), X \= -1.
get_black_tile(X, Y, Board) :- get_valid_tile(X, Y, Board, [_,4]), X \= -1.

get_round_tile(X, Y, Board) :- get_valid_tile(X, Y, Board, [_,1]), X \= -1.
get_round_tile(X, Y, Board) :- get_valid_tile(X, Y, Board, [_,3]), X \= -1.

get_square_tile(X, Y, Board) :- get_valid_tile(X, Y, Board, [_,2]), X \= -1.
get_square_tile(X, Y, Board) :- get_valid_tile(X, Y, Board, [_,4]), X \= -1.