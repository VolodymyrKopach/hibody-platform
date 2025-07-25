import React from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const theme = useTheme();
  
  const formatText = (text: string) => {
    return text
      // Headers - order matters: longest patterns first
      .replace(/^##### (.*$)/gm, '<h5>$1</h5>')
      .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      
      // Horizontal rules
      .replace(/^---$/gm, '<hr>')
      
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // Inline code
      .replace(/`(.*?)`/g, '<code>$1</code>')
      
      // Special sections with enhanced styling
      .replace(/^🎯 (.*$)/gm, '<div class="objectives-section">🎯 <span class="section-title">$1</span></div>')
      .replace(/^📋 (.*$)/gm, '<div class="plan-section">📋 <span class="section-title">$1</span></div>')
      .replace(/^🎮 (.*$)/gm, '<div class="interactive-section">🎮 <span class="section-title">$1</span></div>')
      .replace(/^📊 (.*$)/gm, '<div class="assessment-section">📊 <span class="section-title">$1</span></div>')
      .replace(/^📚 (.*$)/gm, '<div class="materials-section">📚 <span class="section-title">$1</span></div>')
      .replace(/^💡 (.*$)/gm, '<div class="recommendations-section">💡 <span class="section-title">$1</span></div>')
      
      // Enhanced slide content areas
      .replace(/^- \*\*Content description:\*\* (.*)/gm, '<div class="slide-content-desc">📝 <span class="content-label">Content:</span> $1</div>')
      .replace(/^- \*\*Interactive element:\*\* (.*)/gm, '<div class="slide-interactive">🎯 <span class="content-label">Interactive:</span> $1</div>')
      .replace(/^- \*\*Activities:\*\* (.*)/gm, '<div class="slide-activities">🎮 <span class="content-label">Activities:</span> $1</div>')
      
      // Emoji bullets - keeping as div with emoji
      .replace(/^🔹 (.*$)/gm, '<div class="emoji-item">🔹 $1</div>')
      
      // Standard lists - convert to standard HTML lists
      .replace(/^([-•]\s.*(?:\n[-•]\s.*)*)/gm, (match) => {
        const items = match
          .split('\n')
          .map(line => line.replace(/^[-•]\s/, '').trim())
          .filter(item => item.length > 0)
          .map(item => `<li>${item}</li>`)
          .join('');
        return `<ul>${items}</ul>`;
      })
      
      // Action items
      .replace(/^⚡ (.*$)/gm, '<div class="action-item">⚡ $1</div>')
      
      // Blockquotes
      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
      
      // Enhanced age group and duration highlighting
      .replace(/\*\*Target Audience:\*\* (.*)/g, '<div class="info-tag audience-tag"><span class="tag-label">Target Audience:</span> <span class="tag-value">$1</span></div>')
      .replace(/\*\*Duration:\*\* (.*)/g, '<div class="info-tag duration-tag"><span class="tag-label">Duration:</span> <span class="tag-value">$1</span></div>')
      .replace(/\*\*Subject:\*\* (.*)/g, '<div class="info-tag subject-tag"><span class="tag-label">Subject:</span> <span class="tag-value">$1</span></div>')
      
      // Emojis
      .replace(/📋|📝|🎮|📊|🎉|🤔|🦖|👥|⭐|🦕|🦴|🏃|🥚|🔍|🌟|🎯|🔹|❓|🚀|📚|💡/g, '<span class="emoji">$&</span>')
      
      // Paragraphs and line breaks
      .replace(/\n\n/g, '</p><p>')
      // Remove br tags after headers and block elements
      .replace(/(<\/h[1-6]>)\n/g, '$1')
      .replace(/(<\/hr>)\n/g, '$1')
      .replace(/(<\/ul>)\n/g, '$1')
      .replace(/(<\/div>)\n/g, '$1')
      .replace(/(<\/blockquote>)\n/g, '$1')
      // Replace remaining newlines with br
      .replace(/\n/g, '<br>');
  };

  const processedContent = formatText(content);
  const finalContent = `<p>${processedContent}</p>`;

  return (
    <Box
      className="chat-message enhanced"
      dangerouslySetInnerHTML={{
        __html: finalContent,
      }}
      sx={{
        fontSize: '0.875rem',
        lineHeight: 1.6,
        color: theme.palette.text.primary,
        fontFamily: 'Inter, Roboto, sans-serif',
        
        // Headers with correct project color palette
        '& h1': {
          fontSize: '1.375rem',
          fontWeight: 600,
          margin: '24px 0 16px 0',
          color: theme.palette.primary.main, // #6366F1 indigo
          position: 'relative',
          paddingBottom: '8px',
          borderBottom: `2px solid ${theme.palette.primary.main}20`, // 20% opacity
          '&:first-child': { marginTop: 0 },
          '& + br': { display: 'none' },
        },
        '& h2': {
          fontSize: '1.25rem',
          fontWeight: 600,
          margin: '20px 0 12px 0',
          color: theme.palette.primary.dark, // #4338CA
          position: 'relative',
          paddingLeft: '12px',
          borderLeft: `3px solid ${theme.palette.primary.light}`, // #818CF8
          backgroundColor: `${theme.palette.primary.main}08`, // 8% opacity
          padding: '8px 12px',
          borderRadius: '8px',
          '&:first-child': { marginTop: 0 },
          '& + br': { display: 'none' },
        },
        '& h3': {
          fontSize: '1.125rem',
          fontWeight: 600,
          margin: '16px 0 10px 0',
          color: theme.palette.primary.main, // #6366F1
          '&:first-child': { marginTop: 0 },
          '& + br': { display: 'none' },
        },
        '& h4': {
          fontSize: '1.0625rem',
          fontWeight: 600,
          margin: '20px 0 12px 0',
          color: theme.palette.primary.main, // #6366F1 primary indigo
          position: 'relative',
          paddingLeft: '16px',
          paddingRight: '12px',
          paddingTop: '10px',
          paddingBottom: '10px',
          borderLeft: `4px solid ${theme.palette.primary.light}`, // #818CF8
          backgroundColor: `${theme.palette.primary.main}06`, // 6% opacity for subtle background
          borderRadius: '6px',
          boxShadow: `0 1px 3px ${theme.palette.primary.main}15`, // subtle shadow
          
          '&::before': {
            content: '"📄"',
            marginRight: '8px',
            fontSize: '1em',
          },
          
          '&:first-child': { marginTop: 0 },
          '& + br': { display: 'none' },
        },
        '& h5': {
          fontSize: '0.9375rem',
          fontWeight: 600,
          margin: '12px 0 6px 0',
          color: theme.palette.grey[700], // #334155
          '&:first-child': { marginTop: 0 },
          '& + br': { display: 'none' },
        },
        
        // Enhanced paragraphs
        '& p': {
          margin: '12px 0',
          lineHeight: 1.6,
          '&:first-child': { marginTop: 0 },
          '&:last-child': { marginBottom: 0 },
          '&:empty': { display: 'none' },
        },
        
        // Enhanced lists with project colors
        '& ul': {
          margin: '16px 0',
          paddingLeft: '24px',
          listStyle: 'none',
          position: 'relative',
          
          '& li': {
            margin: '6px 0',
            lineHeight: 1.6,
            position: 'relative',
            paddingLeft: '8px',
            
            '&::before': {
              content: '"•"',
              color: theme.palette.primary.main, // #6366F1 indigo
              fontWeight: 'bold',
              position: 'absolute',
              left: '-16px',
              fontSize: '1.2em',
            },
            
            // Nested lists
            '& ul': {
              margin: '8px 0',
              paddingLeft: '20px',
              
              '& li': {
                margin: '4px 0',
                fontSize: '0.875rem',
                color: theme.palette.grey[600], // #475569
                
                '&::before': {
                  content: '"◦"',
                  color: theme.palette.secondary.main, // #10B981 green
                  fontSize: '1em',
                },
                
                // Third level
                '& ul': {
                  paddingLeft: '16px',
                  
                  '& li': {
                    fontSize: '0.8125rem',
                    margin: '2px 0',
                    color: theme.palette.grey[500], // #64748B
                    
                    '&::before': {
                      content: '"▪"',
                      color: theme.palette.warning.main, // #F59E0B orange
                      fontSize: '0.9em',
                    },
                  },
                },
              },
            },
          },
          '& + br': { display: 'none' },
        },
        
        // Special section styling with project colors
        '& .objectives-section': {
          margin: '16px 0',
          padding: '12px 16px',
          backgroundColor: `${theme.palette.secondary.main}15`, // 15% opacity green
          borderLeft: `4px solid ${theme.palette.secondary.main}`, // #10B981
          borderRadius: '8px',
          fontSize: '0.9375rem',
          fontWeight: 500,
          
          '& .section-title': {
            color: theme.palette.secondary.dark, // #047857
            fontWeight: 600,
          },
        },
        
        '& .plan-section': {
          margin: '16px 0',
          padding: '12px 16px',
          backgroundColor: `${theme.palette.primary.main}12`, // 12% opacity indigo
          borderLeft: `4px solid ${theme.palette.primary.main}`, // #6366F1
          borderRadius: '8px',
          fontSize: '0.9375rem',
          fontWeight: 500,
          
          '& .section-title': {
            color: theme.palette.primary.dark, // #4338CA
            fontWeight: 600,
          },
        },
        
        '& .interactive-section': {
          margin: '16px 0',
          padding: '12px 16px',
          backgroundColor: `${theme.palette.warning.main}15`, // 15% opacity orange
          borderLeft: `4px solid ${theme.palette.warning.main}`, // #F59E0B
          borderRadius: '8px',
          fontSize: '0.9375rem',
          fontWeight: 500,
          
          '& .section-title': {
            color: theme.palette.warning.dark, // #D97706
            fontWeight: 600,
          },
        },
        
        '& .assessment-section': {
          margin: '16px 0',
          padding: '12px 16px',
          backgroundColor: `${theme.palette.info.main}15`, // 15% opacity blue
          borderLeft: `4px solid ${theme.palette.info.main}`, // #3B82F6
          borderRadius: '8px',
          fontSize: '0.9375rem',
          fontWeight: 500,
          
          '& .section-title': {
            color: theme.palette.info.dark, // #1D4ED8
            fontWeight: 600,
          },
        },
        
        '& .materials-section': {
          margin: '16px 0',
          padding: '12px 16px',
          backgroundColor: `${theme.palette.warning.main}12`, // 12% opacity orange
          borderLeft: `4px solid ${theme.palette.warning.main}`, // #F59E0B
          borderRadius: '8px',
          fontSize: '0.9375rem',
          fontWeight: 500,
          
          '& .section-title': {
            color: theme.palette.warning.dark, // #D97706
            fontWeight: 600,
          },
        },
        
        '& .recommendations-section': {
          margin: '16px 0',
          padding: '12px 16px',
          backgroundColor: `${theme.palette.success.main}15`, // 15% opacity green
          borderLeft: `4px solid ${theme.palette.success.main}`, // #10B981
          borderRadius: '8px',
          fontSize: '0.9375rem',
          fontWeight: 500,
          
          '& .section-title': {
            color: theme.palette.success.dark, // #047857
            fontWeight: 600,
          },
        },
        
        // Info tags with project colors
        '& .info-tag': {
          display: 'inline-flex',
          alignItems: 'center',
          margin: '4px 8px 4px 0',
          padding: '6px 12px',
          borderRadius: '16px',
          fontSize: '0.8125rem',
          fontWeight: 500,
          
          '& .tag-label': {
            fontWeight: 600,
            marginRight: '6px',
          },
          
          '& .tag-value': {
            fontWeight: 500,
          },
        },
        
        '& .audience-tag': {
          backgroundColor: `${theme.palette.primary.main}12`, // 12% opacity indigo
          color: theme.palette.primary.dark, // #4338CA
          border: `1px solid ${theme.palette.primary.main}30`, // 30% opacity
        },
        
        '& .duration-tag': {
          backgroundColor: `${theme.palette.secondary.main}12`, // 12% opacity green
          color: theme.palette.secondary.dark, // #047857
          border: `1px solid ${theme.palette.secondary.main}30`, // 30% opacity
        },
        
        '& .subject-tag': {
          backgroundColor: `${theme.palette.warning.main}12`, // 12% opacity orange
          color: theme.palette.warning.dark, // #D97706
          border: `1px solid ${theme.palette.warning.main}30`, // 30% opacity
        },
        
        // Emoji items
        '& .emoji-item': {
          margin: '10px 0',
          paddingLeft: '4px',
          lineHeight: 1.6,
          color: theme.palette.text.primary,
        },
        
        // Action items
        '& .action-item': {
          margin: '16px 0',
          padding: '12px 16px',
          background: `linear-gradient(135deg, ${theme.palette.warning.main}20 0%, ${theme.palette.warning.main}10 100%)`,
          borderLeft: `4px solid ${theme.palette.warning.main}`, // #F59E0B
          borderRadius: '8px',
          fontWeight: 500,
          color: theme.palette.warning.dark, // #D97706
          boxShadow: `0 2px 4px ${theme.palette.warning.main}20`,
        },
        
        // Text formatting
        '& strong': { 
          fontWeight: 600,
          color: theme.palette.primary.main, // #6366F1 indigo
        },
        '& em': { 
          fontStyle: 'italic',
          color: theme.palette.text.secondary,
        },
        '& code': {
          backgroundColor: theme.palette.grey[100], // #F1F5F9
          padding: '2px 6px',
          borderRadius: '4px',
          fontFamily: 'SF Mono, Monaco, monospace',
          fontSize: '0.8125rem',
          color: theme.palette.error.main, // #EF4444
          border: `1px solid ${theme.palette.grey[300]}`, // #CBD5E1
        },
        
        // Blockquotes
        '& blockquote': {
          margin: '16px 0',
          padding: '12px 16px',
          borderLeft: `4px solid ${theme.palette.grey[300]}`, // #CBD5E1
          backgroundColor: theme.palette.grey[50], // #F8FAFC
          fontStyle: 'italic',
          color: theme.palette.grey[600], // #475569
          borderRadius: '0 4px 4px 0',
        },
        
        // Horizontal rules
        '& hr': {
          border: 'none',
          borderTop: `2px solid ${theme.palette.grey[300]}`, // #CBD5E1
          margin: '24px 0',
          borderRadius: '1px',
          '& + br': { display: 'none' },
        },
        
        // Emojis
        '& .emoji': {
          fontSize: '1.1em',
          marginRight: '4px',
                    filter: 'brightness(1.1)',
        },
        
        // Enhanced slide content areas
        '& .slide-content-desc': {
          margin: '12px 0',
          padding: '10px 14px',
          backgroundColor: `${theme.palette.info.main}08`, // 8% opacity blue
          borderLeft: `3px solid ${theme.palette.info.main}`, // #3B82F6
          borderRadius: '6px',
          fontSize: '0.875rem',
          fontWeight: 500,
          
          '& .content-label': {
            color: theme.palette.info.main, // #3B82F6
            fontWeight: 600,
            marginRight: '6px',
          },
        },
        
        '& .slide-interactive': {
          margin: '12px 0',
          padding: '10px 14px',
          backgroundColor: `${theme.palette.secondary.main}08`, // 8% opacity green
          borderLeft: `3px solid ${theme.palette.secondary.main}`, // #10B981
          borderRadius: '6px',
          fontSize: '0.875rem',
          fontWeight: 500,
          
          '& .content-label': {
            color: theme.palette.secondary.main, // #10B981
            fontWeight: 600,
            marginRight: '6px',
          },
        },
        
        '& .slide-activities': {
          margin: '12px 0',
          padding: '10px 14px',
          backgroundColor: `${theme.palette.warning.main}08`, // 8% opacity orange
          borderLeft: `3px solid ${theme.palette.warning.main}`, // #F59E0B
          borderRadius: '6px',
          fontSize: '0.875rem',
          fontWeight: 500,
          
          '& .content-label': {
            color: theme.palette.warning.main, // #F59E0B
            fontWeight: 600,
            marginRight: '6px',
          },
        },
      }}
    />
  );
};

export default MarkdownRenderer; 