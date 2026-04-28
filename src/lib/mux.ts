import Mux from "@mux/mux-node";
import { env } from "./env";

let _mux: Mux | null = null;
export function mux(): Mux {
  if (_mux) return _mux;
  if (!env.MUX_TOKEN_ID || !env.MUX_TOKEN_SECRET) {
    throw new Error("Mux credentials not configured");
  }
  _mux = new Mux({ tokenId: env.MUX_TOKEN_ID, tokenSecret: env.MUX_TOKEN_SECRET });
  return _mux;
}

export const hasMux = () => Boolean(env.MUX_TOKEN_ID && env.MUX_TOKEN_SECRET);
