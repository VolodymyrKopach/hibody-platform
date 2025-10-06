'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Chip,
  Zoom as MuiZoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  ArrowLeft,
  Hand,
  MousePointer,
  Plus,
  Undo,
  Redo,
  AlertTriangle,
  FileDown,
  Image as ImageIcon,
  Printer,
  Check,
  File,
  Files,
  Palette,
  Sparkles,
  Copy,
  Scissors,
  Trash2,
  CopyPlus,
  ClipboardPaste,
} from 'lucide-react';
import { exportToPDF, exportToPNG, printWorksheet } from '@/utils/pdfExportSnapdom';
import { autoSaveWorksheet, getCurrentWorksheetId, SavedWorksheet, clearAllWorksheets } from '@/utils/worksheetStorage';
import { clearAllImages } from '@/utils/imageStorage';
import { localImageService } from '@/services/images/LocalImageService';
import LeftSidebar from './canvas/LeftSidebar';
import RightSidebar from './canvas/RightSidebar';
import TitleBlock from './canvas/atomic/TitleBlock';
import BodyText from './canvas/atomic/BodyText';
import InstructionsBox from './canvas/atomic/InstructionsBox';
import FillInBlank from './canvas/atomic/FillInBlank';
import MultipleChoice from './canvas/atomic/MultipleChoice';
import TipBox from './canvas/atomic/TipBox';
import CanvasPage from './canvas/CanvasPage';
import { CanvasElement, PageContent } from '@/types/canvas-element';
import { ParsedWorksheet, WorksheetEdit, WorksheetEditContext } from '@/types/worksheet-generation';
import { WorksheetEditingService } from '@/services/worksheet/WorksheetEditingService';
import { WorksheetImageGenerationService } from '@/services/worksheet/WorksheetImageGenerationService';

interface PageBackground {
  type: 'solid' | 'gradient' | 'pattern' | 'image';
  color?: string;
  image?: {
    url: string;
    size: 'cover' | 'contain' | 'repeat' | 'auto';
    position: 'center' | 'top' | 'bottom' | 'left' | 'right';
    opacity?: number;
  };
  gradient?: {
    from: string;
    to: string;
    colors?: string[]; // For multi-color gradients (2-4 colors)
    direction: 'to-bottom' | 'to-top' | 'to-right' | 'to-left' | 'to-bottom-right' | 'to-bottom-left' | 'to-top-right' | 'to-top-left';
  };
  pattern?: {
    name: string;
    backgroundColor: string;
    patternColor: string;
    css: string;
    backgroundSize: string;
    backgroundPosition?: string;
    scale?: number; // Custom scale multiplier (0.5 - 2.0)
    opacity?: number; // Pattern opacity (0-100)
  };
  opacity?: number;
}

interface WorksheetPage {
  id: string;
  pageNumber: number;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string[];
  thumbnail: string;
  background?: PageBackground;
}

// A4 format: 210mm x 297mm = 794px x 1123px at 96 DPI
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

// Mock data - A4 pages розкидані в просторі як в Miro
const MOCK_CANVAS_PAGES: WorksheetPage[] = [
  {
    id: '1',
    pageNumber: 1,
    title: 'Present Simple Practice',
    x: 100,
    y: 100,
    width: A4_WIDTH,
    height: A4_HEIGHT,
    content: ['worksheet-page-1'],
    thumbnail: '📋',
    background: {
      type: 'solid',
      color: '#FFFFFF',
      opacity: 100,
    },
  },
  {
    id: '2',
    pageNumber: 2,
    title: 'Vocabulary Exercises',
    x: 1000,
    y: 100,
    width: A4_WIDTH,
    height: A4_HEIGHT,
    content: ['worksheet-page-2'],
    thumbnail: '✏️',
    background: {
      type: 'solid',
      color: '#FFFFFF',
      opacity: 100,
    },
  },
  {
    id: '3',
    pageNumber: 3,
    title: 'Reading Comprehension',
    x: 100,
    y: 1350,
    width: A4_WIDTH,
    height: A4_HEIGHT,
    content: ['worksheet-page-3'],
    thumbnail: '🎯',
    background: {
      type: 'solid',
      color: '#FFFFFF',
      opacity: 100,
    },
  },
];

interface Step3CanvasEditorProps {
  parameters?: any;
  generatedWorksheet?: ParsedWorksheet | null;
  onOpenGenerateDialog?: () => void;
}

// Selection types
type Selection = 
  | { type: 'page'; data: WorksheetPage }
  | { type: 'element'; pageData: WorksheetPage; elementData: any }
  | null;

// Helper function to format time since save
function formatTimeSince(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return '1 min ago';
  if (minutes < 60) return `${minutes} mins ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

const Step3CanvasEditor: React.FC<Step3CanvasEditorProps> = ({ parameters, generatedWorksheet, onOpenGenerateDialog }) => {
  const theme = useTheme();
  const router = useRouter();
  
  // Initialize pages from generated worksheet or empty canvas
  const PAGE_GAP = 45; // Gap between pages (30% of original 150px for tighter PDF-like appearance)
  const initialPages = generatedWorksheet 
    ? generatedWorksheet.pages.map((page, index) => ({
        id: page.pageId,
        title: page.title,
        pageNumber: page.pageNumber,
        x: 100, // All pages start at x: 100
        y: 100 + (A4_HEIGHT + PAGE_GAP) * index, // Stack vertically
        width: A4_WIDTH,
        height: A4_HEIGHT,
        content: [`worksheet-page-${page.pageNumber}`],
        thumbnail: '📄',
        background: page.background || { type: 'solid' as const, color: '#FFFFFF' },
      }))
    : []; // Start with empty canvas

  const [pages, setPages] = useState<WorksheetPage[]>(initialPages);
  
  // Initialize page contents from generated worksheet
  const initialPageContents = new Map<string, PageContent>();
  if (generatedWorksheet) {
    generatedWorksheet.pages.forEach(page => {
      initialPageContents.set(page.pageId, {
        elements: page.elements,
      });
    });
  }
  
  const [pageContents, setPageContents] = useState<Map<string, PageContent>>(initialPageContents);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.5);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selection, setSelection] = useState<Selection>(null);
  const [tool, setTool] = useState<'select' | 'hand'>('select');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedPageId, setDraggedPageId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [clipboard, setClipboard] = useState<
    | { type: 'element'; pageId: string; element: CanvasElement; operation: 'copy' | 'cut' }
    | { type: 'page'; page: WorksheetPage; pageContent: PageContent; operation: 'copy' | 'cut' }
    | null
  >(null);
  const [crossPageDrag, setCrossPageDrag] = useState<{ sourcePageId: string; elementId: string; element: CanvasElement } | null>(null);
  const [history, setHistory] = useState<Map<string, PageContent>[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [exitCallback, setExitCallback] = useState<(() => void) | null>(null);

  // AI Editing state
  const [editHistoryMap, setEditHistoryMap] = useState<Map<string, WorksheetEdit[]>>(new Map());
  const [isAIEditing, setIsAIEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageGenerationProgress, setImageGenerationProgress] = useState<string>('');

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    pageId?: string; // Optional - if undefined, clicked on canvas
    elementId?: string; // Optional - if undefined, clicked on page or canvas
  } | null>(null);

  // Update pages and contents when generatedWorksheet changes
  useEffect(() => {
    if (generatedWorksheet && generatedWorksheet.pages.length > 0) {
      console.log('📄 Updating canvas with generated worksheet:', generatedWorksheet);
      
      const newPages = generatedWorksheet.pages.map((page, index) => ({
        id: page.pageId,
        title: page.title,
        pageNumber: page.pageNumber,
        x: 100,
        y: 100 + (A4_HEIGHT + PAGE_GAP) * index,
        width: A4_WIDTH,
        height: A4_HEIGHT,
        content: [`worksheet-page-${page.pageNumber}`],
        thumbnail: '📄',
        background: page.background || { type: 'solid' as const, color: '#FFFFFF' },
      }));

      const newPageContents = new Map<string, PageContent>();
      generatedWorksheet.pages.forEach(page => {
        newPageContents.set(page.pageId, {
          elements: page.elements,
        });
      });

      setPages(newPages);
      setPageContents(newPageContents);
      
      console.log(`✅ Canvas updated with ${newPages.length} pages`);
    }
  }, [generatedWorksheet]);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Panel visibility state
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(true);
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(true);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => setZoom(1);

  const handlePageBackgroundUpdate = (pageId: string, background: PageBackground) => {
    console.log('🎨 Background Update:', { pageId, background });
    
    setPages(prev => prev.map(page =>
      page.id === pageId ? { ...page, background } : page
    ));
    
    // Update selection if the modified page is currently selected
    setSelection(prevSelection => {
      if (prevSelection?.type === 'page' && prevSelection.data.id === pageId) {
        return {
          type: 'page',
          data: {
            ...prevSelection.data,
            background,
          },
        };
      }
      return prevSelection;
    });
  };

  const handleImageUpload = async (pageId: string, file: File) => {
    try {
      // Upload image using LocalImageService
      const result = await localImageService.uploadLocalImage(file, {
        compress: true,
        maxWidth: 1920,
      });

      if (!result.success) {
        alert(result.error || 'Failed to upload image');
        return;
      }

      console.log('✅ Image uploaded:', result);

      // Apply as background
      const newBackground: PageBackground = {
        type: 'image',
        image: {
          url: result.url, // Blob URL from IndexedDB
          size: 'cover',
          position: 'center',
          opacity: 100,
        },
        opacity: 100,
      };

      setPages(prev => prev.map(page =>
        page.id === pageId
          ? {
              ...page,
              background: newBackground,
            }
          : page
      ));

      // Update selection if the modified page is currently selected
      setSelection(prevSelection => {
        if (prevSelection?.type === 'page' && prevSelection.data.id === pageId) {
          return {
            type: 'page',
            data: {
              ...prevSelection.data,
              background: newBackground,
            },
          };
        }
        return prevSelection;
      });
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  // Show exit confirmation dialog
  const showExitConfirmation = (): Promise<boolean> => {
    return new Promise((resolve) => {
      setExitCallback(() => () => resolve(true));
      setShowExitDialog(true);
    });
  };

  const handleExitConfirm = () => {
    setShowExitDialog(false);
    if (exitCallback) {
      exitCallback();
      setExitCallback(null);
    }
  };

  const handleExitCancel = () => {
    setShowExitDialog(false);
    setExitCallback(null);
  };

  const handleExitWithoutSave = () => {
    setShowExitDialog(false);
    if (exitCallback) {
      exitCallback();
      setExitCallback(null);
    }
    // Navigate back
    router.push('/');
  };

  const handleExitWithSave = async () => {
    setShowExitDialog(false);
    try {
      // Export all pages as PDF before exiting
      await handleExportPDF(false);
      
      if (exitCallback) {
        exitCallback();
        setExitCallback(null);
      }
      
      // Navigate back after saving
      router.push('/');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export PDF. Please try again.');
      setShowExitDialog(true);
    }
  };

  // Handle download from exit dialog
  const handleDownloadFromDialog = async () => {
    try {
      setIsExporting(true);
      
      // Close dialog temporarily to allow proper rendering
      setShowExitDialog(false);
      
      // Wait a bit for dialog to close
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Export all pages as PDF
      await handleExportPDF(false);
      
      // Reopen dialog after export
      setShowExitDialog(true);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export PDF. Please try again.');
      // Reopen dialog even on error
      setShowExitDialog(true);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle back button click
  const handleBackClick = async () => {
    const confirmed = await showExitConfirmation();
    if (confirmed) {
      console.log('🧹 Cleaning up storage on back button...');
      clearAllWorksheets();
      await clearAllImages();
      router.push('/');
    }
  };

  // Export handlers
  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  const handleExportPDF = async (currentPageOnly: boolean = false) => {
    handleExportMenuClose();
    setIsExporting(true);

    try {
      console.log('📄 Starting PDF export...', { currentPageOnly, pagesCount: pages.length });
      
      let pageElements: HTMLElement[];
      let filename = 'worksheet';

      if (currentPageOnly && selection?.type === 'page') {
        // Export only selected page
        const selectedPageElement = document.querySelector(
          `[data-page-id="${selection.data.id}"]`
        ) as HTMLElement;

        if (!selectedPageElement) {
          throw new Error('Selected page not found');
        }

        pageElements = [selectedPageElement];
        filename = `worksheet_page_${selection.data.pageNumber}`;
      } else if (currentPageOnly && selection?.type === 'element') {
        // Export page containing selected element
        const selectedPageElement = document.querySelector(
          `[data-page-id="${selection.pageData.id}"]`
        ) as HTMLElement;

        if (!selectedPageElement) {
          throw new Error('Selected page not found');
        }

        pageElements = [selectedPageElement];
        filename = `worksheet_page_${selection.pageData.pageNumber}`;
      } else {
        // Export all pages
        console.log('🔍 Looking for page elements with [data-page-id]...');
        pageElements = Array.from(
          document.querySelectorAll('[data-page-id]')
        ) as HTMLElement[];

        console.log(`📋 Found ${pageElements.length} page elements`);

        if (pageElements.length === 0) {
          throw new Error('No pages found to export. Please make sure you have created pages.');
        }
      }

      console.log('📤 Exporting to PDF...', { elementsCount: pageElements.length });
      
      await exportToPDF(pageElements, {
        filename,
        format: 'a4',
      });

      console.log('✅ PDF export successful!');
    } catch (error) {
      console.error('❌ Export PDF failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to export PDF: ${errorMessage}\n\nPlease try again.`);
      throw error; // Re-throw to be caught by caller
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPNG = async (currentPageOnly: boolean = false) => {
    handleExportMenuClose();
    setIsExporting(true);

    try {
      let pageElement: HTMLElement;
      let filename = 'worksheet';

      if (currentPageOnly && selection?.type === 'page') {
        // Export only selected page
        const selectedPageElement = document.querySelector(
          `[data-page-id="${selection.data.id}"]`
        ) as HTMLElement;

        if (!selectedPageElement) {
          throw new Error('Selected page not found');
        }

        pageElement = selectedPageElement;
        filename = `worksheet_page_${selection.data.pageNumber}`;
      } else if (currentPageOnly && selection?.type === 'element') {
        // Export page containing selected element
        const selectedPageElement = document.querySelector(
          `[data-page-id="${selection.pageData.id}"]`
        ) as HTMLElement;

        if (!selectedPageElement) {
          throw new Error('Selected page not found');
        }

        pageElement = selectedPageElement;
        filename = `worksheet_page_${selection.pageData.pageNumber}`;
      } else {
        // Export first page by default
        pageElement = document.querySelector('[data-page-id]') as HTMLElement;

        if (!pageElement) {
          throw new Error('No page found to export');
        }
      }

      await exportToPNG(pageElement, filename);
    } catch (error) {
      console.error('Export PNG failed:', error);
      alert('Failed to export PNG. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    handleExportMenuClose();

    try {
      // Get all page elements
      const pageElements = Array.from(
        document.querySelectorAll('[data-page-id]')
      ) as HTMLElement[];

      if (pageElements.length === 0) {
        throw new Error('No pages found to print');
      }

      printWorksheet(pageElements);
    } catch (error) {
      console.error('Print failed:', error);
      alert('Failed to print. Please try again.');
    }
  };

  // Save worksheet
  const handleSave = () => {
    setIsSaving(true);
    try {
      autoSaveWorksheet(pages, pageContents);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save worksheet. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (pageContents.size > 0) {
        try {
          autoSaveWorksheet(pages, pageContents);
          setLastSaved(new Date());
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [pages, pageContents]);

  // Save on Ctrl/Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pages, pageContents]);

  // Cleanup storage when leaving the canvas page
  useEffect(() => {
    // Cleanup on page unload (closing tab/window)
    const handleBeforeUnload = () => {
      console.log('🧹 Cleaning up storage on page close...');
      clearAllWorksheets();
      clearAllImages(); // Note: this is synchronous cleanup
    };

    // Cleanup on component unmount (navigation away)
    const handleUnmount = async () => {
      console.log('🧹 Cleaning up storage on navigation...');
      clearAllWorksheets();
      await clearAllImages();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleUnmount();
    };
  }, []);

  // Update saved time display
  useEffect(() => {
    if (!lastSaved) return;

    const updateInterval = setInterval(() => {
      // Force re-render to update "saved X ago" text
      setLastSaved(new Date(lastSaved));
    }, 60000); // Update every minute

    return () => clearInterval(updateInterval);
  }, [lastSaved]);

  // Save state to history
  const saveToHistory = (newPageContents: Map<string, PageContent>) => {
    setHistory(prev => {
      // Remove any future history if we're not at the end
      const newHistory = prev.slice(0, historyIndex + 1);
      // Add new state
      newHistory.push(new Map(newPageContents));
      // Limit history to 50 states
      if (newHistory.length > 50) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  };

  // Prevent accidental navigation away
  useEffect(() => {
    // Always show warning when leaving page
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern browsers require returnValue to be set
      e.returnValue = '';
      return '';
    };

    const handleKeyDown = async (e: KeyboardEvent) => {
      // Prevent Cmd/Ctrl+W (close tab)
      if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
        e.preventDefault();
        // Show confirmation dialog
        const confirmed = await showExitConfirmation();
        if (confirmed) {
          window.close();
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Prevent browser back button navigation
  useEffect(() => {
    // Push a dummy state to history to intercept back button
    window.history.pushState(null, '', window.location.href);

    const handlePopState = async (e: PopStateEvent) => {
      // Show confirmation dialog
      const confirmed = await showExitConfirmation();
      
      if (confirmed) {
        // User confirmed - allow navigation back
        window.history.back();
      } else {
        // User cancelled - push state again to stay on page
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Prevent browser gestures on canvas (touchpad swipe navigation)
  useEffect(() => {
    const canvas = canvasContainerRef.current;
    if (!canvas) return;

    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchEndX = e.touches[0].clientX;
      const touchEndY = e.touches[0].clientY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;
      
      // Prevent horizontal swipe navigation (back/forward)
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      // Prevent horizontal scroll from triggering browser navigation
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Prevent default touchpad gestures on the entire document
    const handleDocumentWheel = (e: WheelEvent) => {
      // Block horizontal scroll anywhere on the page
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 10) {
        e.preventDefault();
      }
    };

    // Add listeners with appropriate options
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('wheel', handleDocumentWheel, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('wheel', handleWheel);
      document.removeEventListener('wheel', handleDocumentWheel);
    };
  }, []);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setPageContents(new Map(history[newIndex]));
      setSelection(null);
      setSelectedElementId(null);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setPageContents(new Map(history[newIndex]));
      setSelection(null);
      setSelectedElementId(null);
    }
  };

  // Handle element operations
  const handleElementAdd = (pageId: string, element: Omit<CanvasElement, 'id' | 'zIndex'>) => {
    setPageContents(prev => {
      const newMap = new Map(prev);
      const pageContent = newMap.get(pageId) || { id: `content-${pageId}`, pageId, elements: [] };
      
      const newElement: CanvasElement = {
        ...element,
        id: `element-${Date.now()}-${Math.random()}`,
        zIndex: pageContent.elements.length,
      };
      
      newMap.set(pageId, {
        ...pageContent,
        elements: [...pageContent.elements, newElement],
      });
      
      saveToHistory(newMap);
      return newMap;
    });
  };


  const handleElementEdit = (pageId: string, elementId: string, properties: any) => {
    console.log('✏️ [handleElementEdit] Editing element:', {
      pageId,
      elementId,
      properties,
      textValue: properties?.text,
      textType: typeof properties?.text,
      textIsUndefined: properties?.text === undefined,
      textIsNull: properties?.text === null,
      textIsStringUndefined: properties?.text === 'undefined'
    });
    
    // Захист від undefined/null значень
    if (properties?.text === undefined || properties?.text === null || properties?.text === 'undefined') {
      console.warn('⚠️ [handleElementEdit] Received undefined/null/string-undefined text, ignoring update');
      return;
    }
    
    setPageContents(prev => {
      const newMap = new Map(prev);
      const pageContent = newMap.get(pageId);
      
      if (!pageContent) {
        console.warn('⚠️ [handleElementEdit] Page content not found for pageId:', pageId);
        return prev;
      }
      
      const updatedElements = pageContent.elements.map(el => {
        if (el.id === elementId) {
          console.log('✅ [handleElementEdit] Updating element:', {
            elementId: el.id,
            oldProperties: el.properties,
            newProperties: properties
          });
          return { ...el, properties };
        }
        return el;
      });
      
      newMap.set(pageId, {
        ...pageContent,
        elements: updatedElements,
      });
      
      saveToHistory(newMap);
      return newMap;
    });
    
    // Update selection with new data
    if (selection?.type === 'element' && selection.elementData.id === elementId) {
      setSelection({
        ...selection,
        elementData: {
          ...selection.elementData,
          properties,
        },
      });
    }
  };

  const handleElementReorder = (pageId: string, fromIndex: number, toIndex: number) => {
    setPageContents(prev => {
      const newMap = new Map(prev);
      const pageContent = newMap.get(pageId);
      
      if (!pageContent) return prev;
      
      const elements = [...pageContent.elements];
      const [movedElement] = elements.splice(fromIndex, 1);
      elements.splice(toIndex, 0, movedElement);
      
      newMap.set(pageId, {
        ...pageContent,
        elements,
      });
      
      saveToHistory(newMap);
      return newMap;
    });
  };

  const handleElementSelect = (elementId: string | null) => {
    setSelectedElementId(elementId);
    
    if (elementId) {
      // Find which page contains this element
      for (const [pageId, content] of pageContents.entries()) {
        const element = content.elements.find(el => el.id === elementId);
        if (element) {
          const page = pages.find(p => p.id === pageId);
          if (page) {
            setSelection({ type: 'element', pageData: page, elementData: element });
          }
          break;
        }
      }
    }
  };

  const handleElementDelete = (pageId: string, elementId: string) => {
    setPageContents(prev => {
      const newMap = new Map(prev);
      const pageContent = newMap.get(pageId);
      
      if (!pageContent) return prev;
      
      newMap.set(pageId, {
        ...pageContent,
        elements: pageContent.elements.filter(el => el.id !== elementId),
      });
      
      saveToHistory(newMap);
      return newMap;
    });
    
    // Clear selection
    setSelectedElementId(null);
    setSelection(null);
  };

  // Get unique key for current selection
  const getSelectionKey = (sel: typeof selection): string | null => {
    if (!sel) return null;
    
    if (sel.type === 'page') {
      return `page-${sel.data.id}`;
    } else {
      return `element-${sel.pageData.id}-${sel.elementData.id}`;
    }
  };

  // Detect image prompt changes in page elements
  const detectImagePromptChanges = (
    originalElements: any[],
    updatedElements: any[]
  ): Array<{ element: any; newPrompt: string; oldPrompt: string }> => {
    const changes: Array<{ element: any; newPrompt: string; oldPrompt: string }> = [];

    updatedElements.forEach(updatedEl => {
      if (updatedEl.type !== 'image-placeholder') return;

      const originalEl = originalElements.find(el => el.id === updatedEl.id);
      if (!originalEl) return;

      const oldPrompt = originalEl.properties?.imagePrompt || '';
      const newPrompt = updatedEl.properties?.imagePrompt || '';

      // Check if imagePrompt changed
      if (newPrompt && oldPrompt !== newPrompt) {
        console.log(`🎨 Detected imagePrompt change for ${updatedEl.id}:`, {
          old: oldPrompt.substring(0, 50) + '...',
          new: newPrompt.substring(0, 50) + '...'
        });
        changes.push({
          element: updatedEl,
          newPrompt,
          oldPrompt
        });
      }
    });

    return changes;
  };

  // Regenerate images for page elements with changed prompts
  const regenerateImagesForPageElements = async (
    pageId: string,
    changes: Array<{ element: any; newPrompt: string; oldPrompt: string }>
  ): Promise<void> => {
    if (changes.length === 0) return;

    console.log(`🎨 Regenerating ${changes.length} images for page ${pageId}...`);
    setIsGeneratingImage(true);
    
    const imageService = new WorksheetImageGenerationService();
    let successCount = 0;
    let failureCount = 0;

    for (const change of changes) {
      try {
        setImageGenerationProgress(`Генерація зображення ${successCount + failureCount + 1}/${changes.length}...`);
        
        console.log(`🎨 Generating image for element ${change.element.id}`);
        
        const newImageUrl = await imageService.generateSingleImage(
          change.newPrompt,
          change.element.properties?.width || 400,
          change.element.properties?.height || 300
        );

        // Update element with new image URL
        handleElementEdit(
          pageId,
          change.element.id,
          {
            ...change.element.properties,
            url: newImageUrl,
            imagePrompt: change.newPrompt
          }
        );

        successCount++;
        console.log(`✅ Image generated successfully for ${change.element.id}`);
        
      } catch (error) {
        failureCount++;
        console.error(`❌ Failed to generate image for ${change.element.id}:`, error);
        // Continue with other images even if one fails
      }
    }

    setIsGeneratingImage(false);
    setImageGenerationProgress('');
    
    console.log(`🎨 Image regeneration complete: ${successCount} succeeded, ${failureCount} failed`);
  };

  // Get edit history for current selection
  const getCurrentEditHistory = (): WorksheetEdit[] => {
    const key = getSelectionKey(selection);
    if (!key) return [];
    return editHistoryMap.get(key) || [];
  };

  // Add edit to history for specific selection
  const addEditToHistory = (edit: WorksheetEdit) => {
    const key = getSelectionKey(selection);
    if (!key) return;

    setEditHistoryMap(prev => {
      const newMap = new Map(prev);
      const existingHistory = newMap.get(key) || [];
      newMap.set(key, [...existingHistory, edit]);
      return newMap;
    });
  };

  // AI Editing handler
  const handleAIEdit = async (instruction: string) => {
    if (!selection || !parameters) {
      console.warn('⚠️ Cannot edit: no selection or parameters');
      return;
    }

    setIsAIEditing(true);
    setEditError(null);

    try {
      console.log('🤖 AI Edit requested:', instruction);

      // SPECIAL CASE: Direct regenerate for image components
      if (instruction === '__REGENERATE__' && selection.type === 'element' && selection.elementData.type === 'image-placeholder') {
        console.log('🎨 Direct image regeneration requested');
        
        const currentPrompt = selection.elementData.properties?.imagePrompt;
        if (!currentPrompt) {
          throw new Error('No image prompt found for regeneration');
        }

        // Set image generation state
        setIsGeneratingImage(true);
        setImageGenerationProgress('Генерація зображення...');

        // Generate directly with existing prompt
        const imageService = new WorksheetImageGenerationService();
        const newImageUrl = await imageService.generateSingleImage(
          currentPrompt,
          selection.elementData.properties?.width || 400,
          selection.elementData.properties?.height || 300
        );

        setIsGeneratingImage(false);
        setImageGenerationProgress('');

        // Update component with new image
        handleElementEdit(
          selection.pageData.id,
          selection.elementData.id,
          {
            ...selection.elementData.properties,
            url: newImageUrl
          }
        );

        // Add to history
        addEditToHistory({
          id: `edit-${Date.now()}`,
          timestamp: new Date(),
          instruction: 'Перегенерувати зображення',
          changes: [{ field: 'url', oldValue: selection.elementData.properties?.url, newValue: newImageUrl, description: 'Зображення перегенеровано' }],
          target: 'component',
          success: true
        });

        setIsAIEditing(false);
        return;
      }

      const editService = new WorksheetEditingService();

      // Build context from parameters
      const context: WorksheetEditContext = {
        topic: parameters.topic || 'General',
        ageGroup: parameters.level || parameters.ageGroup || 'general',
        difficulty: parameters.difficulty || getDifficultyFromLevel(parameters.level),
        language: parameters.language || 'en',
      };

      let result: any;

      if (selection.type === 'element') {
        // Edit component
        result = await editService.editComponent(
          selection.pageData.id,
          selection.elementData.id,
          selection.elementData,
          instruction,
          context
        );

        if (result.success && result.patch.properties) {
          // Apply patch to component
          const updatedProperties = editService.applyComponentPatch(
            selection.elementData.properties,
            result.patch
          );

          handleElementEdit(
            selection.pageData.id,
            selection.elementData.id,
            updatedProperties
          );

          console.log('✅ Component updated via AI');

          // SPECIAL: If it's an image component and we got a new imagePrompt, generate the image
          if (selection.elementData.type === 'image-placeholder' && (result as any).imagePrompt) {
            console.log('🎨 Generating new image with updated prompt...');
            
            const newPrompt = (result as any).imagePrompt;
            const imageService = new WorksheetImageGenerationService();
            
            try {
              // Set image generation state
              setIsGeneratingImage(true);
              setImageGenerationProgress('Генерація зображення з новим стилем...');

              const newImageUrl = await imageService.generateSingleImage(
                newPrompt,
                selection.elementData.properties?.width || 400,
                selection.elementData.properties?.height || 300
              );

              setIsGeneratingImage(false);
              setImageGenerationProgress('');

              // Update component with generated image AND new prompt
              handleElementEdit(
                selection.pageData.id,
                selection.elementData.id,
                {
                  ...updatedProperties,
                  url: newImageUrl,
                  imagePrompt: newPrompt // Save the new prompt for future regenerations
                }
              );

              console.log('✅ Image generated successfully with new prompt');
            } catch (imgError) {
              console.error('❌ Image generation failed:', imgError);
              setIsGeneratingImage(false);
              setImageGenerationProgress('');
              // Continue with text changes even if image generation fails
            }
          }
        }
      } else {
        // Edit page
        const pageData = {
          ...selection.data,
          elements: pageContents.get(selection.data.id)?.elements || []
        };

        result = await editService.editPage(
          selection.data.id,
          pageData,
          instruction,
          context
        );

        if (result.success) {
          // Apply patch to page using editService method (preserves URLs)
          const updatedPage = editService.applyPagePatch(pageData, result.patch);
          
          if (result.patch.title) {
            setPages(prev => prev.map(p =>
              p.id === selection.data.id ? { ...p, title: result.patch.title! } : p
            ));
          }

          if (result.patch.elements) {
            // Detect imagePrompt changes before updating state
            const imagePromptChanges = detectImagePromptChanges(
              pageData.elements,
              updatedPage.elements
            );

            setPageContents(prev => {
              const newMap = new Map(prev);
              const pageContent = newMap.get(selection.data.id);

              if (pageContent) {
                newMap.set(selection.data.id, {
                  ...pageContent,
                  elements: updatedPage.elements
                });
                saveToHistory(newMap);
              }

              return newMap;
            });

            // Regenerate images if imagePrompt changed
            if (imagePromptChanges.length > 0) {
              console.log(`🎨 Found ${imagePromptChanges.length} image prompt changes, regenerating...`);
              
              // Run regeneration asynchronously (don't block UI)
              regenerateImagesForPageElements(selection.data.id, imagePromptChanges)
                .catch(error => {
                  console.error('❌ Image regeneration failed:', error);
                  setEditError('Зміни застосовано, але не вдалося згенерувати деякі зображення');
                });
            }
          }

          console.log('✅ Page updated via AI');
        }
      }

      // Add to edit history
      if (result.success) {
        const historyEntry: WorksheetEdit = {
          id: `edit-${Date.now()}`,
          timestamp: new Date(),
          instruction,
          changes: result.changes,
          target: selection.type === 'element' ? 'component' : 'page',
          success: true
        };

        addEditToHistory(historyEntry);
      }

    } catch (error) {
      console.error('❌ AI Edit failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setEditError(errorMessage);

      // Add failed edit to history
      const historyEntry: WorksheetEdit = {
        id: `edit-${Date.now()}`,
        timestamp: new Date(),
        instruction,
        changes: [],
        target: selection?.type === 'element' ? 'component' : 'page',
        success: false,
        error: errorMessage
      };

      addEditToHistory(historyEntry);
    } finally {
      setIsAIEditing(false);
    }
  };

  // Helper: Convert level to difficulty
  const getDifficultyFromLevel = (level: string): 'easy' | 'medium' | 'hard' => {
    if (!level) return 'medium';
    const lowercaseLevel = level.toLowerCase();
    if (lowercaseLevel.includes('beginner') || lowercaseLevel.includes('elementary')) return 'easy';
    if (lowercaseLevel.includes('advanced') || lowercaseLevel.includes('upper')) return 'hard';
    return 'medium';
  };

  const handleAddNewPage = () => {
    const newPageNumber = pages.length + 1;
    const newPageId = `page-${Date.now()}-${Math.random()}`;
    
    // Find the last page position to stack the new page below it
    const lastPage = pages.length > 0 ? pages[pages.length - 1] : null;
    const newY = lastPage ? lastPage.y + lastPage.height + PAGE_GAP : 100;
    
    const newPage: WorksheetPage = {
      id: newPageId,
      pageNumber: newPageNumber,
      title: `Page ${newPageNumber}`,
      x: 100,
      y: newY,
      width: A4_WIDTH,
      height: A4_HEIGHT,
      content: [`worksheet-page-${newPageNumber}`],
      thumbnail: '📄',
      background: {
        type: 'solid',
        color: '#FFFFFF',
        opacity: 100,
      },
    };
    
    // Add page to pages array
    setPages(prev => [...prev, newPage]);
    
    // Initialize empty content for the new page
    setPageContents(prev => {
      const newMap = new Map(prev);
      newMap.set(newPageId, {
        id: `content-${newPageId}`,
        pageId: newPageId,
        elements: [],
      });
      saveToHistory(newMap);
      return newMap;
    });
    
    // Select the new page
    setSelection({ type: 'page', data: newPage });
    
    console.log(`✅ New page ${newPageNumber} added at position (${newPage.x}, ${newY})`);
  };

  const handleElementDuplicate = (pageId: string, elementId: string) => {
    setPageContents(prev => {
      const newMap = new Map(prev);
      const pageContent = newMap.get(pageId);
      
      if (!pageContent) return prev;
      
      const originalElement = pageContent.elements.find(el => el.id === elementId);
      if (!originalElement) return prev;
      
      // Create duplicate with offset position
      const duplicateElement: CanvasElement = {
        ...originalElement,
        id: `element-${Date.now()}-${Math.random()}`,
        position: {
          x: originalElement.position.x + 20,
          y: originalElement.position.y + 20,
        },
        zIndex: pageContent.elements.length,
      };
      
      newMap.set(pageId, {
        ...pageContent,
        elements: [...pageContent.elements, duplicateElement],
      });
      
      saveToHistory(newMap);
      return newMap;
    });
    
    // Select the new duplicate
    setTimeout(() => {
      const newContent = pageContents.get(pageId);
      if (newContent) {
        const newElement = newContent.elements[newContent.elements.length - 1];
        handleElementSelect(newElement.id);
      }
    }, 50);
  };

  const handleCopyElement = (pageId: string, elementId: string) => {
    const pageContent = pageContents.get(pageId);
    if (!pageContent) return;
    
    const element = pageContent.elements.find(el => el.id === elementId);
    if (!element) return;
    
    setClipboard({ type: 'element', pageId, element, operation: 'copy' });
    console.log('📋 Element copied to clipboard');
  };

  const handleCutElement = (pageId: string, elementId: string) => {
    const pageContent = pageContents.get(pageId);
    if (!pageContent) return;
    
    const element = pageContent.elements.find(el => el.id === elementId);
    if (!element) return;
    
    setClipboard({ type: 'element', pageId, element, operation: 'cut' });
    console.log('✂️ Element cut to clipboard');
  };

  const handleCopyPage = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    const pageContent = pageContents.get(pageId);
    if (!page || !pageContent) return;
    
    setClipboard({ type: 'page', page, pageContent, operation: 'copy' });
    console.log('📋 Page copied to clipboard');
  };

  const handleCutPage = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    const pageContent = pageContents.get(pageId);
    if (!page || !pageContent) return;
    
    setClipboard({ type: 'page', page, pageContent, operation: 'cut' });
    console.log('✂️ Page cut to clipboard');
  };

  const handleDuplicatePage = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    const pageContent = pageContents.get(pageId);
    if (!page || !pageContent) return;

    const newPageId = `page-${Date.now()}-${Math.random()}`;
    const newPageNumber = pages.length + 1;
    
    // Find position for new page (below the original)
    const newY = page.y + page.height + PAGE_GAP;
    
    const duplicatedPage: WorksheetPage = {
      ...page,
      id: newPageId,
      pageNumber: newPageNumber,
      title: `${page.title} (Copy)`,
      y: newY,
    };
    
    // Duplicate elements with new IDs
    const duplicatedElements = pageContent.elements.map((el, index) => ({
      ...el,
      id: `element-${Date.now()}-${Math.random()}-${index}`,
    }));
    
    const duplicatedPageContent: PageContent = {
      id: `content-${newPageId}`,
      pageId: newPageId,
      elements: duplicatedElements,
    };
    
    setPages(prev => [...prev, duplicatedPage]);
    setPageContents(prev => {
      const newMap = new Map(prev);
      newMap.set(newPageId, duplicatedPageContent);
      saveToHistory(newMap);
      return newMap;
    });
    
    // Select the new page
    setSelection({ type: 'page', data: duplicatedPage });
    
    console.log(`✅ Page ${page.pageNumber} duplicated as page ${newPageNumber}`);
  };

  const handlePasteElement = (targetPageId: string) => {
    if (!clipboard || clipboard.type !== 'element') return;
    
    setPageContents(prev => {
      const newMap = new Map(prev);
      const targetContent = newMap.get(targetPageId);
      
      if (!targetContent) return prev;
      
      // Create pasted element with offset position (only if pasting to same page)
      const isSamePage = clipboard.pageId === targetPageId;
      const pastedElement: CanvasElement = {
        ...clipboard.element,
        id: `element-${Date.now()}-${Math.random()}`,
        position: {
          x: clipboard.element.position.x + (isSamePage ? 20 : 0),
          y: clipboard.element.position.y + (isSamePage ? 20 : 0),
        },
        zIndex: targetContent.elements.length,
      };
      
      // If cut operation, remove from source page
      if (clipboard.operation === 'cut' && clipboard.pageId !== targetPageId) {
        const sourceContent = newMap.get(clipboard.pageId);
        if (sourceContent) {
          newMap.set(clipboard.pageId, {
            ...sourceContent,
            elements: sourceContent.elements.filter(el => el.id !== clipboard.element.id),
          });
        }
      }
      
      // Add to target page
      newMap.set(targetPageId, {
        ...targetContent,
        elements: [...targetContent.elements, pastedElement],
      });
      
      saveToHistory(newMap);
      return newMap;
    });
    
    // Clear clipboard if it was a cut operation
    if (clipboard.operation === 'cut') {
      setClipboard(null);
      console.log('✅ Element moved to page');
    } else {
      console.log('✅ Element pasted to page');
    }
    
    // Select the pasted element
    setTimeout(() => {
      const newContent = pageContents.get(targetPageId);
      if (newContent) {
        const newElement = newContent.elements[newContent.elements.length - 1];
        handleElementSelect(newElement.id);
      }
    }, 50);
  };

  // Cross-page drag handlers
  const handleCrossPageDragStart = (sourcePageId: string, elementId: string) => {
    const pageContent = pageContents.get(sourcePageId);
    if (!pageContent) return;
    
    const element = pageContent.elements.find(el => el.id === elementId);
    if (!element) return;
    
    setCrossPageDrag({ sourcePageId, elementId, element });
    console.log('🔄 Cross-page drag started:', { sourcePageId, elementId });
  };

  const handleCrossPageDragEnd = () => {
    setCrossPageDrag(null);
    console.log('✅ Cross-page drag ended');
  };

  const handleCrossPageDrop = (targetPageId: string) => {
    if (!crossPageDrag) return;
    
    const { sourcePageId, elementId, element } = crossPageDrag;
    
    if (sourcePageId === targetPageId) {
      console.log('⚠️ Cannot drop on same page (use reorder instead)');
      setCrossPageDrag(null);
      return;
    }

    setPageContents(prev => {
      const newMap = new Map(prev);
      const sourceContent = newMap.get(sourcePageId);
      const targetContent = newMap.get(targetPageId);
      
      if (!sourceContent || !targetContent) return prev;
      
      // Remove from source page
      newMap.set(sourcePageId, {
        ...sourceContent,
        elements: sourceContent.elements.filter(el => el.id !== elementId),
      });
      
      // Add to target page with new ID to avoid conflicts
      const movedElement: CanvasElement = {
        ...element,
        id: `element-${Date.now()}-${Math.random()}`,
        zIndex: targetContent.elements.length,
      };
      
      newMap.set(targetPageId, {
        ...targetContent,
        elements: [...targetContent.elements, movedElement],
      });
      
      saveToHistory(newMap);
      return newMap;
    });
    
    console.log(`✅ Element moved from page ${sourcePageId} to ${targetPageId} via drag`);
    
    // Clear cross-page drag state
    setCrossPageDrag(null);
    setSelectedElementId(null);
    setSelection(null);
  };

  // Context menu handlers
  const handleContextMenu = (event: React.MouseEvent, pageId?: string, elementId?: string) => {
    event.preventDefault();
    event.stopPropagation();
    
    // If clicked on page (not element), auto-select the page
    if (pageId && !elementId) {
      const page = pages.find(p => p.id === pageId);
      if (page) {
        setSelection({ type: 'page', data: page });
      }
    }
    
    setContextMenu({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
      pageId,
      elementId,
    });
  };

  // Canvas context menu handler (outside pages)
  const handleCanvasContextMenu = (event: React.MouseEvent) => {
    // Only show menu if clicking on canvas background, not on a page
    const target = event.target as HTMLElement;
    if (target.closest('[data-page-id]')) return; // Clicked on a page
    
    event.preventDefault();
    event.stopPropagation();
    
    setContextMenu({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
      // No pageId - means we're on canvas
    });
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  const handleContextMenuAction = (action: 'copy' | 'cut' | 'duplicate' | 'delete' | 'paste') => {
    if (!contextMenu) return;

    const { pageId, elementId } = contextMenu;

    // Clicked on canvas (no pageId) - only paste page
    if (!pageId) {
      if (action === 'paste' && clipboard?.type === 'page') {
        handlePastePage();
      }
      handleContextMenuClose();
      return;
    }

    // If clicked on element - use it directly
    if (elementId) {
      switch (action) {
        case 'copy':
          handleCopyElement(pageId, elementId);
          break;
        case 'cut':
          handleCutElement(pageId, elementId);
          break;
        case 'duplicate':
          handleElementDuplicate(pageId, elementId);
          break;
        case 'delete':
          handleElementDelete(pageId, elementId);
          break;
      }
    } 
    // If clicked on page - use current selection
    else if (selection) {
      if (selection.type === 'element') {
        switch (action) {
          case 'copy':
            handleCopyElement(selection.pageData.id, selection.elementData.id);
            break;
          case 'cut':
            handleCutElement(selection.pageData.id, selection.elementData.id);
            break;
          case 'duplicate':
            handleElementDuplicate(selection.pageData.id, selection.elementData.id);
            break;
          case 'delete':
            handleElementDelete(selection.pageData.id, selection.elementData.id);
            break;
        }
      } else if (selection.type === 'page') {
        // Actions for selected page
        switch (action) {
          case 'copy':
            handleCopyPage(selection.data.id);
            break;
          case 'cut':
            handleCutPage(selection.data.id);
            break;
          case 'duplicate':
            handleDuplicatePage(selection.data.id);
            break;
          case 'delete':
            // Delete page
            setPages(prev => prev.filter(p => p.id !== selection.data.id));
            setPageContents(prev => {
              const newMap = new Map(prev);
              newMap.delete(selection.data.id);
              saveToHistory(newMap);
              return newMap;
            });
            setSelection(null);
            console.log(`🗑️ Page ${selection.data.pageNumber} deleted`);
            break;
        }
      }
      // Paste element on page (only if clipboard has element)
      if (action === 'paste' && clipboard?.type === 'element') {
        handlePasteElement(pageId);
      }
    }
    // No selection - only paste element is available
    else if (action === 'paste' && clipboard?.type === 'element') {
      handlePasteElement(pageId);
    }

    handleContextMenuClose();
  };

  // Paste page on canvas
  const handlePastePage = () => {
    if (!clipboard || clipboard.type !== 'page') return;

    const newPageId = `page-${Date.now()}-${Math.random()}`;
    const newPageNumber = pages.length + 1;
    
    // Find position for new page (at the end)
    const lastPage = pages[pages.length - 1];
    const newY = lastPage ? lastPage.y + lastPage.height + PAGE_GAP : 100;
    
    const pastedPage: WorksheetPage = {
      ...clipboard.page,
      id: newPageId,
      pageNumber: newPageNumber,
      title: `${clipboard.page.title} (Pasted)`,
      y: newY,
    };
    
    // Duplicate elements with new IDs
    const pastedElements = clipboard.pageContent.elements.map((el: any, index: number) => ({
      ...el,
      id: `element-${Date.now()}-${Math.random()}-${index}`,
    }));
    
    const pastedPageContent: PageContent = {
      id: `content-${newPageId}`,
      pageId: newPageId,
      elements: pastedElements,
    };
    
    // If cut operation, remove original page
    if (clipboard.operation === 'cut') {
      setPages(prev => prev.filter(p => p.id !== clipboard.page.id));
      setPageContents(prev => {
        const newMap = new Map(prev);
        newMap.delete(clipboard.page.id);
        newMap.set(newPageId, pastedPageContent);
        saveToHistory(newMap);
        return newMap;
      });
      setClipboard(null);
      console.log('✅ Page moved to canvas');
    } else {
      setPageContents(prev => {
        const newMap = new Map(prev);
        newMap.set(newPageId, pastedPageContent);
        saveToHistory(newMap);
        return newMap;
      });
      console.log('✅ Page pasted to canvas');
    }
    
    setPages(prev => [...prev, pastedPage]);
    
    // Select the new page
    setSelection({ type: 'page', data: pastedPage });
  };

  const handlePageMouseDown = (e: React.MouseEvent, pageId: string) => {
    if (tool === 'select') {
      // Don't start page drag if clicking on an element inside the page
      const target = e.target as HTMLElement;
      const isClickingElement = target.closest('[data-print-content]')?.querySelector('[draggable="true"]');
      
      // Only allow page drag if clicking on the page itself, not its elements
      if (target.hasAttribute('data-page-id') || target.closest('[data-page-header]')) {
        e.stopPropagation();
        const page = pages.find(p => p.id === pageId);
        if (page) {
          setSelection({ type: 'page', data: page });
        }
        setIsDragging(true);
        setDraggedPageId(pageId);
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const currentTool = isSpacePressed ? 'hand' : tool;
    
    if (currentTool === 'hand' || (e.button === 1)) { // Middle mouse button or hand tool
      e.preventDefault();
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      // Clear selection when clicking on canvas background (not on pages)
      const target = e.target as HTMLElement;
      if (target === canvasContainerRef.current || target.closest('[data-canvas-container]')) {
        setSelection(null);
        setSelectedElementId(null);
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    // Don't do anything if an element is being dragged (HTML5 drag)
    if (e.buttons === 0 && !isPanning && !isDragging) {
      return;
    }
    
    // Pan canvas
    if (isPanning) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      setPan(prev => ({
        x: prev.x + dx / zoom,
        y: prev.y + dy / zoom,
      }));
      
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }
    
    // Move page (only if we have a valid drag state)
    if (isDragging && draggedPageId && tool === 'select' && e.buttons === 1) {
      e.preventDefault(); // Prevent text selection during drag
      
      const dx = (e.clientX - dragStart.x) / zoom;
      const dy = (e.clientY - dragStart.y) / zoom;
      
      setPages(prev => prev.map(page => 
        page.id === draggedPageId
          ? { ...page, x: page.x + dx, y: page.y + dy }
          : page
      ));
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setDraggedPageId(null);
    setIsPanning(false);
  };

  // Canvas container ref for wheel event
  const canvasContainerRef = React.useRef<HTMLDivElement>(null);

  // Wheel zoom and pan with proper passive: false
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (e.ctrlKey || e.metaKey) {
        // Zoom with Ctrl/Cmd + Wheel
        const delta = -e.deltaY * 0.001;
        setZoom(prev => Math.max(0.1, Math.min(3, prev + delta)));
      } else {
        // Pan with Wheel
        setPan(prev => ({
          x: prev.x - e.deltaX / zoom,
          y: prev.y - e.deltaY / zoom,
        }));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [zoom]);


  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space for temporary hand tool
      if (e.code === 'Space' && !isSpacePressed) {
        // Don't prevent space if user is typing in an input field
        const target = e.target as HTMLElement;
        const isEditable = target.contentEditable === 'true' || target.contentEditable === 'plaintext-only';
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !isEditable) {
          e.preventDefault();
          setIsSpacePressed(true);
        }
      }
      
      // V for select tool
      if (e.code === 'KeyV' && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        const isEditable = target.contentEditable === 'true' || target.contentEditable === 'plaintext-only';
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !isEditable) {
          setTool('select');
        }
      }
      
      // H for hand tool
      if (e.code === 'KeyH') {
        const target = e.target as HTMLElement;
        const isEditable = target.contentEditable === 'true' || target.contentEditable === 'plaintext-only';
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !isEditable) {
          setTool('hand');
        }
      }
      
      // Delete or Backspace to delete selected element or page
      if ((e.code === 'Delete' || e.code === 'Backspace') && selection) {
        // Don't delete if user is typing in an input field
        const target = e.target as HTMLElement;
        const isEditable = target.contentEditable === 'true' || target.contentEditable === 'plaintext-only';
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !isEditable) {
          e.preventDefault();
          if (selection.type === 'element') {
            handleElementDelete(selection.pageData.id, selection.elementData.id);
          } else if (selection.type === 'page') {
            // Delete page and its contents
            setPages(prev => prev.filter(p => p.id !== selection.data.id));
            setPageContents(prev => {
              const newMap = new Map(prev);
              newMap.delete(selection.data.id);
              saveToHistory(newMap);
              return newMap;
            });
            setSelection(null);
            console.log(`🗑️ Page ${selection.data.pageNumber} deleted`);
          }
        }
      }
      
      // Ctrl+D or Cmd+D to duplicate selected element or page
      if (e.code === 'KeyD' && (e.ctrlKey || e.metaKey) && selection) {
        e.preventDefault();
        if (selection.type === 'element') {
          handleElementDuplicate(selection.pageData.id, selection.elementData.id);
        } else if (selection.type === 'page') {
          handleDuplicatePage(selection.data.id);
        }
      }
      
      // Ctrl+C or Cmd+C to copy selected element or page
      if (e.code === 'KeyC' && (e.ctrlKey || e.metaKey) && selection) {
        const target = e.target as HTMLElement;
        const isEditable = target.contentEditable === 'true' || target.contentEditable === 'plaintext-only';
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !isEditable) {
          e.preventDefault();
          if (selection.type === 'element') {
            handleCopyElement(selection.pageData.id, selection.elementData.id);
          } else if (selection.type === 'page') {
            handleCopyPage(selection.data.id);
          }
        }
      }
      
      // Ctrl+X or Cmd+X to cut selected element or page
      if (e.code === 'KeyX' && (e.ctrlKey || e.metaKey) && selection) {
        const target = e.target as HTMLElement;
        const isEditable = target.contentEditable === 'true' || target.contentEditable === 'plaintext-only';
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !isEditable) {
          e.preventDefault();
          if (selection.type === 'element') {
            handleCutElement(selection.pageData.id, selection.elementData.id);
          } else if (selection.type === 'page') {
            handleCutPage(selection.data.id);
          }
        }
      }
      
      // Ctrl+V or Cmd+V to paste
      if (e.code === 'KeyV' && (e.ctrlKey || e.metaKey) && clipboard) {
        const target = e.target as HTMLElement;
        const isEditable = target.contentEditable === 'true' || target.contentEditable === 'plaintext-only';
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !isEditable) {
          e.preventDefault();
          
          // If no selection and clipboard has page - paste page on canvas
          if (!selection && clipboard.type === 'page') {
            handlePastePage();
          } 
          // If has selection or clipboard has element - paste element on page
          else if (clipboard.type === 'element') {
            const targetPageId = selection?.type === 'page' ? selection.data.id : 
                                 selection?.type === 'element' ? selection.pageData.id : 
                                 pages[0]?.id;
            if (targetPageId) {
              handlePasteElement(targetPageId);
            }
          }
        }
      }
      
      // Ctrl+Z or Cmd+Z to undo
      if (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      
      // Ctrl+Shift+Z or Cmd+Shift+Z to redo
      if (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      }
      
      // Ctrl+B or Cmd+B to open background menu
      if (e.code === 'KeyB' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const button = document.querySelector('[data-background-button]') as HTMLElement;
        if (button) {
          button.click();
        }
      }
      
      // ESC to clear selection
      if (e.code === 'Escape') {
        e.preventDefault();
        setSelection(null);
        setSelectedElementId(null);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        // Don't prevent space if user is typing in an input field
        const target = e.target as HTMLElement;
        const isEditable = target.contentEditable === 'true' || target.contentEditable === 'plaintext-only';
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !isEditable) {
          e.preventDefault();
        }
        setIsSpacePressed(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacePressed, selection, clipboard, historyIndex, history, pages]);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          px: 3,
          py: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          zIndex: 10,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          {/* Left */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton onClick={handleBackClick} size="small">
              <ArrowLeft size={20} />
            </IconButton>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Canvas Editor
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {pages.length} pages • Drag to arrange
              </Typography>
            </Box>
            
            {/* Generate with AI Button */}
            {onOpenGenerateDialog && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Sparkles size={16} />}
                onClick={onOpenGenerateDialog}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  color: theme.palette.primary.main,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    background: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
              >
                Generate with AI
              </Button>
            )}
          </Stack>

          {/* Center - Tools */}
          <Stack direction="row" spacing={1}>
            <Tooltip title="Select & Move (V)">
              <IconButton
                size="small"
                onClick={() => setTool('select')}
                sx={{
                  background: tool === 'select' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  color: tool === 'select' ? theme.palette.primary.main : theme.palette.text.secondary,
                }}
              >
                <MousePointer size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Hand Tool (H)">
              <IconButton
                size="small"
                onClick={() => setTool('hand')}
                sx={{
                  background: tool === 'hand' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  color: tool === 'hand' ? theme.palette.primary.main : theme.palette.text.secondary,
                }}
              >
                <Hand size={18} />
              </IconButton>
            </Tooltip>

            <Box sx={{ width: 1, height: 32, background: alpha(theme.palette.divider, 0.2), mx: 1 }} />

            <Tooltip title="Zoom In">
              <IconButton size="small" onClick={handleZoomIn}>
                <ZoomIn size={18} />
              </IconButton>
            </Tooltip>
            <Chip
              label={`${Math.round(zoom * 100)}%`}
              size="small"
              onClick={handleResetZoom}
              sx={{
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 28,
              }}
            />
            <Tooltip title="Zoom Out">
              <IconButton size="small" onClick={handleZoomOut}>
                <ZoomOut size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Fit to Screen">
              <IconButton size="small" onClick={handleResetZoom}>
                <Maximize2 size={18} />
              </IconButton>
            </Tooltip>

            <Box sx={{ width: 1, height: 32, background: alpha(theme.palette.divider, 0.2), mx: 1 }} />

            <Tooltip title="Undo (Ctrl+Z)">
              <span>
                <IconButton 
                  size="small" 
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  sx={{
                    color: historyIndex > 0 ? theme.palette.text.secondary : theme.palette.action.disabled,
                  }}
                >
                  <Undo size={18} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Redo (Ctrl+Shift+Z)">
              <span>
                <IconButton 
                  size="small" 
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  sx={{
                    color: historyIndex < history.length - 1 ? theme.palette.text.secondary : theme.palette.action.disabled,
                  }}
                >
                  <Redo size={18} />
                </IconButton>
              </span>
            </Tooltip>

            <Box sx={{ width: 1, height: 32, background: alpha(theme.palette.divider, 0.2), mx: 1 }} />

            <Tooltip title="Export & Print">
              <IconButton 
                size="small" 
                onClick={handleExportMenuOpen}
                disabled={isExporting}
                sx={{
                  color: theme.palette.text.secondary,
                }}
              >
                {isExporting ? <CircularProgress size={18} /> : <Download size={18} />}
              </IconButton>
            </Tooltip>
          </Stack>

          {/* Right */}
          <Stack direction="row" spacing={1} alignItems="center">
            {clipboard && (
              <Chip
                label={clipboard.type === 'page' ? '📋 1 page' : '📋 1 element'}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600, fontSize: '0.7rem', mr: 1 }}
              />
            )}
            
            {/* Saved Indicator */}
            {lastSaved && (
              <Chip
                icon={<Check size={14} />}
                label={`Saved ${formatTimeSince(lastSaved)}`}
                size="small"
                color="success"
                variant="outlined"
                sx={{ fontWeight: 600, fontSize: '0.7rem' }}
              />
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar */}
        <LeftSidebar 
          isOpen={isLeftPanelVisible}
          onToggle={() => setIsLeftPanelVisible(!isLeftPanelVisible)}
          onComponentDragStart={(comp) => console.log('Dragging:', comp)}
        />

        {/* Infinite Canvas */}
        <Box
          ref={canvasContainerRef}
          sx={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
          background: `
            linear-gradient(${alpha(theme.palette.divider, 0.1)} 1px, transparent 1px),
            linear-gradient(90deg, ${alpha(theme.palette.divider, 0.1)} 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          cursor: isPanning ? 'grabbing' : (isSpacePressed || tool === 'hand' ? 'grab' : 'default'),
        }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onContextMenu={handleCanvasContextMenu}
      >
        {/* Canvas Container */}
        <Box
          data-canvas-container
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.2s',
          }}
        >
          {/* Floating Pages - Canva Style */}
          {pages.map((page) => {
            const pageContent = pageContents.get(page.id);
            const isSelected = selection?.type === 'page' && selection.data.id === page.id;
            const isCut = clipboard?.type === 'page' && clipboard.operation === 'cut' && clipboard.page.id === page.id;
            
            return (
            <Box
              key={page.id}
              onMouseDown={(e) => handlePageMouseDown(e, page.id)}
              sx={{
                position: 'absolute',
                left: page.x,
                top: page.y,
                border: isSelected 
                  ? `3px solid ${theme.palette.primary.main}` 
                  : isCut
                  ? `3px dashed ${alpha(theme.palette.warning.main, 0.7)}`
                  : '3px solid transparent',
                borderRadius: '8px',
                transition: 'border-color 0.2s, opacity 0.2s',
                boxShadow: isSelected ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}` : 'none',
                opacity: isCut ? 0.5 : 1,
              }}
            >
              <CanvasPage
                pageId={page.id}
                pageNumber={page.pageNumber}
                title={page.title}
                width={page.width}
                height={page.height}
                background={page.background}
                elements={pageContent?.elements || []}
                selectedElementId={selectedElementId}
                clipboard={clipboard}
                crossPageDrag={crossPageDrag}
                onElementSelect={handleElementSelect}
                onElementAdd={(element) => handleElementAdd(page.id, element)}
                onElementEdit={(elementId, properties) => handleElementEdit(page.id, elementId, properties)}
                onElementReorder={(fromIndex, toIndex) => handleElementReorder(page.id, fromIndex, toIndex)}
                onCrossPageDragStart={(elementId) => handleCrossPageDragStart(page.id, elementId)}
                onCrossPageDragEnd={handleCrossPageDragEnd}
                onCrossPageDrop={() => handleCrossPageDrop(page.id)}
                onElementContextMenu={(e: React.MouseEvent, elementId: string) => handleContextMenu(e, page.id, elementId)}
                onPageContextMenu={(e: React.MouseEvent) => handleContextMenu(e, page.id)}
              />
            </Box>
            );
            })}
        </Box>

        {/* Add New Page Button */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 24,
            right: 24,
          }}
        >
          <Tooltip title="Add New Page">
            <IconButton
              size="large"
              onClick={handleAddNewPage}
              sx={{
                width: 56,
                height: 56,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                color: 'white',
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Plus size={24} />
            </IconButton>
          </Tooltip>
        </Box>

        </Box>

        {/* Right Sidebar - Properties */}
        <RightSidebar 
          isOpen={isRightPanelVisible}
          onToggle={() => setIsRightPanelVisible(!isRightPanelVisible)}
          selection={selection}
            onSelectionChange={setSelection}
            onImageUpload={handleImageUpload}
            onUpdate={(updates) => {
              if (selection?.type === 'element') {
                const elementId = selection.elementData.id;
                const pageId = selection.pageData.id;
                
                // Update element properties
                handleElementEdit(pageId, elementId, {
                  ...selection.elementData.properties,
                  ...updates,
                });
                
                // Update selection with new properties
                setSelection({
                  ...selection,
                  elementData: {
                    ...selection.elementData,
                    properties: {
                      ...selection.elementData.properties,
                      ...updates,
                    },
                  },
                });
              }
            }}
            onDuplicate={(pageId, elementId) => {
              handleElementDuplicate(pageId, elementId);
            }}
            onDelete={(pageId, elementId) => {
              handleElementDelete(pageId, elementId);
            }}
            onPageBackgroundUpdate={handlePageBackgroundUpdate}
            // AI Editing props
            parameters={parameters}
            onAIEdit={handleAIEdit}
            editHistory={getCurrentEditHistory()}
            isAIEditing={isAIEditing}
            editError={editError}
            onClearEditError={() => setEditError(null)}
          />
      </Box>

      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={handleExportMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 2,
            minWidth: 200,
          },
        }}
      >
        {/* Current Page Export - only show if page is selected */}
        {selection && (
          <>
            <Box sx={{ px: 2, py: 1, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                {selection.type === 'page' 
                  ? `Page ${selection.data.pageNumber}`
                  : `Page ${selection.pageData.pageNumber}`
                }
              </Typography>
            </Box>
            <MenuItem onClick={() => handleExportPDF(true)}>
              <ListItemIcon>
                <File size={18} />
              </ListItemIcon>
              <ListItemText 
                primary="Export Page as PDF"
                secondary="Current page only"
                primaryTypographyProps={{ fontSize: '0.875rem' }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </MenuItem>
            <MenuItem onClick={() => handleExportPNG(true)}>
              <ListItemIcon>
                <ImageIcon size={18} />
              </ListItemIcon>
              <ListItemText 
                primary="Export Page as PNG"
                secondary="Current page only"
                primaryTypographyProps={{ fontSize: '0.875rem' }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </MenuItem>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        {/* All Pages Export */}
        <Box sx={{ px: 2, py: 1, bgcolor: alpha(theme.palette.grey[500], 0.05) }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
            All Pages ({pages.length})
          </Typography>
        </Box>
        <MenuItem onClick={() => handleExportPDF(false)}>
          <ListItemIcon>
            <Files size={18} />
          </ListItemIcon>
          <ListItemText 
            primary="Export All as PDF"
            secondary="Multi-page document"
            primaryTypographyProps={{ fontSize: '0.875rem' }}
            secondaryTypographyProps={{ fontSize: '0.75rem' }}
          />
        </MenuItem>
        <MenuItem onClick={handlePrint}>
          <ListItemIcon>
            <Printer size={18} />
          </ListItemIcon>
          <ListItemText 
            primary="Print All Pages"
            secondary="Browser print dialog"
            primaryTypographyProps={{ fontSize: '0.875rem' }}
            secondaryTypographyProps={{ fontSize: '0.75rem' }}
          />
        </MenuItem>
      </Menu>

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleContextMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        PaperProps={{
          sx: {
            borderRadius: 1.5,
            minWidth: 160,
          },
        }}
      >
        {/* Canvas context menu (no pageId) - only paste page */}
        {!contextMenu?.pageId ? (
          clipboard?.type === 'page' ? (
            <MenuItem 
              onClick={() => handleContextMenuAction('paste')}
              sx={{ py: 0.75, px: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <ClipboardPaste size={16} />
              </ListItemIcon>
              <ListItemText 
                primary="Вставити"
                primaryTypographyProps={{ fontSize: '0.875rem' }}
              />
            </MenuItem>
          ) : (
            <MenuItem 
              disabled
              sx={{ py: 0.75, px: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <ClipboardPaste size={16} />
              </ListItemIcon>
              <ListItemText 
                primary="Нічого вставити"
                primaryTypographyProps={{ fontSize: '0.875rem' }}
              />
            </MenuItem>
          )
        ) : (
          /* Page/Element context menu */
          [
            <MenuItem 
              key="copy"
              onClick={() => handleContextMenuAction('copy')}
              disabled={!contextMenu?.elementId && !selection}
              sx={{ py: 0.75, px: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Copy size={16} />
              </ListItemIcon>
              <ListItemText 
                primary="Копіювати"
                primaryTypographyProps={{ fontSize: '0.875rem' }}
              />
            </MenuItem>,
            <MenuItem 
              key="cut"
              onClick={() => handleContextMenuAction('cut')}
              disabled={!contextMenu?.elementId && !selection}
              sx={{ py: 0.75, px: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Scissors size={16} />
              </ListItemIcon>
              <ListItemText 
                primary="Вирізати"
                primaryTypographyProps={{ fontSize: '0.875rem' }}
              />
            </MenuItem>,
            clipboard?.type === 'element' ? (
              <MenuItem 
                key="paste"
                onClick={() => handleContextMenuAction('paste')}
                sx={{ py: 0.75, px: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <ClipboardPaste size={16} />
                </ListItemIcon>
                <ListItemText 
                  primary="Вставити"
                  primaryTypographyProps={{ fontSize: '0.875rem' }}
                />
              </MenuItem>
            ) : (
              <MenuItem 
                key="paste-disabled"
                disabled
                sx={{ py: 0.75, px: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <ClipboardPaste size={16} />
                </ListItemIcon>
                <ListItemText 
                  primary={clipboard?.type === 'page' ? 'Вставити (тільки на canvas)' : 'Нічого вставити'}
                  primaryTypographyProps={{ fontSize: '0.875rem' }}
                />
              </MenuItem>
            ),
            <MenuItem 
              key="duplicate"
              onClick={() => handleContextMenuAction('duplicate')}
              disabled={!contextMenu?.elementId && !selection}
              sx={{ py: 0.75, px: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CopyPlus size={16} />
              </ListItemIcon>
              <ListItemText 
                primary="Дублювати"
                primaryTypographyProps={{ fontSize: '0.875rem' }}
              />
            </MenuItem>,
            <Divider key="divider" sx={{ my: 0.5 }} />,
            <MenuItem 
              key="delete"
              onClick={() => handleContextMenuAction('delete')}
              disabled={!contextMenu?.elementId && !selection}
              sx={{ py: 0.75, px: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Trash2 size={16} color={theme.palette.error.main} />
              </ListItemIcon>
              <ListItemText 
                primary="Видалити"
                primaryTypographyProps={{ 
                  fontSize: '0.875rem',
                  color: theme.palette.error.main,
                }}
              />
            </MenuItem>
          ]
        )}
      </Menu>

      {/* Exit Confirmation Dialog */}
      <Dialog
        open={showExitDialog}
        onClose={handleExitCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: alpha(theme.palette.warning.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={24} color={theme.palette.warning.main} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Download Before Leaving
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You have unsaved changes. Would you like to download your worksheet before leaving?
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleExitCancel} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleExitWithoutSave} color="inherit">
            Leave Without Saving
          </Button>
          <Button onClick={handleExitWithSave} variant="contained" color="primary">
            Download & Leave
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Step3CanvasEditor;
