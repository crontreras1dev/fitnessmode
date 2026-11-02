import { readFileSync } from "node:fs";
import path from "node:path";

// Load .env.local before any test module evaluates (src/lib/supabase/env.ts
// captures NEXT_PUBLIC_* at import time). Missing values stay empty.
try {
  const raw = readFileSync(path.resolve(__dirname, "../.env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || line.trimStart().startsWith("#")) continue;
    const [, key, value] = match;
    if (!(key in process.env)) {
      process.env[key] = value.replace(/^["']|["']$/g, "");
    }
  }
} catch {
  // No .env.local: e2e tests skip themselves, unit tests don't need env.
}

// Node 20 has no native WebSocket, but @supabase/supabase-js constructs a
// realtime client eagerly. Tests never open channels, so a stub is enough.
if (typeof globalThis.WebSocket === "undefined") {
  class FakeWebSocket {
    close() {}
    send() {}
    addEventListener() {}
    removeEventListener() {}
  }
  // @ts-expect-error intentional stub for Node < 22
  globalThis.WebSocket = FakeWebSocket;
}
