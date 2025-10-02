# Dynamic Pagination Architecture

## Problem Statement

Current pagination system uses **static estimation** of component heights:
- ❌ Guesses heights before rendering
- ❌ Can't account for dynamic content (text length, images, etc.)
- ❌ Results in incorrect page breaks
- ❌ Word banks and complex components don't fit properly

## Correct Approach: "Render → Measure → Paginate"

### Current (Wrong) Flow:
```
AI generates JSON
  ↓
Estimate heights statically
  ↓
Group into pages (wrong sizes)
  ↓
Render
  ↓
❌ Content doesn't fit properly
```

### New (Correct) Flow:
```
AI generates JSON
  ↓
Render ALL components in hidden container
  ↓
Measure REAL heights from DOM
  ↓
Group into pages (correct sizes)
  ↓
Show final result
  ↓
✅ Perfect pagination
```

## Architecture

### 1. DynamicPaginationService

**Purpose:** Orchestrate the "render → measure → paginate" flow

**Key Methods:**
- `paginateWithMeasurements()` - Main entry point
- `createMeasurementContainer()` - Create hidden DOM container
- `measureElements()` - Render and measure each element
- `groupIntoPages()` - Group based on real measurements
- `cleanupMeasurementContainer()` - Clean up after measurement

### 2. Measurement Container

**Characteristics:**
- Hidden from user (`position: absolute; top: -99999px`)
- Same width as target page
- Fully rendered (so measurements are accurate)
- Cleaned up after measurement

### 3. Measurement Algorithm

```typescript
for each element:
  1. Create wrapper div
  2. Render element into wrapper
  3. Wait for render (requestAnimationFrame)
  4. Measure height (offsetHeight)
  5. Store measurement
  6. Remove wrapper
```

### 4. Pagination Algorithm

```typescript
availableHeight = pageHeight - padding
currentPageHeight = 0
currentPage = []

for each measuredElement:
  if (currentPageHeight + element.height <= availableHeight):
    // Fits on current page
    currentPage.push(element)
    currentPageHeight += element.height
  else:
    // Doesn't fit - start new page
    pages.push(currentPage)
    currentPage = [element]
    currentPageHeight = element.height

// Add last page
pages.push(currentPage)
```

## Implementation Plan

### Phase 1: Create Infrastructure ✅

- [x] Create `DynamicPaginationService.ts`
- [ ] Add types to `worksheet-generation.ts`
- [ ] Write unit tests

### Phase 2: Integration with WorksheetEditor

**Option A: Server-Side Measurement (Puppeteer)**
```typescript
// In API route
const html = renderComponentsToHTML(elements);
const measurements = await measureWithPuppeteer(html);
const pages = paginateByMeasurements(elements, measurements);
return pages;
```

**Option B: Client-Side Measurement (React)**
```typescript
// In WorksheetEditor
const [elements, setElements] = useState<GeneratedElement[]>([]);
const [pages, setPages] = useState<GeneratedPage[]>([]);

useEffect(() => {
  // Render all elements in hidden container
  // Measure them
  // Group into pages
  // Update state
}, [elements]);
```

**Recommended: Option B** (simpler, no server dependency)

### Phase 3: Measurement Component

Create `WorksheetMeasurementRenderer.tsx`:

```tsx
interface Props {
  elements: GeneratedElement[];
  onMeasurementsComplete: (measurements: MeasuredElement[]) => void;
}

export const WorksheetMeasurementRenderer: React.FC<Props> = ({
  elements,
  onMeasurementsComplete,
}) => {
  const measurementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!measurementRef.current) return;

    const measurements = elements.map((element, index) => {
      // Render element
      const wrapper = document.createElement('div');
      measurementRef.current.appendChild(wrapper);
      
      // Use ReactDOM.render to render component
      const component = renderElementComponent(element);
      ReactDOM.render(component, wrapper);
      
      // Measure
      const height = wrapper.offsetHeight;
      
      // Clean up
      ReactDOM.unmountComponentAtNode(wrapper);
      measurementRef.current.removeChild(wrapper);
      
      return {
        ...element,
        measuredHeight: height,
        elementId: `element-${index}`,
      };
    });

    onMeasurementsComplete(measurements);
  }, [elements]);

  return (
    <div
      ref={measurementRef}
      style={{
        position: 'absolute',
        top: -99999,
        left: -99999,
        width: '794px', // A4 width
        visibility: 'hidden',
      }}
    />
  );
};
```

### Phase 4: Update WorksheetEditor

```tsx
const [rawElements, setRawElements] = useState<GeneratedElement[]>([]);
const [measuredElements, setMeasuredElements] = useState<MeasuredElement[]>([]);
const [pages, setPages] = useState<GeneratedPage[]>([]);

// Step 1: Receive elements from AI
const handleGenerate = async () => {
  const response = await generateWorksheet(...);
  setRawElements(response.elements); // Not paginated yet
};

// Step 2: Measurements complete
const handleMeasurementsComplete = (measurements: MeasuredElement[]) => {
  setMeasuredElements(measurements);
  
  // Step 3: Paginate based on measurements
  const paginationService = new DynamicPaginationService();
  const result = paginationService.groupIntoPages(measurements, title);
  setPages(result.pages);
};

return (
  <>
    {/* Hidden measurement renderer */}
    {rawElements.length > 0 && pages.length === 0 && (
      <WorksheetMeasurementRenderer
        elements={rawElements}
        onMeasurementsComplete={handleMeasurementsComplete}
      />
    )}
    
    {/* Actual pages display */}
    {pages.map((page) => (
      <WorksheetPage key={page.pageNumber} page={page} />
    ))}
  </>
);
```

## Benefits

### 1. Accuracy ✅
- Real measurements from DOM
- No guessing or estimation
- Handles dynamic content correctly

### 2. Flexibility ✅
- Works with any component type
- Handles complex layouts
- Supports responsive sizing

### 3. Reliability ✅
- No more broken page breaks
- Content always fits properly
- Predictable results

### 4. Debuggability ✅
- Measurement log shows estimated vs. actual
- Easy to identify problem components
- Clear algorithm flow

## Example Output

```javascript
{
  pages: [
    {
      pageNumber: 1,
      title: "Present Simple Worksheet",
      elements: [
        { type: 'title-block', ... },
        { type: 'body-text', ... },
        { type: 'fill-blank', ... }, // Complete with word bank
      ]
    },
    {
      pageNumber: 2,
      title: "Present Simple Worksheet",
      elements: [
        { type: 'multiple-choice', ... },
        { type: 'image-placeholder', ... },
      ]
    }
  ],
  measurementLog: [
    {
      elementType: 'fill-blank',
      estimatedHeight: 120,
      measuredHeight: 480,
      difference: +360 // We were WAY off!
    }
  ]
}
```

## Performance Considerations

### Measurement Time
- ~10-50ms per component
- Total: ~500ms for 20 components
- Acceptable for user experience

### Optimization Strategies
1. **Parallel Measurement**: Render multiple elements at once
2. **Caching**: Cache measurements for identical components
3. **Progressive Rendering**: Show pages as they're measured
4. **Web Workers**: Offload calculations (future enhancement)

## Testing Strategy

### Unit Tests
```typescript
describe('DynamicPaginationService', () => {
  it('should measure elements correctly', async () => {
    const elements = [/* test elements */];
    const service = new DynamicPaginationService();
    const result = await service.paginateWithMeasurements(elements, renderFn);
    expect(result.pages).toHaveLength(2);
  });
});
```

### Integration Tests
```typescript
describe('Worksheet Generation Flow', () => {
  it('should paginate fill-blank with word bank correctly', async () => {
    const worksheet = await generateWorksheet({
      topic: 'Present Simple',
      ageGroup: '6-7',
    });
    
    // Check that word bank is on same page as questions
    const fillBlankPage = worksheet.pages.find(page =>
      page.elements.some(el => el.type === 'fill-blank')
    );
    
    expect(fillBlankPage.elements).toContainType('fill-blank');
    // Word bank should be part of fill-blank component
  });
});
```

## Migration Strategy

### Step 1: Feature Flag
```typescript
const USE_DYNAMIC_PAGINATION = process.env.NEXT_PUBLIC_USE_DYNAMIC_PAGINATION === 'true';

if (USE_DYNAMIC_PAGINATION) {
  // New approach
  const pages = await dynamicPaginationService.paginateWithMeasurements(...);
} else {
  // Old approach
  const pages = contentPaginationService.paginateContent(...);
}
```

### Step 2: A/B Testing
- Roll out to 10% of users
- Monitor performance and accuracy
- Collect feedback

### Step 3: Full Rollout
- Enable for all users
- Remove old pagination code
- Update documentation

## Related Files

- `src/services/worksheet/DynamicPaginationService.ts` - New service
- `src/services/worksheet/ContentPaginationService.ts` - Old service (will be deprecated)
- `src/components/worksheet/WorksheetEditor.tsx` - Integration point
- `src/types/worksheet-generation.ts` - Type definitions

## Future Enhancements

- [ ] Parallel measurement for faster processing
- [ ] Measurement caching for duplicate components
- [ ] Progressive page rendering during measurement
- [ ] Smart page breaks (avoid orphans/widows)
- [ ] Multi-column layout support
- [ ] Dynamic page height adjustment

## Conclusion

This architecture solves the fundamental problem: **we can't accurately predict component heights without rendering them**. By measuring first and paginating second, we ensure perfect page breaks every time.

The implementation is straightforward, performant, and maintainable. It's the **correct** solution to the pagination problem.

