calcBoardValue(Game, Value) :-
  calcNumberTiles(Game, V1),
  calcIslands(Game, V2),
  Value is V1 + V2.
calcBoardValue(_, 0).

calcNumberTiles(Game, Value) :-
  game_getTurn(Game, Turn),
  calcNumberTiles(Game, Turn, Value).
calcNumberTiles(Game, 'black', Value) :-
  game_getBoard(Game, Board),
  number_of_tiles(Board, [_,1], N1), number_of_tiles(Board, [_,2], N2), NWhites is N1+N2,
  number_of_tiles(Board, [_,3], N3), number_of_tiles(Board, [_,4], N4), NBlacks is N3+N4,
  Value is NBlacks - NWhites.
calcNumberTiles(Game, 'white', Value) :-
  game_getBoard(Game, Board),
  number_of_tiles(Board, [_,1], N1), number_of_tiles(Board, [_,2], N2), NWhites is N1+N2,
  number_of_tiles(Board, [_,3], N3), number_of_tiles(Board, [_,4], N4), NBlacks is N3+N4,
  Value is NWhites - NBlacks.

calcIslands(Game, Value) :-
  game_getTurn(Game, Turn),
  calcIslands(Game, Turn, Value).
calcIslands(Game, 'black', Value) :-
  game_getBoard(Game, B),
  get_towers(B, [[X1,Y1],[X2,Y2]], 1),
  check_black_island(X1, Y1, B, I1), check_square_island(X1, Y1, B, I2),
  check_black_island(X2, Y2, B, I3), check_square_island(X2, Y2, B, I4),
  append(I1, I2, Temp1), append(I3, I4, Temp2), append(Temp1, Temp2, Temp3),
  list_remove_dups(Temp3, Final),
  get_list_size(Final, NTotal),
  number_of_tiles(Board, [_,3], N1), number_of_tiles(Board, [_,4], N2),
  NBlacks is N1+N2,
  Value is NTotal - NBlacks.
calcIslands(Game, 'white', Value) :-
  game_getBoard(Game, B),
  get_towers(B, [[X1,Y1],[X2,Y2]], 2),
  check_white_island(X1, Y1, B, I1), check_round_island(X1, Y1, B, I2),
  check_white_island(X2, Y2, B, I3), check_round_island(X2, Y2, B, I4),
  append(I1, I2, Temp1), append(I3, I4, Temp2), append(Temp1, Temp2, Temp3),
  list_remove_dups(Temp3, Final),
  get_list_size(Final, NTotal),
  number_of_tiles(Board, [_,1], N1), number_of_tiles(Board, [_,2], N2),
  NWhites is N1+N2,
  Value is NTotal - NWhites.
