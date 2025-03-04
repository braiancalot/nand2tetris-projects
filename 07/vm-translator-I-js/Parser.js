import fs from "fs";
import { C_PUSH } from "./constants.js";
import { C_POP } from "./constants.js";
import { C_ARITHMETIC } from "./constants.js";

export class Parser {
  constructor(source) {
    this.sourceData = this.readSourceFile(source);
    this.currentInstructionIndex = -1;
    this.currentInstruction = null;
  }

  readSourceFile(source) {
    try {
      const data = fs.readFileSync(source, "utf8");
      return data
        .split("\n")
        .map((line) => line.trim())
        .filter(this.isAValidLine);
    } catch (error) {
      console.error("Erro reading .vm file:", error);
      throw error;
    }
  }

  isAValidLine(line) {
    return line && !line.startsWith("//");
  }

  hasMoreLines() {
    return this.currentInstructionIndex < this.sourceData.length - 1;
  }

  advance() {
    this.currentInstruction = this.sourceData[++this.currentInstructionIndex];
  }

  commandType() {
    if (this.currentInstruction.startsWith("push")) {
      return C_PUSH;
    } else if (this.currentInstruction.startsWith("pop")) {
      return C_POP;
    } else {
      return C_ARITHMETIC;
    }
  }

  arg1() {
    if (this.commandType() === C_ARITHMETIC) {
      return this.currentInstruction;
    }

    return this.currentInstruction.split(" ")[1];
  }

  arg2() {
    return Number(this.currentInstruction.split(" ")[2]);
  }
}
