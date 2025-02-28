import fs from "fs";

export const instructionTypes = {
  A_INSTRUCTION: "A_INSTRUCTION",
  C_INSTRUCTION: "C_INSTRUCTION",
  L_INSTRUCTION: "L_INSTRUCTION",
};

export class Parser {
  constructor(source) {
    this.sourceData = this.readAndCleanAsmFile(source);
    this.currentInstructionIndex = -1;
    this.currentInstruction = null;
  }

  readAndCleanAsmFile(source) {
    try {
      const data = fs.readFileSync(source, "utf8");
      return data
        .split("\n")
        .map((line) => line.trim())
        .filter(this.isAValidLine);
    } catch (error) {
      console.error("Erro opening .asm file:", error);
      throw error;
    }
  }

  reset() {
    this.currentInstructionIndex = -1;
    this.currentInstruction = null;
  }

  hasMoreLines() {
    return this.currentInstructionIndex < this.sourceData.length - 1;
  }

  advance() {
    this.currentInstruction = this.sourceData[++this.currentInstructionIndex];
  }

  instructionType() {
    if (this.currentInstruction.startsWith("@")) {
      return instructionTypes.A_INSTRUCTION;
    } else if (this.currentInstruction.startsWith("(")) {
      return instructionTypes.L_INSTRUCTION;
    } else {
      return instructionTypes.C_INSTRUCTION;
    }
  }

  symbol() {
    if (this.instructionType() === instructionTypes.A_INSTRUCTION) {
      return this.currentInstruction.substring(1);
    } else if (this.instructionType() === instructionTypes.L_INSTRUCTION) {
      return this.currentInstruction.substring(
        1,
        this.currentInstruction.length - 1
      );
    }
  }

  dest() {
    if (!this.currentInstruction.includes("=")) return null;

    return this.currentInstruction.split("=")[0];
  }

  comp() {
    let data = this.currentInstruction;

    if (this.dest()) {
      data = data.split("=")[1];
    }

    if (this.jump()) {
      data = data.split(";")[0];
    }

    return data;
  }

  jump() {
    if (!this.currentInstruction.includes(";")) return null;

    return this.currentInstruction.split(";")[1];
  }

  isAValidLine(line) {
    return line && !line.startsWith("//");
  }
}
