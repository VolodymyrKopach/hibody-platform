# Image Library

This directory contains a collection of educational SVG images organized by categories.

## Structure

```
image-library/
├── educational/     # Numbers, letters, geometric shapes
├── animals/         # Animals (cat, dog, bird, fish, etc.)
├── nature/          # Nature elements (tree, flower, sun, cloud, etc.)
├── food/            # Food items (apple, banana, carrot, etc.)
├── transport/       # Vehicles (car, plane, ship, bicycle, etc.)
└── metadata.json    # Metadata for all elements
```

## Usage

Images are loaded through the `ImageLibraryService` which reads from `metadata.json`.

## Licenses

All SVG files are either:
- Created specifically for this project
- From lucide-react (MIT license)
- Public domain sources

## Format

Each SVG file should:
- Have a viewBox attribute
- Use simple, clean strokes
- Be suitable for children
- Be optimized (no unnecessary attributes)

