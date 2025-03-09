import fs from "fs";
import {
    C_CALL,
    C_FUNCTION,
    C_GOTO,
    C_IF,
    C_LABEL,
    C_PUSH,
    C_RETURN,
} from "./constants.js";
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
        this.currentInstruction =
            this.sourceData[++this.currentInstructionIndex];
    }

    commandType() {
        const instruction = this.currentInstruction;
        if (instruction.startsWith("push")) {
            return C_PUSH;
        } else if (instruction.startsWith("pop")) {
            return C_POP;
        } else if (instruction.startsWith("label")) {
            return C_LABEL;
        } else if (instruction.startsWith("goto")) {
            return C_GOTO;
        } else if (instruction.startsWith("if-goto")) {
            return C_IF;
        } else if (instruction.startsWith("function")) {
            return C_FUNCTION;
        } else if (instruction.startsWith("return")) {
            return C_RETURN;
        } else if (instruction.startsWith("call")) {
            return C_CALL;
        } else {
            return C_ARITHMETIC;
        }
    }

    arg1() {
        if (this.commandType() === C_ARITHMETIC) {
            return this.currentInstruction.split(" ")[0];
        }

        return this.currentInstruction.split(" ")[1];
    }

    arg2() {
        return Number(this.currentInstruction.split(" ")[2]);
    }
}
