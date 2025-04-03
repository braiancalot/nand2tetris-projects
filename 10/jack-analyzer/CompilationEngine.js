import fs from "fs";

import {
  CONSTRUCTOR,
  DO,
  ELSE,
  FIELD,
  FUNCTION,
  IF,
  LET,
  METHOD,
  RETURN,
  STATIC,
  VAR,
  WHILE,
} from "./utils.js";

const statementsKeywords = [LET, IF, WHILE, DO, RETURN];

export class CompilationEngine {
  constructor(input, output) {
    this.sourceData = this.readSourceFile(input);
    this.currentLine = 0;
    this.output = fs.createWriteStream(output);
    this.currentDeep = 0;
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

  getCurrentToken() {
    const line = this.sourceData[this.currentLine];
    return line.split("> ")[1].split(" <")[0];
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
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // type
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // varName
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // (',' varName)*
    while (this.getCurrentToken() === ",") {
      // ','
      this.write(this.sourceData[this.currentLine]);
      this.currentLine++;

      // varName
      this.write(this.sourceData[this.currentLine]);
      this.currentLine++;
    }

    // ';'
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    this.currentDeep--;
    this.write("</classVarDec>");
  }

  compileSubroutine() {
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
      // type
      this.write(this.sourceData[this.currentLine]);
      this.currentLine++;

      // varName
      this.write(this.sourceData[this.currentLine]);
      this.currentLine++;

      // (',' type varName)*
      while (this.getCurrentToken() === ",") {
        // ','
        this.write(this.sourceData[this.currentLine]);
        this.currentLine++;

        // type
        this.write(this.sourceData[this.currentLine]);
        this.currentLine++;

        // varName
        this.write(this.sourceData[this.currentLine]);
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
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // type
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // varName
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // (',' varName)*
    while (this.getCurrentToken() === ",") {
      // ','
      this.write(this.sourceData[this.currentLine]);
      this.currentLine++;

      // varName
      this.write(this.sourceData[this.currentLine]);
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
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    // ('[' expression ']')?

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

    this.currentDeep--;
    this.write("</expression>");
  }

  compileTerm() {
    this.write("<term>");
    this.currentDeep++;

    // 'term'
    this.write(this.sourceData[this.currentLine]);
    this.currentLine++;

    this.currentDeep--;
    this.write("</term>");
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
