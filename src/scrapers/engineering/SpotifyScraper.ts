import * as cheerio from 'cheerio';
import moment from 'moment';

import { Link, Post } from '../../../core/models';
import { HtmlPageScraper } from '../../../core/scrapers';

export class SpotifyScraper extends HtmlPageScraper {
  constructor() {
    super();
  }

  readonly name = 'Spotify';
  readonly path = 'engineering.atspotify.com';

  readonly Spotify: Link = {
    title: 'Engineering at Spotify',
    href: 'https://engineering.atspotify.com/',
  };

  protected override fetchPosts(): AsyncGenerator<Post> {
    return this
      .fromHtmlPage(this.Spotify.href)
      .fetchPosts(SpotifyScrapeReader, reader => {
        const tags = reader.getTags();

        const post: Post = {
          image: reader.getDefaultImage(),
          title: reader.title,
          description: reader.getDescription(),
          href: reader.href,
          categories: [
            this.Spotify
          ],
          date: moment(reader.getDate(), 'LL', 'en'),
          links: [
            {
              title: 'Read more',
              href: reader.href,
            },
          ],
          tags
        };

        return post;
      });
  }
}

class SpotifyScrapeReader {
  constructor(
    private readonly $: cheerio.CheerioAPI,
    private readonly article: cheerio.Cheerio<cheerio.Element>) { }

  static selector = '.post';

  readonly link = this.article.find('a');
  readonly title = this.link.text();
  readonly href = this.link.attr('href') ?? '';

  getDefaultImage(): string | undefined {
    let src = this.article.find('img').attr('src');

    if (src) {
      src = src.replace(/-\d+x\d+(\.\w+)$/, '$1');
    }

    return src;
  }

  getDate(): string {
    let date = this.article.find('.date').text();

    if (date) {
      date = date.replace('Updated Date', '');
    }

    return date.trim();
  }

  getTags(): string[] {
    const tags: string[] = [];
    const elements = this.article
      .find('.info-btn');

    for (const element of elements) {
      const link = this.$(element);
      const title = link.text().replace('*', '');
      tags.push(title);
    }

    return tags;
  }

  getDescription(): string[] {
    let description = this.article.find('h2').text().trim();

    if (description.length > 200) {
      description = description.substring(0, 200) + '...';
    }
    
    return [description];
  }

  getHref(): string[] {
    let description = this.article.find('h2').text().trim();

    if (description.length > 200) {
      description = description.substring(0, 200) + '...';
    }
    
    return [description];
  }
}