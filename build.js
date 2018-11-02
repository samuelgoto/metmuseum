var fs = require('fs');
let src = fs.readFileSync('data.json', 'utf8');
let data = JSON.parse(src);
let flatten = (src, mapper) => (src.map(mapper)).reduce((acc, val) => acc.concat(val), []);

let datasets = {
 "@context": "https://code.sgo.to/datasets/",
 "@type": "Dataset",
 "@id": "https://code.sgo.to/metmuseum/artwork",
 "url": "https://code.sgo.to/metmuseum/artwork.jsonld",
 "name": "Images of artwork from the metropolitan museum of art",
 "description": "These images were created with google's BigQuery",
 "classes": []
};

for (let i = 0; i < data.length; i++) {
 data[i].reproductions = flatten(data[i].reproductions, (x) => x.fullMatchingImages.map(y => y.url));
 data[i].partials = flatten(data[i].partials, (x) => x.partialMatchingImages.map(y => y.url));
}

// console.log(JSON.stringify(foo, undefined, 2));
let max = {length: 0, artwork: undefined};
let encode = (value) => encodeURIComponent(value.replace(/\s/g, '_'));
for (let artwork of data) {
 let artist = "";
 if (artwork.artist_display_name) {
  artist = `${encode(artwork.artist_display_name)}/`;
 }
 let name = "";
 if (artwork.title) {
  name += artwork.title;
 } else if (artwork.name) {
  name += artwork.name;
 }
 if (artwork.artist) {
  name += "by " + artwork.artist_display_name;
 }
 // name += artwork.object_id;

 let department = encode(artwork.department); 
 // console.log(`/${department}/${artist}${name}.html`);
 // let id = `/${department}/${artist}${name}.html`;
 let id = `https://code.sgo.to/metmuseum/images/${artwork.object_id}.jsonld`;

 let description = `Images of "${name}" by "${artist}" from ${artwork.object_date} from the ${department} of the metmuseum.org.`;

 // artwork["@type"] = "DataSet";
 let images = artwork.original_image_url
  .concat(artwork.reproductions)
  .concat(artwork.partials);

 datasets.classes.push(`images/${artwork.object_id}/index.jsonld`);

 let clazz = {
   "@type": "Class",
   "@id": id,
   "url": `${artwork.object_id}.jsonld`,
   "name": name,
   "description": description,
   "images": images.map(url => { return {
       "@type": "Image", 
       "url": url.replace(/[^a-z0-9.]+/gi, "+")
     }
   })
 };

 // datasets.classes.push();

 fs.writeFileSync(`images/${artwork.object_id}/index.jsonld`, JSON.stringify(clazz, undefined, 2));

}

// console.log(data[0]);

// console.log(datasets.datasets[0]);
fs.writeFileSync("index.jsonld", JSON.stringify(datasets, undefined, 2));
