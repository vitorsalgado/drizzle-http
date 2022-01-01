import { decorateWithHttpMethod } from "./utils/mod.ts";

export const HTTP = (method: string, path = "") =>
  decorateWithHttpMethod(HTTP, method, path);
