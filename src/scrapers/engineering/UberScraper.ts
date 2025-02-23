import * as cheerio from 'cheerio';
import moment from 'moment';

import { Link, Post } from '../../../core/models';
import { HtmlPageScraper } from '../../../core/scrapers';

export class UberScraper extends HtmlPageScraper {
  constructor() {
    super();
  }

  readonly name = 'Uber';
  readonly path = 'uber.com';

  readonly Uber: Link = {
    title: 'Engineering at Uber',
    href: 'https://www.uber.com/en-US/blog/engineering/',
  };

  protected override fetchPosts(): AsyncGenerator<Post> {
    return this
      .fromHtmlPage(this.Uber.href)
      .fetchPosts(UberScrapeReader, reader => {
        const post: Post = {
          image: reader.getDefaultImage(),
          title: reader.title,
          description: reader.getDescription(),
          href: reader.href,
          categories: [
            this.Uber
          ],
          date: moment(reader.getDate(), 'LL', 'en'),
          links: [
            {
              title: 'Read more',
              href: reader.href,
            },
          ]
        };

        return post;
      });
  }
}

class UberScrapeReader {
  constructor(
    private readonly $: cheerio.CheerioAPI,
    private readonly article: cheerio.Cheerio<cheerio.Element>) { }

  static selector = 'div[data-baseweb="flex-grid-item"]';

  readonly link = this.article.find('a');
  readonly title = this.link.text().trim();
  readonly href = 'https://www.uber.com/en-SE' + (this.link.attr('href') ?? '');

  getDefaultImage(): string | undefined {
    let src = this.article.find('img').attr('src');

    if (src) {
      src = src.replace(/-\d+x\d+(\.\w+)$/, '$1');
    }

    return src;
  }

  getDate(): string {
    let date = this.article.find('p').text();

    if (date) {
      date = date.replace(' / Global', '');
    }

    return date.trim();
  }

  getDescription(): string[] {
    let description = this.article.find('h5').text().trim();

    if (description.length > 200) {
      description = description.substring(0, 200) + '...';
    }
    
    return [description];
  }
}