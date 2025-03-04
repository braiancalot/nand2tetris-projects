import path from "path";

import { CodeWriter } from "./CodeWriter.js";
import { Parser } from "./Parser.js";

import { C_ARITHMETIC } from "./constants.js";

const args = process.argv.slice(2);
const source = args[0];

if (!source) {
  console.log("Invalid .vm file.");
  process.exit();
}

const sourceName = path.basename(source).split(path.extname(source))[0];
const output = path.join("output", sourceName + ".asm");

const parser = new Parser(source);
const codeWriter = new CodeWriter(output, sourceName);

while (parser.hasMoreLines()) {
  parser.advance();

  if (parser.commandType() === C_ARITHMETIC) {
    codeWriter.writeArithmetic(parser.currentInstruction);
  } else {
    codeWriter.writePushPop(parser.commandType(), parser.arg1(), parser.arg2());
  }
}

codeWriter.close();
