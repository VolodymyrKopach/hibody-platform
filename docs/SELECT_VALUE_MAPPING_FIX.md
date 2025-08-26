# Select Value Mapping Fix

## Problem

MUI Select components were showing warnings about out-of-range values:

```
MUI: You have provided an out-of-range value `Animals` for the select component.
Consider providing a value that matches one of the available options or ''.
The available values are `Mathematics`, `Ukrainian Language`, `English Language`, `Science`, `History`, `Geography`, `Physics`, `Chemistry`, `Biology`, `Art`, `Music`, `Physical Education`, `Computer Science`, `Technology`, `General Education`.

MUI: You have provided an out-of-range value `2-3` for the select component.
Consider providing a value that matches one of the available options or ''.
The available values are `3-5 years`, `6-7 years`, `8-9 years`, `10-11 years`, `12-13 years`, `14-15 years`, `16-18 years`, `All age groups`.
```

## Root Cause

The template generation system uses different value formats than what the SaveLessonDialog select components expect:

- **Template System**: `"Animals"`, `"2-3"`
- **Select Components**: `"Biology"`, `"3-5 years"`

The select components expect exact matches with values defined in translation files (`src/locales/*/lessons.json`).

## Solution

Added mapping functions in `SimplifiedSaveLessonDialog.tsx` to convert template values to select-compatible values:

### Subject Mapping

```typescript
const mapSubjectToSelectValue = (templateSubject: string): string => {
  const subjectMapping: Record<string, string> = {
    'Animals': 'Biology',
    'Mathematics': 'Mathematics',
    'Math': 'Mathematics',
    'Science': 'Science',
    'History': 'History',
    'Geography': 'Geography',
    'Physics': 'Physics',
    'Chemistry': 'Chemistry',
    'Biology': 'Biology',
    'Art': 'Art',
    'Music': 'Music',
    'Physical Education': 'Physical Education',
    'Computer Science': 'Computer Science',
    'Technology': 'Technology',
    'English': 'English Language',
    'Ukrainian': 'Ukrainian Language',
    // Additional mappings
    'Nature': 'Science',
    'Sports': 'Physical Education',
    'IT': 'Computer Science',
    'Programming': 'Computer Science'
  };

  return subjectMapping[templateSubject] || 'General Education';
};
```

### Age Group Mapping

```typescript
const mapAgeGroupToSelectValue = (templateAgeGroup: string): string => {
  const ageMapping: Record<string, string> = {
    '2-3': '3-5 years',
    '3-5': '3-5 years',
    '4-6': '6-7 years',
    '6-7': '6-7 years',
    '7-8': '8-9 years',
    '8-9': '8-9 years',
    '9-10': '10-11 years',
    '10-11': '10-11 years',
    '12-13': '12-13 years',
    '14-15': '14-15 years',
    '16-18': '16-18 years',
    // Alternative formats
    'preschool': '3-5 years',
    'elementary': '8-9 years',
    'middle': '12-13 years',
    'high': '16-18 years',
    'all': 'All age groups'
  };

  return ageMapping[templateAgeGroup] || 'All age groups';
};
```

## Implementation

1. **Mapping Functions**: Added `mapSubjectToSelectValue` and `mapAgeGroupToSelectValue` functions
2. **Auto-fill Logic**: Updated the `useEffect` that auto-fills dialog data to use mapping functions
3. **Debug Logging**: Added console logging to track mapping process
4. **Fallback Values**: Provided sensible defaults (`'General Education'`, `'All age groups'`) for unmapped values

## Expected Select Values

### Subjects (English)
- Mathematics
- Ukrainian Language  
- English Language
- Science
- History
- Geography
- Physics
- Chemistry
- Biology
- Art
- Music
- Physical Education
- Computer Science
- Technology
- General Education

### Age Groups (English)
- 3-5 years
- 6-7 years
- 8-9 years
- 10-11 years
- 12-13 years
- 14-15 years
- 16-18 years
- All age groups

## Testing

After the fix:
1. Template values like `"Animals"` → `"Biology"`
2. Template values like `"2-3"` → `"3-5 years"`
3. No more MUI warnings in console
4. Select components display correct options
5. Auto-fill works properly with mapped values

## Future Considerations

1. **Centralized Mapping**: Consider moving mapping logic to a shared utility
2. **Dynamic Mapping**: Could read available options from translation files dynamically
3. **Validation**: Add validation to ensure all template values have mappings
4. **Localization**: Extend mapping to support Ukrainian locale values
