#pragma strict

static class PieceValidMoves
{
	private static var BlackAttackBoard : boolean[];
	private static var blackKingPosition : byte;

	private static var WhiteAttackBoard : boolean[];
	private static var whiteKingPosition : byte;

	private static function AnalyzeMovePawn(board : BoardEV, dstPos : byte, pcMoving : PieceEV)
	{
	    var pcAttacked : PieceEV = board.pieces[dstPos];

	    //If there no piece there I can potentialy kill
	    if (pcAttacked == null)
	        return;

	    //Regardless of what is there I am attacking this square
	    if (!pcMoving.Black)
	    {
	        WhiteAttackBoard[dstPos] = true;

	        // if that piece is the same color
	        if (pcAttacked.Black == pcMoving.Black)
	        {
	            pcAttacked.DefendedValue += pcMoving.PieceActionValue;
	            return;
	        }

	        pcAttacked.AttackedValue += pcMoving.PieceActionValue;

	        //If this is a king set it in check                   
	        if (pcAttacked.type == PieceEV.PIECE_KING)
	        {
	            board.BlackCheck = true;
	            // NYI - still add move
	            pcMoving.ValidMoves.Push(dstPos);
	        }
	        else
	        {
	            //Add this as a valid move
	            pcMoving.ValidMoves.Push(dstPos);
	        }
	    }
	    else
	    {
	        BlackAttackBoard[dstPos] = true;

	        //if that piece is the same color
	        if (pcAttacked.Black == pcMoving.Black)
	        {
	            pcAttacked.DefendedValue += pcMoving.PieceActionValue;
	            return;
	        }

	        pcAttacked.AttackedValue += pcMoving.PieceActionValue;

	        //If this is a king set it in check                   
	        if (pcAttacked.type == PieceEV.PIECE_KING)
	        {
	            board.WhiteCheck = true;
	            // NYI - still add move
	            pcMoving.ValidMoves.Push(dstPos);
	        }
	        else
	        {
	            //Add this as a valid move
	            pcMoving.ValidMoves.Push(dstPos);
	        }
	    }

	    return;
	}

	private static function AnalyzeMove(board : BoardEV, dstPos : byte, pcMoving : PieceEV) : boolean
	{
	    //If I am not a pawn everywhere I move I can attack
	    if (!pcMoving.Black)
	    {
	        WhiteAttackBoard[dstPos] = true;
	    }
	    else
	    {
	        BlackAttackBoard[dstPos] = true;
	    }

	    //If there no piece there I can potentialy kill just add the move and exit
	    if (board.pieces[dstPos] == null)
	    {
	        pcMoving.ValidMoves.Push(dstPos);

	        return true;
	    }

	    var pcAttacked : PieceEV = board.pieces[dstPos];

	    //if that piece is a different color
	    if (pcAttacked.Black != pcMoving.Black)
	    {
	        pcAttacked.AttackedValue += pcMoving.PieceActionValue;

	        //If this is a king set it in check                   
	        if (pcAttacked.type == PieceEV.PIECE_KING)
	        {
	            if (pcAttacked.Black)
	            {
	                board.BlackCheck = true;
	            }
	            else
	            {
	                board.WhiteCheck = true;
	            }
	            
	            // NYI - still add move
	            pcMoving.ValidMoves.Push(dstPos);
	        }
	        else
	        {
	            //Add this as a valid move
	            pcMoving.ValidMoves.Push(dstPos);
	        }


	        //We don't continue movement past this piece
	        return false;
	    }
	    //Same Color I am defending
	    pcAttacked.DefendedValue += pcMoving.PieceActionValue;

	    //Since this piece is of my kind I can't move there
	    return false;
	}

	private static function CheckValidMovesPawn(moves : System.Collections.Generic.List.<byte>, 
											pcMoving : PieceEV, srcPosition : byte,
	                                        board : BoardEV, count : byte)
	{
		var i : int;
	    for (i = 0; i < count; i++)
	    {
	        var dstPos : byte = moves[i];

	        if (dstPos%8 != srcPosition%8)
	        {
	            //If there is a piece there I can potentialy kill
	            AnalyzeMovePawn(board, dstPos, pcMoving);

	            if (!pcMoving.Black)
	            {
	                WhiteAttackBoard[dstPos] = true;
	            }
	            else
	            {
	                BlackAttackBoard[dstPos] = true;
	            }
	        }
	            // if there is something if front pawns can't move there
	        else if (board.pieces[dstPos] != null)
	        {
	            return;
	        }
	            //if there is nothing in front of me (blocked == false)
	        else
	        {
	            pcMoving.ValidMoves.Push(dstPos);
	        }
	    }
	}

	private static function GenerateValidMovesKing(piece : PieceEV, board : BoardEV, srcPosition : byte)
	{
	    if (piece == null)
	    {
	        return;
	    }

		var i : byte;
	    for (i = 0; i < MoveArrays.KingTotalMoves[srcPosition]; i++)
	    {
	        var dstPos : byte = MoveArrays.KingMoves[srcPosition].Moves[i];

	        if (!piece.Black)
	        {
	            //I can't move where I am being attacked
	            if (BlackAttackBoard[dstPos])
	            {
	                WhiteAttackBoard[dstPos] = true;
	                continue;
	            }
	        }
	        else
	        {
	            if (WhiteAttackBoard[dstPos])
	            {
	                BlackAttackBoard[dstPos] = true;
	                continue;
	            }
	        }

	        AnalyzeMove(board, dstPos, piece);
	    }
	}

	internal static function GenerateValidMoves(board : BoardEV)
	{
	    // Reset Board
	    board.BlackCheck = false;
	    board.WhiteCheck = false;

	    WhiteAttackBoard = new boolean[64];
	    BlackAttackBoard = new boolean[64];

	    //Generate Moves
	    var x : byte;
	    var i : byte;
	    for (x = 0; x < 64; x++)
	    {
	        var p : PieceEV = board.pieces[x];

	        if (p == null)
	            continue;

	        p.ValidMoves = new System.Collections.Generic.Stack.<byte>();
			
	        switch (p.type)
	        {
	            case PieceEV.PIECE_NEL:
                    if (!p.Black)
                    {
                        CheckValidMovesPawn(MoveArrays.WhitePawnMoves[x].Moves, p, x,
                                            board,
                                            MoveArrays.WhitePawnTotalMoves[x]);
                        break;
                    }
                    if (p.Black)
                    {
                        CheckValidMovesPawn(MoveArrays.BlackPawnMoves[x].Moves, p, x,
                                            board,
                                            MoveArrays.BlackPawnTotalMoves[x]);
                        break;
                    }

                    break;
	            case PieceEV.PIECE_HORSE:
                    for (i = 0; i < MoveArrays.KnightTotalMoves[x]; i++)
                    {
                        AnalyzeMove(board, MoveArrays.KnightMoves[x].Moves[i], p);
                    }

                    break;
	            case PieceEV.PIECE_ELEPHANT:
                	if (!p.Black)
                	{
	                    for (i = 0; i < MoveArrays.WhiteElephantTotalMoves[x]; i++)
	                    {
	                    	AnalyzeMove(board, MoveArrays.WhiteElephantMoves[x].Moves[i], p);
	                    }
					}
                    if (p.Black)
                    {
                    	for (i = 0; i < MoveArrays.BlackElephantTotalMoves[x]; i++)
                        	AnalyzeMove(board, MoveArrays.BlackElephantMoves[x].Moves[i], p);
                    }
                    break;
                    
	            case PieceEV.PIECE_CASTLE:
	            	// for castle, we need to check all four directions
                    for (i = 0; i < MoveArrays.RookTotalMoves1[x]; i++)
                    {
                    	if (!AnalyzeMove(board, MoveArrays.RookMoves1[x].Moves[i], p))
                    		break;
                    }
                    for (i = 0; i < MoveArrays.RookTotalMoves2[x]; i++)
                    {
                    	if (!AnalyzeMove(board, MoveArrays.RookMoves2[x].Moves[i], p))
                    		break;
                    }
                    for (i = 0; i < MoveArrays.RookTotalMoves3[x]; i++)
                    {
                    	if (!AnalyzeMove(board, MoveArrays.RookMoves3[x].Moves[i], p))
                    		break;
                    }
                    for (i = 0; i < MoveArrays.RookTotalMoves4[x]; i++)
                    {
                    	if (!AnalyzeMove(board, MoveArrays.RookMoves4[x].Moves[i], p))
                    		break;
                    }
                    break;
                    
	            case PieceEV.PIECE_SITKEL:
                	for (i = 0; i < MoveArrays.SitkelTotalMoves[x]; i++)
                       	AnalyzeMove(board, MoveArrays.SitkelMoves[x].Moves[i], p);
                        	
                    break;

	            case PieceEV.PIECE_KING:
                    if (!p.Black)
                    {
                        whiteKingPosition = x;
                    }
                    else
                    {
                        blackKingPosition = x;
                    }

                    break;
	        }
	    }

	    if (!board.BlackMove)
	    {
	        GenerateValidMovesKing(board.pieces[blackKingPosition], board,
	                               blackKingPosition);
	        GenerateValidMovesKing(board.pieces[whiteKingPosition], board,
	                               whiteKingPosition);
	    }
	    else
	    {
	        GenerateValidMovesKing(board.pieces[whiteKingPosition], board,
	                               whiteKingPosition);
	        GenerateValidMovesKing(board.pieces[blackKingPosition], board,
	                               blackKingPosition);
	    } 
	}
}