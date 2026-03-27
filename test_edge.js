const env = require('./dist/environment').Environment;
const parser = require('./dist/parser').Parser;

const e = new env();
const p = new parser(e);

try {
  let src = "$f:a:b:a+b";
  p.parse(src);
  console.log("Success parsing", src);
} catch (err) {
  console.log("Error:", err.message);
}
