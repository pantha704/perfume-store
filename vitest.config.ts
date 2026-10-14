import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Unit tests import app modules directly, and app modules use the "@/*" alias
// from tsconfig — mirror it here so vitest resolves them the same way Next does.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) }
  }
});
