import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type NodeProps,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { buildGraphElements } from '../utils/layout';

function MajorNode({ data }: NodeProps) {
  const color = data.color as string;
  return (
    <div style={{
      width: 200, background: color, color: '#fff',
      borderRadius: 10, padding: '10px 16px',
      textAlign: 'center', fontSize: 13, fontWeight: 700,
      lineHeight: 1.35, whiteSpace: 'pre-line',
      boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
    }}>
      <Handle id="bottom" type="target" position={Position.Bottom}
        style={{ opacity: 0, background: '#ffffff80', border: 'none', width: 8, height: 8 }} />
      {data.label as string}
      <Handle id="top" type="source" position={Position.Top}
        style={{ opacity: 0, background: '#ffffff80', border: 'none', width: 8, height: 8 }} />
      <Handle id="right" type="source" position={Position.Right}
        style={{ opacity: 0, background: '#ffffff80', border: 'none', width: 6, height: 6 }} />
    </div>
  );
}

function SubNode({ data }: NodeProps) {
  const color = data.color as string;
  return (
    <div style={{
      width: 168, background: `${color}18`, color: '#1E293B',
      border: `1.5px solid ${color}70`, borderRadius: 6,
      padding: '5px 10px', textAlign: 'center',
      fontSize: 11, fontWeight: 500, lineHeight: 1.3,
      whiteSpace: 'pre-line',
    }}>
      <Handle id="left" type="target" position={Position.Left}
        style={{ opacity: 0, width: 6, height: 6 }} />
      {data.label as string}
    </div>
  );
}

const nodeTypes: NodeTypes = { major: MajorNode, sub: SubNode };
const { nodes: initialNodes, edges: initialEdges } = buildGraphElements();

export default function ConceptGraph() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div style={{ width: '50vw', height: '100vw', maxHeight: '100vh', background: '#F1F5F9' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        nodesConnectable={false}
        fitView
        fitViewOptions={{ padding: 0.08 }}
        minZoom={0.1}
      >
        <Controls />
        <MiniMap
          nodeColor={n => n.type === 'major' ? (n.data?.color as string) : `${n.data?.color as string}40`}
          style={{ background: '#fff', border: '1px solid #E2E8F0' }}
        />
        <Background variant={BackgroundVariant.Dots} color="#64748B" gap={20} />
      </ReactFlow>
    </div>
  );
}