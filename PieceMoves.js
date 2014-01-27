import System.Collections.Generic;

class PieceMoveSet
{
	var Moves : List.<byte>;

	function PieceMoveSet()
	{
		Moves = new List.<byte>();
	}	
}

class MoveArrays
{
	public static var BlackElephantMoves : PieceMoveSet[];
	public static var BlackElephantTotalMoves : byte[];

	public static var WhiteElephantMoves : PieceMoveSet[];
	public static var WhiteElephantTotalMoves : byte[];

	public static var BlackPawnMoves : PieceMoveSet[];
	public static var BlackPawnTotalMoves : byte[];

	public static var WhitePawnMoves : PieceMoveSet[];
	public static var WhitePawnTotalMoves : byte[];

	public static var KnightMoves : PieceMoveSet[];
	public static var KnightTotalMoves : byte[];

	public static var SitkelMoves : PieceMoveSet[];
	public static var SitkelTotalMoves : byte[];
	
	public static var RookMoves1 : PieceMoveSet[];
	public static var RookTotalMoves1 : byte[];
	public static var RookMoves2 : PieceMoveSet[];
	public static var RookTotalMoves2 : byte[];
	public static var RookMoves3 : PieceMoveSet[];
	public static var RookTotalMoves3 : byte[];
	public static var RookMoves4 : PieceMoveSet[];
	public static var RookTotalMoves4 : byte[];
	
	public static var KingMoves : PieceMoveSet[];
	public static var KingTotalMoves : byte[];
}

class PieceMoves
{
	private static function Position(col : byte, row : byte) : byte
	{
	    return (col + (row * 8));
	}

	public static function InitiateChessPieceMotion()
	{
	    MoveArrays.WhitePawnMoves = new PieceMoveSet[64];
	    MoveArrays.WhitePawnTotalMoves = new byte[64];

	    MoveArrays.BlackPawnMoves = new PieceMoveSet[64];
	    MoveArrays.BlackPawnTotalMoves = new byte[64];

	    MoveArrays.KnightMoves = new PieceMoveSet[64];
	    MoveArrays.KnightTotalMoves = new byte[64];

	    MoveArrays.WhiteElephantMoves = new PieceMoveSet[64];
	    MoveArrays.WhiteElephantTotalMoves = new byte[64];

	    MoveArrays.BlackElephantMoves = new PieceMoveSet[64];
	    MoveArrays.BlackElephantTotalMoves = new byte[64];

	    MoveArrays.RookMoves1 = new PieceMoveSet[64];
	    MoveArrays.RookTotalMoves1 = new byte[64];
	    MoveArrays.RookMoves2 = new PieceMoveSet[64];
	    MoveArrays.RookTotalMoves2 = new byte[64];
	    MoveArrays.RookMoves3 = new PieceMoveSet[64];
	    MoveArrays.RookTotalMoves3 = new byte[64];
	    MoveArrays.RookMoves4 = new PieceMoveSet[64];
	    MoveArrays.RookTotalMoves4 = new byte[64];

	    MoveArrays.SitkelMoves = new PieceMoveSet[64];
	    MoveArrays.SitkelTotalMoves = new byte[64];

	    MoveArrays.KingMoves = new PieceMoveSet[64];
	    MoveArrays.KingTotalMoves = new byte[64];
	    
	    SetMovesWhitePawn();
	    SetMovesBlackPawn();
	    SetMovesKnight();
	    SetMovesWhiteElephant();
	    SetMovesBlackElephant();
	    SetMovesRook();
	    SetMovesSitkel();
	    SetMovesKing();
	}

	private static function SetMovesBlackPawn()
	{
		var index : byte;
	    for (index = 0; index < 64; index++)
	    {
	        var moveset = new PieceMoveSet();
	        
	        var x : byte = (index % 8);
	        var y : byte = ((index / 8));
	        
	        //Diagonal Kill
	        if (y < 7 && x < 7)
	        {
	            moveset.Moves.Add((index + 8 + 1));
	            MoveArrays.BlackPawnTotalMoves[index]++;
	        }
	        if (x > 0 && y < 7)
	        {
	            moveset.Moves.Add((index + 8 - 1));
	            MoveArrays.BlackPawnTotalMoves[index]++;
	        }
	        
	        //One Forward
	        if (index <= 55)
	        {
		        moveset.Moves.Add((index + 8));
		        MoveArrays.BlackPawnTotalMoves[index]++;
		    }

	        MoveArrays.BlackPawnMoves[index] = moveset;
	    }
	}

	private static function SetMovesWhitePawn()
	{
		var index : byte;
	    for (index = 0; index < 64; index++)
	    {
	        var x : byte = (index % 8);
	        var y : byte = ((index / 8));

	        var moveset = new PieceMoveSet();
	       
	        //Diagonal Kill
	        if (x < 7 && y > 0)
	        {
	            moveset.Moves.Add((index - 8 + 1));
	            MoveArrays.WhitePawnTotalMoves[index]++;
	        }
	        if (x > 0 && y > 0)
	        {
	            moveset.Moves.Add((index - 8 - 1));
	            MoveArrays.WhitePawnTotalMoves[index]++;
	        }

	        //One Forward
	        if (index > 8)
	        {
	        	moveset.Moves.Add((index - 8));
	        	MoveArrays.WhitePawnTotalMoves[index]++;
	        }

	        MoveArrays.WhitePawnMoves[index] = moveset;
	    }
	}

	private static function SetMovesKnight()
	{
		var x : byte;
		var y : byte;
	    for (y = 0; y < 8; y++)
	    {
	        for (x = 0; x < 8; x++)
	        {
	            var index : byte = (y + (x * 8));

	            var moveset = new PieceMoveSet();
	            
	            var move : byte;

	            if (y < 6 && x > 0)
	            {
	                move = Position((y + 2), (x - 1));

	                if (move < 64)
	                {
	                    moveset.Moves.Add(move);
	                    MoveArrays.KnightTotalMoves[index]++;
	                }
	            }

	            if (y > 1 && x < 7)
	            {
	                move = Position((y - 2), (x + 1));

	                if (move < 64)
	                {
	                    moveset.Moves.Add(move);
	                    MoveArrays.KnightTotalMoves[index]++;
	                }
	            }

	            if (y > 1 && x > 0)
	            {
	                move = Position((y - 2), (x - 1));

	                if (move < 64)
	                {
	                    moveset.Moves.Add(move);
	                    MoveArrays.KnightTotalMoves[index]++;
	                }
	            }

	            if (y < 6 && x < 7)
	            {
	                move = Position((y + 2), (x + 1));

	                if (move < 64)
	                {
	                    moveset.Moves.Add(move);
	                    MoveArrays.KnightTotalMoves[index]++;
	                }
	            }

	            if (y > 0 && x < 6)
	            {
	                move = Position((y - 1), (x + 2));

	                if (move < 64)
	                {
	                    moveset.Moves.Add(move);
	                    MoveArrays.KnightTotalMoves[index]++;
	                }
	            }

	            if (y < 7 && x > 1)
	            {
	                move = Position((y + 1), (x - 2));

	                if (move < 64)
	                {
	                    moveset.Moves.Add(move);
	                    MoveArrays.KnightTotalMoves[index]++;
	                }
	            }

	            if (y > 0 && x > 1)
	            {
	                move = Position((y - 1), (x - 2));

	                if (move < 64)
	                {
	                    moveset.Moves.Add(move);
	                    MoveArrays.KnightTotalMoves[index]++;
	                }
	            }
	            
	            if (y < 7 && x < 6)
	            {
	                move = Position((y + 1), (x + 2));

	                if (move < 64)
	                {
	                    moveset.Moves.Add(move);
	                    MoveArrays.KnightTotalMoves[index]++;
	                }
	            }

	            MoveArrays.KnightMoves[index] = moveset;
	        }
	    }
	}

	private static function SetMovesBlackElephant()
	{
		var index : byte;
	    for (index = 0; index < 64; index++)
	    {
	        var x : byte = (index % 8);
	        var y : byte = ((index / 8));

	        var moveset = new PieceMoveSet();
	       
	        // Diagonal moves
	        if (x < 7 && y > 0)
	        {
	            moveset.Moves.Add((index - 8 + 1));
	            MoveArrays.BlackElephantTotalMoves[index]++;
	        }
	        if (x > 0 && y > 0)
	        {
	            moveset.Moves.Add((index - 8 - 1));
	            MoveArrays.BlackElephantTotalMoves[index]++;
	        }
	        if (x < 7 && y < 7)
	        {
	            moveset.Moves.Add((index + 8 + 1));
	            MoveArrays.BlackElephantTotalMoves[index]++;
	        }
	        if (x > 0 && y < 7)
	        {
	            moveset.Moves.Add((index + 8 - 1));
	            MoveArrays.BlackElephantTotalMoves[index]++;
	        }

	        //One Forward
	        if (y < 7)
	        {
		        moveset.Moves.Add((index + 8));
		        MoveArrays.BlackElephantTotalMoves[index]++;
		    }

	        MoveArrays.BlackElephantMoves[index] = moveset;
	    }
	}
	
	private static function SetMovesWhiteElephant()
	{
		var index : byte;
	    for (index = 0; index < 64; index++)
	    {
	        var x : byte = (index % 8);
	        var y : byte = ((index / 8));

	        var moveset : PieceMoveSet = new PieceMoveSet();
	       
	        // Diagonal moves
	        if (x < 7 && y > 0)
	        {
	            moveset.Moves.Add((index - 8 + 1));
	            MoveArrays.WhiteElephantTotalMoves[index]++;
	        }
	        if (x > 0 && y > 0)
	        {
	            moveset.Moves.Add((index - 8 - 1));
	            MoveArrays.WhiteElephantTotalMoves[index]++;
	        }
	        if (x < 7 && y < 7)
	        {
	            moveset.Moves.Add((index + 8 + 1));
	            MoveArrays.WhiteElephantTotalMoves[index]++;
	        }
	        if (x > 0 && y < 7)
	        {
	            moveset.Moves.Add((index + 8 - 1));
	            MoveArrays.WhiteElephantTotalMoves[index]++;
	        }

	        //One Forward
	        if (y > 0)
	        {
		        moveset.Moves.Add((index - 8));
		        MoveArrays.WhiteElephantTotalMoves[index]++;
		    }

	        MoveArrays.WhiteElephantMoves[index] = moveset;
	    }
	}

	private static function SetMovesRook()
	{
		var x : byte;
		var y : byte;
	    for (y = 0; y < 8; y++)
	    {
	        for (x = 0; x < 8; x++)
	        {
	            var index : byte = (y + (x * 8));

	            var moveset : PieceMoveSet = new PieceMoveSet();
	            var move : byte;

	            var row : byte = x;
	            var col : byte = y;

	            while (row < 7)
	            {
	                row++;

	                move = Position(col, row);
	                moveset.Moves.Add(move);
	                MoveArrays.RookTotalMoves1[index]++;
	            }
	            
	            MoveArrays.RookMoves1[index] = moveset;

				moveset = new PieceMoveSet();
	            row = x;
	            col = y;

	            while (row > 0)
	            {
	                row--;

	                move = Position(col, row);
	                moveset.Moves.Add(move);
	                MoveArrays.RookTotalMoves2[index]++;
	            }
				
				MoveArrays.RookMoves2[index] = moveset;

				moveset = new PieceMoveSet();
	            row = x;
	            col = y;

	            while (col > 0)
	            {
	                col--;

	                move = Position(col, row);
	                moveset.Moves.Add(move);
	                MoveArrays.RookTotalMoves3[index]++;
	            }

				MoveArrays.RookMoves3[index] = moveset;

				moveset = new PieceMoveSet();
	            row = x;
	            col = y;

	            while (col < 7)
	            {
	                col++;

	                move = Position(col, row);
	                moveset.Moves.Add(move);
	                MoveArrays.RookTotalMoves4[index]++;
	            }

	            MoveArrays.RookMoves4[index] = moveset;
	        }
	    }
	}

	private static function SetMovesSitkel()
	{
	    var index : byte;
	    for (index = 0; index < 64; index++)
	    {
	        var x : byte = (index % 8);
	        var y : byte = ((index / 8));

	        var moveset : PieceMoveSet = new PieceMoveSet();
	       
	        // Diagonal moves
	        if (x < 7 && y > 0)
	        {
	            moveset.Moves.Add((index - 8 + 1));
	            MoveArrays.SitkelTotalMoves[index]++;
	        }
	        if (x > 0 && y > 0)
	        {
	            moveset.Moves.Add((index - 8 - 1));
	            MoveArrays.SitkelTotalMoves[index]++;
	        }
	        if (x < 7 && y < 7)
	        {
	            moveset.Moves.Add((index + 8 + 1));
	            MoveArrays.SitkelTotalMoves[index]++;
	        }
	        if (x > 0 && y < 7)
	        {
	            moveset.Moves.Add((index + 8 - 1));
	            MoveArrays.SitkelTotalMoves[index]++;
	        }

	        MoveArrays.SitkelMoves[index] = moveset;
	    }
	}

	private static function SetMovesKing()
	{
		var x : byte;
		var y : byte;
		
	    for (y = 0; y < 8; y++)
	    {
	        for (x = 0; x < 8; x++)
	        {
	            var index : byte = (y + (x * 8));

	            var moveset : PieceMoveSet = new PieceMoveSet();
	            var move : byte;

	            var row : byte = x;
	            var col : byte = y;

	            if (row < 7)
	            {
	                row++;

	                move = Position(col, row);
	                moveset.Moves.Add(move);
	                MoveArrays.KingTotalMoves[index]++;
	            }

	            row = x;
	            col = y;

	            if (row > 0)
	            {
	                row--;

	                move = Position(col, row);
	                moveset.Moves.Add(move);
	                MoveArrays.KingTotalMoves[index]++;
	            }

	            row = x;
	            col = y;

	            if (col > 0)
	            {
	                col--;

	                move = Position(col, row);
	                moveset.Moves.Add(move);
	                MoveArrays.KingTotalMoves[index]++;
	            }

	            row = x;
	            col = y;

	            if (col < 7)
	            {
	                col++;

	                move = Position(col, row);
	                moveset.Moves.Add(move);
	                MoveArrays.KingTotalMoves[index]++;
	            }

	            row = x;
	            col = y;

	            if (row < 7 && col < 7)
	            {
	                row++;
	                col++;

	                move = Position(col, row);
	                moveset.Moves.Add(move);
	                MoveArrays.KingTotalMoves[index]++;
	            }

	            row = x;
	            col = y;

	            if (row < 7 && col > 0)
	            {
	                row++;
	                col--;

	                move = Position(col, row);
	                moveset.Moves.Add(move);
	                MoveArrays.KingTotalMoves[index]++;
	            }

	            row = x;
	            col = y;

	            if (row > 0 && col < 7)
	            {
	                row--;
	                col++;

	                move = Position(col, row);
	                moveset.Moves.Add(move);
	                MoveArrays.KingTotalMoves[index]++;
	            }


	            row = x;
	            col = y;

	            if (row > 0 && col > 0)
	            {
	                row--;
	                col--;

	                move = Position(col, row);
	                moveset.Moves.Add(move);
	                MoveArrays.KingTotalMoves[index]++;
	            }

	            MoveArrays.KingMoves[index] = moveset;
	        }
	    }
	}
}
