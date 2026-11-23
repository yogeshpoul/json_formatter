const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/** Appends an object key to a JSONPath-style path, e.g. `$.user["first name"]`. */
export function appendKey(path: string, key: string): string {
  return IDENTIFIER.test(key) ? `${path}.${key}` : `${path}[${JSON.stringify(key)}]`;
}

/** Appends an array index to a JSONPath-style path, e.g. `$.items[3]`. */
export function appendIndex(path: string, index: number): string {
  return `${path}[${index}]`;
}

export const ROOT_PATH = "$";
