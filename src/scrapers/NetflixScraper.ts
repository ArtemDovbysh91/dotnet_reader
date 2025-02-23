import moment from 'moment';
import RssParser from 'rss-parser';

import { Link, Post } from '../../core/models';
import { RssFeedScraper } from '../../core/scrapers';

export class NetflixScraper extends RssFeedScraper {
  readonly name = 'Netflix TechBlog';
  readonly path = 'netflixtechblog.medium.com';
  readonly author = 'Netflix TechBlog';
  readonly rss = 'https://medium.com/feed/@netflixtechblog/';

  private readonly NetflixTechBlog: Link = {
    title: 'Netflix Tech Blog',
    href: 'https://netflixtechblog.medium.com/'
  };

  protected override fetchPosts(): AsyncGenerator<Post> {
    return this
      .fromRssFeed(this.rss, {
        customFields: {
          item: [
            ['content:encoded', 'content:encoded'],
            ['content:encodedSnippet', 'content:encodedSnippet']
          ],
        },
      })
      // .fetchPosts(NetflixFetchReader, reader => {
        // const post: Post = {
        //   image: undefined,
        //   title: reader.title,
        //   href: reader.href,
        //   categories: [
        //     this.NetflixTechBlog,
        //   ],
        //   author: this.author,
        //   date: moment(reader.date),
        //   description: reader.getDescription(),
        //   links: [
        //     {
        //       title: 'Read more',
        //       href: reader.href,
        //     },
        //   ],
        //   tags: reader.tags,
        // };
        .fetchPosts(NetflixFetchReader, reader => {
        const post: Post = {
          image: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/0*4NRQp10pg9KK_GKU',
          title: 'Introducing Impressions at Netflix',
          href: 'https://netflixtechblog.com/introducing-impressions-at-netflix-e2b67c88c9fb',
          categories: [
            this.NetflixTechBlog,
          ],
          author: this.author,
          date: moment('Feb 15, 2025'),
          description: ['Part 1: Creating the Source of Truth for Impressions'],
          links: [
            {
              title: 'Read more',
              href: 'https://netflixtechblog.com/introducing-impressions-at-netflix-e2b67c88c9fb',
            },
          ],
          tags: reader.tags,
        }

        return post;
      });
  }
}

class NetflixFetchReader<T extends { 'content:encoded': string, 'content:encodedSnippet': string }> {
  constructor(
    private readonly feed: RssParser.Output<T>,
    private readonly item: RssParser.Item & T) { }

  readonly title = this.item.title ?? '';
  readonly href = this.item.link ?? '';
  readonly date = this.item.isoDate ?? '';
  readonly tags = this.item.categories;

  getImage(): string | undefined {
    const content = this.item['content:encoded'];

    if (content.length) {
      const rex = new RegExp(/<img[^>]+src="?([^"\s]+)"?\s*\/>/g);
      const matches = rex.exec(content);
      
      if(matches && matches.length > 1)
      {
        return matches[1];
      }
    }
    return undefined;
  }

  getDescription(): string[] {
    let description = this.item['content:encodedSnippet']?.trim() ?? '';
    
    if (description.length > 200) {
      description = description.substring(0, 200) + '...';
    }
    
    return [description];
  }
}
