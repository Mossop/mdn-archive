import { promises as fs } from "fs";
import path from "path";

import Locale from "./locale";
import type Page from "./page";

export default class Site {
  private locales = new Map<string, Locale>();

  private constructor(private readonly content: string) {}

  private async build(): Promise<void> {
    console.log(`Parsing content from ${this.content}...`);

    let root = path.join(this.content, "files");
    let entries = await fs.readdir(root, { withFileTypes: true });
    for (let entry of entries) {
      if (entry.isDirectory()) {
        let locale = await Locale.build(root, entry.name);
        this.locales.set(locale.code, locale);
      }
    }

    console.log(`Found ${this.locales.size} locales.`);
  }

  public async findPage(path: string): Promise<Page | null> {
    let parts = path.split("/");

    // `/<locale>/docs/...`
    if (parts.length < 4) {
      return null;
    }

    let [, localeCode, , ...slug] = parts;

    let localeSplit = localeCode.indexOf("-");
    if (localeSplit >= 0) {
      localeCode = localeCode.substring(0, localeSplit);
    }

    let locale = this.locales.get(localeCode.toLocaleLowerCase());

    if (locale) {
      return locale.findPage(slug.join("/"));
    }

    return null;
  }

  public static async build(content: string): Promise<Site> {
    let site = new Site(content);
    await site.build();
    return site;
  }
}
