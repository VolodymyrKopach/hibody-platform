'use client';

import React from 'react';
import { Stack, Box, Typography, IconButton, Tooltip, Divider } from '@mui/material';
import { Copy, Trash2, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { CommonElementPropertiesProps } from '@/types/element-editors';
import PositionControls from './PositionControls';
import SizeControls from './SizeControls';

interface ExtendedCommonElementPropertiesProps extends CommonElementPropertiesProps {
  onDuplicate?: () => void;
  onDelete?: () => void;
  showPositionControls?: boolean;
  showSizeControls?: boolean;
}

const CommonElementProperties: React.FC<ExtendedCommonElementPropertiesProps> = ({ 
  elementData,
  onUpdate,
  onDuplicate,
  onDelete,
  showPositionControls = true,
  showSizeControls = true,
}) => {
  return (
    <Stack spacing={2.5}>
      {/* Element Type Badge */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
          {elementData.type || 'Element'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          ID: {elementData.id}
        </Typography>
      </Box>

      <Divider />

      {/* Actions */}
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
          Actions
        </Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Duplicate">
            <IconButton
              size="small"
              onClick={onDuplicate}
              disabled={!onDuplicate}
              sx={{ 
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                '&:hover': { borderColor: '#2563EB', backgroundColor: '#EFF6FF' }
              }}
            >
              <Copy size={16} />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={elementData.visible ? 'Hide' : 'Show'}>
            <IconButton
              size="small"
              onClick={() => onUpdate?.({ visible: !elementData.visible })}
              sx={{ 
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                '&:hover': { borderColor: '#2563EB', backgroundColor: '#EFF6FF' }
              }}
            >
              {elementData.visible ? <Eye size={16} /> : <EyeOff size={16} />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title={elementData.locked ? 'Unlock' : 'Lock'}>
            <IconButton
              size="small"
              onClick={() => onUpdate?.({ locked: !elementData.locked })}
              sx={{ 
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                '&:hover': { borderColor: '#2563EB', backgroundColor: '#EFF6FF' }
              }}
            >
              {elementData.locked ? <Lock size={16} /> : <Unlock size={16} />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={onDelete}
              disabled={!onDelete}
              sx={{ 
                border: '1px solid #FEE2E2',
                borderRadius: '8px',
                color: '#EF4444',
                '&:hover': { borderColor: '#EF4444', backgroundColor: '#FEF2F2' }
              }}
            >
              <Trash2 size={16} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {showPositionControls && elementData.x !== undefined && elementData.y !== undefined && (
        <>
          <Divider />
          <PositionControls
            x={elementData.x}
            y={elementData.y}
            onChange={(position) => onUpdate?.(position)}
          />
        </>
      )}

      {showSizeControls && elementData.width !== undefined && elementData.height !== undefined && (
        <>
          <Divider />
          <SizeControls
            width={elementData.width}
            height={elementData.height}
            onChange={(size) => onUpdate?.(size)}
          />
        </>
      )}
    </Stack>
  );
};

export default CommonElementProperties;

