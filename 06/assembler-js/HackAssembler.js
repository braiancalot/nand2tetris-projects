import fs from "fs";
import path from "path";

import { Code } from "./Code.js";
import { Parser, instructionTypes } from "./Parser.js";
import { SymbolTable } from "./SymbolTable.js";

const args = process.argv.slice(2);
const source = args[0];

if (!source) {
  console.log("Invalid .asm file.");
  process.exit();
}

const parser = new Parser(source);
const code = new Code();
const symbolTable = new SymbolTable();

const output = [];

let instructionAddress = 0;

while (parser.hasMoreLines()) {
  parser.advance();
  const instructionType = parser.instructionType();

  if (instructionType === instructionTypes.L_INSTRUCTION) {
    const symbol = parser.symbol();
    symbolTable.addEntry(symbol, instructionAddress);
  } else {
    instructionAddress++;
  }
}

parser.reset();

while (parser.hasMoreLines()) {
  parser.advance();
  const instructionType = parser.instructionType();

  if (instructionType === instructionTypes.A_INSTRUCTION) {
    let symbol = parser.symbol();

    if (isNaN(Number(symbol))) {
      if (!symbolTable.contains(symbol)) {
        symbolTable.addEntry(symbol, symbolTable.n++);
      }

      symbol = symbolTable.getAddress(symbol);
    }

    const symbolCode = (symbol >>> 0).toString(2);
    const newLine = "0" + symbolCode.padStart(15, "0");
    output.push(newLine);
  } else if (instructionType === instructionTypes.C_INSTRUCTION) {
    const dest = parser.dest();
    const comp = parser.comp();
    const jump = parser.jump();

    const destCode = code.dest(dest);
    const compCode = code.comp(comp);
    const jumpCode = code.jump(jump);

    const newLine = "111" + compCode + destCode + jumpCode;
    output.push(newLine);
  }
}

try {
  const outputPath = path.join(
    "output",
    path.basename(source).split(path.extname(source))[0] + ".hack"
  );

  fs.writeFileSync(outputPath, output.join("\n"));
} catch (error) {
  console.error("Erro writing .hack file:", error);
  throw error;
}
