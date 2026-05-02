import { useEffect, useCallback, useState, useRef } from 'react';
import {
  ReactFlow, type ReactFlowInstance, Controls, Background, BackgroundVariant,
  useNodesState, useEdgesState, Handle, Position, MarkerType,
  type NodeProps, type NodeTypes, type Node, type Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { buildGraphElements } from '../utils/layout';
import { majorConcepts, prereqEdgeData } from '../data/conceptGraph';

interface ConceptGraphProps {
  highlightedIds: Set<string>;
  highlightedSubconcepts: Map<string, Set<string>>;
  onConceptClick: (id: string) => void;
  starredIds: Set<string>;
  onStarClick: (id: string) => void;
  onReset: () => void;
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

const nodeTypes: NodeTypes = { major: MajorNode };
const { nodes: initialNodes, edges: initialEdges } = buildGraphElements();

export default function ConceptGraph({ highlightedIds, highlightedSubconcepts, onConceptClick, starredIds, onStarClick, onReset }: ConceptGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const hasSelection = highlightedIds.size > 0;

  const rfInstance = useRef<ReactFlowInstance<Node, Edge> | null>(null);

  const handleReset = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    onReset();
    setTimeout(() => rfInstance.current?.fitView({ padding: 0.08 }), 50);
  }, [onReset, setNodes, setEdges]);

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
    if (!hasSelection) { setEdges(initialEdges); return; }
    setEdges(prereqEdgeData.map(e => {
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
    }));
  }, [highlightedIds, hasSelection, setEdges]);

  const onNodeClick = useCallback((_e: React.MouseEvent, node: Node) => {
    onConceptClick(node.id);
  }, [onConceptClick]);

  return (
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
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        nodesConnectable={false}
        onNodeClick={onNodeClick}
        onInit={(instance: ReactFlowInstance<Node, Edge>) => { rfInstance.current = instance; }}
        fitView fitViewOptions={{ padding: 0.08 }} minZoom={0.1}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} color='#1E293B' gap={20} />
      </ReactFlow>
    </div>
  );
}
