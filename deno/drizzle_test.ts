import {
  Body,
  ContentType,
  DELETE,
  FormUrlEncoded,
  GET,
  Param,
  ParseErrorBody,
  Path,
  PlainTextResponse,
  POST,
  PUT,
  Query,
  UsePlainTextConv,
} from "./decorators/mod.ts";
import { MediaTypes } from "./MediaTypes.ts";
import { noop } from "./noop.ts";
import { BuiltInConv, RawResponse } from "./builtin/mod.ts";
import { DrizzleBuilder } from "./DrizzleBuilder.ts";
import { DenoCallFactory } from "./fetch/mod.ts";
import {
  assertArrayIncludes,
  assertEquals,
} from "https://deno.land/std@0.85.0/testing/asserts.ts";
import { delay } from "https://deno.land/std@0.85.0/async/delay.ts";
import { HttpError } from "./HttpError.ts";

interface Customer {
  id: number;
  name: string;
}

@ContentType(MediaTypes.APPLICATION_JSON)
@Path("/customers")
class TestAPI {
  @GET()
  list(@Query("filter") filter: string): Promise<Customer[]> {
    return noop(filter);
  }

  @GET("/{id}")
  @ParseErrorBody()
  byId(@Param("id") id: string): Promise<Customer> {
    return noop(id);
  }

  @POST()
  create(@Body() user: Customer): Promise<Customer> {
    return noop(user);
  }

  @PUT("/{id}")
  @RawResponse()
  update(
    @Param("id") id: string,
    @Body() user: unknown,
  ): Promise<Response> {
    return noop(id, user);
  }

  @DELETE("/{id}")
  remove(@Param("id") id: string): Promise<void> {
    return noop(id);
  }

  @POST("/{id}/documents")
  @FormUrlEncoded()
  form(
    @Param("id") id: string,
    @Body() docs: Record<string, string>,
  ): Promise<Record<string, string>> {
    return noop(id, docs);
  }

  @GET("/{id}/health")
  @PlainTextResponse()
  health(@Param("id") id: string): Promise<string> {
    return noop(id);
  }

  @GET("/{id}/ping")
  @UsePlainTextConv()
  ping(@Param("id") id: string): Promise<void> {
    return noop(id);
  }

  @POST("/{id}/error")
  @ParseErrorBody(BuiltInConv.TEXT)
  err(@Param("id") id: string, @Body() payload: unknown): Promise<unknown> {
    return noop(id, payload);
  }
}

const isCI = Deno.env.get("CI") === "true";
const port: number = Deno.env.get("DENO_TEST_PORT")
  ? parseInt(Deno.env.get("DENO_TEST_PORT") ?? "")
  : 3000;
const api: TestAPI = DrizzleBuilder.newBuilder()
  .baseUrl(`http://localhost:${port}`)
  .callFactory(new DenoCallFactory())
  .addInterceptor((chain) => {
    chain.request().headers.append("x-ctx", "deno");
    return chain.proceed(chain.request());
  })
  .createAPI(TestAPI);

const worker = new Worker(new URL("./testServer.ts", import.meta.url).href, {
  type: "module",
  deno: {
    namespace: true,
  },
});

await delay(isCI ? 15000 : 3000);

const tests: {
  name: string;
  fn: () => Promise<void>;
}[] = [
  {
    name: "GET /customers should return JSON response based on query parameter",
    fn: async () => {
      const response = await api.list("dev");

      assertEquals(response.length, 1);
      assertArrayIncludes(response, [{ id: 1, name: "dev" }]);
    },
  },

  {
    name:
      "GET /customers/:id should return single JSON object based on path parameter",
    fn: async () => {
      const response = await api.byId("100");

      assertEquals(response.id, "100");
      assertEquals(response.name, "lead");
    },
  },

  {
    name:
      "should handle and parse error response body when decorated with @ParseErrorBody()",
    fn: async () => {
      try {
        await api.byId("none");
      } catch (ex) {
        const error = ex as HttpError;
        assertEquals(error.response.status, 404);
        assertEquals(error.response.body, { message: "not found" });
      }
    },
  },

  {
    name:
      "POST /customers should send body and receive JSON response with status 201",
    fn: async () => {
      const customer: Customer = { id: 100, name: "new" };
      const response = await api.create(customer);

      assertEquals(response.id, 100);
      assertEquals(response.name, "new");
    },
  },

  {
    name:
      "PUT /customers/:id should send body and path params and receive 204 and the raw HTTP response as specified by the @RawResponse() decorator",
    fn: async () => {
      const customer: Customer = { id: 100, name: "new" };
      const response = await api.update("100", customer);

      assertEquals(response.ok, true);
      assertEquals(response.status, 204);
    },
  },

  {
    name: "DELETE /customers/:id should delete request",
    fn: async () => {
      await api.remove("100");
    },
  },

  {
    name:
      "should send application/x-www-form-urlencoded when decorated with @FormUrlEncoded()",
    fn: async () => {
      const docs = { doc1: "one", doc2: "two" };
      const response = await api.form("100", docs);

      assertEquals(response, docs);
    },
  },

  {
    name: "should parse plain text response when using @PlainTextResponse()",
    fn: async () => {
      const response = await api.health("200");

      assertEquals(response, "ok");
    },
  },

  {
    name: "should parse plain text response when using @UsePlainTextConv()",
    fn: async () => {
      const response = await api.ping("200");

      assertEquals(response, "pong");
    },
  },

  {
    name:
      "should parse error with the response converter specified by the decorator @ParseErrorBody()",
    fn: async () => {
      try {
        await api.err("300", {});
      } catch (ex) {
        const error = ex as HttpError<string>;

        assertEquals(error.response.body, "fail");
        assertEquals(error.response.status, 400);
      }
    },
  },

  {
    name: "should apply request changes made by a interceptor",
    fn: async () => {
      const customer: Customer = { id: 100, name: "new" };
      const response = await api.update("100", customer);

      assertEquals(response.ok, true);
      assertEquals(response.status, 204);
      assertEquals(response.headers.get("x-ctx"), "deno");
    },
  },
];

let numberOfRanTest = 0;
const done = () => {
  numberOfRanTest++;
  if (numberOfRanTest === tests.length) {
    worker.terminate();
  }
};

tests.forEach((test) => {
  Deno.test({
    name: test.name,
    fn: () => test.fn().then(done),
    sanitizeOps: false,
    sanitizeResources: false,
  });
});
