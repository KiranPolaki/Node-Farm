//----------------------------------------------Modules------------------------------------------------------------
const fs = require("fs");
const http = require("http");
const url = require("url");
//----------------------------------------------Server-------------------------------------------------------------
const replaceTemplate = (temp, product) => {
  let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%FROM%}/g, product.from);
  output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
  output = output.replace(/{%QUANTITY%}/g, product.quantity);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);
  output = output.replace(/{%ID%}/g, product.id);

  if (!product.organic) {
    output = output.replace(/{%NOT_ORGANIC%}/g, "not-organic");
  }

  return output;
};
//Hence this read is implemented only once we can now make this syncronous and not worry about the blocking of code
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const dataObject = JSON.parse(data);

//Reading template pages in a sync
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);

//Creating the server
const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);
  const pathName = req.url;

  //Overview Page
  if (pathName === "/" || pathName === "/overview") {
    res.writeHead(404, {
      "Content-type": "text/html",
    });

    const cardsHtml = dataObject
      .map((el) => replaceTemplate(tempCard, el))
      .join("");

    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);

    res.end(output);
  }

  //Product Page
  else if (pathname === "/product") {
    res.writeHead(200, { "Content-type": "text/html" });
    const product = dataObject[query.id];
    const output = replaceTemplate(tempProduct, product);
    res.end(output);
  }

  //API
  else if (pathName === "/api") {
    res.end(data);
  }

  //Not Found
  else {
    //With this write head we are specifying what data we are sending in what port
    res.writeHead(404, {
      "Content-type": "text/html",
      "my-own-header": "hellow-world",
    });
    res.end("<h1>Page not Found!</h1>");
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to requests on port 8000");
});
