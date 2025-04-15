import {
  ARG,
  CONSTANT,
  CONSTRUCTOR,
  DO,
  ELSE,
  FUNCTION,
  IDENTIFIER,
  IF,
  INT_CONST,
  KEYWORD,
  LET,
  METHOD,
  NULL,
  ops,
  RETURN,
  statementsKeywords,
  THIS,
  TRUE,
  unaryOps,
  VAR,
  WHILE,
  ADD,
  TEMP,
  NOT,
  NEG,
  AND,
  OR,
  LT,
  GT,
  EQ,
  FALSE,
  SUB,
  LOCAL,
  ARGUMENT,
  STATIC,
  FIELD,
  POINTER,
  NONE,
  STRING_CONST,
  THAT,
} from "./utils.js";

import { SymbolTable } from "./SymbolTable.js";

export class CompilationEngine {
  constructor(tokenizer, vmWriter) {
    this.tokenizer = tokenizer;
    this.vmWriter = vmWriter;
    this.symbolTable = new SymbolTable();
    this.className = null;
    this.currentSubroutineName = null;
    this.currentFunctionType = null;
    this.labelCount = 0;
  }

  compileClass() {
    this.tokenizer.advance();

    this.tokenizer.advance(); // 'class'
    this.className = this.tokenizer.currentToken;
    this.tokenizer.advance(); // className
    this.tokenizer.advance(); // '{'

    // classVarDec*
    while ([STATIC, FIELD].includes(this.tokenizer.currentToken)) {
      this.compileClassVarDec();
    }

    // subroutineDec*
    while (
      [CONSTRUCTOR, FUNCTION, METHOD].includes(this.tokenizer.currentToken)
    ) {
      this.compileSubroutine();
    }

    this.tokenizer.advance(); // '}'
    this.vmWriter.close();
  }

  compileClassVarDec() {
    const kind = this.tokenizer.currentToken === STATIC ? STATIC : THIS;
    this.tokenizer.advance(); // ('static' | 'field')

    const type = this.tokenizer.currentToken;
    this.tokenizer.advance(); // type

    const name = this.tokenizer.currentToken;
    this.symbolTable.define(name, type, kind);
    this.tokenizer.advance(); // varName

    // (',' varName)*
    while (this.tokenizer.currentToken === ",") {
      this.tokenizer.advance(); // ','

      const name = this.tokenizer.currentToken;
      this.symbolTable.define(name, type, kind);
      this.tokenizer.advance(); // varName
    }

    this.tokenizer.advance(); // ';'
  }

  compileSubroutine() {
    this.symbolTable.reset();

    this.currentFunctionType = this.tokenizer.currentToken;
    this.tokenizer.advance(); // ('constructor' | 'function' | 'method')
    this.tokenizer.advance(); // ('void' | type)
    this.currentSubroutineName = this.tokenizer.currentToken;
    this.tokenizer.advance(); // subroutineName
    this.tokenizer.advance(); // '('

    this.compileParameterList();

    this.tokenizer.advance(); // ')'

    this.compileSubroutineBody();
  }

  compileParameterList() {
    if (this.currentFunctionType === METHOD) {
      this.symbolTable.define("this", this.className, ARGUMENT, 0);
    }

    // ((type varName) (',' type varName)*)?
    if (this.tokenizer.currentToken != ")") {
      const kind = ARGUMENT;

      const type = this.tokenizer.currentToken;
      this.tokenizer.advance(); // type

      const name = this.tokenizer.currentToken;
      this.symbolTable.define(name, type, kind);
      this.tokenizer.advance(); // varName

      // (',' type varName)*
      while (this.tokenizer.currentToken === ",") {
        this.tokenizer.advance(); // ','

        const type = this.tokenizer.currentToken;
        this.tokenizer.advance(); // type

        const name = this.tokenizer.currentToken;
        this.symbolTable.define(name, type, kind);
        this.tokenizer.advance(); // varName
      }
    }
  }

  compileSubroutineBody() {
    this.tokenizer.advance(); // '{'

    // varDec*
    while (this.tokenizer.currentToken === VAR) {
      this.compileVarDec();
    }

    const nVars = this.symbolTable.varCount(LOCAL);

    const functionName = `${this.className}.${this.currentSubroutineName}`;
    this.vmWriter.writeFunction(functionName, nVars);

    if (this.currentFunctionType === CONSTRUCTOR) {
      const nFields = this.symbolTable.varCount(THIS);
      this.vmWriter.writePush(CONSTANT, nFields);
      this.vmWriter.writeCall("Memory.alloc", 1);
      this.vmWriter.writePop(POINTER, 0);
    } else if (this.currentFunctionType === METHOD) {
      this.vmWriter.writePush(ARGUMENT, 0);
      this.vmWriter.writePop(POINTER, 0);
    }

    this.compileStatements();

    this.tokenizer.advance(); // '}'
  }

  compileVarDec() {
    const kind = LOCAL;
    this.tokenizer.advance(); // 'var'

    const type = this.tokenizer.currentToken;
    this.tokenizer.advance(); // type

    const name = this.tokenizer.currentToken;
    this.symbolTable.define(name, type, kind);
    this.tokenizer.advance(); // varName

    // (',' varName)*
    while (this.tokenizer.currentToken === ",") {
      this.tokenizer.advance(); // ','

      const name = this.tokenizer.currentToken;
      this.symbolTable.define(name, type, kind);
      this.tokenizer.advance(); // varName
    }

    this.tokenizer.advance(); // ';'
  }

  compileStatements() {
    // statement*
    while (statementsKeywords.includes(this.tokenizer.currentToken)) {
      if (this.tokenizer.currentToken === LET) {
        this.compileLet();
      } else if (this.tokenizer.currentToken === IF) {
        this.compileIf();
      } else if (this.tokenizer.currentToken === WHILE) {
        this.compileWhile();
      } else if (this.tokenizer.currentToken === DO) {
        this.compileDo();
      } else if (this.tokenizer.currentToken === RETURN) {
        this.compileReturn();
      }
    }
  }

  compileLet() {
    this.tokenizer.advance(); // 'let'

    let isArray = false;
    const name = this.tokenizer.currentToken;
    const kind = this.symbolTable.kindOf(name);
    const index = this.symbolTable.indexOf(name);
    this.tokenizer.advance(); // varName

    // ('[' expression ']')?
    if (this.tokenizer.currentToken === "[") {
      isArray = true;

      this.vmWriter.writePush(kind, index);

      this.tokenizer.advance(); // '['
      this.compileExpression();
      this.tokenizer.advance(); // ']'

      this.vmWriter.writeArithmetic(ADD);
      this.vmWriter.writePop(TEMP, 0);
    }

    this.tokenizer.advance(); // '='
    this.compileExpression();
    this.tokenizer.advance(); // ';'

    if (isArray) {
      this.vmWriter.writePop(TEMP, 1);
      this.vmWriter.writePush(TEMP, 0);
      this.vmWriter.writePop(POINTER, 1);
      this.vmWriter.writePush(TEMP, 1);
      this.vmWriter.writePop(THAT, 0);
    } else {
      this.vmWriter.writePop(kind, index);
    }
  }

  compileIf() {
    const label1 = `L${++this.labelCount}`;
    const label2 = `L${++this.labelCount}`;

    this.tokenizer.advance(); // 'if'
    this.tokenizer.advance(); // '('

    this.compileExpression();
    this.vmWriter.writeArithmetic(NOT);
    this.vmWriter.writeIf(label1);

    this.tokenizer.advance(); // ')'
    this.tokenizer.advance(); // '{'

    this.compileStatements();

    this.tokenizer.advance(); // '}'

    if (this.tokenizer.currentToken === ELSE) {
      this.vmWriter.writeGoto(label2);
      this.vmWriter.writeLabel(label1);

      this.tokenizer.advance(); // 'else'
      this.tokenizer.advance(); // '{'

      this.compileStatements();

      this.tokenizer.advance(); // '}'
      this.vmWriter.writeLabel(label2);
    } else {
      this.vmWriter.writeLabel(label1);
    }
  }

  compileWhile() {
    const label1 = `L${++this.labelCount}`;
    const label2 = `L${++this.labelCount}`;

    this.tokenizer.advance(); // 'while'
    this.tokenizer.advance(); // '('

    this.vmWriter.writeLabel(label1);
    this.compileExpression();
    this.vmWriter.writeArithmetic(NOT);
    this.vmWriter.writeIf(label2);

    this.tokenizer.advance(); // ')'
    this.tokenizer.advance(); // '{'

    this.compileStatements();
    this.vmWriter.writeGoto(label1);

    this.tokenizer.advance(); // '}'

    this.vmWriter.writeLabel(label2);
  }

  compileDo() {
    this.tokenizer.advance(); // 'do'

    let name = this.tokenizer.currentToken;
    this.tokenizer.advance(); // subroutineName | (className | varName)

    let nArgs = 0;

    if (this.tokenizer.currentToken === ".") {
      this.tokenizer.advance(); // '.'
      const subroutineName = this.tokenizer.currentToken;
      this.tokenizer.advance(); // subroutineName

      const type = this.symbolTable.typeOf(name);
      if (type != NONE) {
        const kind = this.symbolTable.kindOf(name);
        const index = this.symbolTable.indexOf(name);
        this.vmWriter.writePush(kind, index);
        nArgs++;

        name = `${type}.${subroutineName}`;
      } else {
        name = `${name}.${subroutineName}`;
      }
    } else {
      this.vmWriter.writePush(POINTER, 0);
      nArgs++;

      name = `${this.className}.${name}`;
    }

    this.tokenizer.advance(); // '('

    nArgs += this.compileExpressionList();
    this.vmWriter.writeCall(name, nArgs);
    this.vmWriter.writePop(TEMP, 0);

    this.tokenizer.advance(); // ')'
    this.tokenizer.advance(); // ';'
  }

  compileReturn() {
    this.tokenizer.advance(); // 'return'

    // expression?
    if (this.tokenizer.currentToken === ";") {
      this.vmWriter.writePush(CONSTANT, 0);
    } else {
      this.compileExpression();
    }

    this.vmWriter.writeReturn();

    this.tokenizer.advance(); // ';'
  }

  compileExpression() {
    this.compileTerm();

    // (op term)*
    while (ops.includes(this.tokenizer.currentToken)) {
      const op = this.tokenizer.currentToken;
      this.tokenizer.advance(); // op

      this.compileTerm();

      switch (op) {
        case "+":
          this.vmWriter.writeArithmetic(ADD);
          break;
        case "-":
          this.vmWriter.writeArithmetic(SUB);
          break;
        case "*":
          this.vmWriter.writeCall("Math.multiply", 2);
          break;
        case "/":
          this.vmWriter.writeCall("Math.divide", 2);
          break;
        case "&":
          this.vmWriter.writeArithmetic(AND);
          break;
        case "|":
          this.vmWriter.writeArithmetic(OR);
          break;
        case "<":
          this.vmWriter.writeArithmetic(LT);
          break;
        case ">":
          this.vmWriter.writeArithmetic(GT);
          break;
        case "=":
          this.vmWriter.writeArithmetic(EQ);
          break;
      }
    }
  }

  compileTerm() {
    // '(' expression ')'
    if (this.tokenizer.currentToken === "(") {
      this.tokenizer.advance(); // '('
      this.compileExpression();
      this.tokenizer.advance(); // ')'
      return;
    }

    // unaryOp term
    if (unaryOps.includes(this.tokenizer.currentToken)) {
      let op = this.tokenizer.currentToken;
      this.tokenizer.advance(); // unaryOp
      this.compileTerm();

      if (op === "-") {
        this.vmWriter.writeArithmetic(NEG);
      } else if (op === "~") {
        this.vmWriter.writeArithmetic(NOT);
      }

      return;
    }

    // varName | varName '[' expression ']' | subroutineCall
    if (this.tokenizer.tokenType() === IDENTIFIER) {
      let name = this.tokenizer.currentToken;
      this.tokenizer.advance(); // varName | subroutineName | (className | varName)

      // varName '[' expression ']'
      if (this.tokenizer.currentToken === "[") {
        const kind = this.symbolTable.kindOf(name);
        const index = this.symbolTable.indexOf(name);
        this.vmWriter.writePush(kind, index);

        this.tokenizer.advance(); // '['
        this.compileExpression();
        this.tokenizer.advance(); // ']'

        this.vmWriter.writeArithmetic(ADD);
        this.vmWriter.writePop(POINTER, 1);
        this.vmWriter.writePush(THAT, 0);

        return;
      }

      // (className | varName) '.' subroutineName '(' expressionList ')'
      if (this.tokenizer.currentToken === ".") {
        this.tokenizer.advance(); // '.'
        const subroutineName = this.tokenizer.currentToken;
        this.tokenizer.advance(); // subroutineName

        let nArgs = 0;
        const type = this.symbolTable.typeOf(name);
        if (type != NONE) {
          const kind = this.symbolTable.kindOf(name);
          const index = this.symbolTable.indexOf(name);
          this.vmWriter.writePush(kind, index);
          nArgs++;

          name = `${type}.${subroutineName}`;
        } else {
          name = `${name}.${subroutineName}`;
        }

        this.tokenizer.advance(); // '('

        nArgs += this.compileExpressionList();
        this.vmWriter.writeCall(name, nArgs);

        this.tokenizer.advance(); // ')'
        return;
      }

      // subroutineName '(' expressionList ')'
      if (this.tokenizer.currentToken === "(") {
        this.tokenizer.advance(); // '('

        const nArgs = this.compileExpressionList();
        this.vmWriter.writeCall(name, nArgs);

        this.tokenizer.advance(); // ')'
        return;
      }

      // varName
      const kind = this.symbolTable.kindOf(name);
      const index = this.symbolTable.indexOf(name);

      this.vmWriter.writePush(kind, index);

      return;
    }

    // integerConstant
    if (this.tokenizer.tokenType() === INT_CONST) {
      const num = this.tokenizer.intVal();
      this.vmWriter.writePush(CONSTANT, num);
      this.tokenizer.advance(); // integerConstant
    }

    // stringConstant
    if (this.tokenizer.tokenType() === STRING_CONST) {
      const string = this.tokenizer.stringVal();
      const length = string.length;

      this.vmWriter.writePush(CONSTANT, length);
      this.vmWriter.writeCall("String.new", 1);
      for (let i = 0; i < length; i++) {
        this.vmWriter.writePush(CONSTANT, string.charCodeAt(i));
        this.vmWriter.writeCall("String.appendChar", 2);
      }
      this.tokenizer.advance(); // stringConstant
      return;
    }

    // keywordConstant
    if (this.tokenizer.tokenType() === KEYWORD) {
      const keyword = this.tokenizer.keyword();

      switch (keyword) {
        case TRUE:
          this.vmWriter.writePush(CONSTANT, 1);
          this.vmWriter.writeArithmetic(NEG);
          break;
        case FALSE:
          this.vmWriter.writePush(CONSTANT, 0);
          break;
        case NULL:
          this.vmWriter.writePush(CONSTANT, 0);
          break;
        case THIS:
          this.vmWriter.writePush(POINTER, 0);
          break;
      }

      this.tokenizer.advance(); // integerConstant
    }
  }

  compileExpressionList() {
    let nArgs = 0;

    // (expression (',' expression)*)?
    if (this.tokenizer.currentToken != ")") {
      this.compileExpression();
      nArgs++;

      // (',' expression)*)?
      while (this.tokenizer.currentToken === ",") {
        this.tokenizer.advance(); // ','
        this.compileExpression();
        nArgs++;
      }
    }

    return nArgs;
  }
}
