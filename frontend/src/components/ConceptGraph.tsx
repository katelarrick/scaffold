import { useEffect, useCallback, useState, useRef, createContext, useContext } from 'react';
import {
  ReactFlow, type ReactFlowInstance, Controls, Background, BackgroundVariant,
  useNodesState, useEdgesState, Handle, Position, MarkerType, type NodeChange,
  type NodeProps, type NodeTypes, type Node, type Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { buildGraphElements } from '../utils/layout';
import { majorConcepts, prereqEdgeData } from '../data/conceptGraph';

interface SavedDetailCard {
  cardType: string; itemLabel: string;
  conceptId: string; conceptColor: string;
  posX: number; posY: number;
}

interface ConceptGraphProps {
  highlightedIds: Set<string>;
  highlightedSubconcepts: Map<string, Set<string>>;
  onConceptClick: (id: string) => void;
  starredIds: Set<string>;
  onStarClick: (id: string) => void;
  onReset: () => void;
  onDetailAdded?: (card: {
    cardType: string; itemLabel: string;
    conceptId: string; conceptColor: string;
    posX: number; posY: number;
  }) => void;
  onDetailDeleted?: (cardType: string, itemLabel: string) => void;
  restoredDetailCards?: SavedDetailCard[];
  onDetailMoved?: (cardType: string, itemLabel: string, posX: number, posY: number) => void;
}

function toPastel(hex: string, strength: number = 0.35): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const pr = Math.round(r * strength + 255 * (1 - strength));
  const pg = Math.round(g * strength + 255 * (1 - strength));
  const pb = Math.round(b * strength + 255 * (1 - strength));
  return `rgb(${pr}, ${pg}, ${pb})`;
}

const DeleteDetailContext = createContext<(id: string) => void>(() => {});

const LEVELS = [
  { label: 'Level 1', color: '#c5d3f9' },
  { label: 'Level 2', color: '#feaef2' },
  { label: 'Level 3', color: '#93ebff' },
  { label: 'Level 4', color: '#fe9a71' },
  { label: 'Level 5', color: '#2bcd9c' },
  { label: 'Level 6', color: '#f4e87b' },
];

function LevelLegend() {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(255,255,255,0.92)',
        borderRadius: 10,
        borderTop:    '1.5px solid #1E293B',
        borderLeft:   '1.5px solid #1E293B',
        borderRight:  '4px solid #1E293B',
        borderBottom: '4px solid #1E293B',
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        width: hovered ? 100 : 44,
        transition: 'width 0.2s ease',
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {LEVELS.map((level, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 5,
            background: level.color, border: '1.5px solid #1E293B', flexShrink: 0,
          }} />
          <span style={{
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontSize: 13, fontWeight: 600, color: '#1E293B',
            whiteSpace: 'nowrap', overflow: 'hidden',
            width: hovered ? 72 : 0, opacity: hovered ? 1 : 0,
            transition: 'width 0.2s ease, opacity 0.15s ease',
          }}>
            {level.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function ResetButton({ onReset }: { onReset: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onReset}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(255,255,255,0.92)',
        borderRadius: 10,
        borderTop:    '1.5px solid #1E293B',
        borderLeft:   '1.5px solid #1E293B',
        borderRight:  '4px solid #1E293B',
        borderBottom: '4px solid #1E293B',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        width: hovered ? 180 : 44,
        transition: 'width 0.2s ease',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="#1E293B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ flexShrink: 0 }}
      >
        <path d="M23 4v6h-6"/>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
      </svg>
      <span style={{
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontSize: 13, fontWeight: 600, color: '#1E293B',
        whiteSpace: 'nowrap', overflow: 'hidden',
        width: hovered ? 180 : 0, opacity: hovered ? 1 : 0,
        transition: 'width 0.2s ease, opacity 0.15s ease',
      }}>
        Click to reset graph
      </span>
    </div>
  );
}

function MajorNode({ data }: NodeProps) {
  const color                  = data.color as string;
  const label                  = data.label as string;
  const subconcepts            = data.subconcepts as string[];
  const highlighted            = data.highlighted as boolean;
  const hasSelection           = data.hasSelection as boolean;
  const highlightedSubconcepts = data.highlightedSubconcepts as Set<string>;
  const starred                = data.starred as boolean;
  const onStarClick            = data.onStarClick as () => void;

  const showColor = !hasSelection || highlighted;

  return (
    <div style={{
      width: 270,
      borderRadius: 10,
      overflow: 'hidden',
      borderTop:    '1.5px solid #1E293B',
      borderLeft:   '1.5px solid #1E293B',
      borderRight:  '4px solid #1E293B',
      borderBottom: '4px solid #1E293B',
      boxShadow: highlighted && hasSelection
        ? `0 0 0 6px ${color}50, 0 4px 16px rgba(0,0,0,0.2)`
        : showColor ? '0 3px 12px rgba(0,0,0,0.18)' : '0 2px 8px rgba(0,0,0,0.1)',
      opacity: hasSelection && !highlighted ? 0.25 : 1,
      cursor: 'pointer',
      transition: 'opacity 0.25s, box-shadow 0.25s',
    }}>
      <Handle id="bottom" type="target" position={Position.Bottom}
        style={{ opacity: 0, pointerEvents: 'none' }} />

      <div style={{
        background: showColor ? color : '#94A3B8',
        letterSpacing: '0.03em',
        fontFamily: 'Helvetica, Arial, sans-serif',
        color: '#000000',
        paddingTop: '27px', paddingBottom: '6px',
        paddingLeft: '14px', paddingRight: '14px',
        lineHeight: 1.1, textAlign: 'left',
        fontSize: 28, fontWeight: 700,
        whiteSpace: 'pre-line',
        transition: 'background 0.25s',
        position: 'relative',
      }}>
        {label}
        <div
          onClick={e => { e.stopPropagation(); onStarClick(); }}
          style={{
            position: 'absolute', top: 12, right: 12,
            width: 28, height: 28, borderRadius: 6,
            border: '2px solid #1E293B',
            background: starred ? '#FACC15' : '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24"
            fill={starred ? '#1E293B' : 'none'} stroke="#1E293B"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr', gap: 2,
        background: showColor ? `${color}55` : '#CBD5E140',
        padding: 2,
      }}>
        {subconcepts.map((sub, i) => (
          <div key={i} style={{
            background: highlightedSubconcepts?.has(sub) ? toPastel(color) : '#fff',
            padding: '5px 6px', textAlign: 'center',
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontSize: 17, fontWeight: 550,
            lineHeight: 1.3, color: '#1E293B', whiteSpace: 'pre-line',
          }}>
            {sub}
          </div>
        ))}
      </div>

      <Handle id="top" type="source" position={Position.Top}
        style={{ opacity: 0, pointerEvents: 'none' }} />
    </div>
  );
}

function DetailNode({ data, id }: NodeProps) {
  const onDelete                 = useContext(DeleteDetailContext);
  const [closeHovered, setCloseHovered] = useState(false);

  const cardType    = data.cardType    as string;
  const itemLabel   = data.itemLabel   as string;
  const conceptColor = data.conceptColor as string;

  return (
    <div style={{
      background: toPastel(conceptColor),
      border: '1px solid #000000',
      borderRadius: 8,
      width: 250,
      padding: '10px 10px',
      position: 'relative',
      textAlign: 'left',
    }}>
      <Handle id="bottom" type="target" position={Position.Bottom} isConnectable={false} 
        style={{ opacity: 0, pointerEvents: 'none' }} />

      {/* X button */}
      <div
        onClick={e => { e.stopPropagation(); onDelete(id); }}
        onMouseEnter={() => setCloseHovered(true)}
        onMouseLeave={() => setCloseHovered(false)}
        style={{
          position: 'absolute', top: 8, right: 8,
          width: 22, height: 22, borderRadius: 5,
          borderTop: '1.5px solid #1E293B', borderLeft: '1.5px solid #1E293B',
          borderRight: '3px solid #1E293B', borderBottom: '3px solid #1E293B',
          background: closeHovered ? '#ef4444' : '#ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'background 0.15s', zIndex: 1,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke={closeHovered ? '#ffffff' : '#1E293B'}
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>

      {/* Pill label */}
      <span style={{
        background: conceptColor,
        borderRadius: 100,
        padding: '2px 10px',
        border: '1px solid #000000',
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontSize: 15, fontWeight: 700, color: '#000000',
        whiteSpace: 'nowrap',
        display: 'inline-block',
        marginBottom: 6,
        marginRight: 20,
      }}>
        {cardType}
      </span>

      {/* Item label */}
      <div style={{
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontSize: 13, fontWeight: 700, color: '#1E293B', marginBottom: 6,
      }}>
        {itemLabel}
      </div>

      {/* Placeholder content */}
      <div style={{
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontSize: 13, color: '#1E293B', lineHeight: 1.5,
      }}>
        {`${cardType} for "${itemLabel}" will appear here.`}
      </div>

      <Handle type="source" position={Position.Bottom}
        style={{ opacity: 0, pointerEvents: 'none' }} />
    </div>
  );
}

const nodeTypes: NodeTypes = { major: MajorNode, detail: DetailNode };
const { nodes: initialNodes, edges: initialEdges } = buildGraphElements();

export default function ConceptGraph({ highlightedIds, highlightedSubconcepts, onConceptClick, starredIds, onStarClick, onReset, onDetailAdded, onDetailDeleted, restoredDetailCards, onDetailMoved}: ConceptGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const hasSelection = highlightedIds.size > 0;
  const restoredRef = useRef(false);
  const nodesRef = useRef(nodes);
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);

  useEffect(() => {
    if (restoredRef.current || !restoredDetailCards?.length) return;
    restoredRef.current = true;

    const newNodes = restoredDetailCards.map((card, i) => ({
      id: `detail-restored-${i}-${card.cardType}-${card.itemLabel}`,
      type: 'detail' as const,
      position: { x: card.posX, y: card.posY },
      data: {
        cardType: card.cardType, itemLabel: card.itemLabel,
        conceptId: card.conceptId, conceptColor: card.conceptColor,
      },
    }));
    const newEdges = restoredDetailCards.map((card, i) => ({
      id: `edge-restored-${i}`,
      source: card.conceptId,
      target: newNodes[i].id,
      targetHandle: 'bottom',
      type:         'smooth',
      style:        { stroke: card.conceptColor, strokeWidth: 4, strokeDasharray: '4 2' },
      markerEnd:    { type: MarkerType.ArrowClosed, color: card.conceptColor },
    }));

    setNodes(prev => [...prev, ...newNodes]);
    setEdges(prev => [...prev, ...newEdges]);
  }, [restoredDetailCards]);

  const rfInstance = useRef<ReactFlowInstance<Node, Edge> | null>(null);

  const handleReset = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    onReset();
    setTimeout(() => rfInstance.current?.fitView({ padding: 0.08 }), 50);
  }, [onReset, setNodes, setEdges]);

  const handleDeleteDetail = useCallback((id: string) => {
    setNodes(nds => {
      const node = nds.find(n => n.id === id);
      if (node?.data) {
        onDetailDeleted?.(node.data.cardType as string, node.data.itemLabel as string);
      }
      return nds.filter(n => n.id !== id);
    });
    setEdges(eds => eds.filter(e => e.source !== id && e.target !== id));
  }, [setNodes, setEdges, onDetailDeleted]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/scaffold-card');
    if (!raw) return;

    const { cardType, itemLabel, conceptId, conceptColor } = JSON.parse(raw);
    const position = rfInstance.current?.screenToFlowPosition({
      x: e.clientX, y: e.clientY,
    });
    if (!position) return;

    const nodeId = `detail-${Date.now()}`;

    setNodes(nds => [...nds, {
      id:       nodeId,
      type:     'detail',
      position,
      data:     { cardType, itemLabel, conceptColor },
    }]);

    setEdges(eds => [...eds, {
      id:     `detail-edge-${nodeId}`,
      source:  conceptId,
      target:  nodeId,
      targetHandle: 'bottom',
      type:   'smooth',
      style:  { stroke: conceptColor, strokeWidth: 4, strokeDasharray: '4 2' },
      markerEnd: { type: MarkerType.ArrowClosed, color: conceptColor },
    }]);

    onDetailAdded?.({
      cardType, itemLabel, conceptId, conceptColor,
      posX: position.x, posY: position.y,
    }); 

  }, [setNodes, setEdges]);

  // Update node appearance when highlighted set changes
  useEffect(() => {
    setNodes(nds => nds.map(node => ({
      ...node,
      data: {
        ...node.data,
        highlighted:            highlightedIds.has(node.id),
        hasSelection,
        highlightedSubconcepts: highlightedSubconcepts.get(node.id) ?? new Set(),
        starred:                starredIds.has(node.id),
        onStarClick:            () => onStarClick(node.id),
      },
    })));
  }, [highlightedIds, hasSelection, highlightedSubconcepts, starredIds, onStarClick, setNodes]);

  // Update edge appearance when highlighted set changes
  useEffect(() => {
    if (!hasSelection) {
      setEdges(eds => [
        ...initialEdges,
        ...eds.filter(e => e.id.startsWith('detail-edge-') || e.id.startsWith('edge-restored-')),
      ]);
      return;
    }
    setEdges(eds => [
      ...prereqEdgeData.map(e => {
        const isHighlighted = highlightedIds.has(e.source) && highlightedIds.has(e.target);
        const color = majorConcepts.find(c => c.id === e.source)?.color ?? '#64748B';
        return {
          id: `prereq-${e.source}-${e.target}`,
          source: e.source, target: e.target,
          sourceHandle: 'top', targetHandle: 'bottom',
          type: 'dashed',
          animated: isHighlighted,
          style: {
            stroke: isHighlighted ? color : '#CBD5E1',
            strokeWidth: isHighlighted ? 5 : 4,
            strokeDasharray: isHighlighted ? undefined : '5 3',
            opacity: isHighlighted ? 1 : 0.2,
          },
          markerEnd: { type: MarkerType.ArrowClosed, color: isHighlighted ? color : '#CBD5E1' },
        };
      }),
      ...eds.filter(e => e.id.startsWith('detail-edge-') || e.id.startsWith('edge-restored-')),
    ]);
  }, [highlightedIds, hasSelection, setEdges]);

  const onNodeClick = useCallback((_e: React.MouseEvent, node: Node) => {
    if (node.type === 'detail') return;
    onConceptClick(node.id);
  }, [onConceptClick]);

  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);
    changes.forEach(change => {
      if (change.type === 'position' && change.dragging === false && change.position) {
        const node = nodesRef.current.find(n => n.id === change.id);
        if (node?.type === 'detail') {
          onDetailMoved?.(
            node.data.cardType as string,
            node.data.itemLabel as string,
            change.position.x,
            change.position.y,
          );
        }
      }
    });
  }, [onNodesChange, onDetailMoved]);

  return (
    <DeleteDetailContext.Provider value={handleDeleteDetail}>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <div style={{
          position: 'absolute', alignItems: 'flex-end',
          top: 12, right: 12, zIndex: 10,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <ResetButton onReset={handleReset} />
          <LevelLegend />
        </div>
        <ReactFlow
          nodes={nodes} edges={edges}
          onNodesChange={handleNodesChange} 
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          nodesConnectable={false}
          onNodeClick={onNodeClick}
          onInit={(instance: ReactFlowInstance<Node, Edge>) => { rfInstance.current = instance; }}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView fitViewOptions={{ padding: 0.08 }} minZoom={0.1}
        >
          <Controls />
          <Background variant={BackgroundVariant.Dots} color='#1E293B' gap={20} />
        </ReactFlow>
      </div>
    </DeleteDetailContext.Provider>
  );
}