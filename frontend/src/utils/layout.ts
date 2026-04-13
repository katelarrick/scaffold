import dagre from '@dagrejs/dagre';
import { type Node, type Edge, MarkerType, Position } from '@xyflow/react';
import { majorConcepts, prereqEdgeData } from '../data/conceptGraph';

const MAJOR_W = 200;
const MAJOR_H = 56;
const SUB_W   = 168;
const SUB_H   = 34;
const SUB_GAP = 8;
const SUB_OFFSET_X = MAJOR_W + 10; // gap between major right edge and sub left edge

// Tell dagre each major node occupies enough horizontal space to include its sub column
const DAGRE_W = MAJOR_W + SUB_OFFSET_X + SUB_W + 10;

export function buildGraphElements(): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'BT', ranksep: 500, nodesep: 5 });

  majorConcepts.forEach(c => g.setNode(c.id, { width: DAGRE_W, height: MAJOR_H }));
  prereqEdgeData.forEach(e => g.setEdge(e.source, e.target));
  dagre.layout(g);

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  majorConcepts.forEach(concept => {
    const { x, y } = g.node(concept.id);
    // Dagre gives the center; convert to top-left corner
    const mx = x - MAJOR_W / 2;
    const my = y - MAJOR_H / 2;

    nodes.push({
      id: concept.id,
      type: 'major',
      position: { x: mx, y: my },
      data: { label: concept.label, color: concept.color },
      sourcePosition: Position.Top,
      targetPosition: Position.Bottom,
    });

    // Subconcept nodes — stacked vertically, centred on the major node's midpoint
    const n = concept.subconcepts.length;
    if (n > 0) {
      const totalH = n * SUB_H + (n - 1) * SUB_GAP;
      const startY = my + MAJOR_H / 2 - totalH / 2;

      concept.subconcepts.forEach((label, i) => {
        const subId = `${concept.id}__sub__${i}`;
        nodes.push({
          id: subId,
          type: 'sub',
          position: { x: mx + SUB_OFFSET_X, y: startY + i * (SUB_H + SUB_GAP) },
          data: { label, color: concept.color },
        });

        edges.push({
          id: `sub-${subId}`,
          source: concept.id,
          target: subId,
          sourceHandle: 'right',
          targetHandle: 'left',
          type: 'dashed',
          style: { stroke: concept.color, strokeWidth: 1.2, opacity: 0.55 },
          markerEnd: { type: MarkerType.Arrow, color: concept.color, width: 10, height: 10 },
        });
      });
    }
  });

  // Prerequisite edges between major nodes
  prereqEdgeData.forEach(e => {
    edges.push({
      id: `prereq-${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      sourceHandle: 'top',
      targetHandle: 'bottom',
      type: 'dashed',
      style: { stroke: '#64748B', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#64748B' },
    });
  });

  return { nodes, edges };
}