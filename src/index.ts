import koa from "koa";
import type Koa from "koa";

async function init(): Promise<void> {
  let port = 8000;
  if (process.argv.length >= 3) {
    port = parseInt(process.argv[2]);
  }

  let app = new koa();

  app.use(async (ctx: Koa.DefaultContext, next: Koa.Next): Promise<void> => {
    await next();
  });

  app.listen(port);

  console.log(`Listening on http://localhost:${port}`);
}

init().catch((e: Error) => console.error(e));
