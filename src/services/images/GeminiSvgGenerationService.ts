/**
 * Service for generating SVG images using Gemini 2.5 Flash
 * Generates clean, editable SVG code for coloring pages
 */

import { GoogleGenAI } from '@google/genai';

interface SvgGenerationOptions {
  prompt: string;
  width?: number;
  height?: number;
  complexity?: 'simple' | 'medium' | 'detailed';
  style?: 'cartoon' | 'outline' | 'geometric' | 'realistic';
}

interface SvgGenerationResult {
  success: boolean;
  svg?: string;
  error?: string;
}

export class GeminiSvgGenerationService {
  private client: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.client = new GoogleGenAI({ apiKey });
  }

  /**
   * Generate SVG image based on text description
   */
  async generateSvg(options: SvgGenerationOptions): Promise<SvgGenerationResult> {
    const {
      prompt,
      width = 1000,
      height = 1000,
      complexity = 'medium',
      style = 'cartoon'
    } = options;

    try {
      console.log('🎨 [SVG Generation] Starting Gemini SVG generation', {
        prompt: prompt.substring(0, 50) + '...',
        width,
        height,
        complexity,
        style
      });

      const systemPrompt = this.buildSvgPrompt(prompt, width, height, complexity, style);

      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: systemPrompt,
        config: {
          thinkingConfig: {
            thinkingBudget: 0, // Disable thinking for faster generation
          },
          temperature: 0.7,
          maxOutputTokens: 8192
        }
      });

      const content = response.text;
      if (!content) {
        throw new Error('No content in Gemini response');
      }

      // Extract SVG from response (remove markdown if present)
      const svgCode = this.extractSvg(content);

      if (!svgCode) {
        throw new Error('Failed to extract SVG from response');
      }

      // Validate SVG
      if (!this.validateSvg(svgCode)) {
        throw new Error('Generated SVG is invalid');
      }

      console.log('✅ [SVG Generation] SVG generated successfully', {
        svgLength: svgCode.length,
        hasViewBox: svgCode.includes('viewBox')
      });

      return {
        success: true,
        svg: svgCode
      };
    } catch (error) {
      console.error('❌ [SVG Generation] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Build prompt for SVG generation
   */
  private buildSvgPrompt(
    userPrompt: string,
    width: number,
    height: number,
    complexity: string,
    style: string
  ): string {
    const complexityGuidelines = {
      simple: 'Very simple shapes with 3-5 main elements. Clean and minimal design perfect for young children (ages 3-5).',
      medium: 'Moderate detail with 5-10 elements. Balanced complexity for children ages 6-10.',
      detailed: 'Rich detail with 10+ elements. More sophisticated design for older children and adults (ages 11+).'
    };

    const styleGuidelines = {
      cartoon: 'Cute, rounded shapes with friendly appearance. Large eyes, simple features, playful proportions.',
      outline: 'Clean outlines only, no fill. Simple black strokes (2-5px) on white background. Perfect for coloring.',
      geometric: 'Made of basic geometric shapes (circles, squares, triangles). Modern, abstract style.',
      realistic: 'More realistic proportions while keeping it child-friendly. Natural shapes and details.'
    };

    return `You are an expert SVG artist creating coloring pages for children.

**USER REQUEST:**
${userPrompt}

**TECHNICAL REQUIREMENTS:**
- Generate a complete, valid SVG image
- Dimensions: ${width}x${height}
- Use viewBox="0 0 ${width} ${height}" for proper scaling
- Complexity: ${complexityGuidelines[complexity as keyof typeof complexityGuidelines]}
- Style: ${styleGuidelines[style as keyof typeof styleGuidelines]}

**SVG STRUCTURE RULES:**
1. Start with: <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
2. Use clean, simple paths and basic shapes (circle, rect, polygon, path)
3. Black strokes (stroke="#000000") with stroke-width between 8-15 for thick, easy-to-color lines
4. White fills (fill="#FFFFFF" fill-opacity="1") - elements should have solid white background that can be colored later
5. Use rounded line caps and joins: stroke-linecap="round" stroke-linejoin="round"
6. Center the drawing in the viewBox with proper margins
7. Group related elements with <g> tags with descriptive id attributes
8. NO complex gradients, filters, or advanced SVG features
9. NO text elements (unless specifically requested)
10. Close all tags properly

**Z-ORDER AND LAYERING (CRITICAL):**
- Background elements MUST come FIRST in the SVG
- Foreground elements MUST come LAST in the SVG
- Order elements from back to front: background → middle → foreground
- Use <g> tags with descriptive ids to group logical parts (e.g., id="background", id="body", id="details")
- Each <g> group represents a layer that can be reordered
- Example order: <g id="background">...</g> <g id="main-body">...</g> <g id="face-details">...</g>

**FOR EASY CONVERSION TO EDITABLE OBJECTS:**
- Prefer simple shapes (circle, rect, ellipse) over complex paths when possible
- Avoid nested transforms (no transform attributes on elements)
- Use consistent stroke-width (10-15px) for all elements
- Each element should have explicit stroke and fill attributes
- Center elements clearly with proper x, y coordinates
- Keep each logical part as a separate <g> group for independent editing

**DESIGN PRINCIPLES:**
- Large, clear shapes that are easy to color
- Thick outlines (10-15px stroke-width) for visibility
- Good spacing between elements (at least 20px)
- Symmetrical when possible for aesthetic appeal
- Age-appropriate content
- Fun and engaging design

**EXAMPLE OUTPUT STRUCTURE:**
\`\`\`svg
<svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
  <!-- Background layer (drawn first, appears behind) -->
  <g id="background">
    <circle cx="500" cy="500" r="300" stroke="#000000" stroke-width="12" fill="#FFFFFF" fill-opacity="1" />
  </g>
  
  <!-- Main subject layer (middle) -->
  <g id="main-body">
    <circle cx="500" cy="400" r="200" stroke="#000000" stroke-width="12" fill="#FFFFFF" fill-opacity="1" />
    <ellipse cx="450" cy="500" r="80" stroke="#000000" stroke-width="10" fill="#FFFFFF" fill-opacity="1" />
  </g>
  
  <!-- Details layer (drawn last, appears in front) -->
  <g id="face-details">
    <circle cx="450" cy="380" r="20" stroke="#000000" stroke-width="8" fill="#FFFFFF" fill-opacity="1" />
    <circle cx="550" cy="380" r="20" stroke="#000000" stroke-width="8" fill="#FFFFFF" fill-opacity="1" />
    <path d="M 420 450 Q 500 480 580 450" stroke="#000000" stroke-width="10" fill="none" stroke-linecap="round" />
  </g>
</svg>
\`\`\`

**IMPORTANT:**
- Generate ONLY the SVG code
- NO explanations, NO markdown formatting
- Start with <svg and end with </svg>
- Make it fun and suitable for children!

Generate the SVG now:`;
  }

  /**
   * Extract SVG code from response (handle markdown wrappers)
   */
  private extractSvg(content: string): string {
    // Remove markdown code blocks if present
    let svg = content.trim();
    
    // Remove ```svg or ```xml wrappers
    svg = svg.replace(/```(?:svg|xml)?\n?/g, '');
    svg = svg.replace(/```\n?$/g, '');
    
    // Find SVG tag
    const svgMatch = svg.match(/<svg[\s\S]*<\/svg>/i);
    if (svgMatch) {
      return svgMatch[0];
    }

    // If no match, try to find it with more lenient regex
    const startIndex = svg.indexOf('<svg');
    const endIndex = svg.lastIndexOf('</svg>');
    
    if (startIndex !== -1 && endIndex !== -1) {
      return svg.substring(startIndex, endIndex + 6);
    }

    return svg;
  }

  /**
   * Basic SVG validation
   */
  private validateSvg(svg: string): boolean {
    // Check if it starts with <svg and ends with </svg>
    if (!svg.trim().startsWith('<svg') || !svg.trim().endsWith('</svg>')) {
      console.error('❌ SVG validation failed: Invalid SVG structure');
      return false;
    }

    // Check SVG size (max 500KB)
    const svgSizeKB = svg.length / 1024;
    if (svgSizeKB > 500) {
      console.error('❌ SVG validation failed: SVG too large', { 
        size: `${svgSizeKB.toFixed(2)}KB`,
        maxSize: '500KB' 
      });
      return false;
    }

    // Check for required viewBox attribute
    if (!svg.includes('viewBox')) {
      console.warn('⚠️ SVG missing viewBox attribute');
    }

    // Check for balanced tags (basic check)
    const openTags = (svg.match(/<[^/][^>]*>/g) || []).length;
    const closeTags = (svg.match(/<\/[^>]+>/g) || []).length;
    const selfClosingTags = (svg.match(/\/>/g) || []).length;
    
    // Allow some flexibility as SVG can have self-closing tags
    const balanced = openTags - selfClosingTags === closeTags;
    
    if (!balanced) {
      console.warn('⚠️ SVG tags might not be balanced', { openTags, closeTags, selfClosingTags });
    }

    console.log('✅ SVG validation passed', { size: `${svgSizeKB.toFixed(2)}KB` });
    return true;
  }

  /**
   * Clean SVG for use in constructor
   * Ensures it's properly formatted and ready for editing
   */
  cleanSvgForConstructor(svg: string): string {
    let cleaned = svg.trim();

    // Ensure proper formatting
    cleaned = cleaned.replace(/>\s+</g, '>\n<');
    
    // Ensure all paths have proper stroke attributes
    if (!cleaned.includes('stroke=')) {
      cleaned = cleaned.replace(/<path /g, '<path stroke="#000000" stroke-width="10" fill="transparent" ');
    }

    return cleaned;
  }
}

// Export singleton instance
export const geminiSvgService = new GeminiSvgGenerationService();

