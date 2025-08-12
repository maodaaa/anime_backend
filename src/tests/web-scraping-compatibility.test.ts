import { describe, it, expect, beforeAll } from 'bun:test';
import axios, { type AxiosResponse, type AxiosRequestConfig } from 'axios';
import { load, type CheerioAPI } from 'cheerio';
import { wajikFetch, getFinalUrl, getFinalUrls } from '@services/dataFetcher';
import AnimeScraper from '@scrapers/AnimeScraper';
import animeConfig from '@configs/animeConfig';

// Mock HTML content for testing
const mockHtmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Page</title>
</head>
<body>
    <div class="test-container">
        <h1>Test Title</h1>
        <p>Test paragraph content</p>
        <a href="/test-link" class="test-link">Test Link</a>
        <iframe src="https://example.com/embed/test" width="100%" height="400"></iframe>
    </div>
    <ul class="anime-list">
        <li><a href="/anime/test-anime-1">Test Anime 1</a></li>
        <li><a href="/anime/test-anime-2">Test Anime 2</a></li>
    </ul>
</body>
</html>
`;

// Test implementation of AnimeScraper for testing
class TestAnimeScraper extends AnimeScraper {
    constructor() {
        super('https://test.example.com', '/test');
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
}

describe('Web Scraping Compatibility Tests', () => {
    let testScraper: TestAnimeScraper;

    beforeAll(() => {
        testScraper = new TestAnimeScraper();
    });

    describe('Axios HTTP Client Tests', () => {
        it('should make basic GET request with axios', async () => {
            // Test with a reliable endpoint
            const response = await axios.get('https://httpbin.org/get', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; Bun-Test/1.0)',
                },
                timeout: 10000,
            });

            expect(response.status).toBe(200);
            expect(response.data).toBeDefined();
            expect(typeof response.data).toBe('object');
        });

        it('should handle axios POST requests', async () => {
            const testData = { test: 'data', timestamp: Date.now() };

            const response = await axios.post('https://httpbin.org/post', testData, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (compatible; Bun-Test/1.0)',
                },
                timeout: 10000,
            });

            expect(response.status).toBe(200);
            expect(response.data.json).toEqual(testData);
        });

        it('should handle axios with custom headers and referer', async () => {
            const response = await axios.get('https://httpbin.org/headers', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://test.example.com',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                },
                timeout: 10000,
            });

            expect(response.status).toBe(200);
            expect(response.data.headers['User-Agent']).toContain('Mozilla/5.0');
            expect(response.data.headers['Referer']).toBe('https://test.example.com');
        });



        it('should handle axios redirects', async () => {
            const response = await axios.get('https://httpbin.org/redirect/2', {
                maxRedirects: 5,
                timeout: 10000,
            });

            expect(response.status).toBe(200);
            expect(response.data.url).toContain('httpbin.org/get');
        });

        it('should handle axios errors properly', async () => {
            try {
                await axios.get('https://httpbin.org/status/404', {
                    timeout: 10000,
                });
                expect(true).toBe(false); // Should not reach here
            } catch (error: any) {
                expect(error.response.status).toBe(404);
                expect(error.isAxiosError).toBe(true);
            }
        });
    });

    describe('Cheerio HTML Parsing Tests', () => {
        let $: CheerioAPI;

        beforeAll(() => {
            $ = load(mockHtmlContent);
        });

        it('should parse HTML content with cheerio', () => {
            expect($).toBeDefined();
            expect(typeof $).toBe('function');
        });

        it('should select elements by class', () => {
            const container = $('.test-container');
            expect(container.length).toBe(1);

            const title = container.find('h1').text();
            expect(title).toBe('Test Title');
        });

        it('should extract text content', () => {
            const paragraph = $('p').text();
            expect(paragraph).toBe('Test paragraph content');
        });

        it('should extract attributes', () => {
            const linkHref = $('.test-link').attr('href');
            expect(linkHref).toBe('/test-link');

            const iframeSrc = $('iframe').attr('src');
            expect(iframeSrc).toBe('https://example.com/embed/test');
        });

        it('should iterate over multiple elements', () => {
            const animeLinks: string[] = [];
            $('.anime-list li a').each((_, element) => {
                animeLinks.push($(element).attr('href') || '');
            });

            expect(animeLinks).toEqual(['/anime/test-anime-1', '/anime/test-anime-2']);
        });

        it('should handle element manipulation', () => {
            const testHtml = '<div><p>Original</p><br><p>Content</p></div>';
            const $test = load(testHtml);

            $test('br').after('BREAK');
            const text = $test('div').text();
            expect(text).toContain('BREAK');
        });
    });

    describe('DataFetcher Service Tests', () => {
        it('should fetch data with wajikFetch function', async () => {
            const data = await wajikFetch(
                'https://httpbin.org/get',
                'https://test.example.com',
                {
                    method: 'GET',
                    timeout: 10000,
                }
            );

            expect(data).toBeDefined();
            expect(data.headers['User-Agent']).toContain('Mozilla/5.0');
            expect(data.headers['Referer']).toBe('https://test.example.com');
        });

        it('should handle getFinalUrl redirect resolution', async () => {
            const finalUrl = await getFinalUrl(
                'https://httpbin.org/redirect-to?url=https://httpbin.org/get',
                'https://test.example.com',
                { timeout: 10000 }
            );

            expect(finalUrl).toBe('https://httpbin.org/get');
        });

        it('should handle getFinalUrls batch processing', async () => {
            const urls = [
                'https://httpbin.org/redirect-to?url=https://httpbin.org/get',
                'https://httpbin.org/redirect-to?url=https://httpbin.org/json',
            ];

            const finalUrls = await getFinalUrls(urls, 'https://test.example.com', {
                axiosConfig: { timeout: 10000 },
                retryConfig: { retries: 2, delay: 500 },
            });

            expect(finalUrls).toHaveLength(2);
            expect(finalUrls[0]).toBe('https://httpbin.org/get');
            expect(finalUrls[1]).toBe('https://httpbin.org/json');
        });

        it('should handle retry logic in getFinalUrls', async () => {
            const urls = [
                'https://httpbin.org/status/500', // This will fail
                'https://httpbin.org/get', // This will succeed
            ];

            const finalUrls = await getFinalUrls(urls, 'https://test.example.com', {
                axiosConfig: { timeout: 5000 },
                retryConfig: { retries: 1, delay: 100 },
            });

            expect(finalUrls).toHaveLength(2);
            expect(finalUrls[0]).toBe(''); // Failed request returns empty string
            expect(finalUrls[1]).toBe('https://httpbin.org/get'); // Successful request
        });
    });

    describe('AnimeScraper Base Class Tests', () => {
        it('should initialize AnimeScraper correctly', () => {
            expect(testScraper).toBeDefined();
            expect(testScraper).toBeInstanceOf(AnimeScraper);
        });

        it('should handle string trimming', () => {
            expect(testScraper.testStr('  test string  ')).toBe('test string');
            expect(testScraper.testStr('')).toBe('');
            expect(testScraper.testStr(undefined)).toBe('');
        });

        it('should handle number parsing', () => {
            expect(testScraper.testNum('123')).toBe(123);
            expect(testScraper.testNum('  456  ')).toBe(456);
            expect(testScraper.testNum('invalid')).toBe(null);
            expect(testScraper.testNum(undefined)).toBe(null);
        });

        it('should generate slugs from URLs', () => {
            expect(testScraper.testGenerateSlug('https://example.com/anime/test-anime')).toBe('test-anime');
            expect(testScraper.testGenerateSlug('/episode/episode-1')).toBe('episode-1');
            expect(testScraper.testGenerateSlug('')).toBe('');
        });

        it('should generate source URLs when enabled', () => {
            // Temporarily enable sourceUrl for testing
            const originalSourceUrl = animeConfig.response.sourceUrl;
            animeConfig.response.sourceUrl = true;

            expect(testScraper.testGenerateSourceUrl('/test-path')).toBe('https://test.example.com/test-path');
            expect(testScraper.testGenerateSourceUrl('https://test.example.com/full-url')).toBe('https://test.example.com/full-url');

            // Restore original setting
            animeConfig.response.sourceUrl = originalSourceUrl;
        });

        it('should generate href paths when enabled', () => {
            // Temporarily enable href for testing
            const originalHref = animeConfig.response.href;
            animeConfig.response.href = true;

            expect(testScraper.testGenerateHref('anime', 'test-id')).toBe('/test/anime/test-id');
            expect(testScraper.testGenerateHref('episode')).toBe('/test/episode');

            // Restore original setting
            animeConfig.response.href = originalHref;
        });

        it('should extract iframe src from HTML', () => {
            const html = '<iframe src="https://example.com/embed/123" width="100%" height="400"></iframe>';
            expect(testScraper.testGenerateSrcFromIframeTag(html)).toBe('https://example.com/embed/123');

            const noIframe = '<div>No iframe here</div>';
            expect(testScraper.testGenerateSrcFromIframeTag(noIframe)).toBe('No iframe found');
        });

        it('should handle encoding and decoding', () => {
            const original = 'testString123';
            const encoded = testScraper.testEnrawr(original);
            const decoded = testScraper.testDerawr(encoded);

            expect(encoded).not.toBe(original);
            expect(decoded).toBe(original);
        });
    });

    describe('Integration Tests', () => {
        it('should perform complete scraping workflow', async () => {
            // Create a mock server response
            const mockResponse = {
                data: mockHtmlContent,
                status: 200,
                headers: {},
            };

            // Test the complete workflow: fetch -> parse -> extract
            const $ = load(mockResponse.data);

            const title = $('h1').text();
            const links = $('.anime-list li a').map((_, el) => ({
                text: $(el).text(),
                href: $(el).attr('href'),
            })).get();

            expect(title).toBe('Test Title');
            expect(links).toHaveLength(2);
            expect(links[0].text).toBe('Test Anime 1');
            expect(links[0].href).toBe('/anime/test-anime-1');
        });

        it('should handle error scenarios gracefully', async () => {
            try {
                await axios.get('https://nonexistent-domain-12345.com', {
                    timeout: 5000,
                });
                expect(true).toBe(false); // Should not reach here
            } catch (error: any) {
                expect(error).toBeDefined();
                expect(error.code || error.response?.status).toBeDefined();
            }
        });
    });




    describe('Performance Tests', () => {
        it('should handle concurrent requests efficiently', async () => {
            const startTime = Date.now();

            const requests = Array(5).fill(null).map(() =>
                axios.get('https://httpbin.org/delay/1', { timeout: 10000 })
            );

            const responses = await Promise.all(requests);
            const endTime = Date.now();
            const duration = endTime - startTime;

            expect(responses).toHaveLength(5);
            responses.forEach(response => {
                expect(response.status).toBe(200);
            });

            // Should complete in roughly 1 second (concurrent), not 5 seconds (sequential)
            expect(duration).toBeLessThan(3000);
        });

        it('should handle large HTML parsing efficiently', () => {
            const largeHtml = '<div>' + 'x'.repeat(100000) + '</div>';
            const startTime = Date.now();

            const $ = load(largeHtml);
            const content = $('div').text();

            const endTime = Date.now();
            const duration = endTime - startTime;

            expect(content).toHaveLength(100000);
            expect(duration).toBeLessThan(1000); // Should parse quickly
        });
    });
});