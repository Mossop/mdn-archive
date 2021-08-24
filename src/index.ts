import path from "path";

import koa from "koa";
import type Koa from "koa";

import Site from "./site";
import { render } from "./template";

async function init(): Promise<void> {
  if (process.argv.length < 3) {
    throw new Error(
      "Expected to be passed the path to the archived content repository.",
    );
  }

  let content = path.resolve(process.argv[2]);
  let site = await Site.build(content);

  let port = 8000;
  if (process.argv.length >= 4) {
    port = parseInt(process.argv[3]);
  }

  let app = new koa();

  app.use(
    async (ctx: Koa.ParameterizedContext, next: Koa.Next): Promise<void> => {
      let page = await site.findPage(ctx.path);

      if (!page) {
        await next();
      } else {
        await render(ctx, page.metadata, await page.render());
      }
    },
  );

  app.listen(port);

  console.log(`Listening on http://localhost:${port}`);
}

init().catch((e: Error) => console.error(e));
