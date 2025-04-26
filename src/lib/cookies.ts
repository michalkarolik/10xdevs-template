import type { CookieSerializeOptions } from "cookie";
import { parse, serialize } from "cookie";

export const AUTH_TOKEN_COOKIE = "auth_token";

export function getCookie(name: string, cookieString = ""): string | undefined {
  const cookies = parse(cookieString || "");
  return cookies[name];
}

export function setCookie(name: string, value: string, options: CookieSerializeOptions = {}): string {
  return serialize(name, value, options);
}

export function getClientCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;

  const value = `; ${document.cookie}`;

  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(";").shift();
    console.log(`[cookies] Found client cookie ${name}:`, cookieValue?.substring(0, 10) + "...");
    return cookieValue;
  }

  console.log(`[cookies] No client cookie found for ${name}`);
  return undefined;
}

export function setClientCookie(name: string, value: string, options: CookieSerializeOptions = {}): void {
  if (typeof document === "undefined") return;
  document.cookie = serialize(name, value, options);
  console.log(`[cookies] Set client cookie ${name}`);
}

export function removeClientCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = serialize(name, "", {
    maxAge: -1,
    path: "/",
  });
  console.log(`[cookies] Removed client cookie ${name}`);
}
