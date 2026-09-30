import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(
    mode,
    process.cwd(),
    ""
  );

  const apiOrigin =
    env.VITE_API_ORIGIN ||
    "http://localhost:5000";

  const replaceLocalApiOrigin = {
    name: "replace-local-api-origin",

    transform(code, id) {
      if (
        id.includes("node_modules") ||
        (!id.endsWith(".js") &&
          !id.endsWith(".jsx") &&
          !id.endsWith(".ts") &&
          !id.endsWith(".tsx"))
      ) {
        return null;
      }

      if (
        !code.includes(
          "http://localhost:5000"
        )
      ) {
        return null;
      }

      return {
        code: code.replaceAll(
          "http://localhost:5000",
          apiOrigin
        ),
        map: null,
      };
    },
  };

  return {
    plugins: [
      react(),
      tailwindcss(),
      replaceLocalApiOrigin,
    ],
  };
});
