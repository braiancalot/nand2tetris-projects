import fs from "fs";

import {
  ARG,
  CONSTRUCTOR,
  DO,
  ELSE,
  FIELD,
  FUNCTION,
  IF,
  LET,
  METHOD,
  ops,
  RETURN,
  statementsKeywords,
  STATIC,
  unaryOps,
  VAR,
  WHILE,
} from "./utils.js";
import { SymbolTable } from "./SymbolTable.js";

export class CompilationEngine {
  constructor(input, output) {
    this.sourceData = this.readSourceFile(input);
    this.currentLine = 0;
    this.output = fs.createWriteStream(output);
    this.currentDeep = 0;
    this.symbolTable = new SymbolTable();
  }

  readSourceFile(source) {
    try {
      const data = fs.readFileSync(source, "utf8");
      return data.split("\n").filter((line) => !line.includes("tokens"));
    } catch (error) {
      console.error("Error reading tokens file:", error);
      throw error;
    }
  }

  write(string) {
    const tab = "  ".repeat(this.currentDeep);
    this.output.write(`${tab}${string}\n`);
  }

  writeIdentifier({ name, kind, type, index, usage }) {
    const indent = "  ".repeat(this.currentDeep);
    const attrs = `name="${name}" kind="${kind}" type="${type}" index="${index}" usage="${usage}"`;
    this.output.write(`${indent}<identifier ${attrs}> ${name} </identifier>\n`);
  }

  getCurrentToken() {
    const line = this.sourceData[this.currentLine];
    return line.split("> ")[1].split(" <")[0];
  }

  getCurrentTokenType() {
    const line = this.sourceData[this.currentLine];
    return line.split("<")[1].split(">")[0];
  }

  compileClass() {
    this.write("<class>");
    this.currentDeep++;

    // 'class'
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // className
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // '{'
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // classVarDec*
    while ([STATIC, FIELD].includes(this.getCurrentToken())) {
      this.compileClassVarDec();
    }

    // subroutineDec*
    while ([CONSTRUCTOR, FUNCTION, METHOD].includes(this.getCurrentToken())) {
      this.compileSubroutine();
    }

    // '}'
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    this.currentDeep--;
    this.write("</class>");

    this.output.close();
  }

  compileClassVarDec() {
    this.write("<classVarDec>");
    this.currentDeep++;

    // ('static' | 'field')
    const kind = this.getCurrentToken();
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // type
    const type = this.getCurrentToken();
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // varName
    const name = this.getCurrentToken();
    this.symbolTable.define(name, type, kind);
    const index = this.symbolTable.indexOf(name);
    this.writeIdentifier({ name, kind, type, index, usage: "definition" });
    this.currentLine++;

    // (',' varName)*
    while (this.getCurrentToken() === ",") {
      // ','
      this.write(this.sourceData[this.currentLine]);
      this.currentLine++;

      // varName
      const name = this.getCurrentToken();
      this.symbolTable.define(name, type, kind);
      const index = this.symbolTable.indexOf(name);
      this.writeIdentifier({ name, kind, type, index, usage: "definition" });
      this.currentLine++;
    }

    // ';'
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    this.currentDeep--;
    this.write("</classVarDec>");
  }

  compileSubroutine() {
    this.symbolTable.reset();

    this.write("<subroutineDec>");
    this.currentDeep++;

    // ('constructor' | 'function' | 'method')
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // ('void' | type)
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // subroutineName
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // '('
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // parameterList
    this.compileParameterList();

    // ')'
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    //subroutineBody
    this.compileSubroutineBody();

    this.currentDeep--;
    this.write("</subroutineDec>");
  }

  compileParameterList() {
    this.write("<parameterList>");
    this.currentDeep++;

    // ((type varName) (',' type varName)*)?
    if (this.getCurrentToken() != ")") {
      const kind = ARG;

      // type
      const type = this.getCurrentToken();
      this.write(this.sourceData[this.currentLine]);
      this.currentLine++;

      // varName
      const name = this.getCurrentToken();
      this.symbolTable.define(name, type, kind);
      const index = this.symbolTable.indexOf(name);
      this.writeIdentifier({ name, kind, type, index, usage: "definition" });
      this.currentLine++;

      // (',' type varName)*
      while (this.getCurrentToken() === ",") {
        // ','
        this.write(this.sourceData[this.currentLine]);
        this.currentLine++;

        // type
        const type = this.getCurrentToken();
        this.write(this.sourceData[this.currentLine]);
        this.currentLine++;

        const name = this.getCurrentToken();
        this.symbolTable.define(name, type, kind);
        const index = this.symbolTable.indexOf(name);
        this.writeIdentifier({ name, kind, type, index, usage: "definition" });
        this.currentLine++;
      }
    }

    this.currentDeep--;
    this.write("</parameterList>");
  }

  compileSubroutineBody() {
    this.write("<subroutineBody>");
    this.currentDeep++;

    // '{'
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // varDec*
    while (this.getCurrentToken() === VAR) {
      this.compileVarDec();
    }

    // statements
    this.compileStatements();

    // '}'
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    this.currentDeep--;
    this.write("</subroutineBody>");
  }

  compileVarDec() {
    this.write("<varDec>");
    this.currentDeep++;

    // 'var'
    const kind = this.getCurrentToken();
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // type
    const type = this.getCurrentToken();
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // varName
    const name = this.getCurrentToken();
    this.symbolTable.define(name, type, kind);
    const index = this.symbolTable.indexOf(name);
    this.writeIdentifier({ name, kind, type, index, usage: "definition" });
    this.currentLine++;

    // (',' varName)*
    while (this.getCurrentToken() === ",") {
      // ','
      this.write(this.sourceData[this.currentLine]);
      this.currentLine++;

      // varName
      const name = this.getCurrentToken();
      this.symbolTable.define(name, type, kind);
      const index = this.symbolTable.indexOf(name);
      this.writeIdentifier({ name, kind, type, index, usage: "definition" });
      this.currentLine++;
    }

    // ';'
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    this.currentDeep--;
    this.write("</varDec>");
  }

  compileStatements() {
    this.write("<statements>");
    this.currentDeep++;

    // statement*
    while (statementsKeywords.includes(this.getCurrentToken())) {
      if (this.getCurrentToken() === LET) {
        this.compileLet();
      } else if (this.getCurrentToken() === IF) {
        this.compileIf();
      } else if (this.getCurrentToken() === WHILE) {
        this.compileWhile();
      } else if (this.getCurrentToken() === DO) {
        this.compileDo();
      } else if (this.getCurrentToken() === RETURN) {
        this.compileReturn();
      }
    }

    this.currentDeep--;
    this.write("</statements>");
  }

  compileLet() {
    this.write("<letStatement>");
    this.currentDeep++;

    // 'let'
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // varName
    const name = this.getCurrentToken();
    const kind = this.symbolTable.kindOf(name);
    const type = this.symbolTable.typeOf(name);
    const index = this.symbolTable.indexOf(name);
    const usage = "usage";

    this.writeIdentifier({ name, kind, type, index, usage });
    this.currentLine++;

    // ('[' expression ']')?
    if (this.getCurrentToken() === "[") {
      // '['
      this.write(this.sourceData[this.currentLine]);
      this.currentLine++;

      // expression
      this.compileExpression();

      // ']'
      this.write(this.sourceData[this.currentLine]);
      this.currentLine++;
    }

    // '='
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // expression
    this.compileExpression();

    // ';'
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    this.currentDeep--;
    this.write("</letStatement>");
  }

  compileIf() {
    this.write("<ifStatement>");
    this.currentDeep++;

    // 'if'
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // '('
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // expression
    this.compileExpression();

    // ')'
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // '{'
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // statements
    this.compileStatements();

    // '}'
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    if (this.getCurrentToken() === ELSE) {
      // 'else'
      this.write(this.sourceData[this.currentLine]);
      this.currentLine++;

      // '{'
      this.write(this.sourceData[this.currentLine]);
      this.currentLine++;

      // statements
      this.compileStatements();

      // '}'
      this.write(this.sourceData[this.currentLine]);
      this.currentLine++;
    }

    this.currentDeep--;
    this.write("</ifStatement>");
  }

  compileWhile() {
    this.write("<whileStatement>");
    this.currentDeep++;

    // 'while'
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // '('
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // expression
    this.compileExpression();

    // ')'
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // '{'
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // statements
    this.compileStatements();

    // '}'
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    this.currentDeep--;
    this.write("</whileStatement>");
  }

  compileDo() {
    this.write("<doStatement>");
    this.currentDeep++;

    // 'do'
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    this.currentLine++;
    const nextToken = this.getCurrentToken();
    this.currentLine--;
    if (nextToken === ".") {
      // (className | varName)
      this.write(this.sourceData[this.currentLine]);
      this.currentLine++;

      // '.'
      this.write(this.sourceData[this.currentLine]);
      this.currentLine++;
    }

    // subroutineName
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // '('
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // expressionList
    this.compileExpressionList();

    // ')'
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // ';'
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    this.currentDeep--;
    this.write("</doStatement>");
  }

  compileReturn() {
    this.write("<returnStatement>");
    this.currentDeep++;

    // 'return'
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // expression?
    if (this.getCurrentToken() !== ";") {
      this.compileExpression();
    }

    // ';'
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    this.currentDeep--;
    this.write("</returnStatement>");
  }

  compileExpression() {
    this.write("<expression>");
    this.currentDeep++;

    // 'term'
    this.compileTerm();

    // (op term)*
    while (ops.includes(this.getCurrentToken())) {
      // op
      this.write(this.sourceData[this.currentLine]);
      this.currentLine++;

      // term
      this.compileTerm();
    }

    this.currentDeep--;
    this.write("</expression>");
  }

  compileTerm() {
    this.write("<term>");
    this.currentDeep++;

    const finalizeTerm = () => {
      this.currentDeep--;
      this.write("</term>");
    };

    // '(' expression ')'
    if (this.getCurrentToken() === "(") {
      // '('
      this.write(this.sourceData[this.currentLine]);
      this.currentLine++;

      // expression
      this.compileExpression();

      // ')'
      this.write(this.sourceData[this.currentLine]);
      this.currentLine++;

      finalizeTerm();
      return;
    }

    // unaryOp term
    if (unaryOps.includes(this.getCurrentToken())) {
      // unaryOp
      this.write(this.sourceData[this.currentLine]);
      this.currentLine++;

      // term
      this.compileTerm();

      finalizeTerm();
      return;
    }

    this.currentLine++;
    const nextToken = this.getCurrentToken();
    this.currentLine--;

    // subroutineCall
    if (nextToken === "(" || nextToken === ".") {
      if (nextToken === ".") {
        // (className | varName)
        this.write(this.sourceData[this.currentLine]);
        this.currentLine++;

        // '.'
        this.write(this.sourceData[this.currentLine]);
        this.currentLine++;
      }

      // subroutineName
      this.write(this.sourceData[this.currentLine]);
      this.currentLine++;

      // '('
      this.write(this.sourceData[this.currentLine]);
      this.currentLine++;

      // expressionList
      this.compileExpressionList();

      // ')'
      this.write(this.sourceData[this.currentLine]);
      this.currentLine++;

      finalizeTerm();
      return;
    }

    // varName '[' expression ']'
    if (nextToken === "[") {
      // varName
      const name = this.getCurrentToken();
      const kind = this.symbolTable.kindOf(name);
      const type = this.symbolTable.typeOf(name);
      const index = this.symbolTable.indexOf(name);
      const usage = "usage";

      this.writeIdentifier({ name, kind, type, index, usage });
      this.currentLine++;

      // '['
      this.write(this.sourceData[this.currentLine]);
      this.currentLine++;

      // expression
      this.compileExpression();

      // ']'
      this.write(this.sourceData[this.currentLine]);
      this.currentLine++;

      finalizeTerm();
      return;
    }

    // integerConstant | stringConstant | keywordConstant | varName
    if (this.getCurrentTokenType() === "identifier") {
      const name = this.getCurrentToken();
      const kind = this.symbolTable.kindOf(name);
      const type = this.symbolTable.typeOf(name);
      const index = this.symbolTable.indexOf(name);
      const usage = "usage";

      this.writeIdentifier({ name, kind, type, index, usage });
      this.currentLine++;
    } else {
      this.write(this.sourceData[this.currentLine]);
      this.currentLine++;
    }

    finalizeTerm();
  }

  compileExpressionList() {
    this.write("<expressionList>");
    this.currentDeep++;

    // (expression (',' expression)*)?
    if (this.getCurrentToken() != ")") {
      // expression
      this.compileExpression();

      // (',' expression)*)?
      while (this.getCurrentToken() === ",") {
        // ','
        this.write(this.sourceData[this.currentLine]);
        this.currentLine++;

        // expression
        this.compileExpression();
      }
    }

    this.currentDeep--;
    this.write("</expressionList>");
  }
}
