let fs = require("fs");
let path = require("path");
let fetch = require("node-fetch");

let data = fs.readFileSync("index.jsonld");
let dataset = JSON.parse(new String(data));

function mkdir(dirname) {
 if (fs.existsSync(dirname)) {
  return true;
 }
 fs.mkdirSync(dirname);
}

async function load(url, dir) {
 let name = url.replace(/[^a-z0-9.]+/gi, "+");

 if (fs.existsSync(dir + name)) {
  console.log(`skipping`);
  return;
 }

 let res = await fetch(url);

 if (!resp.ok) {
  return;
 }

 return new Promise((resolve, reject) => {
   const dest = fs.createWriteStream(dir + name);
   res.body.pipe(dest);
   res.body.on("error", err => {
     reject(err);
    });
   dest.on("finish", () => {
     resolve();
    });
   dest.on("error", err => {
     reject(err);
    });
  });
}

async function main() {
 for (let clazz of dataset.classes) {
  // console.log(clazz);
  let description = JSON.parse(fs.readFileSync(clazz));
  let id = description.url.substr(0, description.url.length - ".jsonld".length);

  mkdir("images/" + id);

  for (let image of description.images) {
   console.log(`downloading ${image.url}`);
   // let result = await fetch(image.url);
   try {
    let result = await load(image.url, "images/" + id + "/");
   } catch (e) {
    // ignore download failures
    console.log("error");
   }
   // console.log(result);
   // break;
  }
  // break;
 }
}

main();