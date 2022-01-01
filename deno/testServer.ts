import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { getQuery } from "https://deno.land/x/oak@v10.1.0/helpers.ts";

const port: number = Deno.env.get("DENO_TEST_PORT")
  ? parseInt(Deno.env.get("DENO_TEST_PORT") ?? "")
  : 3000;
const router = new Router();
const app = new Application();
const controller = new AbortController();
const { signal } = controller;

router.get(
  "/customers",
  (context) =>
    context.response.body = [{ id: 1, name: "dev" }, {
      id: 1,
      name: "qa",
    }].filter((x) => x.name === getQuery(context).filter),
);
router.get("/customers/:id", (context) => {
  if (context.params.id === "none") {
    context.response.body = { message: "not found" };
    context.response.status = 404;
    return;
  }

  context.response.body = { id: context.params.id, name: "lead" };
});
router.post("/customers", async (context) => {
  context.response.status = 201;
  context.response.body = await context.request.body().value;
});
router.put("/customers/:id", (context) => {
  context.response.status = 204;
  context.response.headers.append(
    "x-ctx",
    context.request.headers.get("x-ctx") as string,
  );
});
router.delete("/customers/:id", (context) => context.response.status = 204);
router.post("/customers/:id/documents", async (context) => {
  const body = await context.request.body();
  const value = await body.value as URLSearchParams;

  context.response.body = { doc1: value.get("doc1"), doc2: value.get("doc2") };
});
router.get("/customers/:id/health", (context) => context.response.body = "ok");
router.get("/customers/:id/ping", (context) => context.response.body = "pong");
router.post("/customers/:id/error", (context) => {
  context.response.body = "fail";
  context.response.status = 400;
});

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port, signal });
