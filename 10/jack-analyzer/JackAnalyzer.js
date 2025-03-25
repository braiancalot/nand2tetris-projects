import fs from "fs";
import path from "path";

import { JackTokenizer } from "./JackTokenizer.js";

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
      const output = path.join(outputFolder, sourceName + "T.xml");

      extractTokens(path.join(source, file), output);
    });
} else {
  if (!fs.existsSync("output")) fs.mkdirSync("output");

  const sourceName = path.basename(source).split(path.extname(source))[0];
  const output = path.join("output", sourceName + "T.xml");

  extractTokens(source, output);
}

function extractTokens(source, output) {
  const writer = fs.createWriteStream(output);

  writer.write("<tokens>\n");

  const jackTokenizer = new JackTokenizer(source);

  while (jackTokenizer.hasMoreTokens()) {
    jackTokenizer.advance();
    const tokenType = jackTokenizer.tokenType();
    writer.write(
      `<${tokenType}> ${jackTokenizer.currentToken} </${tokenType}>\n`
    );
  }

  writer.write("</tokens>\n");
}
