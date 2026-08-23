import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Pen,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Save,
  X,
  Sparkles,
  Check,
  AlertCircle,
  CopyPlus,
  Loader2,
} from 'lucide-react';
import { useTheme, useAuth } from '../../hooks';
import {
  DoodleItem,
  DoodleSection,
  DoodleStroke,
  DoodleTool,
} from '../../types/doodle';
import { saveDoodle, generateDoodleId } from '../../services/doodleService';

interface DoodleCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: DoodleSection;
  initialDoodle?: DoodleItem | null;
  onDoodleSaved?: (doodle: DoodleItem) => void;
}

export const DoodleCanvasModal: React.FC<DoodleCanvasModalProps> = ({
  isOpen,
  onClose,
  section,
  initialDoodle,
  onDoodleSaved,
}) => {
  const { theme } = useTheme();
  const { currentUser, userProfile } = useAuth();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Drawing state
  const [currentTool, setCurrentTool] = useState<DoodleTool>('pen');
  const [penSize, setPenSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [currentDoodleId, setCurrentDoodleId] = useState<string>(
    initialDoodle?.id || generateDoodleId()
  );
  const [doodleTitle, setDoodleTitle] = useState<string>(
    initialDoodle?.title || ''
  );
  const [strokes, setStrokes] = useState<DoodleStroke[]>(
    initialDoodle?.strokes || []
  );
  const [redoStack, setRedoStack] = useState<DoodleStroke[]>([]);
  const isDrawingRef = useRef<boolean>(false);
  const currentStrokeRef = useRef<DoodleStroke | null>(null);
  const strokesRef = useRef<DoodleStroke[]>(strokes);
  strokesRef.current = strokes;

  // Status & Confirmation
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    text: string;
    type: 'success' | 'warning';
  } | null>(null);

  // Palette & Default color based on theme
  const getThemeDefaultColor = useCallback(() => {
    switch (theme) {
      case 'midnight-journal':
        return '#F2E8D2'; // Starlit parchment cream
      case 'whimsical-scrapbook':
        return '#2E5A44'; // Forest sage green
      case 'letter-archive':
      default:
        return '#3D2B1F'; // Deep walnut sepia ink
    }
  }, [theme]);

  const [selectedColor, setSelectedColor] = useState<string>(getThemeDefaultColor);

  // Update default color when opening or when theme changes if untouched
  useEffect(() => {
    if (!initialDoodle) {
      setSelectedColor(getThemeDefaultColor());
    }
  }, [getThemeDefaultColor, initialDoodle?.id]);

  // Curated vintage ink colors
  const inkColors = [
    { name: 'Sepia Ink', value: '#3D2B1F' },
    { name: 'Obsidian', value: '#1F2421' },
    { name: 'Starlit Gold', value: '#C59A52' },
    { name: 'Velvet Burgundy', value: '#7A2E3B' },
    { name: 'Antique Parchment', value: '#F2E8D2' },
    { name: 'Forest Sage', value: '#2E5A44' },
    { name: 'Night Indigo', value: '#1F3A5A' },
  ];

  const getStrokeWidth = (size: 'small' | 'medium' | 'large', tool: DoodleTool) => {
    if (tool === 'eraser') {
      switch (size) {
        case 'small':
          return 14;
        case 'large':
          return 44;
        case 'medium':
        default:
          return 26;
      }
    }
    switch (size) {
      case 'small':
        return 2;
      case 'large':
        return 9;
      case 'medium':
      default:
        return 4.5;
    }
  };

  // Redraw all strokes onto canvas with high DPI and transparency
  const redrawCanvas = useCallback((strokesToDraw?: DoodleStroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear everything to preserve transparency
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const list = strokesToDraw ?? strokesRef.current;
    list.forEach((stroke) => {
      if (stroke.points.length === 0) return;

      ctx.save();
      if (stroke.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
      }
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      const firstPoint = stroke.points[0];
      ctx.moveTo(firstPoint.x, firstPoint.y);

      if (stroke.points.length === 1) {
        ctx.lineTo(firstPoint.x + 0.1, firstPoint.y + 0.1);
      } else {
        for (let i = 1; i < stroke.points.length; i++) {
          const pt = stroke.points[i];
          ctx.lineTo(pt.x, pt.y);
        }
      }
      ctx.stroke();
      ctx.restore();
    });
  }, []);

  // Adjust canvas size for container & devicePixelRatio (stable callback, [] dependency)
  const setupCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    if (width <= 0 || height <= 0) return;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    redrawCanvas();
  }, [redrawCanvas]);

  // Initialize or reset when modal opens or initialDoodle changes
  useEffect(() => {
    if (isOpen) {
      if (initialDoodle) {
        setCurrentDoodleId(initialDoodle.id);
        setDoodleTitle(initialDoodle.title || '');
        setStrokes(initialDoodle.strokes || []);
      } else {
        setCurrentDoodleId(generateDoodleId());
        setDoodleTitle('');
        setStrokes([]);
      }
      setRedoStack([]);
      setFeedbackMessage(null);
      setShowClearConfirm(false);

      const timer = setTimeout(() => {
        setupCanvasDimensions();
      }, 50);

      window.addEventListener('resize', setupCanvasDimensions);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', setupCanvasDimensions);
      };
    }
  }, [isOpen, initialDoodle?.id, setupCanvasDimensions]);

  // Redraw when strokes change
  useEffect(() => {
    redrawCanvas(strokes);
  }, [strokes, redrawCanvas]);

  // Pointer Event Handlers (Mouse, Touch, Stylus unified)
  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, pressure: 0.5 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure > 0 ? e.pressure : 0.5,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // Ignored for environments where setPointerCapture might fail
    }

    isDrawingRef.current = true;
    const pt = getCanvasPoint(e);
    const width = getStrokeWidth(penSize, currentTool);

    const newStroke: DoodleStroke = {
      points: [pt],
      color: selectedColor,
      width: width,
      tool: currentTool,
    };

    currentStrokeRef.current = newStroke;

    // Draw single point immediately on canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.save();
      if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = selectedColor;
      }
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
      ctx.lineTo(pt.x + 0.1, pt.y + 0.1);
      ctx.stroke();
      ctx.restore();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pt = getCanvasPoint(e);
    const stroke = currentStrokeRef.current;
    const prevPt = stroke.points[stroke.points.length - 1];

    stroke.points.push(pt);

    const ctx = canvas.getContext('2d');
    if (ctx && prevPt) {
      ctx.save();
      if (stroke.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
      }
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(prevPt.x, prevPt.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
      ctx.restore();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // Safe ignore
      }
    }

    isDrawingRef.current = false;

    if (currentStrokeRef.current && currentStrokeRef.current.points.length > 0) {
      const finishedStroke = currentStrokeRef.current;
      setStrokes((prev) => [...prev, finishedStroke]);
      setRedoStack([]); // Clear redo stack on new action
      currentStrokeRef.current = null;
    }
  };

  // Undo & Redo Handlers
  const handleUndo = () => {
    if (strokes.length === 0) return;
    const last = strokes[strokes.length - 1];
    setStrokes((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, last]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setStrokes((prev) => [...prev, next]);
  };

  // Clear Handler
  const handleClear = () => {
    if (strokes.length === 0) return;
    if (!showClearConfirm) {
      setShowClearConfirm(true);
      return;
    }
    setStrokes([]);
    setRedoStack([]);
    setShowClearConfirm(false);
  };

  // Save Doodle Handler (with thumbnail generation)
  const handleSave = async (asNew: boolean = false) => {
    if (isSaving) return;
    if (strokes.length === 0) {
      setFeedbackMessage({
        text: 'The canvas is empty. Draw a little thought before saving.',
        type: 'warning',
      });
      return;
    }

    setIsSaving(true);
    setFeedbackMessage(null);

    try {
      const canvas = canvasRef.current;
      const thumbnailDataUrl = canvas ? canvas.toDataURL('image/png') : undefined;

      const targetId = asNew ? generateDoodleId() : currentDoodleId;
      if (asNew) {
        setCurrentDoodleId(targetId);
      }

      const doodleToSave: DoodleItem = {
        id: targetId,
        userId: currentUser?.uid || 'anonymous',
        section: section,
        title: doodleTitle.trim() || (section === 'what-am-i-to-you' ? 'Quiet Feeling Doodle' : 'Reflection Doodle'),
        strokes: strokes,
        thumbnailDataUrl: thumbnailDataUrl,
        canvasWidth: canvas?.width,
        canvasHeight: canvas?.height,
        createdAt: asNew || !initialDoodle ? new Date().toISOString() : initialDoodle.createdAt,
        updatedAt: new Date().toISOString(),
      };

      const res = await saveDoodle(doodleToSave, currentUser?.uid, userProfile || undefined);

      setFeedbackMessage({
        text: res.message,
        type: 'success',
      });

      if (onDoodleSaved) {
        onDoodleSaved(res.doodle);
      }
    } catch (err: any) {
      console.error('Save doodle error:', err);
      setFeedbackMessage({
        text: 'Saved on this device. Cloud save couldn’t be completed.',
        type: 'warning',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="doodle-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={() => {
        if (showClearConfirm) setShowClearConfirm(false);
      }}
    >
      <div
        id="doodle-modal-card"
        className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl border shadow-2xl overflow-hidden transition-all duration-300 relative"
        style={{
          backgroundColor: theme === 'midnight-journal' ? '#111728' : theme === 'whimsical-scrapbook' ? '#0d1d13' : '#172033',
          borderColor: 'rgba(197, 154, 82, 0.3)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px rgba(197, 154, 82, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <header
          className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b shrink-0"
          style={{ borderColor: 'rgba(197, 154, 82, 0.2)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center border shadow-xs"
              style={{
                backgroundColor: 'rgba(197, 154, 82, 0.12)',
                borderColor: 'rgba(197, 154, 82, 0.4)',
                color: '#C59A52',
              }}
            >
              <Pen className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="doodle-modal-title"
                className="text-base sm:text-lg font-serif font-medium tracking-tight"
                style={{ color: '#F2E8D2' }}
              >
                {section === 'what-am-i-to-you' ? 'Quiet Thought Doodle' : 'Reflection Doodle Desk'}
              </h2>
              <p className="text-[11px] font-serif italic" style={{ color: '#9F927F' }}>
                Handmade strokes preserved with transparent ink
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-[#9F927F] hover:text-[#F2E8D2] hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Close doodle desk"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Title Input & Save Feedback Banner */}
        <div className="px-4 sm:px-6 pt-3 pb-1 space-y-2 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              placeholder="Give your doodle a title (optional)..."
              value={doodleTitle}
              onChange={(e) => setDoodleTitle(e.target.value)}
              maxLength={60}
              className="flex-1 px-3.5 py-1.5 text-xs sm:text-sm font-serif rounded-xl focus:outline-none transition-all"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                color: '#F2E8D2',
                border: '1px solid rgba(197, 154, 82, 0.25)',
              }}
            />

            {!currentUser && (
              <span className="text-[11px] font-serif italic text-amber-300/80 px-1 text-center sm:text-right">
                Offline/Local mode
              </span>
            )}
          </div>

          {feedbackMessage && (
            <div
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-serif border animate-fadeIn"
              style={{
                backgroundColor:
                  feedbackMessage.type === 'success'
                    ? 'rgba(46, 90, 68, 0.25)'
                    : 'rgba(122, 46, 59, 0.25)',
                borderColor:
                  feedbackMessage.type === 'success'
                    ? 'rgba(110, 190, 140, 0.4)'
                    : 'rgba(197, 154, 82, 0.4)',
                color: '#F2E8D2',
              }}
            >
              {feedbackMessage.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
          )}
        </div>

        {/* Main Canvas Drawing Surface */}
        <div className="flex-1 p-4 sm:p-6 min-h-[260px] sm:min-h-[360px] flex flex-col">
          <div
            ref={containerRef}
            id="doodle-canvas-viewport"
            className="w-full h-full min-h-[260px] sm:min-h-[340px] flex-1 rounded-2xl relative overflow-hidden border shadow-inner transition-colors duration-300"
            style={{
              backgroundColor:
                theme === 'midnight-journal'
                  ? '#0a0e1a'
                  : theme === 'whimsical-scrapbook'
                  ? '#06130b'
                  : '#F6EFE3', // Aged Parchment background for letter archive
              borderColor: 'rgba(197, 154, 82, 0.35)',
              backgroundImage:
                theme === 'letter-archive'
                  ? `radial-gradient(#8A6E59 0.75px, transparent 0.75px)`
                  : `radial-gradient(rgba(197,154,82,0.15) 0.75px, transparent 0.75px)`,
              backgroundSize: '16px 16px',
            }}
          >
            <canvas
              ref={canvasRef}
              id="doodle-interactive-canvas"
              aria-label="Drawing canvas"
              className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />

            {/* Clear Confirmation Floating Dialog */}
            {showClearConfirm && (
              <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
                <div
                  className="p-5 rounded-2xl border max-w-xs w-full text-center space-y-3 shadow-2xl"
                  style={{
                    backgroundColor: '#172033',
                    borderColor: '#C59A52',
                    color: '#F2E8D2',
                  }}
                >
                  <p className="text-sm font-serif font-medium">Clear this doodle?</p>
                  <p className="text-xs font-serif italic text-[#CDBFA8]">
                    This will clear all current strokes from this canvas.
                  </p>
                  <div className="flex items-center justify-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(false)}
                      className="px-4 py-1.5 rounded-full text-xs font-serif border border-slate-700 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleClear}
                      className="px-4 py-1.5 rounded-full text-xs font-serif font-medium bg-rose-900/60 border border-rose-600 text-rose-200 hover:bg-rose-900 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toolbar & Controls Footer */}
        <footer
          className="px-4 sm:px-6 py-3.5 border-t bg-black/25 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderColor: 'rgba(197, 154, 82, 0.2)' }}
        >
          {/* Tool, Size, Palette Controls */}
          <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
            {/* Tool Selection (Pen vs Eraser) */}
            <div
              className="flex items-center p-0.5 rounded-xl border"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderColor: 'rgba(197, 154, 82, 0.3)',
              }}
            >
              <button
                type="button"
                onClick={() => setCurrentTool('pen')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-serif transition-all cursor-pointer"
                style={{
                  backgroundColor: currentTool === 'pen' ? '#6E3E42' : 'transparent',
                  color: currentTool === 'pen' ? '#F2E8D2' : '#9F927F',
                }}
                title="Pen tool"
                aria-label="Pen tool"
              >
                <Pen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pen</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentTool('eraser')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-serif transition-all cursor-pointer"
                style={{
                  backgroundColor: currentTool === 'eraser' ? '#6E3E42' : 'transparent',
                  color: currentTool === 'eraser' ? '#F2E8D2' : '#9F927F',
                }}
                title="Eraser tool"
                aria-label="Eraser tool"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Eraser</span>
              </button>
            </div>

            {/* Stroke Size Selection */}
            <div
              className="flex items-center p-0.5 rounded-xl border"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderColor: 'rgba(197, 154, 82, 0.3)',
              }}
            >
              {(['small', 'medium', 'large'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setPenSize(sz)}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-serif capitalize transition-all cursor-pointer"
                  style={{
                    backgroundColor: penSize === sz ? 'rgba(197, 154, 82, 0.2)' : 'transparent',
                    color: penSize === sz ? '#F2E8D2' : '#9F927F',
                    fontWeight: penSize === sz ? 600 : 400,
                  }}
                  title={`${sz} stroke size`}
                >
                  {sz === 'small' ? 'Fine' : sz === 'medium' ? 'Med' : 'Broad'}
                </button>
              ))}
            </div>

            {/* Ink Color Swatches */}
            {currentTool === 'pen' && (
              <div className="flex items-center gap-1.5 pl-1">
                {inkColors.map((ink) => (
                  <button
                    key={ink.value}
                    type="button"
                    onClick={() => setSelectedColor(ink.value)}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border transition-transform cursor-pointer relative"
                    style={{
                      backgroundColor: ink.value,
                      borderColor: selectedColor === ink.value ? '#C59A52' : 'rgba(255, 255, 255, 0.2)',
                      transform: selectedColor === ink.value ? 'scale(1.2)' : 'scale(1)',
                      boxShadow: selectedColor === ink.value ? '0 0 6px rgba(197, 154, 82, 0.6)' : 'none',
                    }}
                    title={ink.name}
                    aria-label={`Select ${ink.name} ink`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons (Undo, Redo, Clear, Save) */}
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
            <button
              type="button"
              onClick={handleUndo}
              disabled={strokes.length === 0}
              className="p-2 rounded-xl text-[#9F927F] hover:text-[#F2E8D2] hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Undo stroke"
              aria-label="Undo stroke"
            >
              <Undo2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-2 rounded-xl text-[#9F927F] hover:text-[#F2E8D2] hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Redo stroke"
              aria-label="Redo stroke"
            >
              <Redo2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={strokes.length === 0}
              className="p-2 rounded-xl text-[#9F927F] hover:text-rose-300 hover:bg-rose-950/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Clear canvas"
              aria-label="Clear canvas"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {initialDoodle && (
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={isSaving || strokes.length === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-serif border border-slate-700 hover:bg-white/5 transition-all cursor-pointer disabled:opacity-40"
                style={{ color: '#E8D8B8' }}
                title="Save as a new copy"
              >
                <CopyPlus className="w-3.5 h-3.5 text-[#C59A52]" />
                <span className="hidden sm:inline">Save as New</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={isSaving || strokes.length === 0}
              className="inline-flex items-center gap-1.5 px-5 py-2 min-h-[38px] rounded-full text-xs sm:text-sm font-serif font-medium shadow-md transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
              style={{
                backgroundColor: '#6E3E42',
                color: '#F2E8D2',
                border: '1px solid #9F7A3D',
              }}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Doodle</span>
                </>
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
