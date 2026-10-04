import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [tailwindcss(), reactRouter()],
    resolve: {
      tsconfigPaths: true,
    },
    define: {
      // Plain BASE_URL (no VITE_ prefix) isn't exposed via import.meta.env,
      // and would collide with Vite's reserved import.meta.env.BASE_URL, so
      // it's injected as a build-time global instead.
      __BASE_URL__: JSON.stringify(env.BASE_URL),
    },
  };
});
