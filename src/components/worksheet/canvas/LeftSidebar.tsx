'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  useTheme,
  alpha,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Chip,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Package,
  Layers,
  Settings,
  Search,
  Type,
  FileText,
  Edit3,
  CheckSquare,
  Image as ImageIcon,
  AlertCircle,
  Lightbulb,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Sparkles,
  Send,
  Wand2,
  RefreshCw,
  Languages,
  Palette,
} from 'lucide-react';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ height: '100%' }}>
    {value === index && <Box sx={{ height: '100%' }}>{children}</Box>}
  </Box>
);

interface LeftSidebarProps {
  selectedPageId: string | null;
  pages: any[];
  onComponentDragStart?: (component: string) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ 
  selectedPageId, 
  pages,
  onComponentDragStart 
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiMessage, setAiMessage] = useState('');
  const [aiChat, setAiChat] = useState<Array<{ role: 'user' | 'ai'; message: string }>>([]);

  // Components Library Data - IDs match CanvasElement types
  const componentCategories = [
    {
      name: 'Text',
      items: [
        { id: 'title-block', name: 'Title', icon: '📝', description: 'Large heading' },
        { id: 'body-text', name: 'Body Text', icon: '📄', description: 'Paragraph text' },
        { id: 'instructions-box', name: 'Instructions', icon: '📋', description: 'Step-by-step guide' },
      ],
    },
    {
      name: 'Exercises',
      items: [
        { id: 'fill-blank', name: 'Fill in Blanks', icon: '✏️', description: 'Complete sentences' },
        { id: 'multiple-choice', name: 'Multiple Choice', icon: '☑️', description: 'Choose answer' },
        { id: 'true-false', name: 'True/False', icon: '✓✗', description: 'True or false statements' },
        { id: 'short-answer', name: 'Short Answer', icon: '📝', description: 'Written response' },
      ],
    },
    {
      name: 'Media',
      items: [
        { id: 'image-placeholder', name: 'Image', icon: '🖼️', description: 'Add picture' },
      ],
    },
    {
      name: 'Layout',
      items: [
        { id: 'divider', name: 'Divider', icon: '━', description: 'Horizontal line' },
      ],
    },
    {
      name: 'Boxes',
      items: [
        { id: 'warning-box', name: 'Warning Box', icon: '⚠️', description: 'Important note' },
        { id: 'tip-box', name: 'Tip Box', icon: '💡', description: 'Helpful hint' },
      ],
    },
  ];

  // Mock layers for selected page
  const selectedPage = pages.find(p => p.id === selectedPageId);
  const mockLayers = selectedPage ? [
    { id: '1', name: 'Title', type: 'title', visible: true, locked: false },
    { id: '2', name: 'Instructions', type: 'text', visible: true, locked: false },
    { id: '3', name: 'Fill Exercise', type: 'fill-blanks', visible: true, locked: false },
  ] : [];

  return (
    <Paper
      elevation={0}
      sx={{
        width: 280,
        height: '100%',
        borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(255, 255, 255, 0.98)',
      }}
    >
      {/* Tabs Header */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant="fullWidth"
        sx={{
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          minHeight: 48,
          '& .MuiTab-root': {
            minHeight: 48,
            textTransform: 'none',
            fontSize: '0.75rem',
            fontWeight: 500,
            minWidth: 0,
            px: 1,
          },
        }}
      >
        <Tab 
          icon={<Package size={16} />} 
          iconPosition="start" 
          label="Components" 
        />
        <Tab 
          icon={<Layers size={16} />} 
          iconPosition="start" 
          label="Pages" 
        />
        <Tab 
          icon={<Sparkles size={16} />} 
          iconPosition="start" 
          label="AI Assistant" 
        />
      </Tabs>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* TAB 1: Components */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 2 }}>
            {/* Search */}
            <TextField
              fullWidth
              size="small"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                },
              }}
            />

            {/* Component Categories */}
            <Stack spacing={3}>
              {componentCategories.map((category) => (
                <Box key={category.name}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.text.secondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      mb: 1,
                      display: 'block',
                    }}
                  >
                    {category.name}
                  </Typography>
                  <Stack spacing={1}>
                    {category.items.map((item) => (
                      <Paper
                        key={item.id}
                        elevation={0}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('componentType', item.id);
                          e.dataTransfer.effectAllowed = 'copy';
                          onComponentDragStart?.(item.id);
                        }}
                        sx={{
                          p: 1.5,
                          borderRadius: '10px',
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          cursor: 'grab',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            background: alpha(theme.palette.primary.main, 0.03),
                            transform: 'translateY(-2px)',
                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                          },
                          '&:active': {
                            cursor: 'grabbing',
                          },
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Typography sx={{ fontSize: '1.5rem' }}>
                            {item.icon}
                          </Typography>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                              {item.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                              {item.description}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        </TabPanel>

        {/* TAB 2: Pages & Layers */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 2 }}>
            {/* Pages List */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
              Pages ({pages.length})
            </Typography>
            <Stack spacing={1} sx={{ mb: 3 }}>
              {pages.map((page) => (
                <Paper
                  key={page.id}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: '10px',
                    border: `2px solid ${
                      selectedPageId === page.id
                        ? theme.palette.primary.main
                        : alpha(theme.palette.divider, 0.1)
                    }`,
                    background: selectedPageId === page.id
                      ? alpha(theme.palette.primary.main, 0.05)
                      : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      background: alpha(theme.palette.primary.main, 0.03),
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Typography sx={{ fontSize: '1.5rem' }}>
                      {page.thumbnail}
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                        Page {page.pageNumber}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {page.title}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Layers */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
              Layers {selectedPageId && `(Page ${pages.find(p => p.id === selectedPageId)?.pageNumber})`}
            </Typography>
            {!selectedPageId ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', py: 3 }}>
                Select a page to see layers
              </Typography>
            ) : (
              <Stack spacing={0.5}>
                {mockLayers.map((layer) => (
                  <Paper
                    key={layer.id}
                    elevation={0}
                    sx={{
                      p: 1,
                      borderRadius: '8px',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      '&:hover': {
                        background: alpha(theme.palette.grey[100], 0.5),
                      },
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <IconButton size="small" sx={{ p: 0.5 }}>
                        {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </IconButton>
                      <Typography variant="body2" sx={{ flex: 1, fontSize: '0.8rem' }}>
                        {layer.name}
                      </Typography>
                      <IconButton size="small" sx={{ p: 0.5 }}>
                        {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
                      </IconButton>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
        </TabPanel>

        {/* TAB 3: AI Assistant */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Sparkles size={20} color={theme.palette.primary.main} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                AI Assistant
              </Typography>
            </Stack>

            {/* Quick Actions */}
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                mb: 1,
                display: 'block',
              }}
            >
              Quick Actions
            </Typography>
            <Stack spacing={1} sx={{ mb: 2 }}>
              {[
                { icon: <Wand2 size={14} />, label: 'Generate Exercise', color: theme.palette.primary.main },
                { icon: <RefreshCw size={14} />, label: 'Improve Text', color: theme.palette.success.main },
                { icon: <Languages size={14} />, label: 'Translate', color: theme.palette.info.main },
                { icon: <Palette size={14} />, label: 'Suggest Colors', color: theme.palette.warning.main },
              ].map((action, idx) => (
                <Paper
                  key={idx}
                  elevation={0}
                  onClick={() => console.log('AI Action:', action.label)}
                  sx={{
                    p: 1.5,
                    borderRadius: '10px',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: action.color,
                      background: alpha(action.color, 0.05),
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        background: alpha(action.color, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: action.color,
                      }}
                    >
                      {action.icon}
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {action.label}
                    </Typography>
                  </Stack>
                </Paper>
              ))}
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Chat */}
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                mb: 1,
                display: 'block',
              }}
            >
              Chat with AI
            </Typography>

            {/* Chat Messages */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                mb: 2,
                minHeight: 200,
                maxHeight: 300,
                background: alpha(theme.palette.grey[100], 0.3),
                borderRadius: '12px',
                p: 1.5,
              }}
            >
              {aiChat.length === 0 ? (
                <Stack spacing={1.5} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography sx={{ fontSize: '2rem' }}>💬</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ask me anything about your worksheet!
                  </Typography>
                  <Stack spacing={0.5}>
                    {[
                      'Add more fill-in exercises',
                      'Make instructions simpler',
                      'Suggest vocabulary words',
                    ].map((suggestion, idx) => (
                      <Chip
                        key={idx}
                        label={suggestion}
                        size="small"
                        onClick={() => {
                          setAiMessage(suggestion);
                          // Simulate AI response
                          setAiChat([
                            { role: 'user', message: suggestion },
                            { role: 'ai', message: `I'll help you with: "${suggestion}". Let me generate that for you...` },
                          ]);
                        }}
                        sx={{
                          fontSize: '0.7rem',
                          height: 24,
                          cursor: 'pointer',
                          '&:hover': {
                            background: alpha(theme.palette.primary.main, 0.1),
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </Stack>
              ) : (
                <Stack spacing={1.5}>
                  {aiChat.map((msg, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                      }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: '12px',
                          background: msg.role === 'user'
                            ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`
                            : alpha(theme.palette.grey[100], 0.8),
                          color: msg.role === 'user' ? 'white' : theme.palette.text.primary,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                          {msg.message}
                        </Typography>
                      </Paper>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '0.65rem',
                          color: theme.palette.text.secondary,
                          display: 'block',
                          mt: 0.5,
                          mx: 1,
                        }}
                      >
                        {msg.role === 'user' ? 'You' : 'AI Assistant'} • just now
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            {/* Input */}
            <Box sx={{ mt: 'auto' }}>
              <TextField
                fullWidth
                multiline
                maxRows={3}
                placeholder="Ask AI to help..."
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && aiMessage.trim()) {
                    e.preventDefault();
                    setAiChat([
                      ...aiChat,
                      { role: 'user', message: aiMessage },
                      { role: 'ai', message: `I understand you want help with: "${aiMessage}". I'm working on it!` },
                    ]);
                    setAiMessage('');
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        disabled={!aiMessage.trim()}
                        onClick={() => {
                          if (aiMessage.trim()) {
                            setAiChat([
                              ...aiChat,
                              { role: 'user', message: aiMessage },
                              { role: 'ai', message: `I'll help you with: "${aiMessage}"!` },
                            ]);
                            setAiMessage('');
                          }
                        }}
                        sx={{
                          background: aiMessage.trim()
                            ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`
                            : alpha(theme.palette.grey[400], 0.2),
                          color: aiMessage.trim() ? 'white' : theme.palette.text.disabled,
                          '&:hover': {
                            background: aiMessage.trim()
                              ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                              : alpha(theme.palette.grey[400], 0.2),
                          },
                        }}
                      >
                        <Send size={14} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: '0.7rem' }}>
                Press Enter to send • Shift+Enter for new line
              </Typography>
            </Box>
          </Box>
        </TabPanel>
      </Box>
    </Paper>
  );
};

export default LeftSidebar;
