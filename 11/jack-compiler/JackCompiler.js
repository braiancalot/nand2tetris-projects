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
import { VMWriter } from "./VMWriter.js";

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
  const outputPath = path.join(outputDir, `${baseName}.vm`);

  const jackTokenizer = new JackTokenizer(sourcePath);
  const vmWriter = new VMWriter(outputPath);

  const compilationEngine = new CompilationEngine(jackTokenizer, vmWriter);
  compilationEngine.compileClass();
}
