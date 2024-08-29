import { Hono } from "@hono/hono";
import { Main, Counter } from "./views/main.tsx";

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

Deno.serve(app.fetch);
