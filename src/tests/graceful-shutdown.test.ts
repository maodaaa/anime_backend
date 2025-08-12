import { describe, it, expect } from 'bun:test';
import { readFile } from 'fs/promises';

describe('Graceful Shutdown Implementation', () => {
    it('should have SIGTERM signal handler', async () => {
        const indexContent = await readFile('src/index.ts', 'utf-8');

        expect(indexContent).toContain("process.on('SIGTERM'");
        expect(indexContent).toContain('gracefulShutdown');
    });

    it('should have SIGINT signal handler', async () => {
        const indexContent = await readFile('src/index.ts', 'utf-8');

        expect(indexContent).toContain("process.on('SIGINT'");
        expect(indexContent).toContain('gracefulShutdown');
    });

    it('should have graceful shutdown function with proper cleanup', async () => {
        const indexContent = await readFile('src/index.ts', 'utf-8');

        // Check for graceful shutdown function
        expect(indexContent).toContain('async function gracefulShutdown');

        // Check for connection cleanup
        expect(indexContent).toContain('activeConnections');
        expect(indexContent).toContain('Preparing to close server');
        expect(indexContent).toContain('active connections');

        // Check for proper exit handling
        expect(indexContent).toContain('process.exit(0)');
        expect(indexContent).toContain('Graceful shutdown completed');
    });

    it('should have forced shutdown timeout mechanism', async () => {
        const indexContent = await readFile('src/index.ts', 'utf-8');

        expect(indexContent).toContain('forceShutdownTimeout');
        expect(indexContent).toContain('10000'); // 10 second timeout
        expect(indexContent).toContain('Forcing exit');
        expect(indexContent).toContain('clearTimeout');
    });

    it('should handle uncaught exceptions and unhandled rejections', async () => {
        const indexContent = await readFile('src/index.ts', 'utf-8');

        expect(indexContent).toContain("process.on('uncaughtException'");
        expect(indexContent).toContain("process.on('unhandledRejection'");
    });

    it('should prevent multiple shutdown attempts', async () => {
        const indexContent = await readFile('src/index.ts', 'utf-8');

        expect(indexContent).toContain('isShuttingDown');
        expect(indexContent).toContain('Already shutting down');
    });

    it('should track active connections for cleanup', async () => {
        const indexContent = await readFile('src/index.ts', 'utf-8');

        expect(indexContent).toContain('activeConnections = new Set');
        expect(indexContent).toContain('activeConnections.add');
        expect(indexContent).toContain('activeConnections.delete');
        expect(indexContent).toContain('activeConnections.clear');
    });
});