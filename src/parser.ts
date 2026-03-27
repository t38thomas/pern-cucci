// src/parser.ts
import { Expr, Stmt, NumberLiteral, StringLiteral, Program, Identifier, CallExpr } from './ast';
import { Environment } from './environment';
import { CucciSyntaxError } from './errors';

export class Parser {
    private env: Environment;
    private pos: number = 0;
    private input: string = "";
    private parsingOverloads: { name: string, arity: number }[] = [];

    constructor(env: Environment) { this.env = env; }

    public parse(source: string | string[]): Program {
        const lines = Array.isArray(source) ? source : source.split(/\r?\n/);
        const body: Stmt[] = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.length === 0) throw new CucciSyntaxError(`Empty lines are not permitted.`, i + 1);
            try {
                body.push(this.parseLine(line));
            } catch (e: any) {
                if (e instanceof CucciSyntaxError && !e.line) {
                    throw new CucciSyntaxError(e.message, i + 1);
                }
                throw e; // re-throw if it already has line info or is unknown
            }
        }
        return { type: 'Program', body };
    }

    public parseLine(line: string): Stmt {
        this.input = line;
        this.pos = 0;

        if (this.input[0] === '$') return this.parseFuncDef();

        try {
            this.pos = 0;
            const expr = this.parseExpr();
            
            if (this.isAtEnd()) {
                if (!this.isPure(expr)) {
                    return { type: 'ExprStmt', expr };
                }
            } else {
                throw new CucciSyntaxError("Incomplete expression parsing.");
            }
        } catch (e: any) {
            // Silence CucciSyntaxError to allow fallback to assignment statement
            if (!(e instanceof CucciSyntaxError)) {
                throw e; // Rethrow actual runtime bugs, JS errors or stack overflows
            }
        }

        this.pos = 0;
        const target = this.consume();
        
        if (this.isAtEnd()) throw new CucciSyntaxError(`Assignment to variable '${target}' lacks an expression.`);
        
        const valueExpr = this.parseExpr();
        if (!this.isAtEnd()) throw new CucciSyntaxError(`Illegal juxtaposition at character '${this.peek()}'. Use operators.`);

        return { type: 'AssignStmt', name: target, value: valueExpr };
    }

    private isPure(expr: Expr): boolean {
        switch (expr.type) {
            case 'CallExpr': return false; 
            case 'UnaryExpr': 
                if (expr.operator === '.') return false; 
                return this.isPure(expr.operand);
            case 'BinaryExpr': return this.isPure(expr.left) && this.isPure(expr.right);
            case 'Identifier': 
            case 'NumberLiteral':
            case 'StringLiteral': return true;
        }
    }

    private parseFuncDef(): Stmt {
        this.consume(); 
        if (this.isAtEnd()) throw new CucciSyntaxError("Missing function name after '$'.");
        const name = this.consume();
        
        const params: string[] = [];
        while (!this.isAtEnd() && this.peek() !== ':') {
            params.push(this.consume());
        }
        
        if (new Set(params).size !== params.length) {
            throw new CucciSyntaxError(`Duplicate parameters in function '${name}'.`);
        }

        if (this.isAtEnd() || this.consume() !== ':') {
            throw new CucciSyntaxError(`Missing ':' after parameters for function '${name}'.`);
        }
        
        const dummyScope = new Map<string, number | string>();
        for (const p of params) dummyScope.set(p, 0);
        this.env.pushScope(dummyScope);
        
        this.parsingOverloads.push({ name, arity: params.length });
        
        let body: Expr;
        try {
            body = this.parseExpr();
        } finally {
            this.parsingOverloads.pop();
            this.env.popScope();
        }
        
        if (!this.isAtEnd()) {
            throw new CucciSyntaxError(`Excess characters after the body of function '${name}'.`);
        }
        
        return { type: 'FuncDefStmt', name, params, body };
    }

    public parseExpr(): Expr { return this.parseComp(); }

    private parseComp(): Expr {
        let left = this.parseAdd();
        while (!this.isAtEnd()) {
            const c = this.peek();
            if ((c === '<' || c === '>' || c === '=') && this.isRawOp(c)) {
                this.consume();
                left = { type: 'BinaryExpr', operator: c, left, right: this.parseAdd() };
            } else break;
        }
        return left;
    }

    private parseAdd(): Expr {
        let left = this.parseMul();
        while (!this.isAtEnd()) {
            const c = this.peek();
            if ((c === '+' || c === '-') && this.isRawOp(c)) {
                this.consume();
                left = { type: 'BinaryExpr', operator: c, left, right: this.parseMul() };
            } else break;
        }
        return left;
    }

    private parseMul(): Expr {
        let left = this.parseUnary();
        while (!this.isAtEnd()) {
            const c = this.peek();
            if ((c === '*' || c === '/' || c === '%') && this.isRawOp(c)) {
                this.consume();
                left = { type: 'BinaryExpr', operator: c, left, right: this.parseUnary() };
            } else break;
        }
        return left;
    }

    private parseUnary(): Expr {
        if (this.isAtEnd()) throw new CucciSyntaxError("Unexpected EOF computing Unary Operator.");
        const c = this.peek();
        
        if ((c === '-' || c === '!' || c === '.') && this.isRawOp(c)) {
            this.consume();
            return { type: 'UnaryExpr', operator: c, operand: this.parseUnary() };
        }
        return this.parsePrimary();
    }

    private parsePrimary(): Expr {
        if (this.isAtEnd()) throw new CucciSyntaxError("Unexpected EOF computing Expression.");
        const c = this.peek();

        if (this.isDefinedInEnv(c)) {
            this.consume();
            
            if (this.env.isLocalParam(c)) {
                return { type: 'Identifier', name: c };
            }

            const isGlobalVar = this.env.getVariable(c) !== undefined;
            let overloads = this.env.getFunctions(c);

            const parsingMatch = this.parsingOverloads.filter(f => f.name === c);
            if (parsingMatch.length > 0) {
                const merged = overloads ? [...overloads] : [];
                for (const pm of parsingMatch) {
                    if (!merged.find(f => f.params.length === pm.arity)) {
                        merged.push({ name: c, params: new Array(pm.arity).fill('x'), body: {type: 'NumberLiteral', value: 0} });
                    }
                }
                merged.sort((a,b) => b.params.length - a.params.length);
                overloads = merged;
            }

            if (overloads && overloads.length > 0) {
                const savedPos = this.pos;
                for (const func of overloads) {
                    const arity = func.params.length;
                    
                    if (arity === 0 && isGlobalVar) continue; 
                    
                    try {
                        const args: Expr[] = [];
                        for (let i = 0; i < arity; i++) {
                            args.push(this.parseUnary());
                        }
                        return { type: 'CallExpr', callee: c, args };
                    } catch (e) {
                        this.pos = savedPos;
                    }
                }
            }

            return { type: 'Identifier', name: c };
        }

        if (c === '(' && this.isRawOp('(')) {
            this.consume();
            const expr = this.parseExpr();
            if (this.isAtEnd() || this.peek() !== ')' || !this.isRawOp(')')) {
                throw new CucciSyntaxError("Missing closing parenthesis ')'.");
            }
            this.consume();
            return expr;
        }

        if (this.isDigitRaw(c) && !this.isDefinedInEnv(c)) return this.parseNumber();

        return this.parseString();
    }

    private parseNumber(): NumberLiteral {
        let str = '';
        while (!this.isAtEnd()) {
            const c = this.peek();
            if ((this.isDigitRaw(c) || c === '.') && !this.isDefinedInEnv(c)) {
                str += this.consume();
            } else break;
        }
        return { type: 'NumberLiteral', value: parseFloat(str) };
    }

    private parseString(): StringLiteral {
        let str = '';
        while (!this.isAtEnd()) {
            const c = this.peek();
            if (this.isDefinedInEnv(c)) break;
            if (this.isRawOpBase(c) && !this.isDefinedInEnv(c)) break;
            if (this.isDigitRaw(c) && !this.isDefinedInEnv(c)) break;
            
            str += this.consume();
        }
        if (str.length === 0) throw new CucciSyntaxError(`Unresolvable token '${this.peek()}'`);
        return { type: 'StringLiteral', value: str };
    }

    private peek(): string { return this.input[this.pos]; }
    private consume(): string { return this.input[this.pos++]; }
    private isAtEnd(): boolean { return this.pos >= this.input.length; }

    private isDefinedInEnv(c: string): boolean {
        return this.env.resolveSymbolValue(c) !== undefined 
            || this.env.isFunctionDefined(c)
            || this.parsingOverloads.some(f => f.name === c);
    }
    private isRawOpBase(c: string): boolean {
        return ['+', '-', '*', '/', '%', '<', '>', '=', '!', '.', '(', ')', ':'].includes(c);
    }
    private isRawOp(c: string): boolean { return this.isRawOpBase(c) && !this.isDefinedInEnv(c); }
    private isDigitRaw(c: string): boolean { return c >= '0' && c <= '9'; }
}
