import * as cheerio from 'cheerio';
import moment from 'moment';

import { Link, Post } from '../../../core/models';
import { HtmlPageScraper } from '../../../core/scrapers';

export class CloudflareScraper extends HtmlPageScraper {
  constructor() {
    super();
  }

  readonly name = 'cloudflare';
  readonly path = 'cloudflare.com';

  readonly Cloudflare: Link = {
    title: 'Cloudflare blog',
    href: 'https://blog.cloudflare.com',
  };

  protected override fetchPosts(): AsyncGenerator<Post> {
    return this
      .fromHtmlPage(this.Cloudflare.href)
      .fetchPosts(CloudflareScrapeReader, reader => {
        const post: Post = {
          image: reader.getDefaultImage(),
          title: reader.title,
          description: reader.getDescription(),
          href: this.Cloudflare.href + reader.href,
          categories: [
            this.Cloudflare
          ],
          date: moment(reader.getDate()),
          links: [
            {
              title: 'Read more',
              href: this.Cloudflare.href + reader.href,
            },
          ]
        };
        
        return post;
      });
  }
}

class CloudflareScrapeReader {
  constructor(
    private readonly $: cheerio.CheerioAPI,
    private readonly article: cheerio.Cheerio<cheerio.Element>) { }

  static selector = 'article';

  readonly link = this.article.find('a');
  readonly title = this.link.text().trim();
  readonly href = this.link.attr('href') ?? '';

  getDefaultImage(): string | undefined {
    let src = this.article.find('div:last').children().attr('src');

    if(!src){
      src = this.article.find('img').attr('src');
    }

    if (src) {
      src = src.replace(/-\d+x\d+(\.\w+)$/, '$1');
    }

    return src;
  }

  getDate(): string {
    let date = this.article.find('p[data-testid="post-date"]').text();

    if (date) {
      date = date.replace(' / Global', '');
    }

    return date.trim();
  }

  getDescription(): string[] {
    let description = this.article.find('p[data-testid="post-content"]').text().trim();

    if (description.length > 200) {
      description = description.substring(0, 200) + '...';
    }
    
    return [description];
  }
}