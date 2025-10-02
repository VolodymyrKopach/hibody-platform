/**
 * Worksheet Measurement Renderer
 * 
 * This component renders worksheet elements in a hidden container to measure their real heights.
 * Once all measurements are complete, it calls the callback with measured elements.
 * 
 * ALGORITHM:
 * 1. Render each element in hidden container
 * 2. Wait for render to complete (requestAnimationFrame)
 * 3. Measure offsetHeight
 * 4. Store measurement
 * 5. After all elements measured, call callback
 * 
 * This enables "render → measure → paginate" flow.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GeneratedElement } from '@/types/worksheet-generation';
import { CanvasElement } from '@/types/canvas-element';
import { convertGeneratedElementToCanvasElement } from '@/utils/canvas-conversion';
import TitleBlock from './canvas/atomic/TitleBlock';
import BodyText from './canvas/atomic/BodyText';
import InstructionsBox from './canvas/atomic/InstructionsBox';
import FillInBlank from './canvas/atomic/FillInBlank';
import MultipleChoice from './canvas/atomic/MultipleChoice';
import TrueFalse from './canvas/atomic/TrueFalse';
import ShortAnswer from './canvas/atomic/ShortAnswer';
import TipBox from './canvas/atomic/TipBox';
import WarningBox from './canvas/atomic/WarningBox';
import ImagePlaceholder from './canvas/atomic/ImagePlaceholder';
import Divider from './canvas/atomic/Divider';
import BulletList from './canvas/atomic/BulletList';
import NumberedList from './canvas/atomic/NumberedList';
import Table from './canvas/atomic/Table';

export interface MeasuredElement extends GeneratedElement {
  measuredHeight: number;
  elementId: string;
}

interface WorksheetMeasurementRendererProps {
  elements: GeneratedElement[];
  pageWidth?: number; // A4 width by default
  onMeasurementsComplete: (measurements: MeasuredElement[]) => void;
  onProgress?: (current: number, total: number) => void;
}

export const WorksheetMeasurementRenderer: React.FC<WorksheetMeasurementRendererProps> = ({
  elements,
  pageWidth = 794, // A4 width in pixels at 96 DPI
  onMeasurementsComplete,
  onProgress,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [measurements, setMeasurements] = useState<MeasuredElement[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  // Measure elements one by one
  useEffect(() => {
    if (isComplete || currentIndex >= elements.length) {
      return;
    }

    const measureElement = async () => {
      const element = elements[currentIndex];
      const elementId = `measure-${currentIndex}-${Date.now()}`;

      console.log(`📐 Measuring element ${currentIndex + 1}/${elements.length} (${element.type})`);

      if (onProgress) {
        onProgress(currentIndex + 1, elements.length);
      }

      // Wait for render
      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });

      // Measure height
      if (containerRef.current) {
        const wrapper = containerRef.current.querySelector(`#${elementId}`) as HTMLElement;
        if (wrapper) {
          const height = wrapper.offsetHeight;
          
          console.log(`  📏 Height: ${height}px`);

          const measuredElement: MeasuredElement = {
            ...element,
            measuredHeight: height,
            elementId,
          };

          setMeasurements((prev) => [...prev, measuredElement]);
        }
      }

      // Move to next element
      setCurrentIndex((prev) => prev + 1);
    };

    measureElement();
  }, [currentIndex, elements, isComplete, onProgress]);

  // When all measurements complete, call callback
  useEffect(() => {
    if (measurements.length === elements.length && measurements.length > 0) {
      console.log('✅ All measurements complete!');
      console.log(`📊 Total elements measured: ${measurements.length}`);
      
      setIsComplete(true);
      onMeasurementsComplete(measurements);
    }
  }, [measurements, elements.length, onMeasurementsComplete]);

  // Convert current element to CanvasElement for rendering
  const getCurrentCanvasElement = (): CanvasElement | null => {
    if (currentIndex >= elements.length) {
      return null;
    }

    const element = elements[currentIndex];
    const elementId = `measure-${currentIndex}-${Date.now()}`;

    try {
      return convertGeneratedElementToCanvasElement(element, 0, elementId);
    } catch (error) {
      console.error(`Failed to convert element ${currentIndex}:`, error);
      return null;
    }
  };

  const currentElement = getCurrentCanvasElement();

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: '-99999px',
        left: '-99999px',
        width: `${pageWidth}px`,
        visibility: 'hidden',
        pointerEvents: 'none',
        padding: '40px', // Same padding as worksheet pages
      }}
      data-measurement-container="true"
    >
      {/* Render current element being measured */}
      {currentElement && !isComplete && (
        <div
          id={currentElement.id}
          style={{
            width: '100%',
            margin: 0,
            padding: 0,
          }}
        >
          {renderElement(currentElement)}
        </div>
      )}
    </div>
  );
};

// Render element based on type (for measurement only - no editing)
function renderElement(element: CanvasElement) {
  const noop = () => {}; // No-op for measurement

  switch (element.type) {
    case 'title-block':
      return (
        <TitleBlock
          text={element.properties.text || 'Title Here'}
          level={element.properties.level || 'main'}
          align={element.properties.align || 'center'}
          color={element.properties.color}
          isSelected={false}
          onEdit={noop}
          onFocus={noop}
        />
      );

    case 'body-text':
      return (
        <BodyText
          text={element.properties.text || 'Text here...'}
          variant={element.properties.variant || 'paragraph'}
          align={element.properties.align}
          color={element.properties.color}
          isSelected={false}
          onEdit={noop}
          onFocus={noop}
        />
      );

    case 'instructions-box':
      return (
        <InstructionsBox
          text={element.properties.text || 'Instructions...'}
          type={element.properties.type || 'general'}
          isSelected={false}
          onEdit={noop}
          onFocus={noop}
        />
      );

    case 'fill-blank':
      return (
        <FillInBlank
          items={element.properties.items || []}
          wordBank={element.properties.wordBank}
          isSelected={false}
          onEdit={noop}
          onFocus={noop}
        />
      );

    case 'multiple-choice':
      return (
        <MultipleChoice
          items={element.properties.items || []}
          isSelected={false}
          onEdit={noop}
          onFocus={noop}
        />
      );

    case 'true-false':
      return (
        <TrueFalse
          items={element.properties.items || []}
          isSelected={false}
          onEdit={noop}
          onFocus={noop}
        />
      );

    case 'short-answer':
      return (
        <ShortAnswer
          items={element.properties.items || []}
          lineCount={element.properties.lineCount}
          isSelected={false}
          onEdit={noop}
          onFocus={noop}
        />
      );

    case 'tip-box':
      return (
        <TipBox
          text={element.properties.text || 'Tip...'}
          type={element.properties.type || 'general'}
          isSelected={false}
          onEdit={noop}
          onFocus={noop}
        />
      );

    case 'warning-box':
      return (
        <WarningBox
          text={element.properties.text || 'Warning...'}
          severity={element.properties.severity || 'warning'}
          isSelected={false}
          onEdit={noop}
          onFocus={noop}
        />
      );

    case 'image-placeholder':
      return (
        <ImagePlaceholder
          caption={element.properties.caption}
          url={element.properties.url}
          width={element.properties.width}
          height={element.properties.height}
          align={element.properties.align}
          isSelected={false}
          onEdit={noop}
          onFocus={noop}
        />
      );

    case 'divider':
      return (
        <Divider
          style={element.properties.style || 'solid'}
          thickness={element.properties.thickness}
          spacing={element.properties.spacing}
          isSelected={false}
          onEdit={noop}
          onFocus={noop}
        />
      );

    case 'bullet-list':
      return (
        <BulletList
          items={element.properties.items || []}
          isSelected={false}
          onEdit={noop}
          onFocus={noop}
        />
      );

    case 'numbered-list':
      return (
        <NumberedList
          items={element.properties.items || []}
          isSelected={false}
          onEdit={noop}
          onFocus={noop}
        />
      );

    case 'table':
      return (
        <Table
          headers={element.properties.headers || []}
          rows={element.properties.rows || []}
          isSelected={false}
          onEdit={noop}
          onFocus={noop}
        />
      );

    default:
      return <div>Unknown component type: {element.type}</div>;
  }
}

