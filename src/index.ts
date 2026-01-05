import app from "./app.js";
import { env } from "./env.js";
import { register } from 'tsconfig-paths';

const tsConfig = require('./tsconfig.json');

// Register path aliases before any other imports
register({
  baseUrl: tsConfig.compilerOptions.baseUrl || '.',
  paths: tsConfig.compilerOptions.paths || {},
});

const port = env.PORT;
const server = app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});

server.on("error", (err) => {
  if ("code" in err && err.code === "EADDRINUSE") {
    console.error(`Port ${env.PORT} is already in use. Please choose another port or stop the process using it.`);
  }
  else {
    console.error("Failed to start server:", err);
  }
  process.exit(1);
});
