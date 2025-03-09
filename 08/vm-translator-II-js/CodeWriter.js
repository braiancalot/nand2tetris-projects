import fs from "fs";
import {
    ADD,
    AND,
    ARGUMENT,
    C_POP,
    C_PUSH,
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
    constructor(output) {
        this.output = fs.createWriteStream(output);
        this.labelCounters = { [EQ]: 1, [GT]: 1, [LT]: 1 };

        this.writeBootstrapCode();
    }

    setFilename(filename) {
        this.filename = filename;
        this.returnCounter = 1;
    }

    writeBootstrapCode() {
        this.setFilename("Bootstrap");

        this.output.write("// bootstrap code\n");

        // prettier-ignore
        const code = [
            "@256",
            "D=A",
            "@SP",
            "M=D",
        ]

        this.output.write(`${code.join("\n")}\n\n`);

        this.writeCall("Sys.init", 0);
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
                } else if (command === C_PUSH) {
                    code = this.buildPushCode(segmentPointer, index);
                }
                break;

            case STATIC:
                const staticPointer = `${this.filename}.${index}`;
                if (command === C_POP) {
                    code = this.buildPopStaticCode(staticPointer);
                } else if (command === C_PUSH) {
                    code = this.buildPushStaticCode(staticPointer);
                }
                break;

            case TEMP:
                if (command === C_POP) {
                    code = this.buildPopTempCode(index);
                } else if (command === C_PUSH) {
                    code = this.buildPushTempCode(index);
                }
                break;

            case POINTER:
                if (command === C_POP) {
                    code = this.buildPopPointerCode(index);
                } else if (command === C_PUSH) {
                    code = this.buildPushPointerCode(index);
                }
                break;
        }

        this.output.write(`${code}\n\n`);
    }

    writeLabel(label) {
        this.output.write(`// label ${label}\n`);

        const code = this.buildLabelCode(label);

        this.output.write(`${code}\n\n`);
    }

    writeGoto(label) {
        this.output.write(`// goto ${label}\n`);

        const code = this.buildGotoCode(label);

        this.output.write(`${code}\n\n`);
    }

    writeIf(label) {
        this.output.write(`// if-goto ${label}\n`);

        const code = this.buildIfCode(label);

        this.output.write(`${code}\n\n`);
    }

    writeFunction(functionName, nVars) {
        this.output.write(`// function ${functionName} ${nVars}\n`);

        const code = this.buildFunctionCode(functionName, nVars);

        this.output.write(`${code}\n\n`);
    }

    writeReturn() {
        this.output.write("// return\n");

        const code = this.buildReturnCode();

        this.output.write(`${code}\n\n`);
    }

    writeCall(functionName, nArgs) {
        this.output.write(`// call ${functionName} ${nArgs}\n`);

        const code = this.buildCallCode(functionName, nArgs);

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

    // --- BRANCHING ---
    // prettier-ignore
    buildLabelCode(label) {
        return [
            `(${label})`
        ].join("\n")
    }

    // prettier-ignore
    buildGotoCode(label) {
        return [
            `@${label}`,
            "0;JMP"
        ].join("\n")
    }

    // prettier-ignore
    buildIfCode(label) {
        return [
            "@SP",
            "AM=M-1",
            "D=M",
            `@${label}`,
            "D;JNE"
        ].join("\n")
    }

    // prettier-ignore
    buildFunctionCode(label, nVars) {
        const nVarsInitialized = [];
        for (let i = 0;  i < nVars; i++) {
            nVarsInitialized.push(this.buildPushConstantCode(0));
        }
      
        return [
          `(${label})`,
        ].filter(line => line).join("\n")
    }

    // prettier-ignore
    buildReturnCode() {
        return [
          "@LCL",
          "D=M",
          "@5",
          "A=D-A",
          "D=M",
          "@R13",
          "M=D",
          
          "@SP",
          "A=M-1",
          "D=M",
          "@ARG",
          "A=M",
          "M=D",
          
          "@ARG",
          "D=M+1",
          "@SP",
          "M=D",
          
          "@LCL",
          "D=M",
          "@1",
          "A=D-A",
          "D=M",
          "@THAT",
          "M=D",
          
          "@LCL",
          "D=M",
          "@2",
          "A=D-A",
          "D=M",
          "@THIS",
          "M=D",
          
          "@LCL",
          "D=M",
          "@3",
          "A=D-A",
          "D=M",
          "@ARG",
          "M=D",
          
          "@LCL",
          "D=M",
          "@4",
          "A=D-A",
          "D=M",
          "@LCL",
          "M=D",

          "@R13",
          "A=M",
          "0;JMP"
        ].join("\n")
    }

    // prettier-ignore
    buildCallCode(functionName, nArgs) {
        const returnAddr = `${this.filename}.${functionName}.$ret.${this.returnCounter++}`
        
        return [
          `@${returnAddr}`,
          "D=A",
          "@SP",
          "A=M",
          "M=D",
          "@SP",
          "M=M+1",

          "@LCL",
          "D=M",
          "@SP",
          "A=M",
          "M=D",
          "@SP",
          "M=M+1",

          "@ARG",
          "D=M",
          "@SP",
          "A=M",
          "M=D",
          "@SP",
          "M=M+1",

          "@THIS",
          "D=M",
          "@SP",
          "A=M",
          "M=D",
          "@SP",
          "M=M+1",

          "@THAT",
          "D=M",
          "@SP",
          "A=M",
          "M=D",
          "@SP",
          "M=M+1",

          "@SP",
          "D=M",
          `@${5 + nArgs}`,
          "D=D-A",
          "@ARG",
          "M=D",

          "@SP",
          "D=M",
          "@LCL",
          "M=D",

          `@${functionName}`,
          "0;JMP",

          `(${returnAddr})`
        ].join("\n")
    }
}
