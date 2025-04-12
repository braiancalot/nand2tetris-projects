import fs, { stat } from "fs";
import path from "path";

import { JackTokenizer } from "./JackTokenizer.js";
import {
  IDENTIFIER,
  INT_CONST,
  KEYWORD,
  STRING_CONST,
  SYMBOL,
} from "./utils.js";
import { CompilationEngine } from "./CompilationEngine.js";

const args = process.argv.slice(2);
const source = args[0];

if (!source) {
  console.log("Invalid source");
  process.exit();
}

main(source);

async function main(sourcePath) {
  const stats = fs.lstatSync(sourcePath);

  if (stats.isDirectory()) {
    await compileDirectory(sourcePath);
  } else {
    await compileSingleFile(sourcePath);
  }
}

async function compileDirectory(directoryPath) {
  const folderName = path.basename(directoryPath);
  const outputFolder = path.join("output", folderName);
  prepareOutputDirectory(outputFolder);

  const jackFiles = fs
    .readdirSync(source)
    .filter((file) => file.endsWith(".jack"));

  for (const file of jackFiles) {
    const fullPath = path.join(directoryPath, file);
    await compileFile(fullPath, outputFolder);
  }
}

async function compileSingleFile(filePath) {
  prepareOutputDirectory("output");
  await compileFile(filePath, "output");
}

function prepareOutputDirectory(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

async function compileFile(sourcePath, outputDir) {
  const baseName = path.basename(sourcePath, path.extname(sourcePath));
  const tokensPath = path.join(outputDir, `${baseName}T.xml`);
  const outputPath = path.join(outputDir, `${baseName}.xml`);

  await extractTokens(sourcePath, tokensPath);
  compile(tokensPath, outputPath);
}

function extractTokens(source, output) {
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(output);

    writer.write("<tokens>\n");

    const jackTokenizer = new JackTokenizer(source);

    while (jackTokenizer.hasMoreTokens()) {
      jackTokenizer.advance();
      const tokenType = jackTokenizer.tokenType();
      let string;

      switch (tokenType) {
        case KEYWORD:
          string = jackTokenizer.keyword();
          break;

        case SYMBOL:
          string = jackTokenizer.symbol();
          break;

        case IDENTIFIER:
          string = jackTokenizer.identifier();
          break;

        case INT_CONST:
          string = jackTokenizer.intVal();
          break;

        case STRING_CONST:
          string = jackTokenizer.stringVal();
          break;
      }

      writer.write(`<${tokenType}> ${string} </${tokenType}>\n`);
    }

    writer.write("</tokens>\n");
    writer.end();

    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

function compile(source, output) {
  const compilationEngine = new CompilationEngine(source, output);
  compilationEngine.compileClass();
}
