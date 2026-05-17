import { createWebServer } from "./http.js";

const port = Number(process.env.PORT ?? 3000);
const server = createWebServer();

server.listen(port, () => {
  console.log(`modulewood web listening on http://127.0.0.1:${port}`);
});
