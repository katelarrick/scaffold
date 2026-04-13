import {
  ReactFlow, Controls, MiniMap, Background, BackgroundVariant,
  useNodesState, useEdgesState, Handle, Position,
  type NodeProps, type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { buildGraphElements } from '../utils/layout';

function MajorNode({ data }: NodeProps) {
  const color       = data.color as string;
  const label       = data.label as string;
  const subconcepts = data.subconcepts as string[];

  return (
    <div style={{
      width: 220,
      borderRadius: 10,
      overflow: 'hidden',
      boxShadow: '0 3px 12px rgba(0,0,0,0.18)',
      border: `2px solid ${color}`,
    }}>
      <Handle id="bottom" type="target" position={Position.Bottom}
        style={{ opacity: 0, pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{
        background: color,
        color: '#fff',
        padding: '9px 14px',
        textAlign: 'center',
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: '0.01em',
      }}>
        {label}
      </div>

      {/* Subconcept grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr', 
        gap: 1,
        background: `${color}55`,   // colored 1px gap between cells
        padding: 1,
      }}>
        {subconcepts.map((sub, i) => (
          <div key={i} style={{
            background: '#ffffff',
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

export default function ConceptGraph() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div style={{ width: '100vw', height: '50vw', background: '#F1F5F9' }}>
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        nodesConnectable={false}
        fitView fitViewOptions={{ padding: 0.08 }} minZoom={0.1}
      >
        <Controls />
        <MiniMap
          nodeColor={n => (n.data?.color as string) ?? '#ccc'}
          style={{ background: '#fff', border: '1px solid #E2E8F0' }}
        />
        <Background variant={BackgroundVariant.Dots} color="#CBD5E1" gap={20} />
      </ReactFlow>
    </div>
  );
}