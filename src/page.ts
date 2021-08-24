import { promises as fs } from "fs";

import { JsonDecoder } from "ts.data.json";
import YAML from "yaml";

export interface PageMetadata {
  readonly title: string;
  readonly slug?: string;
}

const MetadataDecoder = JsonDecoder.object<PageMetadata>(
  {
    title: JsonDecoder.string,
    slug: JsonDecoder.string,
  },
  "PageMetadata",
);

async function readPageFile(file: string): Promise<[string | null, string]> {
  let content = await fs.readFile(file, { encoding: "utf8" });

  if (!content.startsWith("---\n")) {
    return [null, content];
  }

  let splitPos = content.indexOf("\n---\n", 3);

  if (splitPos < 0) {
    return [null, content];
  }

  return [content.substring(4, splitPos), content.substring(splitPos + 5)];
}

export default class Page {
  private constructor(
    private readonly file: string,
    public readonly metadata: PageMetadata,
  ) {}

  public async render(): Promise<string> {
    let [, content] = await readPageFile(this.file);
    return content.replaceAll("https://developer.mozilla.org/", "/");
  }

  public static async build(file: string): Promise<Page> {
    let [yaml] = await readPageFile(file);

    let metadata: PageMetadata = {
      title: file,
    };

    if (yaml !== null) {
      metadata = await MetadataDecoder.decodeToPromise(YAML.parse(yaml));
    }

    return new Page(file, metadata);
  }
}
