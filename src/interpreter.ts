// src/interpreter.ts
import { Expr, Stmt, BinaryExpr, UnaryExpr, CallExpr } from './ast';
import { Environment } from './environment';
import { CucciRuntimeError } from './errors';

export class Interpreter {
    private env: Environment;

    constructor(env: Environment) { this.env = env; }

    /**
     * Executes a Statement line by line in-place,
     * updating the global state in the Environment (Variables and Functions).
     */
    public execute(stmt: Stmt): void {
        switch (stmt.type) {
            case 'AssignStmt':
                const val = this.evaluate(stmt.value);
                this.env.defineVariable(stmt.name, val);
                break;
            case 'FuncDefStmt':
                this.env.defineFunction(stmt.name, stmt.params, stmt.body);
                break;
            case 'ExprStmt':
                this.evaluate(stmt.expr);
                break;
        }
    }

    /**
     * Evaluates an Expression tree down to a primitive (number | string).
     */
    public evaluate(expr: Expr): number | string {
        switch (expr.type) {
            case 'NumberLiteral': return expr.value;
            case 'StringLiteral': return expr.value;
            case 'Identifier':
                const val = this.env.resolveSymbolValue(expr.name);
                if (val !== undefined) return val;
                throw new CucciRuntimeError(`Symbol '${expr.name}' nonexistent or uninitialized.`);
            case 'BinaryExpr': return this.evaluateBinary(expr);
            case 'UnaryExpr': return this.evaluateUnary(expr);
            case 'CallExpr': return this.evaluateCall(expr);
        }
    }

    private evaluateBinary(expr: BinaryExpr): number | string {
        const left = this.evaluate(expr.left);

        if (expr.operator === '+') {
            const right = this.evaluate(expr.right);
            if (typeof left === 'string' || typeof right === 'string') return String(left) + String(right);
            return (left as number) + (right as number);
        }

        if (expr.operator === '*') {
            const lNum = this.toNumber(left);
            if (lNum === 0) return 0; 
            const right = this.evaluate(expr.right);
            return lNum * this.toNumber(right);
        }

        const right = this.evaluate(expr.right);

        if (expr.operator === '=') return left === right ? 1 : 0;

        const lNum = this.toNumber(left);
        const rNum = this.toNumber(right);

        switch (expr.operator) {
            case '-': return lNum - rNum;
            case '/': return lNum / rNum;
            case '%': return lNum % rNum;
            case '<': return lNum < rNum ? 1 : 0;
            case '>': return lNum > rNum ? 1 : 0;
            default: throw new CucciRuntimeError(`Invalid binary operator '${expr.operator}'.`);
        }
    }

    private evaluateUnary(expr: UnaryExpr): number | string {
        const operand = this.evaluate(expr.operand);

        if (expr.operator === '.') {
            console.log(operand);
            return operand;
        }

        if (expr.operator === '!') {
            let truthy = true;
            if (operand === 0 || operand === "" || (typeof operand === 'number' && isNaN(operand))) truthy = false;
            return truthy ? 0 : 1; 
        }

        if (expr.operator === '-') return -this.toNumber(operand);
        throw new CucciRuntimeError(`Invalid unary operator '${expr.operator}'.`);
    }

    private callDepth: number = 0;

    private evaluateCall(expr: CallExpr): number | string {
        this.callDepth++;
        if (this.callDepth > 500) {
            this.callDepth--;
            throw new CucciRuntimeError(`Maximum call stack size exceeded in function '${expr.callee}'.`);
        }
        
        const overloads = this.env.getFunctions(expr.callee);
        if (!overloads) {
            this.callDepth--;
            throw new CucciRuntimeError(`Function '${expr.callee}' missing from memory.`);
        }

        const func = overloads.find(f => f.params.length === expr.args.length);
        if (!func) throw new CucciRuntimeError(`Dynamic arity mismatch for function '${expr.callee}' with ${expr.args.length} arguments.`);

        const evalArgs: (string | number)[] = [];
        for (const arg of expr.args) evalArgs.push(this.evaluate(arg));

        const scope = new Map<string, number | string>();
        for (let i = 0; i < func.params.length; i++) scope.set(func.params[i], evalArgs[i]);

        this.env.pushScope(scope);
        try {
            return this.evaluate(func.body);
        } finally {
            this.env.popScope();
            this.callDepth--;
        }
    }

    private toNumber(val: number | string): number {
        if (typeof val === 'number') return val;
        const num = parseFloat(val);
        if (isNaN(num)) throw new CucciRuntimeError(`Invalid numeric conversion from '${val}'.`);
        return num;
    }
}
