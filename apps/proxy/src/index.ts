import { Elysia } from "elysia";
import { env } from "./lib/env";
import { proxy } from "./routes/proxy";

const app = new Elysia()
  .use(proxy)
  .listen(env.PORT);