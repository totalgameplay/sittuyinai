#pragma strict

class Position
{
	var SrcPosition : int;
	var DstPosition : int;
	var Score : int;
}

class BoardEV
{
	public var pieces : Array;
	public var TotalScore : int;
	public var BlackMove : boolean;
	
	public var StaleMate : boolean;
	public var FiftyMoveCount : int;
	public var RepeatedMoveCount : int;
	public var MoveCount : int;
	
	public var BlackMate : boolean;
	public var WhiteMate : boolean;
	public var BlackCheck : boolean;
	public var WhiteCheck : boolean;
	public var EndGamePhase : boolean;
	public var InsufficientMaterial : boolean;
	
	public static var AIBoardValue : int;
	public static var MaxAIDepth : int;
	public static var AISrcPos : byte;
	public static var AIDestPos : byte;
	
	private var whitePawnCount : short[];
	private var blackPawnCount : short[];
	
	function BoardEV()
	{
		pieces = new Array(64);
	}
	
	// Copy the board
	function FastCopy() : BoardEV
	{
		var board : BoardEV = new BoardEV();
		
		board.pieces = new Array(64);
		var x : int;
		for (x = 0; x < 64; x++)
		{
			if (pieces[x] != null)
				board.pieces[x] = new PieceEV(pieces[x]);
		}
		
		board.EndGamePhase = EndGamePhase;
		board.BlackMove = BlackMove;
		board.MoveCount = MoveCount;
		board.FiftyMoveCount = FiftyMoveCount;
		
		return board;
	}

	// evaluate a single piece on the board and return score
	private function EvaluatePieceScore(p : PieceEV, position : int) : int
	{
		var score : int = 0;
		var PieceScore : int;
		var index : int = position;
		if (p.Black)
		{
		 	index = 63-position;
		}
		
		score += p.PieceValue;
		score += p.DefendedValue;
		score += p.AttackedValue;
		
		if (p.ValidMoves != null)
		{
			score += p.ValidMoves.Count;
		}
		
		if (p.type == PieceEV.PIECE_NEL)
		{
			if (position % 8 == 0 || position % 8 == 7)
			{
				//Rook Pawns are worth 15% less because they can only attack one way
				score -= 15;
			}
			
			//Calculate Position Values
			PieceScore = SquareScoreEV.PawnTable[index];
			score += PieceScore;
			
			if (!p.Black)
			{
				if (whitePawnCount[position % 8] > 0)
				{
					//Doubled Pawn
					score -= 16;
				}
				whitePawnCount[position % 8]+=10;
			}
			else
			{
				if (blackPawnCount[position % 8] > 0)
				{
					//Doubled Pawn
					score -= 16;
				}
				blackPawnCount[position % 8] += 10;
			}
		}
		if (p.type == PieceEV.PIECE_SITKEL)
		{
			PieceScore = SquareScoreEV.SitKelTable[index];
			score += PieceScore;
		}
		if (p.type == PieceEV.PIECE_ELEPHANT)
		{
			PieceScore = SquareScoreEV.ElephantTable[index];
			score += PieceScore;
		}
		if (p.type == PieceEV.PIECE_HORSE)
		{
			PieceScore = SquareScoreEV.KnightTable[index];
			score += PieceScore;
		}
		if (p.type == PieceEV.PIECE_CASTLE)
		{
			//In the end game add a few points for Knights since they are worthy
			if (EndGamePhase)
			{
				score += 20;
			}
		}
		if (p.type == PieceEV.PIECE_KING)
		{
			// different score for start and end game
			if (EndGamePhase)
				PieceScore = SquareScoreEV.KingTableEndGame[index];
			else
				PieceScore = SquareScoreEV.KingTable[index];
				
			score += PieceScore;
		}
		
		//Double Penalty for Hanging Pieces
		if (p.DefendedValue < p.AttackedValue)
		{
			score -= ((p.AttackedValue - p.DefendedValue)* 10);
		}
		
		// We will also add score for mobility. NYI!
		
		return score;
	}
	
	// evaluate the total score of the current board
	function EvaluateBoardScore()
	{
		TotalScore = 0;
		var insufficientMaterial : boolean = true;
		var remainingPieces : int = 0;
		
		blackPawnCount = new short[8];
		whitePawnCount = new short[8];

		// stop calculating in stale mode				
		if (StaleMate)
		    return;
		if (FiftyMoveCount >= 50)
		    return;
		if (RepeatedMoveCount >= 3)
		    return;
		    
		if (BlackMate)
		{
			 TotalScore = 32767;
			 return;
		}
		if (WhiteMate)
		{
			 TotalScore = -32767;
			 return;
		}
		if (BlackCheck)
		{
			 TotalScore += 75;
			 if (EndGamePhase)
			  	TotalScore += 10;
		}
		else if (WhiteCheck)
		{
			 TotalScore -= 75;
			 if (EndGamePhase)
			  	TotalScore -= 10;
		}

		//Add a small bonus for tempo (turn)
		if (!BlackMove)
		{
		 	TotalScore += 10;
		}
		else
		{
		 	TotalScore -= 10;
		}
		
		var blackBishopCount : int = 0;
		var whiteBishopCount : int = 0;
		var knightCount : int = 0;
		var RemainingPieces : int = 0;
		
		var x : int;
		for (x = 0; x < 64; x++)
		{
			 var p : PieceEV = pieces[x];
			 if (p == null)
			  	continue;

			 //Calculate Remaining Material for end game determination
			 remainingPieces++;

			 if (!p.Black)
			 {
			 	TotalScore += EvaluatePieceScore(p, x);
			 }
			 else if (p.Black)
			 {
			  	TotalScore -= EvaluatePieceScore(p, x);
			 }

			 // calculate the insufficient material
			 if (p.type == PieceEV.PIECE_ELEPHANT)
			 {
			 	if (p.Black)
			 		blackBishopCount++;
			 	else
			 		whiteBishopCount++;
			 }
			 if (p.type == PieceEV.PIECE_HORSE)
			 {
				knightCount++;

				if (knightCount > 1)
					insufficientMaterial = false;
			 }

			 if ((blackBishopCount + whiteBishopCount) > 1)
			 {
				insufficientMaterial = false;
			 }
		}
		
		if (insufficientMaterial)
		{
			TotalScore = 0;
			StaleMate = true;
			InsufficientMaterial = true;
			return;
		}
		if (remainingPieces < 10)
		{
			EndGamePhase = true;

			if (BlackCheck)
				TotalScore += 10;
			else if (WhiteCheck)
				TotalScore -= 10;
		}
		
		//Black Isolated Pawns
		if (blackPawnCount[0] >= 1 && blackPawnCount[1] == 0)
		{
			TotalScore += 12;
		}
		if (blackPawnCount[1] >= 1 && blackPawnCount[0] == 0 &&
		    blackPawnCount[2] == 0)
		{
			TotalScore += 14;
		}
		if (blackPawnCount[2] >= 1 && blackPawnCount[1] == 0 &&
		    blackPawnCount[3] == 0)
		{
			TotalScore += 16;
		}
		if (blackPawnCount[3] >= 1 && blackPawnCount[2] == 0 &&
		    blackPawnCount[4] == 0)
		{
			TotalScore += 20;
		}
		if (blackPawnCount[4] >= 1 && blackPawnCount[3] == 0 &&
		    blackPawnCount[5] == 0)
		{
			TotalScore += 20;
		}
		if (blackPawnCount[5] >= 1 && blackPawnCount[4] == 0 &&
		    blackPawnCount[6] == 0)
		{
			TotalScore += 16;
		}
		if (blackPawnCount[6] >= 1 && blackPawnCount[5] == 0 &&
		    blackPawnCount[7] == 0)
		{
			TotalScore += 14;
		}
		if (blackPawnCount[7] >= 1 && blackPawnCount[6] == 0)
		{
			TotalScore += 12;
		}
		//White Isolated Pawns
		if (whitePawnCount[0] >= 1 && whitePawnCount[1] == 0)
		{
			TotalScore -= 12;
		}
		if (whitePawnCount[1] >= 1 && whitePawnCount[0] == 0 &&
		    whitePawnCount[2] == 0)
		{
			TotalScore -= 14;
		}
		if (whitePawnCount[2] >= 1 && whitePawnCount[1] == 0 &&
		    whitePawnCount[3] == 0)
		{
			TotalScore -= 16;
		}
		if (whitePawnCount[3] >= 1 && whitePawnCount[2] == 0 &&
		    whitePawnCount[4] == 0)
		{
			TotalScore -= 20;
		}
		if (whitePawnCount[4] >= 1 && whitePawnCount[3] == 0 &&
		    whitePawnCount[5] == 0)
		{
			TotalScore -= 20;
		}
		if (whitePawnCount[5] >= 1 && whitePawnCount[4] == 0 &&
		    whitePawnCount[6] == 0)
		{
			TotalScore -= 16;
		}
		if (whitePawnCount[6] >= 1 && whitePawnCount[5] == 0 &&
		    whitePawnCount[7] == 0)
		{
			TotalScore -= 14;
		}
		if (whitePawnCount[7] >= 1 && whitePawnCount[6] == 0)
		{
			TotalScore -= 12;
		}
		
		//Black Passed Pawns
		if (blackPawnCount[0] >= 1 && whitePawnCount[0] == 0)
		{
			TotalScore -= blackPawnCount[0];
		}
		if (blackPawnCount[1] >= 1 && whitePawnCount[1] == 0)
		{
			TotalScore -= blackPawnCount[1];
		}
		if (blackPawnCount[2] >= 1 && whitePawnCount[2] == 0)
		{
			TotalScore -= blackPawnCount[2];
		}
		if (blackPawnCount[3] >= 1 && whitePawnCount[3] == 0)
		{
			TotalScore -= blackPawnCount[3];
		}
		if (blackPawnCount[4] >= 1 && whitePawnCount[4] == 0)
		{
			TotalScore -= blackPawnCount[4];
		}
		if (blackPawnCount[5] >= 1 && whitePawnCount[5] == 0)
		{
			TotalScore -= blackPawnCount[5];
		}
		if (blackPawnCount[6] >= 1 && whitePawnCount[6] == 0)
		{
			TotalScore -= blackPawnCount[6];
		}
		if (blackPawnCount[7] >= 1 && whitePawnCount[7] == 0)
		{
			TotalScore -= blackPawnCount[7];
		}
		
		//White Passed Pawns
		if (whitePawnCount[0] >= 1 && blackPawnCount[1] == 0)
		{
			TotalScore += whitePawnCount[0];
		}
		if (whitePawnCount[1] >= 1 && blackPawnCount[1] == 0)
		{
			TotalScore += whitePawnCount[1];
		}
		if (whitePawnCount[2] >= 1 && blackPawnCount[2] == 0)
		{
			TotalScore += whitePawnCount[2];
		}
		if (whitePawnCount[3] >= 1 && blackPawnCount[3] == 0)
		{
			TotalScore += whitePawnCount[3];
		}
		if (whitePawnCount[4] >= 1 && blackPawnCount[4] == 0)
		{
			TotalScore += whitePawnCount[4];
		}
		if (whitePawnCount[5] >= 1 && blackPawnCount[5] == 0)
		{
			TotalScore += whitePawnCount[5];
		}
		if (whitePawnCount[6] >= 1 && blackPawnCount[6] == 0)
		{
			TotalScore += whitePawnCount[6];
		}
		if (whitePawnCount[7] >= 1 && blackPawnCount[7] == 0)
		{
			TotalScore += whitePawnCount[7];
		}
	}
	
	function SearchForMate() : boolean
	{
		BlackMate = false;
		WhiteMate = false;
		StaleMate = false;
		var foundNonCheckBlack : boolean = false;
		var foundNonCheckWhite : boolean = false;
		
		var x : int;
		for (x = 0; x < 64; x++)
		{
			var p : PieceEV = pieces[x];

			//Make sure there is a piece on the square
			if (p == null)
				continue;

			//Make sure the color is the same color as the one we are moving.
			if (p.Black != BlackMove)
				continue;

			//For each valid move for this piece
			for each (var dst : byte in p.ValidMoves)
			{
				// We make copies of the board and move so we don't change the original
				var board : BoardEV = FastCopy();

				//Make move so we can examine it
				board.MovePiece(x, dst);

				//We Generate Valid Moves for Board
				PieceValidMoves.GenerateValidMoves(board);

				if (board.BlackCheck == false)
				{
					foundNonCheckBlack = true;
				}
				else if (BlackMove)
				{
					continue;
				}

				if (board.WhiteCheck == false)
				{
					foundNonCheckWhite = true;
				}
				else if (!BlackMove)
				{
					continue;
				}
			}
		}

		if (foundNonCheckBlack == false)
		{
			if (BlackCheck)
			{
				BlackMate = true;
				return true;
			}
			if (!WhiteMate && BlackMove)
			{
				StaleMate = true;
				return true;
			}
		}

		if (foundNonCheckWhite == false)
		{
			if (WhiteCheck)
			{
				WhiteMate = true;
				return true;
			}
			if (!BlackMate && !BlackMove)
			{
				StaleMate = true;
				return true;
			}
		}

		return false;
	}

	// sort score function	
	private static function SortFunc(s2 : Position, s1 : Position)
	{
		return (s1.Score).CompareTo(s2.Score);
	}
	
	// evaluate the score of each move
	private function EvaluateMoves()  : System.Collections.Generic.List.<Position>
	{
		//We are going to store our result boards here           
		var positions : System.Collections.Generic.List.<Position> = new System.Collections.Generic.List.<Position>();

		var x : int;
		for (x = 0; x < 64; x++)
		{
			var p : PieceEV = pieces[x];

			//Make sure there is a piece on the square
			if (p == null)
				continue;

			//Make sure the color is the same color as the one we are moving.
			if (p.Black != BlackMove)
				continue;

			var move : Position;
			//For each valid move for this piece
			for each (var dst : byte in p.ValidMoves)
			{
				move = new Position();

				move.SrcPosition = x;
				move.DstPosition = dst;

				var pieceAttacked : PieceEV = pieces[move.DstPosition];

				//If the move is a capture add it's value to the score
				if (pieceAttacked != null)
				{
					move.Score += pieceAttacked.PieceValue;

					if (p.PieceValue < pieceAttacked.PieceValue)
					{
						move.Score += pieceAttacked.PieceValue - p.PieceValue;
						
						if (p.Black != pieceAttacked.Black)
							// we need to add expontential incentive
							move.Score += (pieceAttacked.PieceValue - p.PieceValue) * 10;
					}
				}

				move.Score += p.PieceActionValue;
				
				positions.Add(move);
			}
			
			// check whether we can promote to sitkel
			if (CanPromoteSitkel(p, x))
			{
				move = new Position();

				move.SrcPosition = x;
				move.DstPosition = 128;		// sit-kel promotion code
				move.Score = 180;			// original sitkel is more precious
				positions.Add(move);
			}
		}
		
		return positions;
	}
	
	// check whether a piece can promote to sitkel
	internal function CanPromoteSitkel(p : PieceEV, srcPosition : byte)
	{
		if (p.type != PieceEV.PIECE_NEL)
			return false;
			
		// check whether there is still sitkel
		for (var tp : PieceEV in pieces)
		{
			if (tp != null)
			{
				if (tp.Black == p.Black &&
					tp.type == PieceEV.PIECE_SITKEL)
					return false;
			}
		}
			
		var ix : int = srcPosition % 8;
		var iy : int = srcPosition / 8;
		
		// check for sit-kel line
		if (p.Black)
		{
			if ((ix == 4 && iy == 4) || (ix == 3 && iy == 4) ||
				(ix == 5 && iy == 5) || (ix == 2 && iy == 5) ||
				(ix == 6 && iy == 6) || (ix == 1 && iy == 6) ||
				(ix == 7 && iy == 7) || (ix == 0 && iy == 7))
				return true;
		}
		else
		{
			if ((ix == 4 && iy == 3) || (ix == 3 && iy == 3) ||
				(ix == 5 && iy == 2) || (ix == 2 && iy == 2) ||
				(ix == 6 && iy == 1) || (ix == 1 && iy == 1) ||
				(ix == 7 && iy == 0) || (ix == 0 && iy == 0))
				return true;
		}
		
		return false;
	}
	
	internal function MovePiece(srcPosition : byte, dstPosition : byte)
	{
		var piece : PieceEV = pieces[srcPosition];
		if (piece == null)
			return;

		//Add One to FiftyMoveCount to check for tie.
		FiftyMoveCount++;

		if (piece.Black)
			MoveCount++;
			
		if (dstPosition == 128)		// sitkel promote
		{
			// convert to sitkel value
			piece.type = PieceEV.PIECE_SITKEL;
			piece.PieceActionValue = 5;
			piece.PieceValue = 220;
			piece.DefendedValue = 0;
			piece.AttackedValue = 0;
			
			piece.Moved = true;
		}
		else
		{
			//Delete the piece in its source position
			pieces[srcPosition] = null;

			//Add the piece to its new position
			piece.Moved = true;
			pieces[dstPosition] = piece;
		}

		BlackMove = !BlackMove;
	
		if (FiftyMoveCount >= 50)
			StaleMate = true;
	}

	// shift score function	
	function SideToMoveScore() : int
	{
		if (BlackMove)
			return -TotalScore;
		return TotalScore;
	}

	// Alpha-Beta test function
	function AlphaBeta(depth : byte, alpha : int, beta : int, extended : boolean) : int
	{
		if (depth == 0)
		{
			if (!extended && (BlackCheck || WhiteCheck))
			{
				depth++;
				extended = true;
			}
			else
			{
				//Perform a Quiessence Search
   				return Quiescence(alpha, beta);
			}
		}
		
		var positions : System.Collections.Generic.List.<Position>;
		positions = EvaluateMoves();

		if (WhiteCheck || BlackCheck || positions.Count == 0)
		{
			if (SearchForMate())
			{
				if (BlackMate)
				{
					if (BlackMove)
						return -32767-depth;
					else
						return 32767 + depth;
				}
				if (WhiteMate)
				{
					if (BlackMove)
						return 32767 + depth;
					else
						return -32767 - depth;
				}

				//If Not Mate then StaleMate
				return 0;
			}
		} 

		positions.Sort(SortFunc);
		
		var bestScore : int = -32767; 		
		for each (var move : Position in positions)
		{
			// Make a copy
			var board : BoardEV = FastCopy();

			// Move Piece
			board.MovePiece(move.SrcPosition, move.DstPosition);

			// We Generate Valid Moves for Board
			PieceValidMoves.GenerateValidMoves(board);

			if (board.BlackCheck)
			{
				if (BlackMove)
					// Invalid Move
					continue;
			}

			if (board.WhiteCheck)
			{
				if (!BlackMove)
					// Invalid Move
					continue;
			} 

			var value : int = -board.AlphaBeta(depth-1, -beta, -alpha, extended);
			
			// select if more than AI value
			if (depth == MaxAIDepth)
			{
				if (value > AIBoardValue)
				{
					AIBoardValue = value;
					AISrcPos = move.SrcPosition;
					AIDestPos = move.DstPosition;
				}
			}
			
			if (value >= beta)
				// Beta cut-off
				return beta;
			if (value > alpha)
				alpha = value;
			
			if (value > bestScore)
			{
				bestScore = value;
			}
		}

		// return bestScore;
		return alpha;
	}
	
	private function Quiescence(alpha : int, beta : int) : int
	{
		// Evaluate Score
		EvaluateBoardScore();
		// Invert Score to support Negamax
		var Score : int = SideToMoveScore();
		if (Score >= beta)
			return beta;

		if (Score > alpha)
			alpha = Score;

		var positions : List.<Position> = EvaluateMovesQ();

		if (positions.Count == 0)
			return Score;
		
		positions.Sort(SortFunc);

		for (var move : Position in positions)
		{
			//Make a copy
			var board : BoardEV = FastCopy();

			//Move Piece
			board.MovePiece(move.SrcPosition, move.DstPosition);

			//We Generate Valid Moves for Board
			PieceValidMoves.GenerateValidMoves(board);

			if (board.BlackCheck)
			{
				if (board.BlackMove)
				{
					//Invalid Move
					continue;
				}
			}

			if (board.WhiteCheck)
			{
				if (!board.BlackMove)
				{
					//Invalid Move
					continue;
				}
			}

			var value : int = -board.Quiescence(- beta, -alpha);

			if (value >= beta)
				return beta;
			if (value > alpha)
				alpha = value;
		}
		return alpha;
	}
	
	private function EvaluateMovesQ() : List.<Position>
	{
		//We are going to store our result boards here           
		var positions : List.<Position> = new List.<Position>();
		for (var x : byte = 0; x < 64; x++)
		{
			var piece : PieceEV = pieces[x];

			// Make sure there is a piece on the square
			if (piece == null)
				continue;

			// Make sure the color is the same color as the one we are moving.
			if (piece.Black != BlackMove)
				continue;

			//For each valid move for this piece
			for (var dst : byte in piece.ValidMoves)
			{
				if (pieces[dst] == null)
					continue;

				var move : Position = new Position();

				move.SrcPosition = x;
				move.DstPosition = dst; 

				var pieceAttacked : PieceEV = pieces[move.DstPosition];

				move.Score += pieceAttacked.PieceValue;

				if (piece.PieceValue < pieceAttacked.PieceValue)
				{
					move.Score += pieceAttacked.PieceValue - piece.PieceValue;
				}

				move.Score += piece.PieceActionValue;

				// add to position
				positions.Add(move);
			}
		}

		return positions;
	}
	
	// evaluate the current board
	function EvaluateBoard()
	{
		var positions : System.Collections.Generic.List.<Position>;
		PieceValidMoves.GenerateValidMoves(this);
		positions = EvaluateMoves();

		if (WhiteCheck || BlackCheck || positions.Count == 0)
		{
			if (SearchForMate())
			{
				if (BlackMate)
					return;
				if (WhiteMate)
					return;
			}
		} 	
	}
}
