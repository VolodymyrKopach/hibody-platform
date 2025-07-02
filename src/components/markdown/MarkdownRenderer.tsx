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
      // Headers
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
      
      // Emoji bullets - залишаємо як div з емодзі
      .replace(/^🔹 (.*$)/gm, '<div class="emoji-item">🔹 $1</div>')
      
      // Звичайні списки - перетворюємо в стандартні HTML списки
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
      
      // Emojis
      .replace(/📋|📝|🎮|📊|🎉|🤔|🦖|👥|⭐|🦕|🦴|🏃|🥚|🔍|🌟|🎯|🔹|❓|🚀/g, '<span class="emoji">$&</span>')
      
      // Paragraphs and line breaks
      .replace(/\n\n/g, '</p><p>')
      // Видаляємо br теги після заголовків та елементів блоків
      .replace(/(<\/h[1-6]>)\n/g, '$1')
      .replace(/(<\/hr>)\n/g, '$1')
      .replace(/(<\/ul>)\n/g, '$1')
      .replace(/(<\/div>)\n/g, '$1')
      .replace(/(<\/blockquote>)\n/g, '$1')
      // Заміняємо решту нових рядків на br
      .replace(/\n/g, '<br>');
  };

  const processedContent = formatText(content);
  const finalContent = `<p>${processedContent}</p>`;

  return (
    <Box
      className="chat-message"
      dangerouslySetInnerHTML={{
        __html: finalContent,
      }}
      sx={{
        fontSize: '0.875rem',
        lineHeight: 1.6,
        color: theme.palette.text.primary,
        
        // Headers
        '& h1': {
          fontSize: '1.25rem',
          fontWeight: 600,
          margin: '24px 0 12px 0',
          color: theme.palette.primary.main,
          '&:first-child': { marginTop: 0 },
          '& + br': { display: 'none' },
        },
        '& h2': {
          fontSize: '1.125rem',
          fontWeight: 600,
          margin: '20px 0 10px 0',
          color: theme.palette.primary.main,
          '&:first-child': { marginTop: 0 },
          '& + br': { display: 'none' },
        },
        '& h3': {
          fontSize: '1rem',
          fontWeight: 600,
          margin: '16px 0 8px 0',
          color: theme.palette.primary.main,
          '&:first-child': { marginTop: 0 },
          '& + br': { display: 'none' },
        },
        
        // Paragraphs
        '& p': {
          margin: '12px 0',
          '&:first-child': { marginTop: 0 },
          '&:last-child': { marginBottom: 0 },
          '&:empty': { display: 'none' },
        },
        
        // Стандартні HTML списки
        '& ul': {
          margin: '12px 0',
          paddingLeft: '20px',
          listStyle: 'disc',
          '& li': {
            margin: '4px 0',
            lineHeight: 1.5,
          },
          '& + br': { display: 'none' },
        },
        
        // Emoji items
        '& .emoji-item': {
          margin: '8px 0',
          paddingLeft: '4px',
          lineHeight: 1.5,
        },
        
        // Action items
        '& .action-item': {
          margin: '12px 0',
          padding: '8px 12px',
          background: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)',
          borderLeft: '4px solid #ff9800',
          borderRadius: '6px',
          fontWeight: 500,
          color: '#e65100',
        },
        
        // Text formatting
        '& strong': { 
          fontWeight: 600,
          color: theme.palette.primary.main,
        },
        '& em': { 
          fontStyle: 'italic',
          color: theme.palette.text.secondary,
        },
        '& code': {
          background: '#f5f5f5',
          padding: '2px 4px',
          borderRadius: '3px',
          fontFamily: 'monospace',
          fontSize: '0.85em',
          color: '#d32f2f',
        },
        
        // Blockquotes
        '& blockquote': {
          margin: '12px 0',
          padding: '8px 12px',
          borderLeft: '4px solid #e0e0e0',
          background: '#f9f9f9',
          fontStyle: 'italic',
          color: '#666',
        },
        
        // Horizontal rules
        '& hr': {
          border: 'none',
          borderTop: '1px solid #e0e0e0',
          margin: '20px 0',
          '& + br': { display: 'none' },
        },
        
        // Emojis
        '& .emoji': {
          fontSize: '1.1em',
          marginRight: '4px',
        },
      }}
    />
  );
};

export default MarkdownRenderer; 