import fs from "fs";
import path from "path";

import { CodeWriter } from "./CodeWriter.js";
import { Parser } from "./Parser.js";

import {
    C_ARITHMETIC,
    C_CALL,
    C_FUNCTION,
    C_GOTO,
    C_IF,
    C_LABEL,
    C_POP,
    C_PUSH,
    C_RETURN,
} from "./constants.js";

const args = process.argv.slice(2);
const source = args[0];

if (!source) {
    console.log("Invalid .vm file.");
    process.exit();
}

if (fs.lstatSync(source).isDirectory()) {
    const sourceName = path.basename(source);
    const output = path.join("output", sourceName + ".asm");

    const codeWriter = new CodeWriter(output);

    fs.readdirSync(source)
        .filter((file) => file.endsWith(".vm"))
        .forEach((file) => {
            const parser = new Parser(path.join(source, file));

            codeWriter.setFilename(file);
            translate(parser, codeWriter, file);
        });

    codeWriter.close();
} else {
    const sourceName = path.basename(source).split(path.extname(source))[0];
    const output = path.join("output", sourceName + ".asm");

    const parser = new Parser(source);
    const codeWriter = new CodeWriter(output);

    codeWriter.setFilename(sourceName);
    translate(parser, codeWriter);

    codeWriter.close();
}

function translate(parser, codeWriter) {
    while (parser.hasMoreLines()) {
        parser.advance();
        const commandType = parser.commandType();

        if (commandType === C_ARITHMETIC) {
            codeWriter.writeArithmetic(parser.arg1());
        } else if (commandType === C_PUSH || commandType === C_POP) {
            codeWriter.writePushPop(commandType, parser.arg1(), parser.arg2());
        } else if (commandType === C_LABEL) {
            codeWriter.writeLabel(parser.arg1());
        } else if (commandType === C_GOTO) {
            codeWriter.writeGoto(parser.arg1());
        } else if (commandType === C_IF) {
            codeWriter.writeIf(parser.arg1());
        } else if (commandType === C_FUNCTION) {
            codeWriter.writeFunction(parser.arg1(), parser.arg2());
        } else if (commandType === C_RETURN) {
            codeWriter.writeReturn();
        } else if (commandType === C_CALL) {
            codeWriter.writeCall(parser.arg1(), parser.arg2());
        }
    }
}
