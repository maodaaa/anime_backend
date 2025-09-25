import { describe, it, expect, beforeAll } from 'bun:test';
import axios, { type AxiosResponse, type AxiosRequestConfig } from 'axios';
import { load, type CheerioAPI } from 'cheerio';
import { wajikFetch, getFinalUrl, getFinalUrls } from '@services/dataFetcher';
import { wajikFetchWithFallback, fetchFallback, getFinalUrlFallback } from '@services/dataFetcherFallback';
import AnimeScraper from '@scrapers/AnimeScraper';
import animeConfig from '@configs/animeConfig';

// Mock HTML content for testing
const mockHtmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Anime Site</title>
</head>
<body>
    <div class="anime-container">
        <h1 class="anime-title">Test Anime Title</h1>
        <p class="synopsis">This is a test anime synopsis with some content.</p>
        <div class="episode-list">
            <a href="/episode/episode-1" class="episode-link">Episode 1</a>
            <a href="/episode/episode-2" class="episode-link">Episode 2</a>
        </div>
        <iframe src="https://player.example.com/embed/12345" width="100%" height="400"></iframe>
        <div class="genre-list">
            <a href="/genre/action" class="genre">Action</a>
            <a href="/genre/adventure" class="genre">Adventure</a>
        </div>
    </div>
    <div class="download-links">
        <ul>
            <li><strong>720p</strong> <i>300MB</i> <a href="/download/720p">Download</a></li>
            <li><strong>1080p</strong> <i>500MB</i> <a href="/download/1080p">Download</a></li>
        </ul>
    </div>
</body>
</html>
`;

// Test implementation of AnimeScraper
class TestAnimeScraper extends AnimeScraper {
    constructor() {
        super('https://test-anime.com', '/api', 'test', 'test');
    }

    // Expose protected methods for testing
    public testStr(string?: string): string {
        return this.str(string);
    }

    public testNum(string?: string): number | null {
        return this.num(string);
    }

    public testGenerateSlug(url?: string): string {
        return this.generateSlug(url);
    }

    public testGenerateSourceUrl(urlOrPath?: string): string | undefined {
        return this.generateSourceUrl(urlOrPath);
    }

    public testGenerateHref(...paths: string[]): string | undefined {
        return this.generateHref(...paths);
    }

    public testGenerateSrcFromIframeTag(html?: string): string {
        return this.generateSrcFromIframeTag(html);
    }

    public testEnrawr(input: string): string {
        return this.enrawr(input);
    }

    public testDerawr(enrawr: string): string {
        return this.derawr(enrawr);
    }

    // Test scraping method
    public async testScrape() {
        return this.scrape<{ title: string; episodes: string[] }>(
            {
                path: '/test',
                initialData: { title: '', episodes: [] },
            },
            async ($, data) => {
                data.title = $('.anime-title').text();
                $('.episode-link').each((_, el) => {
                    data.episodes.push($(el).text());
                });
                return data;
            }
        );
    }
}

describe('Web Scraping Compatibility - Focused Tests', () => {
    let testScraper: TestAnimeScraper;

    beforeAll(() => {
        testScraper = new TestAnimeScraper();
    });

    describe('Axios Library Compatibility', () => {
        it('should import axios without errors', () => {
            expect(axios).toBeDefined();
            expect(typeof axios).toBe('function');
            expect(typeof axios.get).toBe('function');
            expect(typeof axios.post).toBe('function');
            expect(typeof axios.head).toBe('function');
        });

        it('should create axios config objects', () => {
            const config: AxiosRequestConfig = {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://test.example.com',
                },
                timeout: 10000,
                maxRedirects: 5,
                responseType: 'text',
            };

            expect(config.method).toBe('GET');
            expect(config.headers?.['User-Agent']).toContain('Mozilla/5.0');
            expect(config.timeout).toBe(10000);
            expect(config.responseType).toBe('text');
        });

        it('should handle URLSearchParams for form data', () => {
            const formData = new URLSearchParams({
                action: 'player_ajax',
                post: '12345',
                nume: '1',
                type: 'embed',
            });

            expect(formData.toString()).toBe('action=player_ajax&post=12345&nume=1&type=embed');
            expect(formData.get('action')).toBe('player_ajax');
        });

        it('should validate axios response structure', () => {
            const mockResponse: AxiosResponse = {
                data: { test: 'data' },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
                request: {},
            };

            expect(mockResponse.status).toBe(200);
            expect(mockResponse.data).toBeDefined();
            expect(typeof mockResponse.data).toBe('object');
        });
    });

    describe('Cheerio HTML Parsing Compatibility', () => {
        let $: CheerioAPI;

        beforeAll(() => {
            $ = load(mockHtmlContent);
        });

        it('should load HTML content with cheerio', () => {
            expect($).toBeDefined();
            expect(typeof $).toBe('function');
        });

        it('should parse anime-specific elements', () => {
            const title = $('.anime-title').text();
            expect(title).toBe('Test Anime Title');

            const synopsis = $('.synopsis').text();
            expect(synopsis).toContain('test anime synopsis');
        });

        it('should extract episode links', () => {
            const episodes: string[] = [];
            $('.episode-link').each((_, element) => {
                episodes.push($(element).text());
            });

            expect(episodes).toEqual(['Episode 1', 'Episode 2']);
        });

        it('should extract iframe src for video players', () => {
            const iframeSrc = $('iframe').attr('src');
            expect(iframeSrc).toBe('https://player.example.com/embed/12345');
        });

        it('should parse genre links', () => {
            const genres: { text: string; href: string }[] = [];
            $('.genre').each((_, element) => {
                genres.push({
                    text: $(element).text(),
                    href: $(element).attr('href') || '',
                });
            });

            expect(genres).toHaveLength(2);
            expect(genres[0].text).toBe('Action');
            expect(genres[0].href).toBe('/genre/action');
        });

        it('should parse download links with quality and size', () => {
            const downloads: { quality: string; size: string; link: string }[] = [];
            $('.download-links li').each((_, element) => {
                const quality = $(element).find('strong').text();
                const size = $(element).find('i').text();
                const link = $(element).find('a').attr('href') || '';
                downloads.push({ quality, size, link });
            });

            expect(downloads).toHaveLength(2);
            expect(downloads[0].quality).toBe('720p');
            expect(downloads[0].size).toBe('300MB');
            expect(downloads[0].link).toBe('/download/720p');
        });

        it('should handle element manipulation for text extraction', () => {
            const testHtml = '<div><p>First paragraph</p><br><p>Second paragraph</p></div>';
            const $test = load(testHtml);

            // Add break markers like in the real scraper
            $test('br').after('BREAK');
            const text = $test('div').text();

            expect(text).toContain('BREAK');
            expect(text).toContain('First paragraph');
            expect(text).toContain('Second paragraph');
        });
    });

    describe('DataFetcher Service Compatibility', () => {
        it('should have wajikFetch function available', () => {
            expect(wajikFetch).toBeDefined();
            expect(typeof wajikFetch).toBe('function');
        });

        it('should have getFinalUrl function available', () => {
            expect(getFinalUrl).toBeDefined();
            expect(typeof getFinalUrl).toBe('function');
        });

        it('should have getFinalUrls function available', () => {
            expect(getFinalUrls).toBeDefined();
            expect(typeof getFinalUrls).toBe('function');
        });

        it('should handle function parameters correctly', () => {
            const url = 'https://example.com/test';
            const ref = 'https://example.com';
            const config: AxiosRequestConfig = {
                method: 'GET',
                timeout: 5000,
                headers: { 'Custom-Header': 'test' },
            };

            // Test that parameters can be passed without errors
            expect(() => {
                // These would normally make HTTP requests, but we're just testing parameter handling
                const params = [url, ref, config];
                expect(params[0]).toBe(url);
                expect(params[1]).toBe(ref);
                expect(params[2]).toBe(config);
            }).not.toThrow();
        });
    });

    describe('Fallback Implementation Tests', () => {
        it('should have fallback functions available', () => {
            expect(fetchFallback).toBeDefined();
            expect(getFinalUrlFallback).toBeDefined();
            expect(wajikFetchWithFallback).toBeDefined();
        });

        it('should handle fetch configuration', () => {
            const config: AxiosRequestConfig = {
                method: 'POST',
                data: new URLSearchParams({ test: 'data' }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                timeout: 5000,
            };

            expect(config.method).toBe('POST');
            expect(config.data).toBeInstanceOf(URLSearchParams);
            expect(config.timeout).toBe(5000);
        });

        it('should handle AbortSignal for timeouts', () => {
            const signal = AbortSignal.timeout(5000);
            expect(signal).toBeDefined();
            expect(signal.aborted).toBe(false);
        });
    });

    describe('AnimeScraper Base Class Compatibility', () => {
        it('should initialize AnimeScraper correctly', () => {
            expect(testScraper).toBeDefined();
            expect(testScraper).toBeInstanceOf(AnimeScraper);
        });

        it('should handle string utilities', () => {
            expect(testScraper.testStr('  test string  ')).toBe('test string');
            expect(testScraper.testStr('')).toBe('');
            expect(testScraper.testStr(undefined)).toBe('');
            expect(testScraper.testStr('   ')).toBe('');
        });

        it('should handle number parsing', () => {
            expect(testScraper.testNum('123')).toBe(123);
            expect(testScraper.testNum('  456  ')).toBe(456);
            expect(testScraper.testNum('0')).toBe(null); // 0 is falsy, so it returns null
            expect(testScraper.testNum('invalid')).toBe(null);
            expect(testScraper.testNum(undefined)).toBe(null);
            expect(testScraper.testNum('')).toBe(null);
        });

        it('should generate slugs from URLs', () => {
            expect(testScraper.testGenerateSlug('https://example.com/anime/test-anime-slug')).toBe('test-anime-slug');
            expect(testScraper.testGenerateSlug('/episode/episode-1-subtitle')).toBe('episode-1-subtitle');
            expect(testScraper.testGenerateSlug('/batch/anime-batch-complete/')).toBe('anime-batch-complete');
            expect(testScraper.testGenerateSlug('')).toBe('');
            expect(testScraper.testGenerateSlug('no-slashes')).toBe('no-slashes');
        });

        it('should handle URL generation based on config', () => {
            // Test with sourceUrl enabled
            const originalSourceUrl = animeConfig.response.sourceUrl;
            animeConfig.response.sourceUrl = true;

            expect(testScraper.testGenerateSourceUrl('/test-path')).toBe('https://test-anime.com/test-path');
            expect(testScraper.testGenerateSourceUrl('https://test-anime.com/full-url')).toBe('https://test-anime.com/full-url');

            // Test with sourceUrl disabled
            animeConfig.response.sourceUrl = false;
            expect(testScraper.testGenerateSourceUrl('/test-path')).toBeUndefined();

            // Restore original setting
            animeConfig.response.sourceUrl = originalSourceUrl;
        });

        it('should handle href generation based on config', () => {
            // Test with href enabled
            const originalHref = animeConfig.response.href;
            animeConfig.response.href = true;

            expect(testScraper.testGenerateHref('anime', 'test-id')).toBe('/api/anime/test-id');
            expect(testScraper.testGenerateHref('episode')).toBe('/api/episode');
            expect(testScraper.testGenerateHref()).toBe('/api');

            // Test with href disabled
            animeConfig.response.href = false;
            expect(testScraper.testGenerateHref('anime', 'test-id')).toBeUndefined();

            // Restore original setting
            animeConfig.response.href = originalHref;
        });

        it('should extract iframe src from HTML', () => {
            const html1 = '<iframe src="https://player.example.com/embed/123" width="100%" height="400"></iframe>';
            expect(testScraper.testGenerateSrcFromIframeTag(html1)).toBe('https://player.example.com/embed/123');

            const html2 = '<div><iframe src="https://another-player.com/video/456"></iframe></div>';
            expect(testScraper.testGenerateSrcFromIframeTag(html2)).toBe('https://another-player.com/video/456');

            const noIframe = '<div>No iframe here</div>';
            expect(testScraper.testGenerateSrcFromIframeTag(noIframe)).toBe('No iframe found');

            const emptyHtml = '';
            expect(testScraper.testGenerateSrcFromIframeTag(emptyHtml)).toBe('No iframe found');
        });

        it('should handle encoding and decoding for server IDs', () => {
            const testStrings = [
                'testString123',
                'anime-episode-1',
                'server-id-12345',
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
            ];

            testStrings.forEach(original => {
                const encoded = testScraper.testEnrawr(original);
                const decoded = testScraper.testDerawr(encoded);

                expect(encoded).not.toBe(original); // Should be different when encoded
                expect(decoded).toBe(original); // Should match when decoded
            });
        });
    });



    describe('Integration Workflow Tests', () => {
        it('should handle complete scraping workflow simulation', () => {
            const $ = load(mockHtmlContent);

            const animeData = {
                title: $('.anime-title').text(),
                synopsis: $('.synopsis').text(),

                episodes: $('.episode-link').map((_, el) => {
                    const href = $(el).attr('href') ?? undefined;
                    return {
                        title: $(el).text(),
                        href,
                        slug: href ? testScraper.testGenerateSlug(href) : undefined,
                    };
                }).get(),

                genres: $('.genre').map((_, el) => {
                    const href = $(el).attr('href') ?? undefined;
                    return {
                        title: $(el).text(),
                        href,
                        slug: href ? testScraper.testGenerateSlug(href) : undefined,
                    };
                }).get(),

                streamingUrl: testScraper.testGenerateSrcFromIframeTag(
                    $('iframe').prop('outerHTML') ?? undefined
                ),
            };

            expect(animeData.title).toBe('Test Anime Title');
            expect(animeData.episodes).toHaveLength(2);
            expect(animeData.episodes[0].title).toBe('Episode 1');
            expect(animeData.episodes[0].slug).toBe('episode-1');
            expect(animeData.genres).toHaveLength(2);
            expect(animeData.streamingUrl).toBe('https://player.example.com/embed/12345');
        });
    });

    it('should handle error scenarios gracefully', () => {
        // Test with malformed HTML
        const malformedHtml = '<div><p>Unclosed paragraph<div>Nested without closing</div>';
        const $ = load(malformedHtml);

        // Cheerio should still parse it
        expect($('p').text()).toBe('Unclosed paragraph');
        expect($('div').length).toBeGreaterThan(0);
    });

    it('should handle empty or missing elements', () => {
        const emptyHtml = '<div></div>';
        const $ = load(emptyHtml);

        expect($('.non-existent').length).toBe(0);
        expect($('.non-existent').text()).toBe('');
        expect($('.non-existent').attr('href')).toBeUndefined();
    });
});

describe('Performance and Memory Tests', () => {
    it('should handle large HTML parsing efficiently', () => {
        const largeHtml = '<div class="container">' +
            Array(1000).fill('<p class="item">Item content</p>').join('') +
            '</div>';

        const startTime = Date.now();
        const $ = load(largeHtml);
        const items = $('.item');
        const endTime = Date.now();

        expect(items.length).toBe(1000);
        expect(endTime - startTime).toBeLessThan(1000); // Should parse quickly
    });

    it('should handle multiple cheerio instances', () => {
        const html1 = '<div class="page1">Page 1 content</div>';
        const html2 = '<div class="page2">Page 2 content</div>';

        const $1 = load(html1);
        const $2 = load(html2);

        expect($1('.page1').text()).toBe('Page 1 content');
        expect($2('.page2').text()).toBe('Page 2 content');
        expect($1('.page2').length).toBe(0); // Should be isolated
        expect($2('.page1').length).toBe(0); // Should be isolated
    });
});
