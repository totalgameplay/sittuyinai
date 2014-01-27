#pragma strict

class PieceEV
{
	public static var PIECE_NEL : int = 1;
	public static var PIECE_SITKEL : int = 2;
	public static var PIECE_ELEPHANT : int = 3;
	public static var PIECE_HORSE : int = 4;
	public static var PIECE_CASTLE : int = 5;
	public static var PIECE_KING : int = 6;
	
	public var type : int;
	public var PieceActionValue : int;
	public var PieceValue : int;
	public var DefendedValue : int;
	public var AttackedValue : int;
	public var Black : boolean;
	public var ValidMoves : System.Collections.Generic.Stack.<byte>;
	public var Moved : boolean;
	
	function PieceEV()
	{
	}
	
	 // copy piece
	 function PieceEV(cp_piece : PieceEV)
	 {
	 	type = cp_piece.type;
	 	PieceActionValue = PieceActionValue;
	 	PieceValue = cp_piece.PieceValue;
	 	Black = cp_piece.Black;
	 	Moved = cp_piece.Moved;
	 }
}