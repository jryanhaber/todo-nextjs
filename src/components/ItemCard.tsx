import { useState } from 'react';
import Image from 'next/image';
import { WorkflowItem, ItemAction } from '../lib/types';

interface ItemCardProps {
  item: WorkflowItem;
  onAction: (action: ItemAction, id: number, item: WorkflowItem) => void;
}

export default function ItemCard({ item, onAction }: ItemCardProps) {
  const [expanded, setExpanded] = useState(false);

  const statusLabel: Record<string, string> = {
    todo: 'To Do',
    inprogress: 'In Progress',
    waiting: 'Waiting For',
    completed: 'Completed'
  };

  return (
    <div className={`item-card ${item.type}-type`} data-id={item.id}>
      <div className="item-screenshot">
        <Image
          src={item.screenshot || '/assets/placeholder.png'}
          alt="Screenshot"
          width={300}
          height={200}
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="item-details">
        <div className="item-header">
          <span className={`status-badge ${item.type}`}>{statusLabel[item.type] || 'Unknown'}</span>
          <h3 className="item-title">{item.title}</h3>
        </div>
        <p className="item-text">{item.text || 'No description'}</p>

        <div className="item-meta">
          <div className="item-tags">
            {item.tags?.map((tag) => (
              <span key={tag} className="tag-chip">
                {tag}
              </span>
            ))}
          </div>
          <div className="item-date">{new Date(item.createdAt).toLocaleString()}</div>
        </div>

        <div className="item-actions">
          <button onClick={() => onAction('open', item.id, item)}>Open URL</button>
          <button onClick={() => onAction('edit', item.id, item)}>Edit</button>
          <button onClick={() => onAction('delete', item.id, item)}>Delete</button>
          {item.gtdStage === 'inbox' && (
            <button onClick={() => onAction('process', item.id, item)}>Process</button>
          )}
        </div>
      </div>
    </div>
  );
}
