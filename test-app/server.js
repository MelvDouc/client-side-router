import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, join } from "node:path";

const root = import.meta.dirname;

const server = createServer(async (req, res) => {
  if (req.url === "/main.js") {
    const file = join(root, "main.js");
    await serve(file, "application/javascript", res);
    return;
  }

  if (req.url === "/dist/index.js") {
    const file = join(dirname(root), "dist", "index.js");
    await serve(file, "application/javascript", res);
    return;
  }

  await serve(join(root, "index.html"), "text/html", res);
});

async function serve(path, contentType, response) {
  const buffer = await readFile(path);
  response
    .writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": buffer.byteLength
    })
    .end(buffer);
}

server.listen(8080, () => {
  console.log(`App running at http://localhost:8080...`);
});