import dagre from '@dagrejs/dagre';
import { type Node, type Edge, MarkerType, Position } from '@xyflow/react';
import { majorConcepts, prereqEdgeData } from '../data/conceptGraph';

const MAJOR_W  = 220;
const HEADER_H = 38;
const SUB_ROW_H = 34;

export function buildGraphElements(): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'BT', ranksep: 160, nodesep: 16 });

  majorConcepts.forEach(c => {
    const rows = c.subconcepts.length;
    const h = HEADER_H + rows * SUB_ROW_H + 4;   // +4 for border gaps
    g.setNode(c.id, { width: MAJOR_W, height: h });
  });

  prereqEdgeData.forEach(e => g.setEdge(e.source, e.target));
  dagre.layout(g);

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  majorConcepts.forEach(concept => {
    const { x, y, width, height } = g.node(concept.id);
    nodes.push({
      id: concept.id,
      type: 'major',
      position: { x: x - width / 2, y: y - height / 2 },
      data: {
        label: concept.label,
        color: concept.color,
        subconcepts: concept.subconcepts,
      },
      sourcePosition: Position.Top,
      targetPosition: Position.Bottom,
    });
  });

  prereqEdgeData.forEach(e => edges.push({
    id: `prereq-${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    sourceHandle: 'top',
    targetHandle: 'bottom',
    type: 'dashed',
    style: { stroke:  majorConcepts.find(c => c.id === e.source)?.color, strokeWidth: 2},
    markerEnd: { type: MarkerType.ArrowClosed, color: majorConcepts.find(c => c.id === e.source)?.color},

  }));

  return { nodes, edges };
}