'use client';

import React, { useState } from 'react';
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
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Save,
  ArrowLeft,
  Hand,
  MousePointer,
  Plus,
  Undo,
  Redo,
} from 'lucide-react';
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
  },
];

interface Step3CanvasEditorProps {
  onBack: () => void;
  parameters: any;
}

// Selection types
type Selection = 
  | { type: 'page'; data: WorksheetPage }
  | { type: 'element'; pageData: WorksheetPage; elementData: any }
  | null;

const Step3CanvasEditor: React.FC<Step3CanvasEditorProps> = ({ onBack, parameters }) => {
  const theme = useTheme();
  const [pages, setPages] = useState<WorksheetPage[]>(MOCK_CANVAS_PAGES);
  const [pageContents, setPageContents] = useState<Map<string, PageContent>>(new Map());
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
  const [clipboard, setClipboard] = useState<{ pageId: string; element: CanvasElement } | null>(null);
  const [history, setHistory] = useState<Map<string, PageContent>[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => setZoom(1);

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
    setPageContents(prev => {
      const newMap = new Map(prev);
      const pageContent = newMap.get(pageId);
      
      if (!pageContent) return prev;
      
      newMap.set(pageId, {
        ...pageContent,
        elements: pageContent.elements.map(el =>
          el.id === elementId ? { ...el, properties } : el
        ),
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
    
    setClipboard({ pageId, element });
  };

  const handlePasteElement = (targetPageId: string) => {
    if (!clipboard) return;
    
    setPageContents(prev => {
      const newMap = new Map(prev);
      const pageContent = newMap.get(targetPageId);
      
      if (!pageContent) return prev;
      
      // Create pasted element with offset position
      const pastedElement: CanvasElement = {
        ...clipboard.element,
        id: `element-${Date.now()}-${Math.random()}`,
        position: {
          x: clipboard.element.position.x + 20,
          y: clipboard.element.position.y + 20,
        },
        zIndex: pageContent.elements.length,
      };
      
      newMap.set(targetPageId, {
        ...pageContent,
        elements: [...pageContent.elements, pastedElement],
      });
      
      saveToHistory(newMap);
      return newMap;
    });
    
    // Select the pasted element
    setTimeout(() => {
      const newContent = pageContents.get(targetPageId);
      if (newContent) {
        const newElement = newContent.elements[newContent.elements.length - 1];
        handleElementSelect(newElement.id);
      }
    }, 50);
  };

  const handlePageMouseDown = (e: React.MouseEvent, pageId: string) => {
    if (tool === 'select') {
      e.stopPropagation();
      const page = pages.find(p => p.id === pageId);
      if (page) {
        setSelection({ type: 'page', data: page });
      }
      setIsDragging(true);
      setDraggedPageId(pageId);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const currentTool = isSpacePressed ? 'hand' : tool;
    
    if (currentTool === 'hand' || (e.button === 1)) { // Middle mouse button or hand tool
      e.preventDefault();
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
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
    
    // Move page
    if (isDragging && draggedPageId && tool === 'select') {
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

  // Wheel zoom and pan
  const handleWheel = (e: React.WheelEvent) => {
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


  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space for temporary hand tool
      if (e.code === 'Space' && !isSpacePressed) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
      
      // V for select tool
      if (e.code === 'KeyV') {
        setTool('select');
      }
      
      // H for hand tool
      if (e.code === 'KeyH') {
        setTool('hand');
      }
      
      // Delete or Backspace to delete selected element
      if ((e.code === 'Delete' || e.code === 'Backspace') && selection?.type === 'element') {
        // Don't delete if user is typing in an input field
        const target = e.target as HTMLElement;
        const isEditable = target.contentEditable === 'true' || target.contentEditable === 'plaintext-only';
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !isEditable) {
          e.preventDefault();
          handleElementDelete(selection.pageData.id, selection.elementData.id);
        }
      }
      
      // Ctrl+D or Cmd+D to duplicate selected element
      if (e.code === 'KeyD' && (e.ctrlKey || e.metaKey) && selection?.type === 'element') {
        e.preventDefault();
        handleElementDuplicate(selection.pageData.id, selection.elementData.id);
      }
      
      // Ctrl+C or Cmd+C to copy selected element
      if (e.code === 'KeyC' && (e.ctrlKey || e.metaKey) && selection?.type === 'element') {
        const target = e.target as HTMLElement;
        const isEditable = target.contentEditable === 'true' || target.contentEditable === 'plaintext-only';
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !isEditable) {
          e.preventDefault();
          handleCopyElement(selection.pageData.id, selection.elementData.id);
        }
      }
      
      // Ctrl+V or Cmd+V to paste element
      if (e.code === 'KeyV' && (e.ctrlKey || e.metaKey) && clipboard) {
        const target = e.target as HTMLElement;
        const isEditable = target.contentEditable === 'true' || target.contentEditable === 'plaintext-only';
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !isEditable) {
          e.preventDefault();
          // Paste to currently selected page or first page
          const targetPageId = selection?.type === 'page' ? selection.data.id : 
                               selection?.type === 'element' ? selection.pageData.id : 
                               pages[0]?.id;
          if (targetPageId) {
            handlePasteElement(targetPageId);
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
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
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
            <IconButton onClick={onBack} size="small">
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
          </Stack>

          {/* Right */}
          <Stack direction="row" spacing={1}>
            {clipboard && (
              <Chip
                label="📋 1 item"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600, fontSize: '0.7rem', mr: 1 }}
              />
            )}
            <Button
              variant="outlined"
              size="small"
              startIcon={<Save size={16} />}
              sx={{ borderRadius: '8px', textTransform: 'none' }}
            >
              Save
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<Download size={16} />}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
              }}
            >
              Export
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar */}
        <LeftSidebar 
          selectedPageId={selection?.type === 'page' ? selection.data.id : (selection?.type === 'element' ? selection.pageData.id : null)}
          onPageSelect={(id) => {
            const page = pages.find(p => p.id === id);
            if (page) setSelection({ type: 'page', data: page });
          }}
          pages={pages}
          onComponentDragStart={(comp) => console.log('Dragging:', comp)}
        />

        {/* Infinite Canvas */}
        <Box
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
        onWheel={handleWheel}
      >
        {/* Canvas Container */}
        <Box
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
            
            return (
            <Box
              key={page.id}
              onMouseDown={(e) => handlePageMouseDown(e, page.id)}
              sx={{
                position: 'absolute',
                left: page.x,
                top: page.y,
              }}
            >
              <CanvasPage
                pageId={page.id}
                pageNumber={page.pageNumber}
                title={page.title}
                width={page.width}
                height={page.height}
                elements={pageContent?.elements || []}
                selectedElementId={selectedElementId}
                onElementSelect={handleElementSelect}
                onElementAdd={(element) => handleElementAdd(page.id, element)}
                onElementEdit={(elementId, properties) => handleElementEdit(page.id, elementId, properties)}
                onElementReorder={(fromIndex, toIndex) => handleElementReorder(page.id, fromIndex, toIndex)}
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
              }}
            >
              <Plus size={24} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Mini Map (optional) */}
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            bottom: 24,
            left: 24,
            width: 200,
            height: 150,
            background: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(20px)',
            borderRadius: '12px',
            p: 1,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
            Overview
          </Typography>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: 'calc(100% - 20px)',
              background: alpha(theme.palette.grey[100], 0.5),
              borderRadius: '8px',
            }}
          >
            {pages.map((page) => {
              const isSelected = selection?.type === 'page' && selection.data.id === page.id;
              const isParentOfSelected = selection?.type === 'element' && selection.pageData.id === page.id;
              
              return (
              <Box
                key={page.id}
                sx={{
                  position: 'absolute',
                  left: `${(page.x / 1400) * 100}%`,
                  top: `${(page.y / 900) * 100}%`,
                  width: 20,
                  height: 26,
                  background: (isSelected || isParentOfSelected) 
                    ? theme.palette.primary.main 
                    : alpha(theme.palette.grey[400], 0.8),
                  borderRadius: '2px',
                  border: `1px solid white`,
                }}
              />
            );
            })}
          </Box>
        </Paper>
        </Box>

        {/* Right Sidebar - Properties */}
        <RightSidebar 
          selection={selection}
          onSelectionChange={setSelection}
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
        />
      </Box>
    </Box>
  );
};

export default Step3CanvasEditor;
