function hasWindow() {
  return typeof window !== "undefined";
}

export function getCurrentSearchParams() {
  if (!hasWindow()) {
    return new URLSearchParams();
  }

  return new URLSearchParams(window.location.search);
}

export function readEnumParam(params, name, allowedValues, fallback) {
  const value = params.get(name);
  return value && allowedValues.includes(value) ? value : fallback;
}

export function readStringParam(params, name, fallback, allowedValues = null) {
  const value = params.get(name);
  if (!value) return fallback;
  if (allowedValues && !allowedValues.includes(value)) return fallback;
  return value;
}

export function readIntegerParam(params, name, fallback, options = {}) {
  const value = params.get(name);
  if (value === null) return fallback;

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;

  if (options.min !== undefined && parsed < options.min) return fallback;
  if (options.max !== undefined && parsed > options.max) return fallback;

  return parsed;
}

export function readBooleanParam(params, name, fallback = false) {
  const value = params.get(name);
  if (value === null) return fallback;
  return value === "1" || value === "true";
}

export function replaceSearchParams(mutator) {
  if (!hasWindow()) return;

  const params = getCurrentSearchParams();
  mutator(params);

  const search = params.toString();
  const nextUrl = `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`;
  window.history.replaceState({}, "", nextUrl);
}

export function setSearchParam(params, name, value) {
  if (value === null || value === undefined || value === "") {
    params.delete(name);
    return;
  }

  params.set(name, String(value));
}

export function setBooleanSearchParam(params, name, value) {
  if (value) {
    params.set(name, "1");
    return;
  }

  params.delete(name);
}
