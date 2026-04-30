import { useState, useEffect } from 'react';
import ConceptGraph from './components/ConceptGraph';
import { fetchAssessments, fetchQuestions, fetchQuestionConcepts } from './api/client';
import type { Assessment, Question } from './api/client';
import { majorConcepts, prereqEdgeData } from './data/conceptGraph';
import ConsentScreen from './components/ConsentScreen';
import QuestionSearch from './components/QuestionSearch';

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
  background: '#fff', color: '#000000',
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
  const [_isTracked, setIsTracked]     = useState(false);
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());


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

  const handleStarClick = (id: string) => {
    setStarredIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (!studentPin) {
    return <ConsentScreen onComplete={handleConsentComplete} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', color: '#f7ede1' }}>

      {/* ── Top bar ── */}
      <div style={{
        height: 52, flexShrink: 0,
        background: '#f4e87b',
        display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px',
      }}>
        <span style={{ color: '#1E293B', fontWeight: 1000, fontFamily: 'Helvetica, Arial, sans-serif', letterSpacing: '0.02em', fontSize: 25, marginRight: 4 }}>Scaffold</span>
        <select value={selectedAssessmentId} onChange={e => setSelectedAssessmentId(e.target.value)} style={selectStyle}>
          <option value="">Select assessment…</option>
          {assessments.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <QuestionSearch
          questions={questions}
          selectedQuestionId={selectedQuestionId}
          onSelect={setSelectedQuestionId}
          disabled={!selectedAssessmentId || questions.length === 0}
        />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginLeft: 'auto',
          paddingRight: 0,
        }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            borderTop:    '1.5px solid #1E293B',
            borderLeft:   '1.5px solid #1E293B',
            borderRight:  '4px solid #1E293B',
            borderBottom: '4px solid #1E293B',
            background: '#FACC15',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24"
              fill="#1E293B" stroke="#1E293B" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <span style={{
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontSize: 'clamp(11px, 2vw, 16px)',
            fontWeight: 700,
            color: '#1E293B',
            letterSpacing: '0.03em',
            whiteSpace: 'nowrap',
          }}>
            {starredIds.size} / 20
          </span>
        </div>
      </div>

      {/* ── Graph ── */}
      <div style={{ flex: 1, minHeight: 0, background: '#ffffff' }}>
        <ConceptGraph
          highlightedIds={highlightedIds}
          highlightedSubconcepts={highlightedSubconcepts}
          onConceptClick={setSelectedConceptId}
          starredIds={starredIds}
          onStarClick={handleStarClick}
        />
      </div>

      {/* ── Bottom toolbar ── */}
      <div style={{
        flexShrink: 0,
        background: '#f4e87b',
        padding: '12px 20px',
        minHeight: 60,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}>
        {selectedConcept ? (
          <>
            {/* Existing content — concept label + buttons + content area */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{
                  background: selectedConcept.color, color: '#000000',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  letterSpacing: '0.03em',
                  fontWeight: 700, fontSize: 13,
                  border: '1px solid #000000',
                  padding: '3px 10px', borderRadius: 4, marginRight: 6,
                }}>
                  {selectedConcept.label}
                </span>
                {(['description', 'example', 'practice'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(activeTab === tab ? null : tab)}
                    style={{
                      background: activeTab === tab ? selectedConcept.color : '#ffffff',
                      color: activeTab === tab ? '#000000' : '#1E293B',
                      border: `1px solid #000000`,
                      borderRadius: 6, padding: '5px 14px',
                      fontSize: 13, cursor: 'pointer', fontWeight: 500,
                    }}
                  >
                    {tab === 'description' && 'Show Description'}
                    {tab === 'example'     && 'Get Example'}
                    {tab === 'practice'    && 'Practice with a PrairieLearn question'}
                  </button>
                ))}
              </div>

              {activeTab && (
                <div style={{
                  marginTop: 12, padding: '10px 14px',
                  background: '#ffffff', borderRadius: 8,
                  border: '1px solid #000000',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  fontSize: 13, color: '#1E293B', lineHeight: 1.6, minHeight: 60,
                }}>
                  {activeTab === 'description' && `Description for "${selectedConcept.label}" will appear here.`}
                  {activeTab === 'example'     && `Example for "${selectedConcept.label}" will appear here.`}
                  {activeTab === 'practice'    && `PrairieLearn practice question for "${selectedConcept.label}" will appear here.`}
                </div>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={() => { setSelectedConceptId(null); setActiveTab(null); }}
              style={{
                background: 'none', border: 'none',
                cursor: 'pointer', color: '#000000',
                fontSize: 20, lineHeight: 1,
                padding: '0 4px', flexShrink: 0,
              }}
              title="Close"
            >
              ✕
            </button>
          </>
        ) : (
          <div style={{ color: '#000000', fontSize: 13, lineHeight: '36px' }}>
            {selectedQuestionId
              ? 'Click a concept card to explore it.'
              : 'Select a question, or click any concept card to explore it.'}
          </div>
        )}
      </div>

    </div>
  );
}