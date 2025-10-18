'use client';

import React, { useState, useRef } from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

interface PuzzlePiece {
  id: string;
  position: number; // 0-based position in the grid
  imageUrl: string;
  clipPath: string; // CSS clip-path for cutting the image
}

interface SimplePuzzleProps {
  imageUrl: string;
  pieces?: 2 | 4 | 6; // Number of pieces
  difficulty?: 'easy' | 'medium';
  showOutline?: boolean;
  ageGroup?: string;
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

const SimplePuzzle: React.FC<SimplePuzzleProps> = ({
  imageUrl = '',
  pieces = 4,
  difficulty = 'easy',
  showOutline = true,
  isSelected,
  onEdit,
  onFocus,
}) => {
  const [puzzlePieces, setPuzzlePieces] = useState<PuzzlePiece[]>([]);
  const [placedPieces, setPlacedPieces] = useState<Map<number, string>>(new Map());
  const [draggedPiece, setDraggedPiece] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<Map<number, HTMLElement>>(new Map());

  const puzzleSize = 400;
  const pieceSize = pieces === 2 ? puzzleSize / 2 : pieces === 4 ? puzzleSize / 2 : puzzleSize / 3;
  const cols = pieces === 2 ? 2 : 2;
  const rows = pieces === 2 ? 1 : pieces === 4 ? 2 : 3;

  // Initialize puzzle pieces
  React.useEffect(() => {
    if (!imageUrl || puzzlePieces.length > 0) return;

    const newPieces: PuzzlePiece[] = [];
    for (let i = 0; i < pieces; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      
      // Calculate clip path for each piece
      const clipPath = pieces === 2
        ? i === 0 
          ? 'polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)'
          : 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)'
        : pieces === 4
        ? `polygon(${col * 50}% ${row * 50}%, ${(col + 1) * 50}% ${row * 50}%, ${(col + 1) * 50}% ${(row + 1) * 50}%, ${col * 50}% ${(row + 1) * 50}%)`
        : `polygon(${col * 33.33}% ${row * 33.33}%, ${(col + 1) * 33.33}% ${row * 33.33}%, ${(col + 1) * 33.33}% ${(row + 1) * 33.33}%, ${col * 33.33}% ${(row + 1) * 33.33}%)`;

      newPieces.push({
        id: `piece-${i}`,
        position: i,
        imageUrl,
        clipPath,
      });
    }

    // Shuffle pieces
    const shuffled = [...newPieces].sort(() => Math.random() - 0.5);
    setPuzzlePieces(shuffled);
  }, [imageUrl, pieces, cols, puzzlePieces.length]);

  // Check if puzzle is complete
  React.useEffect(() => {
    if (placedPieces.size === pieces) {
      let allCorrect = true;
      placedPieces.forEach((pieceId, slotPosition) => {
        const piece = puzzlePieces.find(p => p.id === pieceId);
        if (!piece || piece.position !== slotPosition) {
          allCorrect = false;
        }
      });

      if (allCorrect && !isCompleted) {
        setIsCompleted(true);
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
          });
          soundService.playSuccess();
          triggerHaptic('success');
        }, 300);
      }
    }
  }, [placedPieces, pieces, puzzlePieces, isCompleted]);

  const handleDragStart = (pieceId: string) => {
    setDraggedPiece(pieceId);
    triggerHaptic('light');
  };

  const handleDragEnd = (event: any, pieceId: string) => {
    if (!draggedPiece) return;

    const dragEndX = event.point.x;
    const dragEndY = event.point.y;

    // Find closest slot
    let closestSlot: number | null = null;
    let minDistance = Infinity;

    slotRefs.current.forEach((slotEl, slotPosition) => {
      const rect = slotEl.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      
      if (!containerRect) return;

      const slotCenterX = rect.left - containerRect.left + rect.width / 2;
      const slotCenterY = rect.top - containerRect.top + rect.height / 2;

      const distance = Math.sqrt(
        Math.pow(dragEndX - slotCenterX, 2) + 
        Math.pow(dragEndY - slotCenterY, 2)
      );

      if (distance < minDistance && distance < 150) {
        minDistance = distance;
        closestSlot = slotPosition;
      }
    });

    if (closestSlot !== null) {
      const piece = puzzlePieces.find(p => p.id === pieceId);
      const isCorrect = piece && piece.position === closestSlot;

      // Remove piece from any previous slot
      const newPlaced = new Map(placedPieces);
      newPlaced.forEach((pId, pos) => {
        if (pId === pieceId) {
          newPlaced.delete(pos);
        }
      });

      // Place in new slot
      newPlaced.set(closestSlot, pieceId);
      setPlacedPieces(newPlaced);

      if (isCorrect) {
        soundService.playCorrect();
        triggerHaptic('success');
      } else {
        soundService.playError();
        triggerHaptic('error');
      }
    }

    setDraggedPiece(null);
  };

  const handleReset = () => {
    const shuffled = [...puzzlePieces].sort(() => Math.random() - 0.5);
    setPuzzlePieces(shuffled);
    setPlacedPieces(new Map());
    setIsCompleted(false);
    triggerHaptic('light');
  };

  const getAvailablePieces = () => {
    return puzzlePieces.filter(piece => {
      return ![...placedPieces.values()].includes(piece.id);
    });
  };

  return (
    <Box
      ref={containerRef}
      onClick={onFocus}
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: 600,
        p: 3,
        border: isSelected ? '2px solid' : '2px solid transparent',
        borderColor: 'primary.main',
        borderRadius: 2,
        backgroundColor: 'grey.50',
        cursor: onFocus ? 'pointer' : 'default',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="primary">
            {isCompleted ? '🧩 Puzzle Complete!' : 'Complete the Puzzle'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {isCompleted 
              ? 'Great job putting it together!' 
              : `${placedPieces.size} of ${pieces} pieces placed`}
          </Typography>
        </Box>

        {/* Reset button */}
        <IconButton onClick={handleReset} color="primary" size="large">
          <RotateCcw size={28} />
        </IconButton>
      </Box>

      {/* Puzzle board */}
      <Paper
        elevation={3}
        sx={{
          width: puzzleSize,
          height: pieces === 2 ? puzzleSize / 2 : puzzleSize,
          mx: 'auto',
          mb: 4,
          position: 'relative',
          borderRadius: 2,
          backgroundColor: 'white',
          border: '3px solid',
          borderColor: isCompleted ? 'success.main' : 'primary.light',
          overflow: 'hidden',
        }}
      >
        {/* Background image outline (easy mode) */}
        {showOutline && difficulty === 'easy' && !isCompleted && (
          <Box
            component="img"
            src={imageUrl}
            alt="Puzzle outline"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.2,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Puzzle slots grid */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap: 0,
          }}
        >
          {Array.from({ length: pieces }).map((_, index) => {
            const placedPieceId = placedPieces.get(index);
            const placedPiece = placedPieceId ? puzzlePieces.find(p => p.id === placedPieceId) : null;
            const isCorrectPosition = placedPiece && placedPiece.position === index;

            return (
              <Box
                key={index}
                ref={(el) => {
                  if (el) slotRefs.current.set(index, el);
                }}
                sx={{
                  position: 'relative',
                  border: '2px dashed',
                  borderColor: isCorrectPosition ? 'success.main' : 'grey.300',
                  backgroundColor: isCorrectPosition ? 'success.50' : 'transparent',
                }}
              >
                {/* Placed piece */}
                {placedPiece && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    style={{
                      width: '100%',
                      height: '100%',
                      position: 'relative',
                    }}
                  >
                    <Box
                      component="img"
                      src={placedPiece.imageUrl}
                      alt={`Piece ${placedPiece.position + 1}`}
                      sx={{
                        width: puzzleSize,
                        height: pieces === 2 ? puzzleSize / 2 : puzzleSize,
                        objectFit: 'cover',
                        position: 'absolute',
                        top: -(placedPiece.position / cols | 0) * pieceSize,
                        left: -(placedPiece.position % cols) * pieceSize,
                        clipPath: placedPiece.clipPath,
                      }}
                    />
                  </motion.div>
                )}
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* Available pieces */}
      {getAvailablePieces().length > 0 && !isCompleted && (
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, textAlign: 'center' }}>
            Drag these pieces:
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {getAvailablePieces().map((piece) => (
              <motion.div
                key={piece.id}
                drag
                dragMomentum={false}
                dragElastic={0.1}
                onDragStart={() => handleDragStart(piece.id)}
                onDragEnd={(e, info) => handleDragEnd(info, piece.id)}
                whileDrag={{ scale: 1.1, zIndex: 100, rotate: 5 }}
                whileHover={{ scale: 1.05 }}
                style={{
                  cursor: 'grab',
                  touchAction: 'none',
                }}
              >
                <Paper
                  elevation={draggedPiece === piece.id ? 8 : 4}
                  sx={{
                    width: pieceSize,
                    height: pieceSize,
                    position: 'relative',
                    borderRadius: 2,
                    border: '3px solid',
                    borderColor: 'primary.main',
                    overflow: 'hidden',
                    backgroundColor: 'white',
                  }}
                >
                  <Box
                    component="img"
                    src={piece.imageUrl}
                    alt={`Puzzle piece ${piece.position + 1}`}
                    sx={{
                      width: puzzleSize,
                      height: pieces === 2 ? puzzleSize / 2 : puzzleSize,
                      objectFit: 'cover',
                      position: 'absolute',
                      top: -(piece.position / cols | 0) * pieceSize,
                      left: -(piece.position % cols) * pieceSize,
                      clipPath: piece.clipPath,
                      pointerEvents: 'none',
                    }}
                  />
                </Paper>
              </motion.div>
            ))}
          </Box>
        </Box>
      )}

      {/* Success overlay */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 200,
            }}
          >
            <Paper
              elevation={12}
              sx={{
                px: 6,
                py: 4,
                backgroundColor: 'success.main',
                color: 'white',
                borderRadius: 4,
                textAlign: 'center',
              }}
            >
              <Sparkles size={64} />
              <Typography variant="h3" fontWeight={800} sx={{ mt: 2 }}>
                Perfect! 🧩
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                You completed the puzzle!
              </Typography>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {!isCompleted && placedPieces.size === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <Typography
            variant="body2"
            sx={{
              mt: 3,
              textAlign: 'center',
              color: 'text.secondary',
              fontStyle: 'italic',
            }}
          >
            💡 Drag the pieces to the puzzle board to complete the picture
          </Typography>
        </motion.div>
      )}
    </Box>
  );
};

export default SimplePuzzle;

