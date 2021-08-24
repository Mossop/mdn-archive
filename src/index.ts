import { promises as fs } from "fs";
import path from "path";

import koa from "koa";
import type Koa from "koa";

import Site from "./site";
import { render } from "./template";

async function init(): Promise<void> {
  let root = path.normalize(path.resolve(path.dirname(__dirname)));

  let content = path.join(root, "archived-content");
  let staticPages = path.join(root, "pages");
  let site = await Site.build(content);

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

  app.use(
    async (ctx: Koa.ParameterizedContext, next: Koa.Next): Promise<void> => {
      let target = path.join(staticPages, ctx.path.substring(1));

      try {
        let stat = await fs.stat(target);
        if (stat.isDirectory()) {
          target = path.join(target, "index.html");
          stat = await fs.stat(target);
        }

        if (stat.isFile()) {
          let content = await fs.readFile(target, { encoding: "utf8" });
          await render(ctx, { title: "MDN Archive" }, content);
          return;
        }
      } catch (e) {
        // Missing file.
      }

      await next();
    },
  );

  let port = 8000;
  app.listen(port);

  console.log(`Listening on http://localhost:${port}`);
}

init().catch((e: Error) => console.error(e));
