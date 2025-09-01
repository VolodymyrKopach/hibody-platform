import { NextRequest, NextResponse } from 'next/server';
import { SlideEditRequest, SlideEditResponse, SlideComment } from '@/types/templates';
import { SimpleSlide } from '@/types/chat';

// Mock AI service for slide editing (в реальному проекті тут буде виклик до AI API)
async function editSlideWithAI(
  slide: SimpleSlide, 
  comments: SlideComment[], 
  context: { ageGroup: string; topic: string }
): Promise<{ editedSlide: SimpleSlide; slideChanges: any }> {
  // Симуляція часу обробки
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

  // Симуляція можливої помилки (5% шанс)
  if (Math.random() < 0.05) {
    throw new Error('AI service temporarily unavailable');
  }

  // Створюємо відредагований слайд на основі коментарів
  const editedSlide: SimpleSlide = {
    ...slide,
    // Модифікуємо контент на основі коментарів
    content: applyCommentsToContent(slide.content, comments),
    htmlContent: applyCommentsToHtmlContent(slide.htmlContent, comments),
    // Оновлюємо timestamp
    updatedAt: new Date().toISOString()
  };

  // Генеруємо опис змін
  const slideChanges = {
    slideId: slide.id,
    changes: comments.map(comment => ({
      section: comment.sectionType,
      shortDescription: getShortDescription(comment),
      detailedDescription: getDetailedDescription(comment, slide)
    })),
    summary: {
      totalChanges: comments.length,
      affectedSections: [...new Set(comments.map(c => c.sectionType))]
    }
  };

  return { editedSlide, slideChanges };
}

function applyCommentsToContent(content: string, comments: SlideComment[]): string {
  let modifiedContent = content;

  comments.forEach(comment => {
    switch (comment.sectionType) {
      case 'title':
        if (comment.comment.toLowerCase().includes('bigger') || comment.comment.toLowerCase().includes('larger')) {
          modifiedContent = modifiedContent.replace(/<h1>/g, '<h1 style="font-size: 2.5rem;">');
          modifiedContent = modifiedContent.replace(/<h2>/g, '<h2 style="font-size: 2rem;">');
        }
        break;
      case 'styling':
        if (comment.comment.toLowerCase().includes('color') || comment.comment.toLowerCase().includes('colorful')) {
          modifiedContent = addColorfulStyling(modifiedContent);
        }
        break;
      case 'content':
        if (comment.comment.toLowerCase().includes('simpl')) {
          modifiedContent = simplifyContent(modifiedContent);
        }
        break;
    }
  });

  return modifiedContent;
}

function applyCommentsToHtmlContent(htmlContent: string, comments: SlideComment[]): string {
  let modifiedHtml = htmlContent;

  comments.forEach(comment => {
    switch (comment.sectionType) {
      case 'title':
        if (comment.comment.toLowerCase().includes('bigger')) {
          modifiedHtml = modifiedHtml.replace(
            /<h([1-6])([^>]*)>/g, 
            '<h$1$2 style="font-size: 1.5em; font-weight: bold;">'
          );
        }
        break;
      case 'styling':
        if (comment.comment.toLowerCase().includes('color')) {
          modifiedHtml = addColorfulHtmlStyling(modifiedHtml);
        }
        break;
      case 'interactions':
        if (comment.comment.toLowerCase().includes('animation')) {
          modifiedHtml = addAnimations(modifiedHtml);
        }
        break;
    }
  });

  return modifiedHtml;
}

function addColorfulStyling(content: string): string {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  return content.replace(
    /<div([^>]*)>/g, 
    `<div$1 style="background: linear-gradient(135deg, ${randomColor}20, ${randomColor}10); border-radius: 12px; padding: 16px;">`
  );
}

function addColorfulHtmlStyling(html: string): string {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  return `<div style="background: linear-gradient(135deg, ${randomColor}15, ${randomColor}05); border-radius: 16px; padding: 20px; border: 2px solid ${randomColor}30;">${html}</div>`;
}

function addAnimations(html: string): string {
  return html.replace(
    /<div([^>]*)>/g,
    '<div$1 style="animation: fadeInUp 0.6s ease-out; transition: all 0.3s ease;">'
  ) + `
    <style>
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>
  `;
}

function simplifyContent(content: string): string {
  return content
    .replace(/\b\w{10,}\b/g, match => {
      // Спрощуємо довгі слова
      const simpleWords = {
        'implementation': 'use',
        'demonstration': 'show',
        'understanding': 'learn',
        'development': 'growth',
        'experience': 'try'
      };
      return simpleWords[match.toLowerCase()] || match;
    })
    .replace(/[.!?]+/g, '.')
    .replace(/\s+/g, ' ');
}

function getShortDescription(comment: SlideComment): string {
  const sectionName = {
    title: 'Title',
    content: 'Content', 
    styling: 'Styling',
    interactions: 'Interactions',
    general: 'General'
  }[comment.sectionType];

  return `${sectionName} updated based on feedback`;
}

function getDetailedDescription(comment: SlideComment, slide: SimpleSlide): string {
  const action = extractAction(comment.comment);
  return `In slide "${slide.title}", ${comment.sectionType} section was modified: ${action}. Original comment: "${comment.comment}"`;
}

function extractAction(comment: string): string {
  const lowerComment = comment.toLowerCase();
  
  if (lowerComment.includes('bigger') || lowerComment.includes('larger')) {
    return 'increased text size and made elements more prominent';
  }
  if (lowerComment.includes('color') || lowerComment.includes('colorful')) {
    return 'added colorful background gradients and enhanced visual appeal';
  }
  if (lowerComment.includes('simpl')) {
    return 'simplified language and reduced complexity';
  }
  if (lowerComment.includes('animation')) {
    return 'added smooth animations and transitions';
  }
  
  return 'applied requested modifications';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SlideEditRequest;
    
    // Валідація запиту
    if (!body.slide) {
      return NextResponse.json(
        { success: false, error: { message: 'Slide data is required', code: 'MISSING_SLIDE' } },
        { status: 400 }
      );
    }

    if (!body.comments || body.comments.length === 0) {
      return NextResponse.json(
        { success: false, error: { message: 'At least one comment is required', code: 'MISSING_COMMENTS' } },
        { status: 400 }
      );
    }

    if (!body.context || !body.context.ageGroup || !body.context.topic) {
      return NextResponse.json(
        { success: false, error: { message: 'Context (ageGroup and topic) is required', code: 'MISSING_CONTEXT' } },
        { status: 400 }
      );
    }

    console.log(`🎨 [SLIDE_EDIT] Processing slide "${body.slide.title}" with ${body.comments.length} comments`);
    
    // Обробляємо редагування слайду
    const result = await editSlideWithAI(body.slide, body.comments, body.context);
    
    console.log(`✅ [SLIDE_EDIT] Successfully edited slide "${body.slide.title}"`);
    
    const response: SlideEditResponse = {
      success: true,
      editedSlide: result.editedSlide,
      slideChanges: result.slideChanges
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ [SLIDE_EDIT] Error editing slide:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    const response: SlideEditResponse = {
      success: false,
      error: {
        message: errorMessage,
        code: 'PROCESSING_ERROR'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}
