import { useState, useEffect } from 'react';
import ConceptGraph from './components/ConceptGraph';
import { fetchAssessments, fetchQuestions, fetchQuestionConcepts } from './api/client';
import type { Assessment, Question } from './api/client';
import { majorConcepts, prereqEdgeData } from './data/conceptGraph';
import ConsentScreen from './components/ConsentScreen';

const normalize = (s: string) => s.replace(/\\n/g, '\n');

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

// const btnStyle: React.CSSProperties = {
//   background: '#334155', color: '#fff',
//   border: '1px solid #475569', borderRadius: 6,
//   padding: '6px 16px', fontSize: 13, cursor: 'pointer', marginRight: 8,
// };

export default function App() {
  const [assessments, setAssessments]               = useState<Assessment[]>([]);
  const [questions, setQuestions]                   = useState<Question[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');
  const [selectedQuestionId, setSelectedQuestionId]     = useState('');
  const [highlightedIds, setHighlightedIds]         = useState<Set<string>>(new Set());
  const [selectedConceptId, setSelectedConceptId]   = useState<string | null>(null);
  const [highlightedSubconcepts, setHighlightedSubconcepts] = useState<Map<string, Set<string>>>(new Map());
  const [activeTab, setActiveTab] = useState<'description' | 'example' | 'practice' | null>(null);
  const [studentPin, setStudentPin]   = useState<string | null>(null);
  const [isTracked, setIsTracked]     = useState(false);


  useEffect(() => { fetchAssessments().then(setAssessments); }, []);

  useEffect(() => {
    if (!selectedAssessmentId) { setQuestions([]); return; }
    fetchQuestions(selectedAssessmentId).then(setQuestions);
    setSelectedQuestionId('');
    setHighlightedIds(new Set());
    setSelectedConceptId(null);
    setHighlightedSubconcepts(new Map());
  }, [selectedAssessmentId]);

  useEffect(() => {
    if (!selectedQuestionId) { setHighlightedIds(new Set());  setHighlightedSubconcepts(new Map()); return; }
    fetchQuestionConcepts(selectedQuestionId).then(concepts => {
      setHighlightedIds(computeSubgraph(concepts.map(c => c.concept_id)));

      const subMap = new Map<string, Set<string>>();
      concepts.forEach(c => {
        if (c.subconcept_label) {
          if (!subMap.has(c.concept_id)) subMap.set(c.concept_id, new Set());
          subMap.get(c.concept_id)!.add(normalize(c.subconcept_label));
        }
      });
      setHighlightedSubconcepts(subMap);
    });
    setSelectedConceptId(null);
  }, [selectedQuestionId]);

    //Reset activeTab when selected concept changes
    useEffect(() => {
      setActiveTab(null);
    }, [selectedConceptId]);

  const selectedConcept = selectedConceptId
    ? majorConcepts.find(c => c.id === selectedConceptId)
    : null;

  const handleConsentComplete = (pin: string, consented: boolean) => {
    setStudentPin(pin);
    setIsTracked(consented);
  };

  if (!studentPin) {
    return <ConsentScreen onComplete={handleConsentComplete} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', color: '#F8FAFC' }}>

      {/* ── Top bar ── */}
      <div style={{
        height: 52, flexShrink: 0,
        background: '#0a6efc',
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
      <div style={{ flex: 1, minHeight: 0, background: '#f2f1f1' }}>
        <ConceptGraph
          highlightedIds={highlightedIds}
          highlightedSubconcepts={highlightedSubconcepts}
          onConceptClick={setSelectedConceptId}
        />
      </div>

      {/* ── Bottom toolbar ── */}
      <div style={{
        flexShrink: 0,
        background: '#fff',
        borderTop: '1px solid #E2E8F0',
        padding: '12px 20px',
        minHeight: 60,
      }}>
        {selectedConcept ? (
          <>
            {/* Concept label + buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{
                background: selectedConcept.color, color: '#fff',
                fontWeight: 700, fontSize: 13,
                padding: '3px 10px', borderRadius: 4, marginRight: 6,
              }}>
                {selectedConcept.label}
              </span>
              {(['description', 'example', 'practice'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(activeTab === tab ? null : tab)}
                  style={{
                    background: activeTab === tab ? selectedConcept.color : '#F1F5F9',
                    color: activeTab === tab ? '#fff' : '#1E293B',
                    border: `1px solid ${activeTab === tab ? selectedConcept.color : '#E2E8F0'}`,
                    borderRadius: 6, padding: '5px 14px',
                    fontSize: 13, cursor: 'pointer', fontWeight: 500,
                  }}
                >
                  {tab === 'description' && 'Description'}
                  {tab === 'example'     && 'Code Example'}
                  {tab === 'practice'    && 'Practice with a PrairieLearn question'}
                </button>
              ))}
            </div>

            {/* Content area */}
            {activeTab && (
              <div style={{
                marginTop: 12,
                padding: '10px 14px',
                background: '#F8FAFC',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                fontSize: 13, color: '#1E293B', lineHeight: 1.6,
                minHeight: 60,
              }}>
                {activeTab === 'description' && `Description for "${selectedConcept.label}" will appear here.`}
                {activeTab === 'example'     && `Example for "${selectedConcept.label}" will appear here.`}
                {activeTab === 'practice'    && `PrairieLearn practice question for "${selectedConcept.label}" will appear here.`}
              </div>
            )}
          </>
        ) : (
          <div style={{ color: '#94A3B8', fontSize: 13, lineHeight: '36px' }}>
            {selectedQuestionId
              ? 'Click a highlighted concept card to get hints.'
              : 'Select an assessment and question to begin.'}
          </div>
        )}
      </div>

    </div>
  );
}