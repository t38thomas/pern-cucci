// src/ast.ts

/**
 * Abstract Syntax Tree (AST) for the Cucci language.
 * All AST nodes and fields are readonly for immutability after parsing.
 */

export type Expr =
  | NumberLiteral
  | StringLiteral
  | Identifier
  | BinaryExpr
  | UnaryExpr
  | CallExpr;

export interface NumberLiteral {
  readonly type: 'NumberLiteral';
  readonly value: number;
}

export interface StringLiteral {
  readonly type: 'StringLiteral';
  readonly value: string;
}

export interface Identifier {
  readonly type: 'Identifier';
  readonly name: string;
}

export interface BinaryExpr {
  readonly type: 'BinaryExpr';
  readonly operator: '<' | '>' | '=' | '+' | '-' | '*' | '/' | '%';
  readonly left: Expr;
  readonly right: Expr;
}

export interface UnaryExpr {
  readonly type: 'UnaryExpr';
  readonly operator: '-' | '!' | '.';
  readonly operand: Expr;
}

export interface CallExpr {
  readonly type: 'CallExpr';
  readonly callee: string; // 1-character variable or function name
  readonly args: readonly Expr[]; // Parsed arguments based on arity
}

export type Stmt = AssignStmt | FuncDefStmt | ExprStmt;

export interface AssignStmt {
  readonly type: 'AssignStmt';
  readonly name: string; // Target variable (first character of the line)
  readonly value: Expr;
}

export interface FuncDefStmt {
  readonly type: 'FuncDefStmt';
  readonly name: string;
  readonly params: readonly string[];
  readonly body: Expr;
}

export interface ExprStmt {
  readonly type: 'ExprStmt';
  readonly expr: Expr; 
}

export interface Program {
  readonly type: 'Program';
  readonly body: readonly Stmt[];
}
