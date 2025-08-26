'use client';

import React, { useState } from 'react';
import SmartSlideDeckViewer from './SmartSlideDeckViewer';
import { ComponentBasedSlideDeck } from '@/types/slideTemplates';

// Example slide deck data with AI-generated prompts
const exampleDeck: ComponentBasedSlideDeck = {
  lessonTitle: "Introduction to AI Image Generation",
  slides: [
    {
      slideId: "slide-1",
      slideNumber: 1,
      templateId: "big-image-left",
      props: {
        title: "Welcome to AI Image Generation",
        subtitle: "Learn how artificial intelligence can create stunning visuals for your presentations automatically.",
        imagePrompt: "A modern business presentation with AI-generated images, professional style, clean design, purple and blue color scheme",
        imagePath: "", // Empty - will trigger automatic generation
        imageAlt: "AI image generation illustration"
      }
    },
    {
      slideId: "slide-2", 
      slideNumber: 2,
      templateId: "bullet-points",
      props: {
        title: "Key Benefits of AI Image Generation",
        bullets: [
          "Automatic generation based on slide content",
          "Professional quality images in seconds",
          "Consistent style across presentation",
          "No need for stock photo searches"
        ],
        imagePrompt: "A checklist with AI-generated images, modern flat design, professional business style",
        imagePath: "", // Empty - will trigger automatic generation
        imageAlt: "Benefits checklist illustration"
      }
    },
    {
      slideId: "slide-3",
      slideNumber: 3,
      templateId: "two-column",
      props: {
        title: "Before vs After",
        leftTitle: "Manual Process",
        leftContent: "Search stock photos, download, resize, edit, repeat for each slide",
        leftImagePrompt: "Frustrated person searching through stock photo websites, cluttered desktop, stress",
        leftImagePath: "", // Empty - will trigger automatic generation
        rightTitle: "AI Generation",
        rightContent: "Click generate, AI creates perfect images automatically based on your content",
        rightImagePrompt: "Happy person with AI-generated images appearing magically, clean workspace, satisfaction",
        rightImagePath: "" // Empty - will trigger automatic generation
      }
    }
  ]
};

export const ExampleAutomaticImageGeneration: React.FC = () => {
  const [deck, setDeck] = useState<ComponentBasedSlideDeck>(exampleDeck);
  const [generationStatus, setGenerationStatus] = useState<string>('');

  const handleSave = (updatedDeck: ComponentBasedSlideDeck) => {
    setDeck(updatedDeck);
    console.log('Deck saved:', updatedDeck);
  };

  const handleGenerationStarted = () => {
    setGenerationStatus('🔄 Automatic image generation started...');
    console.log('Automatic generation started');
  };

  const handleGenerationCompleted = (results: { elementId: string; success: boolean; imagePath?: string; error?: string }[]) => {
    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;
    
    if (failedCount > 0) {
      setGenerationStatus(`✅ ${successCount} images generated, ❌ ${failedCount} failed`);
    } else {
      setGenerationStatus(`✅ All ${successCount} images generated successfully! Auto-generation is now disabled for this presentation.`);
    }
    
    console.log('Generation completed:', results);
    
    // Clear status after 5 seconds
    setTimeout(() => setGenerationStatus(''), 5000);
  };

  return (
    <div style={{ padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
          SmartSlideDeckViewer with Enhanced Automatic AI Image Generation
        </h1>
                 <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '16px' }}>
           This example demonstrates the enhanced SmartSlideDeckViewer with automatic AI image generation.
           <strong>Key improvements:</strong> Auto-generation only happens once, AI-generated images are automatically cropped, and the generation process runs silently in the background without modal interruptions.
         </p>
        
        {generationStatus && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#f0f9ff',
            border: '1px solid #0ea5e9',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#0c4a6e',
            marginBottom: '16px'
          }}>
            {generationStatus}
          </div>
        )}
        
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => {
              setDeck(exampleDeck);
              setGenerationStatus('🔄 Reset presentation - automatic generation will start again');
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Reset Presentation
          </button>
          
          <button
            onClick={() => {
              console.log('Current deck state:', deck);
              alert('Check browser console for deck data');
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            View Deck Data
          </button>
        </div>
      </div>

      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <SmartSlideDeckViewer
          deck={deck}
          isEditable={true}
          onSave={handleSave}
          enableAutomaticImageGeneration={true}
          onAutomaticGenerationStarted={handleGenerationStarted}
          onAutomaticGenerationCompleted={handleGenerationCompleted}
          theme="default"
        />
      </div>

      <div style={{
        marginTop: '20px',
        padding: '16px',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#374151'
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>
          Enhanced Behavior
        </h3>
        <ol style={{ margin: 0, paddingLeft: '20px' }}>
          <li style={{ marginBottom: '8px' }}>
            <strong>One-Time Auto-Generation:</strong> Automatic generation only happens once during initial presentation creation
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Auto-Cropped Images:</strong> AI-generated images are automatically cropped to fit placeholder dimensions
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>New Slides:</strong> Adding new slides shows empty placeholders (no auto-generation)
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Deleted Images:</strong> Deleting images shows empty placeholders (no auto-generation)
          </li>
                     <li style={{ marginBottom: '8px' }}>
             <strong>Silent Generation:</strong> AI generation runs silently in the background without modal interruptions
           </li>
           <li style={{ marginBottom: '8px' }}>
             <strong>Manual Uploads:</strong> Manual image uploads still show the crop/no-crop choice modal
           </li>
        </ol>
      </div>

      <div style={{
        marginTop: '20px',
        padding: '16px',
        backgroundColor: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#92400e'
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>
          Debug Information
        </h3>
        <p style={{ margin: '0 0 8px 0' }}>
          Enable debug logging to see detailed information about the generation process:
        </p>
        <code style={{
          backgroundColor: '#fbbf24',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          window.__MOVEABLE_DEBUG__ = true;
        </code>
        <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>
          Check the browser console for detailed logs about placeholder extraction, API calls, and generation progress.
        </p>
      </div>
    </div>
  );
};

export default ExampleAutomaticImageGeneration;
