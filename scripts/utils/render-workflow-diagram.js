const fs = require('fs');
const path = require('path');

// Read the workflow diagram markdown
const workflowContent = fs.readFileSync(path.join(__dirname, '../docs/workflow-diagram.md'), 'utf8');

// Extract Mermaid diagrams
const mermaidDiagrams = [];
const diagramRegex = /```mermaid\n([\s\S]*?)\n```/g;
let match;

while ((match = diagramRegex.exec(workflowContent)) !== null) {
    mermaidDiagrams.push(match[1]);
}

// Create HTML template
const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DAO Registry Workflow Diagram</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        
        .header p {
            margin: 10px 0 0 0;
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px;
        }
        
        .diagram-section {
            margin-bottom: 50px;
            background: #f8f9fa;
            border-radius: 10px;
            padding: 30px;
            border-left: 5px solid #667eea;
        }
        
        .diagram-section h2 {
            color: #333;
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 1.8em;
        }
        
        .diagram-container {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            margin-bottom: 20px;
        }
        
        .diagram-description {
            color: #666;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        
        .mermaid {
            text-align: center;
            margin: 20px 0;
        }
        
        .controls {
            text-align: center;
            margin: 20px 0;
        }
        
        .btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            margin: 0 10px;
            font-size: 14px;
            transition: all 0.3s ease;
        }
        
        .btn:hover {
            background: #5a6fd8;
            transform: translateY(-2px);
        }
        
        .summary {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-top: 30px;
        }
        
        .summary h3 {
            margin-top: 0;
            font-size: 1.5em;
        }
        
        .summary ul {
            margin: 15px 0;
            padding-left: 20px;
        }
        
        .summary li {
            margin: 8px 0;
            line-height: 1.5;
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            border-top: 1px solid #eee;
        }
        
        @media (max-width: 768px) {
            .container {
                margin: 10px;
                border-radius: 10px;
            }
            
            .content {
                padding: 20px;
            }
            
            .header h1 {
                font-size: 2em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>DAO Registry Workflow</h1>
            <p>  system architecture and data flow diagrams</p>
        </div>
        
        <div class="content">
            <div class="diagram-section">
                <h2>System Overview</h2>
                <div class="diagram-description">
                    High-level view of the DAO Registry system showing key components, external entities, and their interactions.
                </div>
                <div class="diagram-container">
                    <div class="mermaid" id="overview-diagram">
                        ${mermaidDiagrams[0]}
                    </div>
                </div>
            </div>
            
            <div class="diagram-section">
                <h2>DAO Registration Process</h2>
                <div class="diagram-description">
                    Step-by-step sequence diagram showing how DAO organizations register and validate their information.
                </div>
                <div class="diagram-container">
                    <div class="mermaid" id="registration-diagram">
                        ${mermaidDiagrams[1]}
                    </div>
                </div>
            </div>
            
            <div class="diagram-section">
                <h2>Cross-Chain Data Flow</h2>
                <div class="diagram-description">
                    Illustration of how data flows across different blockchain networks using CCIP integration.
                </div>
                <div class="diagram-container">
                    <div class="mermaid" id="crosschain-diagram">
                        ${mermaidDiagrams[2]}
                    </div>
                </div>
            </div>
            
            <div class="diagram-section">
                <h2>API Integration Workflow</h2>
                <div class="diagram-description">
                    Flowchart showing the API request processing, authentication, and response handling.
                </div>
                <div class="diagram-container">
                    <div class="mermaid" id="api-diagram">
                        ${mermaidDiagrams[3]}
                    </div>
                </div>
            </div>
            
            <div class="summary">
                <h3>Key System Features</h3>
                <ul>
                    <li><strong>Schema Management:</strong> JSON Schema validation with IPFS storage and semantic versioning</li>
                    <li><strong>CCIP Integration:</strong> Cross-chain data sharing with cryptographic verification</li>
                    <li><strong>API Gateway:</strong> JWT authentication, rate limiting, and response optimization</li>
                    <li><strong>Security:</strong> Role-based access control and complete audit trails</li>
                    <li><strong>Performance:</strong> Caching, batch processing, and global CDN delivery</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p>DAO Registry Workflow Diagram | Generated on ${new Date().toLocaleDateString()}</p>
        </div>
    </div>
    
    <script>
        // Initialize Mermaid
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true
            },
            sequence: {
                useMaxWidth: true,
                diagramMarginX: 50,
                diagramMarginY: 10
            }
        });
        
        // Add interactivity
        document.addEventListener('DOMContentLoaded', function() {
            // Add zoom functionality
            const diagrams = document.querySelectorAll('.mermaid');
            diagrams.forEach(diagram => {
                diagram.style.cursor = 'pointer';
                diagram.addEventListener('click', function() {
                    this.style.transform = this.style.transform === 'scale(1.2)' ? 'scale(1)' : 'scale(1.2)';
                    this.style.transition = 'transform 0.3s ease';
                });
            });
            
            // Add smooth scrolling
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    document.querySelector(this.getAttribute('href')).scrollIntoView({
                        behavior: 'smooth'
                    });
                });
            });
        });
    </script>
</body>
</html>
`;

// Write the HTML file
const outputPath = path.join(__dirname, '../docs/workflow-diagram.html');
fs.writeFileSync(outputPath, htmlTemplate);

console.log('Workflow diagram rendered successfully!');
console.log(`Output file: ${outputPath}`);
console.log(`Diagrams included: ${mermaidDiagrams.length}`);
console.log(`Open in browser: file://${path.resolve(outputPath)}`); 