import { useEffect, useCallback } from 'react';
import {
  ReactFlow, Controls, Background, BackgroundVariant,
  useNodesState, useEdgesState, Handle, Position, MarkerType,
  type NodeProps, type NodeTypes, type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { buildGraphElements } from '../utils/layout';
import { majorConcepts, prereqEdgeData } from '../data/conceptGraph';

interface ConceptGraphProps {
  highlightedIds: Set<string>;
  highlightedSubconcepts: Map<string, Set<string>>;
  onConceptClick: (id: string) => void;
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

function MajorNode({ data }: NodeProps) {
  const color       = data.color as string;
  const label       = data.label as string;
  const subconcepts = data.subconcepts as string[];
  const highlighted = data.highlighted as boolean;
  const hasSelection = data.hasSelection as boolean;
  const highlightedSubconcepts = data.highlightedSubconcepts as Set<string>;

  return (
    <div style={{
      width: 220,
      borderRadius: 10,
      overflow: 'hidden',
      border: `${highlighted ? 3 : 2}px solid ${highlighted ? color : '#CBD5E1'}`,
      boxShadow: highlighted
        ? `0 0 0 3px ${color}50, 0 4px 16px rgba(0,0,0,0.2)`
        : '0 2px 8px rgba(0,0,0,0.1)',
      opacity: hasSelection && !highlighted ? 0.25 : 1,
      cursor: highlighted ? 'pointer' : 'default',
      transition: 'opacity 0.25s, box-shadow 0.25s',
    }}>
      <Handle id="bottom" type="target" position={Position.Bottom}
        style={{ opacity: 0, pointerEvents: 'none' }} />

      <div style={{
        background: highlighted ? color : '#94A3B8',
        color: '#fff', padding: '9px 14px',
        textAlign: 'center', fontSize: 13, fontWeight: 700,
        transition: 'background 0.25s',
      }}>
        {label}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr', gap: 1,
        background: highlighted ? `${color}55` : '#CBD5E140',
        padding: 1,
      }}>
        {subconcepts.map((sub, i) => (
          <div key={i} style={{
            background: highlightedSubconcepts?.has(sub) ? toPastel(color) : '#fff',
            padding: '5px 6px',
            textAlign: 'center',
            fontSize: 10,
            fontWeight: 500,
            lineHeight: 1.3,
            color: '#1E293B',
            whiteSpace: 'pre-line',
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

export default function ConceptGraph({ highlightedIds, highlightedSubconcepts, onConceptClick }: ConceptGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const hasSelection = highlightedIds.size > 0;

  // Update node appearance when highlighted set changes
  useEffect(() => {
  setNodes(nds => nds.map(node => ({
    ...node,
    data: {
      ...node.data,
      highlighted: highlightedIds.has(node.id),
      hasSelection,
      highlightedSubconcepts: highlightedSubconcepts.get(node.id) ?? new Set(),
    },
  })));
}, [highlightedIds, hasSelection, highlightedSubconcepts, setNodes]);

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
          strokeWidth: isHighlighted ? 2.5 : 1.5,
          strokeDasharray: isHighlighted ? undefined : '5 3',
          opacity: isHighlighted ? 1 : 0.2,
        },
        markerEnd: { type: MarkerType.ArrowClosed, color: isHighlighted ? color : '#CBD5E1' },
      };
    }));
  }, [highlightedIds, hasSelection, setEdges]);

  const onNodeClick = useCallback((_e: React.MouseEvent, node: Node) => {
    if (highlightedIds.has(node.id)) onConceptClick(node.id);
  }, [highlightedIds, onConceptClick]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        nodesConnectable={false}
        onNodeClick={onNodeClick}
        fitView fitViewOptions={{ padding: 0.08 }} minZoom={0.1}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} color="#CBD5E1" gap={20} />
      </ReactFlow>
    </div>
  );
}