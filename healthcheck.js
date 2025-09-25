#!/usr/bin/env bun

// Health check script for Docker container
// This script verifies that the application is running correctly

const PORT = process.env.PORT || 3001;
const HEALTH_CHECK_URL = `http://localhost:${PORT}/`;

async function healthCheck() {
    try {
        const response = await fetch(HEALTH_CHECK_URL, {
            method: 'GET',
            timeout: 5000,
        });

        if (response.ok) {
            console.log('✅ Health check passed');
            process.exit(0);
        } else {
            console.error(`❌ Health check failed: HTTP ${response.status}`);
            process.exit(1);
        }
    } catch (error) {
        console.error(`❌ Health check failed: ${error.message}`);
        process.exit(1);
    }
}

healthCheck();