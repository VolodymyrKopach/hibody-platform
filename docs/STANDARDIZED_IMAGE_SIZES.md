# 📐 Standardized Image Sizes for TeachSpark Platform

## Overview

This document defines the standardized image sizes for all age groups and image types in the TeachSpark educational platform. These sizes ensure consistency, optimal performance, and age-appropriate visual design.

## 🎯 Design Principles

- **Consistency**: Same size categories across all age groups
- **Age-appropriate scaling**: Larger images for younger children who need bigger visual elements
- **Performance optimization**: All sizes are multiples of 16 for GPU optimization
- **Responsive design**: Sizes work well on tablets and desktop screens
- **Educational focus**: Sizes support learning objectives for each age group

## 📏 Standardized Size Categories

### 🌟 Hero Images (Main slide visuals)
Primary educational content, central slide illustrations, main teaching material

**Ages 2-3:** `640×480` (4:3 ratio)
**Ages 4-6:** `640×480` (4:3 ratio)  
**Ages 7-8:** `800×600` (4:3 ratio)
**Ages 9-10:** `800×600` (4:3 ratio)

### 📖 Content Images (Supporting illustrations)
Secondary educational material, explanatory diagrams, concept illustrations

**Ages 2-3:** `512×384` (4:3 ratio)
**Ages 4-6:** `512×384` (4:3 ratio)
**Ages 7-8:** `640×480` (4:3 ratio)
**Ages 9-10:** `640×480` (4:3 ratio)

### 🎯 Activity Images (Interactive elements)
Game elements, clickable items, drag-and-drop objects, interactive components

**Ages 2-3:** `400×400` (1:1 square)
**Ages 4-6:** `400×400` (1:1 square)
**Ages 7-8:** `512×512` (1:1 square)
**Ages 9-10:** `512×512` (1:1 square)

### ✨ Decoration Images (Small visual elements)
Icons, badges, borders, small decorative elements, rewards

**Ages 2-3:** `256×256` (1:1 square)
**Ages 4-6:** `256×256` (1:1 square)
**Ages 7-8:** `320×320` (1:1 square)
**Ages 9-10:** `320×320` (1:1 square)

## 🎨 Image Type Guidelines

### Hero Images
- **Purpose**: Main educational focus of the slide
- **Usage**: 1 per slide maximum
- **Position**: Center or top of slide
- **Content**: Core lesson concept, main character, primary visual

### Content Images  
- **Purpose**: Support and explain educational content
- **Usage**: 1-3 per slide
- **Position**: Alongside text, in content sections
- **Content**: Explanatory diagrams, examples, supporting visuals

### Activity Images
- **Purpose**: Interactive learning elements
- **Usage**: 3-8 per slide depending on complexity
- **Position**: In interactive zones, game areas
- **Content**: Clickable objects, game pieces, interactive characters

### Decoration Images
- **Purpose**: Visual enhancement and motivation
- **Usage**: 2-6 per slide
- **Position**: Corners, borders, accent areas
- **Content**: Stars, badges, icons, small decorative elements

## 🔧 Technical Requirements

### All Images Must:
- Use exact standardized dimensions (no custom sizes)
- Be multiples of 16 for GPU optimization
- Include detailed English prompts for AI generation
- Specify target age group in prompt
- Include educational purpose in description

### Image Prompt Format:
```html
<!-- IMAGE_PROMPT: "detailed description including style, colors, mood, age group, educational purpose" WIDTH: XXX HEIGHT: YYY -->
```

### Example Prompts:
```html
<!-- Hero Image for Ages 7-8 -->
<!-- IMAGE_PROMPT: "colorful cartoon illustration of children exploring a science laboratory, bright educational colors, friendly and engaging style, for children aged 7-8, learning about experiments" WIDTH: 800 HEIGHT: 600 -->

<!-- Content Image for Ages 4-6 -->
<!-- IMAGE_PROMPT: "simple diagram showing the water cycle with sun, clouds, rain, and earth, bright colors, child-friendly cartoon style, educational illustration for ages 4-6" WIDTH: 512 HEIGHT: 384 -->

<!-- Activity Image for Ages 2-3 -->
<!-- IMAGE_PROMPT: "large colorful button with a smiling sun character, bright yellow and orange, very simple design for toddlers aged 2-3, interactive game element" WIDTH: 400 HEIGHT: 400 -->

<!-- Decoration Image for Ages 9-10 -->
<!-- IMAGE_PROMPT: "golden star with sparkle effects, achievement badge design, sophisticated but still child-friendly, reward symbol for children aged 9-10" WIDTH: 320 HEIGHT: 320 -->
```

## 🎓 Age-Specific Considerations

### Ages 2-3
- **Larger relative sizes** for better visibility
- **Simple, bold designs** with high contrast
- **Minimal detail** to avoid cognitive overload
- **Bright, primary colors**

### Ages 4-6  
- **Moderate complexity** with clear details
- **Engaging cartoon style** with friendly characters
- **Interactive elements** that invite exploration
- **Educational but playful** design approach

### Ages 7-8
- **More detailed illustrations** with educational depth
- **Structured layouts** supporting learning objectives
- **Clear information hierarchy** in visual design
- **Beginning to handle complexity**

### Ages 9-10
- **Sophisticated designs** with detailed information
- **Academic visual style** while remaining engaging
- **Complex interactive elements** supporting advanced learning
- **Preparation for more mature educational content**

## 📊 Implementation Checklist

- [ ] All slide generation prompts use standardized sizes
- [ ] Age-specific templates reference correct dimensions
- [ ] Image processing pipeline supports all standard sizes
- [ ] Quality assurance checks verify size compliance
- [ ] Documentation updated across all components

## 🔄 Version History

- **v1.0**: Initial standardization (January 2025)
  - Defined 4 image categories across 4 age groups
  - Established 16 standardized size combinations
  - Created comprehensive prompt guidelines

---

*This standardization ensures consistent, age-appropriate, and performant images across the entire TeachSpark educational platform.* 