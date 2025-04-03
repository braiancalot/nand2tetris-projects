import fs from "fs";
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

if (fs.lstatSync(source).isDirectory()) {
  const folder = path.basename(source);

  fs.readdirSync(source)
    .filter((file) => file.endsWith(".jack"))
    .forEach((file) => {
      const outputFolder = path.join("output", folder);

      if (!fs.existsSync(outputFolder))
        fs.mkdirSync(outputFolder, { recursive: true });

      const sourceName = file.split(path.extname(file))[0];
      const tokensFile = path.join(outputFolder, sourceName + "T.xml");

      extractTokens(path.join(source, file), tokensFile);

      const output = path.join(outputFolder, sourceName + ".xml");

      compile(tokensFile, output);
    });
} else {
  if (!fs.existsSync("output")) fs.mkdirSync("output");

  const sourceName = path.basename(source).split(path.extname(source))[0];
  const tokensFile = path.join("output", sourceName + "T.xml");

  await extractTokens(source, tokensFile);

  const output = path.join("output", sourceName + ".xml");
  compile(tokensFile, output);
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
