// src/environment.ts
import { Expr } from './ast';
import { CucciRuntimeError } from './errors';

export interface FunctionRecord {
  readonly name: string;
  readonly params: readonly string[];
  readonly body: Expr;
}

/**
 * The Environment holds the Global scope and the stack of Local scopes.
 * It is queried in real-time by the Lexer/Parser to disambiguate symbols.
 */
export class Environment {
  // Global variables: associated with their value and defined only once.
  private readonly variables = new Map<string, number | string>();
  
  // Functions: overloads supported, so we save an array of records per name.
  private readonly functions = new Map<string, FunctionRecord[]>();
  
  // Local scope (push/pop during function calls for parameters).
  private readonly localScope: Map<string, number | string>[] = [];

  public defineVariable(name: string, value: number | string): void {
    if (this.variables.has(name)) {
      throw new CucciRuntimeError(`Variable '${name}' is already defined.`);
    }
    this.variables.set(name, value);
  }

  public getVariable(name: string): number | string | undefined {
    return this.variables.get(name);
  }

  public isVariableDefined(name: string): boolean {
    return this.variables.has(name);
  }

  public defineFunction(name: string, params: readonly string[], body: Expr): void {
    let overloads = this.functions.get(name);
    if (!overloads) {
      overloads = [];
      this.functions.set(name, overloads);
    }
    // Arity overloading requires no duplicates for the same argument length.
    const existing = overloads.find(f => f.params.length === params.length);
    if (existing) {
      throw new CucciRuntimeError(`Function '${name}' with ${params.length} parameters already exists.`);
    }
    overloads.push({ name, params, body });
    // Sort descending by arity to ease greedy parsing.
    overloads.sort((a, b) => b.params.length - a.params.length);
  }

  public getFunctions(name: string): readonly FunctionRecord[] | undefined {
    return this.functions.get(name);
  }

  public isFunctionDefined(name: string): boolean {
    return this.functions.has(name);
  }

  /**
   * Resolves value locally or globally.
   * Order: 1) Local parameters 2) Global variables
   */
  public resolveSymbolValue(name: string): number | string | undefined {
    if (this.isLocalParam(name)) {
      const currentScope = this.localScope[this.localScope.length - 1];
      return currentScope.get(name);
    }
    
    return this.variables.get(name);
  }

  public isLocalParam(name: string): boolean {
    if (this.localScope.length > 0) {
      return this.localScope[this.localScope.length - 1].has(name);
    }
    return false;
  }

  public pushScope(scope: Map<string, number | string>): void {
    this.localScope.push(scope);
  }

  public popScope(): void {
    if (this.localScope.length === 0) {
      throw new CucciRuntimeError("Call stack underflow while popping scope.");
    }
    this.localScope.pop();
  }
}
