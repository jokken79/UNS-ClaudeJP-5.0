"use client";

import * as React from "react";
import { Monitor, Tablet, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TemplateDefinition, TemplateLike } from "@/lib/templates";

interface TemplatePreviewProps {
  template: TemplateDefinition | TemplateLike;
  scale?: number;
  showDeviceToggle?: boolean;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export function TemplatePreview({
  template,
  scale = 1,
  showDeviceToggle = false,
}: TemplatePreviewProps) {
  const [device, setDevice] = React.useState<DeviceType>('desktop');
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;

    const doc = iframe.contentDocument;

    // Inject template styles into iframe
    const styleContent = `
      :root {
        ${Object.entries(template.variables)
          .map(([key, value]) => `${key}: ${value};`)
          .join('\n        ')}
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: var(--layout-surface-gradient, #f8fafc);
        padding: 1rem;
        min-height: 100vh;
      }

      .preview-container {
        max-width: var(--layout-container-max, 1200px);
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: var(--layout-section-gap, 2rem);
      }

      .preview-navbar {
        background: var(--layout-navbar-background);
        backdrop-filter: blur(var(--layout-panel-blur));
        box-shadow: var(--layout-navbar-shadow);
        border-radius: var(--layout-card-radius);
        padding: 1rem 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .preview-card {
        background: var(--layout-card-surface);
        border: 1px solid var(--layout-card-border);
        border-radius: var(--layout-card-radius);
        box-shadow: var(--layout-card-shadow);
        backdrop-filter: blur(var(--layout-panel-blur));
        padding: 1.5rem;
      }

      .preview-button {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.9));
        color: white;
        border: none;
        border-radius: var(--layout-button-radius);
        padding: 0.75rem 1.5rem;
        font-weight: 600;
        box-shadow: var(--layout-button-shadow);
        cursor: pointer;
        transition: all 0.2s;
      }

      .preview-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
      }

      .preview-button-secondary {
        background: transparent;
        color: #64748b;
        border: 2px solid var(--layout-card-border);
        border-radius: var(--layout-button-radius);
        padding: 0.75rem 1.5rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .preview-input {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 2px solid var(--layout-card-border);
        border-radius: calc(var(--layout-button-radius) * 0.8);
        background: rgba(255, 255, 255, 0.5);
        backdrop-filter: blur(8px);
        font-size: 0.875rem;
        outline: none;
        transition: all 0.2s;
      }

      .preview-input:focus {
        border-color: #3b82f6;
        box-shadow: var(--layout-focus-ring);
      }

      .preview-badge {
        display: inline-block;
        padding: 0.375rem 0.75rem;
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.1));
        border: 1px solid rgba(59, 130, 246, 0.3);
        border-radius: calc(var(--layout-button-radius) * 0.6);
        font-size: 0.75rem;
        font-weight: 600;
        color: #1e40af;
        box-shadow: var(--layout-badge-glow);
      }

      .preview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
      }

      .preview-header {
        font-family: var(--layout-font-heading);
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        background: var(--layout-hero-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .preview-text {
        font-family: var(--layout-font-body);
        color: #64748b;
        line-height: 1.6;
      }

      .preview-divider {
        height: 2px;
        background: var(--layout-divider-glow);
        border: none;
        margin: 2rem 0;
      }
    `;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>${styleContent}</style>
        </head>
        <body>
          <div class="preview-container">
            <!-- Navbar -->
            <nav class="preview-navbar">
              <div style="font-weight: 700; font-size: 1.125rem;">App Name</div>
              <div style="display: flex; gap: 1rem;">
                <button class="preview-button-secondary">Features</button>
                <button class="preview-button">Sign In</button>
              </div>
            </nav>

            <!-- Hero Section -->
            <div class="preview-card">
              <div class="preview-header">Welcome to Your App</div>
              <p class="preview-text" style="margin-bottom: 1.5rem;">
                Experience the power of modern design with this beautiful template.
              </p>
              <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                <button class="preview-button">Get Started</button>
                <button class="preview-button-secondary">Learn More</button>
                <span class="preview-badge">New</span>
              </div>
            </div>

            <hr class="preview-divider" />

            <!-- Feature Cards -->
            <div class="preview-grid">
              <div class="preview-card">
                <h3 style="font-family: var(--layout-font-heading); font-size: 1.25rem; margin-bottom: 0.75rem;">Fast Performance</h3>
                <p class="preview-text">Lightning-fast load times and smooth interactions.</p>
              </div>
              <div class="preview-card">
                <h3 style="font-family: var(--layout-font-heading); font-size: 1.25rem; margin-bottom: 0.75rem;">Beautiful Design</h3>
                <p class="preview-text">Carefully crafted with attention to detail.</p>
              </div>
              <div class="preview-card">
                <h3 style="font-family: var(--layout-font-heading); font-size: 1.25rem; margin-bottom: 0.75rem;">Easy to Use</h3>
                <p class="preview-text">Intuitive interface that just works.</p>
              </div>
            </div>

            <!-- Form Example -->
            <div class="preview-card">
              <h3 style="font-family: var(--layout-font-heading); font-size: 1.5rem; margin-bottom: 1rem;">Contact Form</h3>
              <div style="display: flex; flex-direction: column; gap: 1rem;">
                <input type="text" class="preview-input" placeholder="Your name" />
                <input type="email" class="preview-input" placeholder="Your email" />
                <textarea class="preview-input" rows="4" placeholder="Your message"></textarea>
                <button class="preview-button" style="width: fit-content;">Send Message</button>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();
  }, [template]);

  const deviceDimensions = {
    desktop: { width: '100%', height: '600px' },
    tablet: { width: '768px', height: '600px' },
    mobile: { width: '375px', height: '600px' },
  };

  const dimensions = deviceDimensions[device];

  return (
    <div className="flex flex-col gap-4">
      {showDeviceToggle && (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant={device === 'desktop' ? 'default' : 'outline'}
            onClick={() => setDevice('desktop')}
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={device === 'tablet' ? 'default' : 'outline'}
            onClick={() => setDevice('tablet')}
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={device === 'mobile' ? 'default' : 'outline'}
            onClick={() => setDevice('mobile')}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex items-center justify-center bg-muted/50 rounded-lg p-4 overflow-auto">
        <div
          style={{
            width: dimensions.width,
            height: dimensions.height,
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            transition: 'all 0.3s ease',
          }}
          className="shadow-2xl rounded-lg overflow-hidden bg-white"
        >
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            title="Template Preview"
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}
