import { useState } from 'react';
import { validatePin } from '../api/client';

interface ConsentScreenProps {
  onComplete: (pin: string, consented: boolean) => void;
}

const sectionStyle: React.CSSProperties = {
  marginBottom: 16,
};

const headingStyle: React.CSSProperties = {
  fontWeight: 700, fontSize: 13, marginBottom: 4, color: '#1E293B',
};

const bodyStyle: React.CSSProperties = {
  fontSize: 13, color: '#334155', lineHeight: 1.65,
};

export default function ConsentScreen({ onComplete }: ConsentScreenProps) {
  const [step, setStep]       = useState<'pin' | 'consent'>('pin');
  const [pin, setPin]         = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handlePinSubmit = async () => {
    if (pin.length !== 3) return;
    setLoading(true);
    setError('');
    const valid = await validatePin(pin);
    if (valid) {
      setStep('consent');
    } else {
      setError('Invalid PIN. Please check your study ID and try again.');
    }
    setLoading(false);
  };

  // ── PIN entry ──
  if (step === 'pin') {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0ca6e9',
      }}>
        <div style={{
          background: '#fff', borderRadius: 12,
          borderTop:    `1.5px solid #1E293B`,
          borderLeft:   `1.5px solid #1E293B`,
          borderRight:  `4px solid #1E293B`,
          borderBottom: `4px solid #1E293B`,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          padding: '40px 48px', width: 360, textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 800, color: '#1E293B', marginBottom: 8 }}>
            Scaffold
          </div>
          <div style={{ fontSize: 14, color: '#64748B', marginBottom: 32 }}>
            Enter your 3-digit ID to continue.
          </div>
          <input
            type="text"
            inputMode="numeric"
            maxLength={3}
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => e.key === 'Enter' && handlePinSubmit()}
            placeholder="000"
            style={{
              width: '100%', padding: '10px 14px', fontSize: 24,
              textAlign: 'center', letterSpacing: '0.3em',
              border: '1px solid #CBD5E1', borderRadius: 8,
              outline: 'none', marginBottom: 12,
              boxSizing: 'border-box',
            }}
          />
          {error && (
            <div style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{error}</div>
          )}
          <button
            onClick={handlePinSubmit}
            disabled={pin.length !== 3 || loading}
            style={{
              width: '100%', padding: '10px 0', fontSize: 14, fontWeight: 600,
              background: pin.length === 3 ? '#1E293B' : '#CBD5E1',
              color: '#fff', border: 'none', borderRadius: 8, cursor: pin.length === 4 ? 'pointer' : 'default',
            }}
          >
            {loading ? 'Checking…' : 'Continue'}
          </button>
        </div>
      </div>
    );
  }

  // ── Consent form ──
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#F8FAFC',
    }}>
      <div style={{
        background: '#fff', borderRadius: 12,
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        width: 680, maxHeight: '88vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '24px 32px 16px', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1E293B' }}>Informed Consent to Participate</div>
          <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
            University of California, Santa Barbara — Study ID: {pin}
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', padding: '20px 32px', flex: 1 }}>
          <div style={sectionStyle}>
            <div style={bodyStyle}>
              You are being invited to participate in a research study. Please read this form carefully before deciding whether to allow your data to be used. Your participation in the course activities described below is required for extra credit, but your consent to have your data included in the research is entirely voluntary. You will receive extra credit regardless of your decision.
            </div>
          </div>

          <div style={sectionStyle}>
            <div style={headingStyle}>1. Who is conducting this study?</div>
            <div style={bodyStyle}>
              This study is conducted by Kate Larrick, a member of the CS 8 teaching staff at UC Santa Barbara, under the supervision of a faculty advisor in the UCSB Computer Science Department. The study has been reviewed and approved by the UCSB Institutional Review Board (IRB). Data management is overseen by Professor Phill Conrad (UCSB Computer Science), who is not a member of the CS 8 teaching staff. Professor Conrad holds the only copy of the mapping between student identities and study ID numbers and will not share this information with the teaching staff until after final course grades are submitted.
            </div>
          </div>

          <div style={sectionStyle}>
            <div style={headingStyle}>2. What is the purpose of this study?</div>
            <div style={bodyStyle}>
              This study examines whether an AI-assisted knowledge-graph interface — a tool called Scaffold — helps students in CS 8 develop stronger mastery of introductory Python concepts compared to completing practice problems without this type of support. Scaffold presents an interactive map of CS 8 concepts and provides structured, progressive hints when a student is stuck on a practice problem, without giving away the answer.
            </div>
          </div>

          <div style={sectionStyle}>
            <div style={headingStyle}>3. What will participation involve?</div>
            <div style={bodyStyle}>
              If you consent, your participation involves the following:<br /><br />
              <strong>Intervention 1:</strong> You will complete a set of PrairieLearn practice problems over a 72-hour window. Depending on your section, you will either have access to Scaffold during this period or complete the problems without it. You will then take a short assessment (30-minute time limit) without outside help.<br /><br />
              <strong>Intervention 2:</strong> One week later, you will repeat the process with a new set of problems. The groups will be reversed: students who used Scaffold in Intervention 1 will complete Intervention 2 without it, and vice versa.<br /><br />
              <strong>Optional Post-Study Survey:</strong> After both interventions, you may complete a short anonymous survey (~5 minutes) about your experience.<br /><br />
              Total estimated time: approximately 2–3 hours across both interventions.
            </div>
          </div>

          <div style={sectionStyle}>
            <div style={headingStyle}>4. What are the risks?</div>
            <div style={bodyStyle}>
              The risks of participating are minimal. All activities are extensions of normal course engagement. No sensitive personal information is collected. Your Scaffold activity is recorded only under a randomly assigned ID number; no names, email addresses, or student ID numbers are stored in the Scaffold system.
            </div>
          </div>

          <div style={sectionStyle}>
            <div style={headingStyle}>5. What are the benefits?</div>
            <div style={bodyStyle}>
              Direct benefits may include improved understanding of CS 8 concepts. All students who complete the course activities will receive extra credit regardless of whether they consent. The broader benefit is contributing to research on how AI tools can support student learning.
            </div>
          </div>

          <div style={sectionStyle}>
            <div style={headingStyle}>6. How will my privacy be protected?</div>
            <div style={bodyStyle}>
              You will interact with Scaffold using only a randomly assigned ID number. Your name, email address, and student ID number are never entered into the Scaffold system. The only record linking your identity to your Scaffold ID is held by Professor Phill Conrad, who is not a member of the CS 8 teaching staff and will not share this mapping until after final grades are submitted. If you do not consent, your data will be removed from all study databases before any analysis begins.
            </div>
          </div>

          <div style={sectionStyle}>
            <div style={headingStyle}>7. Is participation voluntary?</div>
            <div style={bodyStyle}>
              Your consent is entirely voluntary. You may decline or withdraw at any time without penalty or effect on your grade. All students will receive extra credit for completing the course activities regardless of their consent decision.
            </div>
          </div>

          <div style={sectionStyle}>
            <div style={headingStyle}>8. Who can I contact with questions?</div>
            <div style={bodyStyle}>
              Researcher: Kate Larrick, katelarrick@ucsb.edu<br />
              IRB Office: UCSB Human Subjects Committee, (805) 893-3807, hsc@research.ucsb.edu
            </div>
          </div>
        </div>

        {/* Consent buttons */}
        <div style={{
          padding: '16px 32px', borderTop: '1px solid #E2E8F0',
          flexShrink: 0, display: 'flex', gap: 12,
        }}>
          <button
            onClick={() => onComplete(pin, true)}
            style={{
              flex: 1, padding: '11px 0', fontSize: 14, fontWeight: 600,
              background: '#1E293B', color: '#fff',
              border: 'none', borderRadius: 8, cursor: 'pointer',
            }}
          >
            I consent to participate
          </button>
          <button
            onClick={() => onComplete(pin, false)}
            style={{
              flex: 1, padding: '11px 0', fontSize: 14, fontWeight: 600,
              background: '#fff', color: '#64748B',
              border: '1px solid #CBD5E1', borderRadius: 8, cursor: 'pointer',
            }}
          >
            I do not consent
          </button>
        </div>
      </div>
    </div>
  );
}