import { Hono } from "@hono/hono";
import { Main, Counter } from "../views/main.tsx";
import { serveStatic } from "@hono/hono/deno";
import { watchHandler } from "./hmr.ts";

const app = new Hono();

let count = 0;

app.get("/", (c) => {
  count++;
  return c.html(<Main count={count} />);
});

app.post("/count", (c) => {
  count++;
  return c.html(<Counter count={count} />);
});

// hmr
app.get("/hmr", watchHandler);

// serve static files
app.use("/*", serveStatic({ root: "./public" }));

Deno.serve(app.fetch);
