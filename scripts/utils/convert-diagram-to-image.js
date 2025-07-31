const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function convertHtmlToImage() {
    console.log('Starting HTML to PNG conversion...');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Set viewport for better rendering
        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 2
        });
        
        const outputDir = path.join(__dirname, '..', 'docs', 'images');
        const htmlFiles = [
            'schema-management-flow.html',
            'schema-management-flow-simplified.html'
        ];
        
        for (const htmlFile of htmlFiles) {
            const htmlPath = path.join(outputDir, htmlFile);
            
            if (fs.existsSync(htmlPath)) {
                console.log(`Converting ${htmlFile}...`);
                
                // Load the HTML file
                await page.goto(`file://${htmlPath}`, {
                    waitUntil: 'networkidle0',
                    timeout: 30000
                });
                
                // Wait for Mermaid to render
                await page.waitForSelector('.mermaid', { timeout: 10000 });
                
                // Additional wait for diagram to fully render
                await page.waitForTimeout(3000);
                
                // Generate output filename
                const baseName = htmlFile.replace('.html', '');
                const pngPath = path.join(outputDir, `${baseName}.png`);
                const svgPath = path.join(outputDir, `${baseName}.svg`);
                
                // Take screenshot
                await page.screenshot({
                    path: pngPath,
                    fullPage: true,
                    type: 'png'
                });
                
                console.log(`PNG created: ${pngPath}`);
                
                // Also try to get SVG if possible
                try {
                    const svgContent = await page.evaluate(() => {
                        const mermaidElement = document.querySelector('.mermaid');
                        if (mermaidElement && mermaidElement.querySelector('svg')) {
                            return mermaidElement.querySelector('svg').outerHTML;
                        }
                        return null;
                    });
                    
                    if (svgContent) {
                        fs.writeFileSync(svgPath, svgContent);
                        console.log(`SVG created: ${svgPath}`);
                    }
                } catch (svgError) {
                    console.log('SVG conversion failed, PNG only created');
                }
            } else {
                console.log(`HTML file not found: ${htmlPath}`);
            }
        }
        
    } catch (error) {
        console.error('Error during conversion:', error.message);
    } finally {
        await browser.close();
        console.log('Browser closed');
    }
}

// Check if Puppeteer is available
try {
    require('puppeteer');
    convertHtmlToImage().then(() => {
        console.log('Diagram conversion completed!');
        console.log('Check the docs/images/ directory for the generated images');
    }).catch(error => {
        console.error('Conversion failed:', error.message);
    });
} catch (error) {
    console.log('Puppeteer not installed. Installing now...');
    
    // Install Puppeteer if not available
    const { execSync } = require('child_process');
    try {
        execSync('npm install puppeteer', { stdio: 'inherit' });
        console.log('Puppeteer installed successfully');
        
        // Retry conversion
        convertHtmlToImage().then(() => {
            console.log('Diagram conversion completed!');
            console.log('Check the docs/images/ directory for the generated images');
        }).catch(error => {
            console.error('Conversion failed:', error.message);
        });
    } catch (installError) {
        console.error('Failed to install Puppeteer:', installError.message);
        console.log('You can manually install with: npm install puppeteer');
        console.log('Or open the HTML files directly in a browser to view the diagrams');
    }
} 