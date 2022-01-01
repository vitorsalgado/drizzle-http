export type BuiltInConverters =
  | "json"
  | "text-plain"
  | "form-url-encoded"
  | "multipart";

export const BuiltInConv = {
  JSON: "json" as BuiltInConverters,
  TEXT: "text-plain" as BuiltInConverters,
  FORM_URL_ENCODED: "form-url-encoded" as BuiltInConverters,
  MULTIPART: "multipart" as BuiltInConverters,
};
