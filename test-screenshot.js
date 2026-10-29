const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple static file server
function startServer(port) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let filePath = '.' + req.url;
      if (filePath === './') {
        filePath = './index.html';
      }

      const extname = String(path.extname(filePath)).toLowerCase();
      const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
      };

      const contentType = mimeTypes[extname] || 'application/octet-stream';

      fs.readFile(filePath, (error, content) => {
        if (error) {
          if (error.code === 'ENOENT') {
            res.writeHead(404);
            res.end('File not found');
          } else {
            res.writeHead(500);
            res.end('Server error: ' + error.code);
          }
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content, 'utf-8');
        }
      });
    });

    server.listen(port, () => {
      console.log(`Server running at http://localhost:${port}/`);
      resolve(server);
    });
  });
}

async function captureScreenshot() {
  const port = 8080;
  const server = await startServer(port);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 900 });

    // Capture console messages
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      });
    });

    // Capture errors
    const errors = [];
    page.on('pageerror', error => {
      errors.push(error.toString());
    });

    // Navigate to the page
    await page.goto(`http://localhost:${port}/`, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    // Wait for the canvas and Three.js to initialize
    await page.waitForSelector('#canvas', { timeout: 5000 });
    
    // Wait a bit for the scene to render
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({ 
      path: 'aquarium-screenshot.png',
      fullPage: false
    });

    console.log('\n✅ Screenshot saved as aquarium-screenshot.png');

    // Report console messages
    console.log('\n📋 Console Messages:');
    if (consoleMessages.length === 0) {
      console.log('  ✅ No console messages');
    } else {
      consoleMessages.forEach(msg => {
        const icon = msg.type === 'error' ? '❌' : msg.type === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`  ${icon} [${msg.type}] ${msg.text}`);
      });
    }

    // Report errors
    console.log('\n🐛 JavaScript Errors:');
    if (errors.length === 0) {
      console.log('  ✅ No JavaScript errors detected');
    } else {
      errors.forEach(error => {
        console.log(`  ❌ ${error}`);
      });
    }

    // Get fish count and other stats
    const stats = await page.evaluate(() => {
      return {
        fishCount: document.getElementById('fishCount')?.textContent || 'N/A',
        plantCount: document.getElementById('plantCount')?.textContent || 'N/A',
        rockCount: document.getElementById('rockCount')?.textContent || 'N/A',
        bubbleCount: document.getElementById('bubbleCount')?.textContent || 'N/A',
        canvasPresent: !!document.getElementById('canvas'),
        threeJsLoaded: typeof THREE !== 'undefined'
      };
    });

    console.log('\n📊 Aquarium Stats:');
    console.log(`  🐠 Fish: ${stats.fishCount}`);
    console.log(`  🌿 Plants: ${stats.plantCount}`);
    console.log(`  🪨 Rocks: ${stats.rockCount}`);
    console.log(`  💧 Bubbles: ${stats.bubbleCount}`);
    console.log(`  Canvas Present: ${stats.canvasPresent ? '✅' : '❌'}`);
    console.log(`  Three.js Loaded: ${stats.threeJsLoaded ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Error during screenshot capture:', error);
  } finally {
    await browser.close();
    server.close();
  }
}

captureScreenshot();
