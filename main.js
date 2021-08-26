const hoist=require('./src/hoist.js');
const useAnalysis=require('./src/useAnalysis.js');
const funcDeclSort=require('./src/funcDeclSort.js');
const identifierAnalysis=require('./src/identifierAnalysis.js');
const compile=require('./src/compile.js');
const fs=require('fs');
const acorn=require('acorn');
const jspb=require('google-protobuf');

if (process.argv.length!=4) {
  console.log('Usage: node main.js input.js output.fuzzil.protofbuf');
  process.exit(139);
}
const jsPath=process.argv[2];
const outPath=process.argv[3];
const js=fs.readFileSync(jsPath);
let ast;
try {
  ast=acorn.parse(js, {ecmaVersion: 2022});
} catch {
  console.log('Acorn parse error');
  process.exit(139);
}

hoist.hoist(ast);
useAnalysis.useAnalysis(ast);
funcDeclSort.funcDeclSort(ast);
identifierAnalysis.identifierAnalysis(ast);
const fuzzilProgram = compile.compile(ast);

const bwriter = new jspb.BinaryWriter();
proto.fuzzilli.protobuf.Program.serializeBinaryToWriter(fuzzilProgram, bwriter);
const buff=bwriter.getResultBuffer();
fs.writeFileSync(outPath, Buffer.from(buff));
