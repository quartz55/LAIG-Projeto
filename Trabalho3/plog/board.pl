:- use_module(library(random)).

test_board([
            [[0,0],[0,3],[0,0],[0,0],[0,0],[0,0],[0,0]],
            [[0,2],[0,2],[0,0],[0,0],[0,0],[0,0],[0,0]],
            [[0,1],[0,3],[0,2],[0,0],[0,0],[0,0],[0,0]],
            [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
            [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
            [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
            [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]]
           ]).

display_board(Board) :-
  write(' '), nl,
  write('    '), display_collums(0, Board), nl,
  display_board_aux(Board, 0).

display_board_aux([X|Xs], N) :-
  N1 is N + 1,
  write(N), write(' '),
  display_line(X), nl,
  display_board_aux(Xs, N1).
display_board_aux([], _).

display_line([X|Xs]) :-
  display_cell(X),
  display_line(Xs).
display_line([]).

% (   ) - Round        1/3
% [   ] - Square       2/4
%  ###  - White        1/2
%       - Black        3/4
display_cell([_,0]) :- write('     ').
display_cell([T,1]) :- write('(#'), display_tower(T), write('#)').
display_cell([T,2]) :- write('[#'), display_tower(T), write('#]').
display_cell([T,3]) :- write('( '), display_tower(T), write(' )').
display_cell([T,4]) :- write('[ '), display_tower(T), write(' ]').

display_tower(0) :- write(' ').
display_tower(1) :- write('I').
display_tower(2) :- write('O').

display_collums(N, B) :- get_matrix_size(B, N1), N >= N1.
display_collums(N, B) :-
  write(N), write('    '),
  N1 is N + 1,
  display_collums(N1, B).

% ------------------------- End Display

% Board utils

number_of_tiles(Board, N) :-
  number_of_tiles(Board, _, N).
number_of_tiles(Board, Tile, N) :-
  number_of_tiles(Board, Tile, 0, N).
number_of_tiles([], _, Total, Total).
number_of_tiles([H|T], Tile, N, Total) :-
  number_of_tiles_line(H, Tile, NLine),
  N1 is N + NLine,
  number_of_tiles(T, Tile, N1, Total).

number_of_tiles_line([], _, 0).
number_of_tiles_line([Curr|T], Tile, N) :-
  (\+ Curr \= [_,0] ; Curr \= Tile),
  number_of_tiles_line(T, Tile, N).
number_of_tiles_line([Curr|T], Tile, N) :-
  \+ Curr \= Tile,
  number_of_tiles_line(T, Tile, N1),
  N is N1 + 1.


% Board manipulation

set_tower(X, Y, Board, Tower, NewBoard) :-
  get_tile(X, Y, Board, Tile),
  set_matrix_elem(X, Y, Board, [Tower,Tile], NewBoard).

get_tower(X, Y, Board, Tower) :-
  get_matrix_elem(X, Y, Board, [Tower,_]).

set_tile(X, Y, Board, Tile, NewBoard) :-
  get_tower(X, Y, Board, Tower),
  set_matrix_elem(X, Y, Board, [Tower,Tile], NewBoard).

get_tile(X, Y, Board, Tile) :-
  get_matrix_elem(X, Y, Board, [_,Tile]).

% Matrix manipulation

get_matrix_size([], 0).
get_matrix_size([_|Xs], Size) :-
  get_matrix_size(Xs, N),
  Size is N + 1.

gen_matrix(Elem, Size, Matrix) :-
  gen_matrix(Elem, Size, 0, Matrix).

gen_matrix(_, Size, Size, []).
gen_matrix(Elem, Size, N, [List|Xs]) :-
  N < Size,
  N1 is N + 1,
  gen_list(Elem, Size, List),
  gen_matrix(Elem, Size, N1, Xs).

get_matrix_elem(X, 0, [H|_], Elem) :-
  get_list_elem(X, H, Elem).
get_matrix_elem(X, Y, [_|Xs], Elem) :-
  X >= 0, Y > 0,
  Y1 is Y - 1,
  get_matrix_elem(X, Y1, Xs, Elem).

set_matrix_elem(X, 0, [H|T], Elem, [List|T]) :-
  set_list_elem(X, H, Elem, List).
set_matrix_elem(X, Y, [H|T], Elem, [H|Xs]) :-
  X >= 0, Y > 0,
  Y1 is Y - 1,
  set_matrix_elem(X, Y1, T, Elem, Xs).

% List manipulation

get_list_last([H|[]], H).
get_list_last([_|T], H) :- get_list_last(T, H).

get_list_size([], 0).
get_list_size([_|T], Size) :-
  get_list_size(T, N),
  Size is N + 1.

gen_list(_,0,[]).
gen_list(Elem,N,[Elem|L]) :-
  N > 0,
  N1 is N - 1,
  gen_list(Elem,N1,L).

get_list_elem(0, [H|_], H).
get_list_elem(Pos, [_|T], Elem) :-
  Pos1 is Pos - 1,
  get_list_elem(Pos1, T, Elem).

set_list_elem(0, [_|T], Elem, [Elem|T]).
set_list_elem(Pos, [H|T], Elem, [H|Xs]) :-
  Pos > 0,
  Pos1 is Pos - 1,
  set_list_elem(Pos1, T, Elem, Xs).

list_remove_dups([], []).
list_remove_dups([H|T], [H|T1]) :- subtract(T, [H], T2), list_remove_dups(T2, T1).

% Board generation

gen_empty_major(Board) :- gen_matrix([0,0], 7, Board).
gen_empty_minor(Board) :- gen_matrix([0,0], 5, Board).

gen_major(Board) :- gen_empty_major(B1), gen_major1(B1, Board).
gen_minor(Board) :- gen_empty_minor(B1), gen_minor1(B1, Board).

gen_major1(Board, NewBoard) :-
  random(1, 4, R),
  set_tile(2, 3, Board, R, B1), place_even_tile(4, 3, R, B1, B2),
  gen_major3(B2, NewBoard).
gen_major3(Board, NewBoard) :-
  random(1, 4, R),
  set_tile(1, 3, Board, R, B1), place_even_tile(5, 3, R, B1, B2),
  gen_major5(B2, NewBoard).
gen_major5(Board, NewBoard) :-
  random(1, 4, R),
  set_tile(0, 3, Board, R, B1), place_even_tile(6, 3, R, B1, B2),
  gen_major7(B2, NewBoard).
gen_major7(Board, NewBoard) :-
  random(1, 4, R),
  set_tile(0, 2, Board, R, B1), place_even_tile(6, 4, R, B1, B2),
  gen_major9(B2, NewBoard).
gen_major9(Board, NewBoard) :-
  random(1, 4, R),
  set_tile(1, 2, Board, R, B1), place_even_tile(5, 4, R, B1, B2),
  gen_major11(B2, NewBoard).
gen_major11(Board, NewBoard) :-
  random(1, 4, R),
  set_tile(2, 2, Board, R, B1), place_even_tile(4, 4, R, B1, B2),
  gen_major13(B2, NewBoard).
gen_major13(Board, NewBoard) :-
  random(1, 4, R),
  set_tile(3, 2, Board, R, B1), place_even_tile(3, 4, R, B1, B2),
  gen_major15(B2, NewBoard).
gen_major15(Board, NewBoard) :-
  random(1, 4, R),
  set_tile(4, 2, Board, R, B1), place_even_tile(2, 4, R, B1, B2),
  gen_major17(B2, NewBoard).
gen_major17(Board, NewBoard) :-
  random(1, 4, R),
  set_tile(5, 2, Board, R, B1), place_even_tile(1, 4, R, B1, B2),
  gen_major19(B2, NewBoard).
gen_major19(Board, NewBoard) :-
  random(1, 4, R),
  set_tile(6, 2, Board, R, B1), place_even_tile(0, 4, R, B1, B2),
  gen_major21(B2, NewBoard).
gen_major21(Board, NewBoard) :-
  random(1, 4, R),
  set_tile(5, 1, Board, R, B1), place_even_tile(1, 5, R, B1, B2),
  gen_major23(B2, NewBoard).
gen_major23(Board, NewBoard) :-
  random(1, 4, R),
  set_tile(4, 1, Board, R, B1), place_even_tile(2, 5, R, B1, B2),
  gen_major25(B2, NewBoard).
gen_major25(Board, NewBoard) :-
  random(1, 4, R),
  set_tile(3, 1, Board, R, B1), place_even_tile(3, 5, R, B1, B2),
  gen_major27(B2, NewBoard).
gen_major27(Board, NewBoard) :-
  random(1, 4, R),
  set_tile(2, 1, Board, R, B1), place_even_tile(4, 5, R, B1, B2),
  gen_major29(B2, NewBoard).
gen_major29(Board, NewBoard) :-
  random(1, 4, R),
  set_tile(1, 1, Board, R, B1), place_even_tile(5, 5, R, B1, B2),
  gen_major31(B2, NewBoard).
gen_major31(Board, NewBoard) :-
  random(1, 4, R),
  set_tile(2, 0, Board, R, B1), place_even_tile(4, 6, R, B1, B2),
  gen_major33(B2, NewBoard).
gen_major33(Board, NewBoard) :-
  random(1, 4, R),
  set_tile(3, 0, Board, R, B1), place_even_tile(3, 6, R, B1, B2),
  gen_major35(B2, NewBoard).
gen_major35(Board, NewBoard) :-
  random(1, 4, R),
  set_tile(4, 0, Board, R, B1), place_even_tile(2, 6, R, B1, NewBoard).

% Minor
gen_minor1(Board, NewBoard) :-
  random(1, 4, R),
  set_tile(1, 2, Board, R, B1), place_even_tile(3, 2, R, B1, B2),
  gen_minor3(B2, NewBoard).
gen_minor3(Board, NewBoard) :-
  random(1, 4, R),
  set_tile(0, 2, Board, R, B1), place_even_tile(4, 2, R, B1, B2),
  gen_minor5(B2, NewBoard).
gen_minor5(Board, NewBoard) :-
  random(1, 4, R),
  set_tile(0, 1, Board, R, B1), place_even_tile(4, 3, R, B1, B2),
  gen_minor7(B2, NewBoard).
gen_minor7(Board, NewBoard) :-
  random(1, 4, R),
  set_tile(1, 1, Board, R, B1), place_even_tile(3, 3, R, B1, B2),
  gen_minor9(B2, NewBoard).
gen_minor9(Board, NewBoard) :-
  random(1, 4, R),
  set_tile(2, 1, Board, R, B1), place_even_tile(2, 3, R, B1, B2),
  gen_minor11(B2, NewBoard).
gen_minor11(Board, NewBoard) :-
  random(1, 4, R),
  set_tile(3, 1, Board, R, B1), place_even_tile(1, 3, R, B1, B2),
  gen_minor13(B2, NewBoard).
gen_minor13(Board, NewBoard) :-
  random(1, 4, R),
  set_tile(3, 0, Board, R, B1), place_even_tile(1, 4, R, B1, B2),
  gen_minor15(B2, NewBoard).
gen_minor15(Board, NewBoard) :-
  random(1, 4, R),
  set_tile(2, 0, Board, R, B1), place_even_tile(2, 4, R, B1, NewBoard).

place_even_tile(X, Y, 0, Board, NewBoard) :- set_tile(X, Y, Board, 0, NewBoard).
place_even_tile(X, Y, 1, Board, NewBoard) :- set_tile(X, Y, Board, 4, NewBoard).
place_even_tile(X, Y, 2, Board, NewBoard) :- set_tile(X, Y, Board, 3, NewBoard).
place_even_tile(X, Y, 3, Board, NewBoard) :- set_tile(X, Y, Board, 2, NewBoard).
place_even_tile(X, Y, 4, Board, NewBoard) :- set_tile(X, Y, Board, 1, NewBoard).
