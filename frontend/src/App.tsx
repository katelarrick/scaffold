import { useState, useEffect } from 'react';
import ConceptGraph from './components/ConceptGraph';
import { fetchAssessments, fetchQuestions, fetchQuestionConcepts } from './api/client';
import type { Assessment, Question } from './api/client';
import { majorConcepts, prereqEdgeData } from './data/conceptGraph';

// Walk the prereq graph upward from tagged concepts to include all ancestors
function computeSubgraph(taggedIds: string[]): Set<string> {
  const result = new Set<string>(taggedIds);
  let changed = true;
  while (changed) {
    changed = false;
    for (const { source, target } of prereqEdgeData) {
      if (result.has(target) && !result.has(source)) {
        result.add(source);
        changed = true;
      }
    }
  }
  return result;
}

const selectStyle: React.CSSProperties = {
  background: '#334155', color: '#fff',
  border: '1px solid #475569', borderRadius: 6,
  padding: '5px 10px', fontSize: 13, cursor: 'pointer', minWidth: 200,
};

const btnStyle: React.CSSProperties = {
  background: '#334155', color: '#fff',
  border: '1px solid #475569', borderRadius: 6,
  padding: '6px 16px', fontSize: 13, cursor: 'pointer', marginRight: 8,
};

export default function App() {
  const [assessments, setAssessments]               = useState<Assessment[]>([]);
  const [questions, setQuestions]                   = useState<Question[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');
  const [selectedQuestionId, setSelectedQuestionId]     = useState('');
  const [highlightedIds, setHighlightedIds]         = useState<Set<string>>(new Set());
  const [selectedConceptId, setSelectedConceptId]   = useState<string | null>(null);

  useEffect(() => { fetchAssessments().then(setAssessments); }, []);

  useEffect(() => {
    if (!selectedAssessmentId) { setQuestions([]); return; }
    fetchQuestions(selectedAssessmentId).then(setQuestions);
    setSelectedQuestionId('');
    setHighlightedIds(new Set());
    setSelectedConceptId(null);
  }, [selectedAssessmentId]);

  useEffect(() => {
    if (!selectedQuestionId) { setHighlightedIds(new Set()); return; }
    fetchQuestionConcepts(selectedQuestionId).then(concepts => {
      setHighlightedIds(computeSubgraph(concepts.map(c => c.concept_id)));
    });
    setSelectedConceptId(null);
  }, [selectedQuestionId]);

  const selectedConcept = selectedConceptId
    ? majorConcepts.find(c => c.id === selectedConceptId)
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh' }}>

      {/* ── Top bar ── */}
      <div style={{
        height: 52, flexShrink: 0,
        background: '#1E293B',
        display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px',
      }}>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 16, marginRight: 4 }}>Scaffold</span>
        <select value={selectedAssessmentId} onChange={e => setSelectedAssessmentId(e.target.value)} style={selectStyle}>
          <option value="">Select assessment…</option>
          {assessments.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select
          value={selectedQuestionId}
          onChange={e => setSelectedQuestionId(e.target.value)}
          disabled={!selectedAssessmentId || questions.length === 0}
          style={{ ...selectStyle, opacity: !selectedAssessmentId ? 0.5 : 1 }}
        >
          <option value="">Select question…</option>
          {questions.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
        </select>
      </div>

      {/* ── Graph ── */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <ConceptGraph
          highlightedIds={highlightedIds}
          onConceptClick={setSelectedConceptId}
        />
      </div>

      {/* ── Bottom toolbar ── */}
      <div style={{
        height: 60, flexShrink: 0,
        background: '#1E293B',
        display: 'flex', alignItems: 'center', padding: '0 20px',
      }}>
        {selectedConcept ? (
          <>
            <span style={{ color: '#94A3B8', fontSize: 12, marginRight: 12 }}>Hints for</span>
            <span style={{
              color: '#fff', fontWeight: 700, fontSize: 14, marginRight: 20,
              padding: '3px 10px', borderRadius: 4,
              background: selectedConcept.color,
            }}>
              {selectedConcept.label}
            </span>
            {[1, 2, 3, 4].map(level => (
              <button key={level} style={btnStyle}>Hint {level}</button>
            ))}
          </>
        ) : (
          <span style={{ color: '#475569', fontSize: 13 }}>
            {selectedQuestionId
              ? 'Click a highlighted concept card to get hints.'
              : 'Select an assessment and question to begin.'}
          </span>
        )}
      </div>

    </div>
  );
}