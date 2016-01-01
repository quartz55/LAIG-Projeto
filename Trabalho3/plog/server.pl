:-use_module(library(sockets)).
:-use_module(library(lists)).
:-use_module(library(codesio)).

:- include('syrtis.pl').

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%                                        Server                                                   %%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

% To run, enter 'server.' on sicstus command line after consulting this file.
% You can test requests to this server by going to http://localhost:8081/<request>.
% Go to http://localhost:8081/quit to close server.

% Made by Luis Reis (ei12085@fe.up.pt) for LAIG course at FEUP.

port(8081).

% Server Entry Point
server :-
	port(Port),
	write('Opened Server'),nl,nl,
	socket_server_open(Port, Socket),
	server_loop(Socket),
	socket_server_close(Socket),
	write('Closed Server'),nl.

% Server Loop 
% Uncomment writes for more information on incomming connections
server_loop(Socket) :-
	repeat,
	socket_server_accept(Socket, _Client, Stream, [type(text)]),
		% write('Accepted connection'), nl,
	    % Parse Request
		catch((
			read_request(Stream, Request),
			read_header(Stream)
		),_Exception,(
			% write('Error parsing request.'),nl,
			close_stream(Stream),
			fail
		)),
		
		% Generate Response
		handle_request(Request, MyReply, Status),
		format('Request: ~q~n',[Request]),
		format('Reply: ~q~n', [MyReply]),
		
		% Output Response
		format(Stream, 'HTTP/1.0 ~p~n', [Status]),
		format(Stream, 'Access-Control-Allow-Origin: *~n', []),
		format(Stream, 'Content-Type: text/plain~n~n', []),
		format(Stream, '~p', [MyReply]),
	
		% write('Finnished Connection'),nl,nl,
		close_stream(Stream),
	(Request = quit), !.
	
close_stream(Stream) :- flush_output(Stream), close(Stream).

% Handles parsed HTTP requests
% Returns 200 OK on successful aplication of parse_input on request
% Returns 400 Bad Request on syntax error (received from parser) or on failure of parse_input
handle_request(Request, MyReply, '200 OK') :- catch(parse_input(Request, MyReply),error(_,_),fail), !.
handle_request(syntax_error, 'Syntax Error', '400 Bad Request') :- !.
handle_request(_, 'Bad Request', '400 Bad Request').

% Reads first Line of HTTP Header and parses request
% Returns term parsed from Request-URI
% Returns syntax_error in case of failure in parsing
read_request(Stream, Request) :-
	read_line(Stream, LineCodes),
	print_header_line(LineCodes),
	
	% Parse Request
	atom_codes('GET /',Get),
	append(Get,RL,LineCodes),
	read_request_aux(RL,RL2),	
	
	catch(read_from_codes(RL2, Request), error(syntax_error(_),_), fail), !.
read_request(_,syntax_error).
	
read_request_aux([32|_],[46]) :- !.
read_request_aux([C|Cs],[C|RCs]) :- read_request_aux(Cs, RCs).


% Reads and Ignores the rest of the lines of the HTTP Header
read_header(Stream) :-
	repeat,
	read_line(Stream, Line),
	print_header_line(Line),
	(Line = []; Line = end_of_file),!.

check_end_of_header([]) :- !, fail.
check_end_of_header(end_of_file) :- !,fail.
check_end_of_header(_).

% Function to Output Request Lines (uncomment the line bellow to see more information on received HTTP Requests)
% print_header_line(LineCodes) :- catch((atom_codes(Line,LineCodes),write(Line),nl),_,fail), !.
print_header_line(_).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%                                       Commands                                                  %%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

% Require your Prolog Files here

parse_input(handshake, handshake).
parse_input(quit, goodbye).


%%% Syrtis predicates

%%%%% Place towers
parse_input(placeBlackTower(X,Y,Board), NewBoard) :-
  place_tower(X,Y,1,Board,NewBoard).
parse_input(placeBlackTower(_,_,Board), Board).

parse_input(placeWhiteTower(X,Y,Board), NewBoard) :-
  place_tower(X,Y,2,Board,NewBoard).
parse_input(placeWhiteTower(_,_,Board), Board).


%%%%% Move towers
parse_input(moveTower(X,Y,X2,Y2,Game), NewGame) :-
  game_getBoard(Game, Board),
  get_tower(X,Y,Board,Tower),
  isValidMove([X,Y],[X2,Y2],Board,Tower),
  moveTower(X,Y,X2,Y2,Tower,Board,NewBoard),
  game_setBoard(Game, NewBoard, G1),
  game_clearPasses(G1, G2),
  game_nextTurn(G2, NewGame).
parse_input(moveTower(_,_,_,_,Game), Game).

parse_input(getValidMoves(X,Y,Game), ValidMoves) :-
  getTurnTower(Game, T),
  game_getBoard(Game, Board),
  getCurrIsland(X, Y, T, Board, Temp),
  validateMoves([X,Y], Temp, Board, T, [], ValidMoves).

%%%%% Sink tile
parse_input(sinkTile(X1,Y1,X,Y,Game), NewGame):-
  game_getBoard(Game, Board),
  getValidSinks([X1,Y1], Board, ValidSinks),
  member([X,Y], ValidSinks),
  sinkTile(X, Y, Board, NewBoard),
  game_setBoard(Game, NewBoard, G1),
  game_clearPasses(G1, G2),
  game_sink(G2, G3),
  game_nextTurn(G3, NewGame).
parse_input(sinkTile(_,_,_,_,Game), Game).

parse_input(getValidSinks(X,Y,Game), ValidSinks) :-
  game_getBoard(Game, Board),
  getValidSinks([X,Y], Board, ValidSinks).

%%%%% Pass turn
parse_input(passTurn(Game), NewGame) :- pass(Game, NewGame).

%%%%% Setup
parse_input(createMajorGame, G) :- createPvPgame(G, 'major').
parse_input(createMinorGame, G) :- createPvPgame(G, 'minor').

%%%%% Utils
parse_input(getPlayerTower(X,Y,Game), Tower) :-
  getTurnTower(Game, Tower),
  game_getBoard(Game, Board),
  get_tower(X,Y,Board,T), T =:= Tower.
parse_input(getPlayerTower(_,_,_), 0).

getTurnTower(Game, T) :-
  game_getTurn(Game, Turn),
  (
    Turn = 'white' -> T = 2;
    Turn = 'black' -> T = 1
  ).

validateMoves(_, [], _, _, Valid, Valid).
validateMoves(Pos, [Move|T], Board, Tower, Acc, Valid) :-
  isValidMove(Pos, Move, Board, Tower),
  append(Acc, [Move], Acc1),
  validateMoves(Pos, T, Board, Tower, Acc1, Valid).
validateMoves(Pos, [_|T], Board, Tower, Acc, Valid) :-
  validateMoves(Pos, T, Board, Tower, Acc, Valid).