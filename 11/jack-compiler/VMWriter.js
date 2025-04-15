import fs from "fs";

export class VMWriter {
  constructor(outputPath) {
    this.output = fs.createWriteStream(outputPath);
  }

  writePush(segment, index) {
    this.output.write(`  push ${segment} ${index}\n`);
  }

  writePop(segment, index) {
    this.output.write(`  pop ${segment} ${index}\n`);
  }

  writeArithmetic(command) {
    this.output.write(`  ${command}\n`);
  }

  writeLabel(label) {
    this.output.write(`label ${label}\n`);
  }

  writeGoto(label) {
    this.output.write(`  goto ${label}\n`);
  }

  writeIf(label) {
    this.output.write(`  if-goto ${label}\n`);
  }

  writeCall(name, nArgs) {
    this.output.write(`  call ${name} ${nArgs}\n`);
  }

  writeFunction(name, nVars) {
    this.output.write(`function ${name} ${nVars}\n`);
  }

  writeReturn() {
    this.output.write("  return\n");
  }

  close() {
    this.output.close();
  }
}
