import { Hono } from "@hono/hono";
import { Main, Counter } from "../views/main.tsx";
import { serveStatic } from "@hono/hono/deno";
import { watchHandler } from "./hmr.ts";
import {
  createGitHubOAuthConfig,
  createGoogleOAuthConfig,
  createHelpers,
} from "@deno/kv-oauth";
import { getGoogleUser } from "./utils/google.ts";
import { getGitHubUser } from "./utils/github.ts";

const oauthConfig = createGitHubOAuthConfig({
  scope: ["email"],
});
const { signIn, handleCallback, getSessionId, signOut } =
  createHelpers(oauthConfig);

const googleOAuthConfig = createGoogleOAuthConfig({
  redirectUri: "http://localhost:8000/google/callback",
  scope: [
    "https://www.googleapis.com/auth/userinfo.profile",
    "email",
    "openid",
  ],
});

const kv = await Deno.openKv();

const { signIn: googleSignIn, handleCallback: googleHandleCallback } =
  createHelpers(googleOAuthConfig);

const app = new Hono();

let count = 0;

app.get("/", async (c) => {
  count++;
  const sessionId = await getSessionId(c.req.raw);
  if (sessionId) {
    const oauthSession = kv.list({ prefix: ["site_sessions"] });
    for await (const { key, value } of oauthSession) {
      console.log("key", key);
      console.log("value", value);
    }
  }
  console.log("sessionId from main", sessionId);
  return c.html(<Main count={count} isLoggedIn={sessionId !== undefined} />);
});

// app.get('/sessions', async (c) => {
//   const keys = await kv.list([]);
//   const sessions = await Promise.all(keys.map(async (key) => {
//     const value = await kv.get(key);
//     return { key, value };
//   }));
//   return c.json(sessions);
// });

app.post("/count", (c) => {
  count++;
  return c.html(<Counter count={count} />);
});

app.post("/sign-in", async (c) => {
  return await signIn(c.req.raw);
});

app.post("/google-sign-in", async (c) => {
  return await googleSignIn(c.req.raw);
});

app.get("/google/callback", async (c) => {
  const { response, sessionId, tokens } = await googleHandleCallback(c.req.raw);
  console.log("sessionId", sessionId);
  console.log("tokens", tokens);

  const userinfo = await getGoogleUser(tokens.accessToken);

  return response;
});

app.get("/callback", async (c) => {
  const { response, sessionId, tokens } = await handleCallback(c.req.raw);
  console.log("sessionId", sessionId);
  console.log("tokens", tokens);
  const userinfo = await getGitHubUser(tokens.accessToken);
  console.log("userinfo", userinfo);
  return response;
});

app.get("/sign-out", (c) => {
  return signOut(c.req.raw);
});

app.get("/protected", (c) => {
  const sessionId = getSessionId(c.req.raw);
  if (!sessionId) {
    return c.redirect("/sign-in");
  }
  return c.text("Protected route");
});

// hmr
app.get("/hmr", watchHandler);

// serve static files
app.use("/*", serveStatic({ root: "./public" }));

Deno.serve(app.fetch);
