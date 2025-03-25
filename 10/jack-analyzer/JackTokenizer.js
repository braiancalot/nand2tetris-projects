import fs from "fs";
import {
  IDENTIFIER,
  INT_CONST,
  KEYWORD,
  keywords,
  STRING_CONST,
  SYMBOL,
  symbols,
} from "./utils.js";

export class JackTokenizer {
  constructor(source) {
    this.sourceData = this.readSourceFile(source);
    this.currentToken = null;
    this.currentIndex = 0;
  }

  readSourceFile(source) {
    try {
      const data = fs.readFileSync(source, "utf8");
      return data
        .split("\n")
        .map((line) => {
          const index = line.indexOf("//");

          if (index !== -1) {
            return line.slice(0, index).trim();
          }

          return line.trim();
        })
        .filter(this.isAValidLine)
        .join("\n");
    } catch (error) {
      console.error("Erro reading .jack file:", error);
      throw error;
    }
  }

  isAValidLine(line) {
    return (
      line &&
      !line.startsWith("//") &&
      !line.startsWith("/*") &&
      !line.startsWith("*")
    );
  }

  hasMoreTokens() {
    return this.currentIndex < this.sourceData.length;
  }

  advance() {
    let currentCharacter;
    let token = "";
    let isStringConstant = false;

    while (this.currentIndex < this.sourceData.length) {
      currentCharacter = this.sourceData[this.currentIndex];

      if (isStringConstant) {
        token += currentCharacter;
        this.currentIndex++;

        if (currentCharacter === '"') {
          isStringConstant = false;
          break;
        }

        continue;
      }

      if (currentCharacter === '"') {
        isStringConstant = true;
        token += currentCharacter;
        this.currentIndex++;
        continue;
      }

      if ([" ", "\n"].includes(currentCharacter)) {
        this.currentIndex++;

        if (!token) continue;

        break;
      }

      if (symbols.includes(currentCharacter)) {
        if (!token) {
          token = currentCharacter;
          this.currentIndex++;
        }
        break;
      }

      token += currentCharacter;
      this.currentIndex++;
    }

    this.currentToken = token;
  }

  tokenType() {
    const token = this.currentToken;
    if (symbols.includes(token)) {
      if (token === "<") {
        this.currentToken = "&lt;";
      } else if (token === ">") {
        this.currentToken = "&gt;";
      } else if (token === '"') {
        this.currentToken = "&quot;";
      } else if (token === "&") {
        this.currentToken = "&amp;";
      }

      return SYMBOL;
    }

    if (keywords.includes(token)) {
      return KEYWORD;
    }

    if (token.startsWith('"') && token.endsWith('"')) {
      this.currentToken = token.substring(1, token.length - 1);
      return STRING_CONST;
    }

    if (!isNaN(token)) {
      return INT_CONST;
    }

    return IDENTIFIER;
  }
}
