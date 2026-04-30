import { useState, useEffect, useRef } from 'react';
import type { Question } from '../api/client';

interface QuestionSearchProps {
  questions: Question[];
  selectedQuestionId: string;
  onSelect: (id: string) => void;
  disabled: boolean;
}

export default function QuestionSearch({ questions, selectedQuestionId, onSelect, disabled }: QuestionSearchProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen]         = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset when the questions list changes (new assessment selected)
  useEffect(() => {
    setInputValue('');
    setIsOpen(false);
  }, [questions]);

  // Reset if question is cleared externally
  useEffect(() => {
    if (!selectedQuestionId) setInputValue('');
  }, [selectedQuestionId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  }, []);

  const filtered = questions.filter(q =>
    q.title.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSelect = (q: Question) => {
    setInputValue(q.title);
    setIsOpen(false);
    onSelect(q.id);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
    if (!e.target.value) onSelect('');
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '5px 10px',
    fontSize: 13,
    background: disabled ? '#E2E8F0' : '#F8FAFC',
    color: '#1E293B',
    border: '1px solid #CBD5E1',
    borderRadius: 6,
    outline: 'none',
    cursor: disabled ? 'not-allowed' : 'text',
    boxSizing: 'border-box',
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', minWidth: 240 }}>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onFocus={() => { if (!disabled) setIsOpen(true); }}
        onKeyDown={e => {
          if (e.key === 'Enter' && filtered.length > 0) handleSelect(filtered[0]);
          if (e.key === 'Escape') setIsOpen(false);
        }}
        placeholder={disabled ? 'Select assessment first…' : 'Search questions…'}
        disabled={disabled}
        style={inputStyle}
      />

      {isOpen && !disabled && filtered.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0, right: 0,
          background: '#fff',
          border: '1px solid #E2E8F0',
          borderRadius: 6,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          zIndex: 100,
          maxHeight: 260,
          overflowY: 'auto',
        }}>
          {filtered.map((q, i) => (
            <div
              key={q.id}
              onMouseDown={() => handleSelect(q)}
              style={{
                padding: '8px 12px',
                fontSize: 13,
                cursor: 'pointer',
                color: '#1E293B',
                background: q.id === selectedQuestionId ? '#EFF6FF' : '#fff',
                borderBottom: i < filtered.length - 1 ? '1px solid #F1F5F9' : 'none',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
              onMouseLeave={e => (e.currentTarget.style.background = q.id === selectedQuestionId ? '#EFF6FF' : '#fff')}
            >
              {q.title}
            </div>
          ))}
        </div>
      )}

      {isOpen && !disabled && filtered.length === 0 && inputValue && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0, right: 0,
          background: '#fff',
          border: '1px solid #E2E8F0',
          borderRadius: 6,
          padding: '8px 12px',
          fontSize: 13,
          color: '#94A3B8',
          zIndex: 100,
        }}>
          No questions match "{inputValue}"
        </div>
      )}
    </div>
  );
}