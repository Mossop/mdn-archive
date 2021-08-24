import { promises as fs } from "fs";
import path from "path";

import Page from "./page";

const PREFIXES = ["archive/", "archive/mozilla/", "mozilla/", "mozilla/tech/"];

function* possibleSlugs(slug: string): Generator<string, void> {
  slug = slug.toLocaleLowerCase();

  for (let i = PREFIXES.length - 1; i >= 0; i--) {
    let prefix = PREFIXES[i];
    if (slug.startsWith(prefix)) {
      slug = slug.substring(prefix.length);
      break;
    }
  }

  yield slug;

  for (let prefix of PREFIXES) {
    yield prefix + slug;
  }
}

export default class Locale {
  public readonly code: string;
  private pageMap = new Map<string, Page>();

  private constructor(
    private readonly root: string,
    private readonly name: string,
  ) {
    let pos = name.indexOf("-");
    if (pos < 0) {
      this.code = name.toLocaleLowerCase();
    } else {
      this.code = name.substring(0, pos).toLocaleLowerCase();
    }
  }

  public async findPage(slug: string): Promise<Page | null> {
    for (let possibleSlug of possibleSlugs(slug)) {
      let page = this.pageMap.get(possibleSlug);
      if (page) {
        return page;
      }
    }

    return null;
  }

  private async build(): Promise<void> {
    console.log(`Parsing content from ${this.name}...`);

    let parseDir = async (dirs: string[] = []): Promise<void> => {
      let root = path.join(this.root, this.name, ...dirs);
      let entries = await fs.readdir(root, { withFileTypes: true });
      for (let entry of entries) {
        if (entry.isDirectory()) {
          await parseDir([...dirs, entry.name]);
        } else if (entry.isFile() && entry.name == "index.html") {
          let page = await Page.build(path.join(root, entry.name));
          this.pageMap.set(path.join(...dirs).toLocaleLowerCase(), page);
        }
      }
    };

    await parseDir();

    console.log(`Found ${this.pageMap.size} pages.`);
  }

  public static async build(root: string, code: string): Promise<Locale> {
    let locale = new Locale(root, code);
    await locale.build();

    return locale;
  }
}
