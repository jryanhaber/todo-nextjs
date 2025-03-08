// components/ItemDetailView.tsx
import { useState } from 'react';
import { WorkflowItem } from '../lib/types';
import TagManager from './TagManager';

interface ItemDetailViewProps {
  item: WorkflowItem;
  onClose: () => void;
  onSave: (updatedItem: WorkflowItem) => void;
}

export default function ItemDetailView({ item, onClose, onSave }: ItemDetailViewProps) {
  const [itemText, setItemText] = useState(item.text || '');
  const [itemType, setItemType] = useState(item.type);
  const [itemTags, setItemTags] = useState(item.tags || []);

  const handleSave = () => {
    const updatedItem: WorkflowItem = {
      ...item,
      text: itemText,
      type: itemType,
      tags: itemTags,
      updatedAt: new Date().toISOString()
    };

    onSave(updatedItem);
  };

  return (
    <div className="item-detail-overlay">
      <div className="item-detail-view">
        <div className="detail-header">
          <h2>{item.title || 'Item Detail'}</h2>
          <button className="close-detail-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="detail-content">
          <div className="detail-left">
            <div className="detail-screenshot">
              <img src={item.screenshot || '/assets/placeholder.png'} alt="Screenshot" />
            </div>

            <div className="detail-url">
              <a
                href={item.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="open-url-btn"
              >
                {item.url || 'No URL'}
              </a>
            </div>
          </div>

          <div className="detail-right">
            <div className="detail-section">
              <label htmlFor="detail-text">Description</label>
              <textarea
                id="detail-text"
                className="detail-text"
                value={itemText}
                onChange={(e) => setItemText(e.target.value)}
              />
            </div>

            <div className="detail-section">
              <label htmlFor="detail-status">Status</label>
              <select
                id="detail-status"
                value={itemType}
                onChange={(e) => setItemType(e.target.value as WorkflowItem['type'])}
              >
                <option value="todo">Todo</option>
                <option value="inprogress">In Progress</option>
                <option value="waiting">Waiting For</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="detail-section">
              <label>Tags</label>
              <TagManager initialTags={itemTags} onChange={setItemTags} />
            </div>

            {item.gtdStage && (
              <div className="detail-section">
                <label>GTD Stage</label>
                <div className="gtd-stage-badge">{item.gtdStage}</div>
              </div>
            )}

            {item.waitingFor && (
              <div className="detail-section">
                <label>Waiting For</label>
                <div className="waiting-info">
                  <div>{item.waitingFor}</div>
                  {item.waitingUntil && (
                    <div className="waiting-until">Follow up: {item.waitingUntil}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="detail-actions">
          <button onClick={handleSave} className="btn btn-primary">
            Save Changes
          </button>
          <button onClick={onClose} className="btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
