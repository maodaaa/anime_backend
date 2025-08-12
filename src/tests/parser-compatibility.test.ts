import { describe, it, expect, beforeAll } from 'bun:test';
import OtakudesuParser from '@otakudesu/parsers/OtakudesuParser';
import SamehadakuParser from '@samehadaku/parsers/SamehadakuParser';
import animeConfig from '@configs/animeConfig';

describe('Parser Compatibility Tests', () => {
    describe('OtakudesuParser', () => {
        let parser: OtakudesuParser;

        beforeAll(() => {
            parser = new OtakudesuParser(animeConfig.baseUrl.otakudesu, '/otakudesu');
        });

        it('should initialize OtakudesuParser correctly', () => {
            expect(parser).toBeDefined();
            expect(parser).toBeInstanceOf(OtakudesuParser);
        });

        it('should have all required parsing methods', () => {
            expect(typeof parser.parseHome).toBe('function');
            expect(typeof parser.parseSchedule).toBe('function');
            expect(typeof parser.parseAllAnimes).toBe('function');
            expect(typeof parser.parseAllGenres).toBe('function');
            expect(typeof parser.parseOngoingAnimes).toBe('function');
            expect(typeof parser.parseCompletedAnimes).toBe('function');
            expect(typeof parser.parseSearch).toBe('function');
            expect(typeof parser.parseGenreAnimes).toBe('function');
            expect(typeof parser.parseAnimeDetails).toBe('function');
            expect(typeof parser.parseAnimeEpisode).toBe('function');
            expect(typeof parser.parseServerUrl).toBe('function');
            expect(typeof parser.parseAnimeBatch).toBe('function');
        });

        it('should handle base URL configuration', () => {
            expect(animeConfig.baseUrl.otakudesu).toBeDefined();
            expect(typeof animeConfig.baseUrl.otakudesu).toBe('string');
        });
    });

    describe('SamehadakuParser', () => {
        let parser: SamehadakuParser;

        beforeAll(() => {
            parser = new SamehadakuParser(animeConfig.baseUrl.samehadaku, '/samehadaku');
        });

        it('should initialize SamehadakuParser correctly', () => {
            expect(parser).toBeDefined();
            expect(parser).toBeInstanceOf(SamehadakuParser);
        });

        it('should have all required parsing methods', () => {
            expect(typeof parser.parseHome).toBe('function');
            expect(typeof parser.parseAllGenres).toBe('function');
            expect(typeof parser.parseAllAnimes).toBe('function');
            expect(typeof parser.parseSchedule).toBe('function');
            expect(typeof parser.parseRecentAnime).toBe('function');
            expect(typeof parser.parseOngoingAnimes).toBe('function');
            expect(typeof parser.parseCompletedAnimes).toBe('function');
            expect(typeof parser.parsePopularAnimes).toBe('function');
            expect(typeof parser.parseMovies).toBe('function');
            expect(typeof parser.parseBatches).toBe('function');
            expect(typeof parser.parseSearch).toBe('function');
            expect(typeof parser.parseGenreAnimes).toBe('function');
            expect(typeof parser.parseAnimeDetails).toBe('function');
            expect(typeof parser.parseAnimeEpisode).toBe('function');
            expect(typeof parser.parseServerUrl).toBe('function');
            expect(typeof parser.parseWibuFile).toBe('function');
            expect(typeof parser.parseAnimeBatch).toBe('function');
        });

        it('should handle base URL configuration', () => {
            expect(animeConfig.baseUrl.samehadaku).toBeDefined();
            expect(typeof animeConfig.baseUrl.samehadaku).toBe('string');
        });
    });

    describe('Configuration Compatibility', () => {
        it('should have valid anime configuration', () => {
            expect(animeConfig).toBeDefined();
            expect(animeConfig.baseUrl).toBeDefined();
            expect(animeConfig.response).toBeDefined();
            expect(typeof animeConfig.response.href).toBe('boolean');
            expect(typeof animeConfig.response.sourceUrl).toBe('boolean');
        });

        it('should handle PORT configuration', () => {
            expect(animeConfig.PORT).toBeDefined();
            expect(typeof animeConfig.PORT).toBe('number');
            expect(animeConfig.PORT).toBeGreaterThan(0);
        });
    });
});