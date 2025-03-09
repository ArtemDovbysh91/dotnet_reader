import * as cheerio from 'cheerio';
import moment from 'moment';

import { Link, Post } from '../../../core/models';
import { HtmlPageScraper } from '../../../core/scrapers';

export class MetaScraper extends HtmlPageScraper {
  constructor() {
    super();
  }

  readonly name = 'engineering.fb';
  readonly path = 'engineering.fb.com';

  readonly Meta: Link = {
    title: 'Engineering at Meta',
    href: 'https://engineering.fb.com/',
  };

  protected override fetchPosts(): AsyncGenerator<Post> {
    return this
      .fromHtmlPage(this.Meta.href)
      .fetchPosts(MetaScrapeReader, reader => {
        const post: Post = {
          image: reader.getDefaultImage(),
          title: reader.title,
          description: reader.getDescription(),
          href: reader.href,
          categories: [
            this.Meta
          ],
          date: reader.getDate(),
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

class MetaScrapeReader {
  constructor(
    private readonly $: cheerio.CheerioAPI,
    private readonly article: cheerio.Cheerio<cheerio.Element>) { }

  static selector = 'article';

  readonly link = this.article.find('a');
  readonly title = this.article.find('.cat-links').text().trim();
  readonly href = this.link.attr('href') ?? '';

  getDefaultImage(): string | undefined {
    let src = this.article.find('img').attr('src');

    if (src) {
      src = src.replace(/-\d+x\d+(\.\w+)$/, '$1');
    }

    return src;
  }

  getDate(): moment.Moment {
    let date = this.article.find('.posted-on').text();

    if (date) {
      date = date.replace(' / Global', '');
    }

    if (!date) {
      return moment();
    }

    return moment(date?.trim(), 'LL', 'en');
  }

  getDescription(): string[] {
    let description = this.article.find('.entry-title').text().trim();

    if (description.length > 200) {
      description = description.substring(0, 200) + '...';
    }
    
    return [description];
  }
}