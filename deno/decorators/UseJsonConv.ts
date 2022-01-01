import { BuiltInConv } from "../builtin/mod.ts";
import { createRequestAndResponseTypes } from "./utils/mod.ts";

/**
 * Define a application/json Content-Type for both request and response
 *
 * @param request - sets the content-type of the request. defaults to true
 * @param response - sets the content-type of the response. defaults to true.
 */
export const UseJsonConv = (request = true, response = true) =>
  createRequestAndResponseTypes(
    BuiltInConv.JSON,
    UseJsonConv,
    request,
    response,
  );
