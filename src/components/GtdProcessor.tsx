// components/GtdProcessor.tsx
import { useState } from 'react';
import { WorkflowItem, GtdStage } from '../lib/types';
import { saveItem } from '../lib/data-store';

interface GtdProcessorProps {
  item: WorkflowItem;
  onClose: () => void;
  onProcessed: () => void;
}

export default function GtdProcessor({ item, onClose, onProcessed }: GtdProcessorProps) {
  const [step, setStep] = useState<'actionable' | 'nonActionable' | 'twoMinute' | 'delegation'>(
    'actionable'
  );
  const [delegateName, setDelegateName] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [delegateNotes, setDelegateNotes] = useState('');

  const handleActionableResponse = async (isActionable: boolean) => {
    if (isActionable) {
      setStep('twoMinute');
    } else {
      setStep('nonActionable');
    }
  };

  const handleNonActionableOption = async (option: 'trash' | 'reference' | 'someday') => {
    try {
      switch (option) {
        case 'trash':
          // Delete the item
          // Implementation depends on your delete method
          break;
        case 'reference':
          await saveItem({
            ...item,
            gtdStage: 'reference',
            systemTags: [...(item.systemTags || []), 'gtd:reference']
          });
          break;
        case 'someday':
          await saveItem({
            ...item,
            gtdStage: 'someday',
            systemTags: [...(item.systemTags || []), 'gtd:someday']
          });
          break;
      }
      onProcessed();
    } catch (error) {
      console.error('Error processing non-actionable item:', error);
    }
  };

  const handleTwoMinuteResponse = async (canDoQuickly: boolean) => {
    if (canDoQuickly) {
      // Mark as completed
      await saveItem({
        ...item,
        gtdStage: 'completed',
        type: 'completed',
        systemTags: [...(item.systemTags || []), 'gtd:completed', 'gtd:two-minute-rule']
      });
      onProcessed();
    } else {
      setStep('delegation');
    }
  };

  const handleDelegationResponse = async (selfOrOther: 'self' | 'other') => {
    if (selfOrOther === 'self') {
      // Mark as next action
      await saveItem({
        ...item,
        gtdStage: 'next-actions',
        systemTags: [...(item.systemTags || []), 'gtd:next-action']
      });
      onProcessed();
    } else {
      // Show delegation details form
      setStep('delegation');
    }
  };

  const handleDelegationSave = async () => {
    if (!delegateName) {
      alert('Please enter who you are waiting for');
      return;
    }

    try {
      await saveItem({
        ...item,
        gtdStage: 'waiting-for',
        type: 'waiting',
        systemTags: [...(item.systemTags || []), 'gtd:waiting-for'],
        waitingFor: delegateName,
        waitingUntil: followUpDate,
        text: delegateNotes
          ? `${
              item.text || ''
            }\n\nWaiting for: ${delegateName}\nFollow up: ${followUpDate}\nNotes: ${delegateNotes}`
          : item.text
      });
      onProcessed();
    } catch (error) {
      console.error('Error saving delegation:', error);
    }
  };

  return (
    <div className="gtd-processor">
      <div className="gtd-processor-header">
        <h2>GTD Processing</h2>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>

      {step === 'actionable' && (
        <div className="gtd-step">
          <h3>Is this item actionable?</h3>
          <p>Does "{item.title}" require any action to be taken?</p>

          <div className="gtd-question-preview">
            <div className="preview-info">
              <div className="preview-title">{item.title}</div>
              <div className="preview-text">{item.text || 'No description'}</div>
            </div>
          </div>

          <div className="gtd-actions">
            <button className="gtd-btn yes-btn" onClick={() => handleActionableResponse(true)}>
              Yes, it's actionable
            </button>
            <button className="gtd-btn no-btn" onClick={() => handleActionableResponse(false)}>
              No, it's not actionable
            </button>
          </div>
        </div>
      )}

      {step === 'nonActionable' && (
        <div className="gtd-step">
          <h3>What should be done with this non-actionable item?</h3>

          <div className="gtd-actions">
            <button
              className="gtd-btn trash-btn"
              onClick={() => handleNonActionableOption('trash')}
            >
              <span className="btn-icon">🗑️</span>
              <span className="btn-label">Trash it</span>
              <span className="btn-desc">No longer needed</span>
            </button>

            <button
              className="gtd-btn reference-btn"
              onClick={() => handleNonActionableOption('reference')}
            >
              <span className="btn-icon">📚</span>
              <span className="btn-label">Reference</span>
              <span className="btn-desc">Keep for information</span>
            </button>

            <button
              className="gtd-btn someday-btn"
              onClick={() => handleNonActionableOption('someday')}
            >
              <span className="btn-icon">🔮</span>
              <span className="btn-label">Someday/Maybe</span>
              <span className="btn-desc">Might do it later</span>
            </button>
          </div>

          <button className="gtd-btn back-btn" onClick={() => setStep('actionable')}>
            ← Back
          </button>
        </div>
      )}

      {step === 'twoMinute' && (
        <div className="gtd-step">
          <h3>Can it be done in less than 2 minutes?</h3>

          <div className="gtd-actions">
            <button className="gtd-btn yes-btn" onClick={() => handleTwoMinuteResponse(true)}>
              Yes, do it now
            </button>

            <button className="gtd-btn no-btn" onClick={() => handleTwoMinuteResponse(false)}>
              No, will take longer
            </button>
          </div>

          <button className="gtd-btn back-btn" onClick={() => setStep('actionable')}>
            ← Back
          </button>
        </div>
      )}

      {step === 'delegation' && (
        <div className="gtd-step">
          <h3>Delegate to someone else</h3>

          <div className="delegation-form">
            <div className="form-group">
              <label htmlFor="delegate-name">Who are you waiting for?</label>
              <input
                type="text"
                id="delegate-name"
                value={delegateName}
                onChange={(e) => setDelegateName(e.target.value)}
                placeholder="Enter name or email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="delegate-until">Follow up date</label>
              <input
                type="date"
                id="delegate-until"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="delegate-notes">Notes (optional)</label>
              <textarea
                id="delegate-notes"
                value={delegateNotes}
                onChange={(e) => setDelegateNotes(e.target.value)}
                placeholder="Notes about what you're waiting for"
              />
            </div>
          </div>

          <div className="gtd-actions">
            <button className="gtd-btn delegate-save-btn" onClick={handleDelegationSave}>
              Save as Waiting For
            </button>
          </div>

          <button className="gtd-btn back-btn" onClick={() => setStep('twoMinute')}>
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
