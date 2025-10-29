'use client';

import * as React from 'react';
import { FontSelector, FontSelectorCompact } from '@/components/font-selector';

/**
 * Demo page for FontSelector component
 *
 * This page demonstrates both the full and compact versions of the FontSelector
 * with different configurations.
 */
export default function FontSelectorDemoPage() {
  const [selectedFont1, setSelectedFont1] = React.useState('Work Sans');
  const [selectedFont2, setSelectedFont2] = React.useState('Inter');
  const [selectedFont3, setSelectedFont3] = React.useState('Playfair Display');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Font Selector Component Demo
          </h1>
          <p className="text-lg text-gray-600">
            Beautiful, professional font selector with search and visual previews
          </p>
        </div>

        {/* Demo Cards */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Full Featured Version */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">
                Full Featured Version
              </h2>
              <p className="text-sm text-gray-600">
                With preview and description
              </p>
            </div>

            <FontSelector
              currentFont={selectedFont1}
              onFontChange={setSelectedFont1}
              label="Primary Font"
              showPreview={true}
              showDescription={true}
            />

            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Selected: <span className="font-bold text-gray-900">{selectedFont1}</span>
              </div>
            </div>
          </div>

          {/* Without Description */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">
                Without Description
              </h2>
              <p className="text-sm text-gray-600">
                Simpler, more compact
              </p>
            </div>

            <FontSelector
              currentFont={selectedFont2}
              onFontChange={setSelectedFont2}
              label="Heading Font"
              showPreview={true}
              showDescription={false}
            />

            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Selected: <span className="font-bold text-gray-900">{selectedFont2}</span>
              </div>
            </div>
          </div>

          {/* Compact Version */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">
                Compact Version
              </h2>
              <p className="text-sm text-gray-600">
                No preview, no description
              </p>
            </div>

            <FontSelectorCompact
              currentFont={selectedFont3}
              onFontChange={setSelectedFont3}
              label="Body Font"
            />

            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Selected: <span className="font-bold text-gray-900">{selectedFont3}</span>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">
                Live Preview
              </h2>
              <p className="text-sm text-gray-600">
                See selected fonts in action
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-2">
                  PRIMARY FONT: {selectedFont1}
                </div>
                <p
                  className="text-2xl font-semibold"
                  style={{ fontFamily: `var(--font-${selectedFont1.toLowerCase().replace(/\s+/g, '-')})` }}
                >
                  The quick brown fox jumps over the lazy dog
                </p>
                <p
                  className="text-sm text-gray-600 mt-1"
                  style={{ fontFamily: `var(--font-${selectedFont1.toLowerCase().replace(/\s+/g, '-')})` }}
                >
                  AaBbCc 123 日本語
                </p>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-500 mb-2">
                  HEADING FONT: {selectedFont2}
                </div>
                <p
                  className="text-2xl font-semibold"
                  style={{ fontFamily: `var(--font-${selectedFont2.toLowerCase().replace(/\s+/g, '-')})` }}
                >
                  The quick brown fox jumps over the lazy dog
                </p>
                <p
                  className="text-sm text-gray-600 mt-1"
                  style={{ fontFamily: `var(--font-${selectedFont2.toLowerCase().replace(/\s+/g, '-')})` }}
                >
                  AaBbCc 123 日本語
                </p>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-500 mb-2">
                  BODY FONT: {selectedFont3}
                </div>
                <p
                  className="text-2xl font-semibold"
                  style={{ fontFamily: `var(--font-${selectedFont3.toLowerCase().replace(/\s+/g, '-')})` }}
                >
                  The quick brown fox jumps over the lazy dog
                </p>
                <p
                  className="text-sm text-gray-600 mt-1"
                  style={{ fontFamily: `var(--font-${selectedFont3.toLowerCase().replace(/\s+/g, '-')})` }}
                >
                  AaBbCc 123 日本語
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Component Features
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900">21 Professional Fonts</div>
                <div className="text-sm text-gray-600">All Google Fonts, carefully curated</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Search & Filter</div>
                <div className="text-sm text-gray-600">Find fonts by name or description</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Visual Previews</div>
                <div className="text-sm text-gray-600">See fonts in the dropdown</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Keyboard Navigation</div>
                <div className="text-sm text-gray-600">Arrow keys, Enter, Escape support</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Category Badges</div>
                <div className="text-sm text-gray-600">Sans-serif, Serif, Display labels</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Fully Accessible</div>
                <div className="text-sm text-gray-600">ARIA labels and keyboard support</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Mobile Friendly</div>
                <div className="text-sm text-gray-600">Responsive design for all devices</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900">TypeScript</div>
                <div className="text-sm text-gray-600">Full type safety and IntelliSense</div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Example */}
        <div className="bg-gray-900 rounded-2xl shadow-lg p-8 text-gray-100">
          <h2 className="text-2xl font-bold mb-4">Usage Example</h2>
          <pre className="text-sm overflow-x-auto">
            <code>{`import { FontSelector } from '@/components/font-selector';

function MyComponent() {
  const [font, setFont] = useState('Work Sans');

  return (
    <FontSelector
      currentFont={font}
      onFontChange={setFont}
      label="Choose Font"
      showPreview={true}
      showDescription={true}
    />
  );
}`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
