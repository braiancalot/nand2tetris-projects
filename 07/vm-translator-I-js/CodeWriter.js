import fs from "fs";
import {
    ADD,
    AND,
    ARGUMENT,
    C_POP,
    CONSTANT,
    EQ,
    GT,
    LOCAL,
    LT,
    NEG,
    NOT,
    OR,
    POINTER,
    STATIC,
    SUB,
    TEMP,
    THAT,
    THIS,
} from "./constants.js";

export class CodeWriter {
    constructor(output, sourceName) {
        this.output = fs.createWriteStream(output);
        this.sourceName = sourceName;
        this.labelCounters = { [EQ]: 1, [GT]: 1, [LT]: 1 };
    }

    writeArithmetic(command) {
        this.output.write(`// ${command}\n`);

        const operator = this.getArithmeticOperator(command);

        let code;
        if (command === NOT || command === NEG) {
            code = this.buildUnaryArithmeticCode(operator);
        } else if (command === EQ || command === GT || command === LT) {
            code = this.buildComparisonCode(
                command,
                this.labelCounters[command]
            );
            this.labelCounters[command]++;
        } else {
            code = this.buildBinaryArithmeticCode(operator);
        }

        this.output.write(`${code}\n\n`);
    }

    writePushPop(command, segment, index) {
        this.output.write(`// ${command} ${segment} ${index}\n`);

        let code;
        switch (segment) {
            case CONSTANT:
                code = this.buildPushConstantCode(index);
                break;

            case LOCAL:
            case ARGUMENT:
            case THIS:
            case THAT:
                const segmentPointer = this.getSegmentPointer(segment);
                if (command === C_POP) {
                    code = this.buildPopCode(segmentPointer, index);
                } else {
                    code = this.buildPushCode(segmentPointer, index);
                }
                break;

            case STATIC:
                const staticPointer = `${this.sourceName}.${index}`;
                if (command === C_POP) {
                    code = this.buildPopStaticCode(staticPointer);
                } else {
                    code = this.buildPushStaticCode(staticPointer);
                }
                break;

            case TEMP:
                if (command === C_POP) {
                    code = this.buildPopTempCode(index);
                } else {
                    code = this.buildPushTempCode(index);
                }
                break;

            case POINTER:
                if (command === C_POP) {
                    code = this.buildPopPointerCode(index);
                } else {
                    code = this.buildPushPointerCode(index);
                }
                break;
        }

        this.output.write(`${code}\n\n`);
    }

    close() {
        this.output.end();
    }

    getArithmeticOperator(command) {
        switch (command) {
            case ADD:
                return "D+M";
            case SUB:
                return "M-D";
            case NEG:
                return "-M";
            case AND:
                return "D&M";
            case OR:
                return "D|M";
            case NOT:
                return "!M";
        }
    }

    getSegmentPointer(segment) {
        switch (segment) {
            case LOCAL:
                return "LCL";
            case ARGUMENT:
                return "ARG";
            case THIS:
                return "THIS";
            case THAT:
                return "THAT";
        }
    }

    // --- ARITHMETIC ----
    // prettier-ignore
    buildUnaryArithmeticCode(operator) {
        return [
            "@SP",
            "A=M-1",
            `M=${operator}`,
            ].join("\n");
    }

    // prettier-ignore
    buildBinaryArithmeticCode(operator) {
        return [
            "@SP",
            "AM=M-1",
            "D=M",
            "A=A-1",
            `M=${operator}`,
            ].join("\n");
    }

    // prettier-ignore
    buildComparisonCode(operator, labelCounter) {
        const label = `${operator.toUpperCase()}_${labelCounter}`;
        const jump = `D;J${operator.toUpperCase()}`;
        
        return [
            "@SP",
            "AM=M-1",
            "D=M",
            "A=A-1",
            "D=M-D",
            "M=-1",
            `@${label}`,
            `${jump}`,
            "@SP",
            "A=M-1",
            "M=0",
            `(${label})`
            ].join("\n");
    }

    // --- PUSH/POP ---
    // prettier-ignore
    buildPopCode(segmentPointer, index) {
        return [
            `@${segmentPointer}`, 
            "D=M",
            `@${index}`,
            "D=D+A",
            "@addr",
            "M=D",
            "@SP",
            "AM=M-1",
            "D=M",
            "@addr",
            "A=M",
            "M=D"
        ].join("\n");
  }

    // prettier-ignore
    buildPushCode(segmentPointer, index) {
        return [
            `@${segmentPointer}`, 
            "D=M",
            `@${index}`,
            "D=D+A",
            "@addr",
            "M=D",
            "A=M",
            "D=M",
            "@SP",
            "A=M",
            "M=D",
            "@SP",
            "M=M+1",
        ].join("\n");
  }

    // prettier-ignore
    buildPushConstantCode(index) {
        return [
            `@${index}`,
            "D=A",
            "@SP",
            "A=M",
            "M=D",
            "@SP",
            "M=M+1"
        ].join("\n");
  }

    // prettier-ignore
    buildPopStaticCode(staticPointer) {
        return [
            "@SP",
            "AM=M-1",
            "D=M",
            `@${staticPointer}`,
            "M=D"
        ].join("\n");
  }

    // prettier-ignore
    buildPushStaticCode(staticPointer) {
        return [
            `@${staticPointer}`,
            "D=M",
            "@SP",
            "A=M",
            "M=D",
            "@SP",
            "M=M+1",
        ].join("\n");
  }

    // prettier-ignore
    buildPopTempCode(index) {
        return [
            "@5", 
            "D=A",
            `@${index}`,
            "D=D+A",
            "@addr",
            "M=D",
            "@SP",
            "AM=M-1",
            "D=M",
            "@addr",
            "A=M",
            "M=D"
        ].join("\n");
  }

    // prettier-ignore
    buildPushTempCode(index) {
        return [
            "@5", 
            "D=A",
            `@${index}`,
            "D=D+A",
            "@addr",
            "M=D",
            "A=M",
            "D=M",
            "@SP",
            "A=M",
            "M=D",
            "@SP",
            "M=M+1",
        ].join("\n");
  }

    // prettier-ignore
    buildPopPointerCode(index) {
        const segmentPointer = index === 0 ? this.getSegmentPointer(THIS) : this.getSegmentPointer(THAT);
        
        return [
            "@SP",
            "AM=M-1",
            "D=M",
            `@${segmentPointer}`,
            "M=D"
        ].join("\n");
  }

    // prettier-ignore
    buildPushPointerCode(index) {
        const segmentPointer = index === 0 ? this.getSegmentPointer(THIS) : this.getSegmentPointer(THAT);
        
        return [
            `@${segmentPointer}`, 
            "D=M",
            "@SP",
            "A=M",
            "M=D",
            "@SP",
            "M=M+1",
        ].join("\n");
  }
}
