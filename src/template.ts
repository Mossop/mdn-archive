import { compile } from "handlebars";
import type Koa from "koa";

import type { PageMetadata } from "./page";

const TEMPLATE = compile(`<!DOCTYPE html>

<html>
<head>
<meta charset="utf-8">
<title>{{ title }}</title>
</head>
<body>
{{{ content }}}
</body>
</html>
`);

export async function render(
  ctx: Koa.ParameterizedContext,
  metadata: PageMetadata,
  content: string,
): Promise<void> {
  ctx.set("Content-Type", "text/html; charset=UTF-8");
  ctx.body = TEMPLATE({
    ...metadata,
    content,
  });
}
