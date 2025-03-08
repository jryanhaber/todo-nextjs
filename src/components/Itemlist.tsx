import { WorkflowItem, ItemAction } from '../lib/types';

interface ItemListProps {
  items: WorkflowItem[];
  onAction: (action: ItemAction, id: number, item: WorkflowItem) => void;
}

export default function ItemList({ items, onAction }: ItemListProps) {
  if (!items || items.length === 0) {
    return (
      <div className="empty-state">
        <h3>No items found</h3>
        <p>Capture your first item to get started</p>
      </div>
    );
  }

  return (
    <div className="items-list">
      {items.map((item) => (
        <div key={item.id} className={`list-item ${item.type}-type`} data-id={item.id}>
          <div className="item-thumbnail">
            <img src={item.screenshot || '/assets/placeholder.png'} alt="" />
          </div>
          <div className="item-summary">
            <div className="item-title">{item.title}</div>
            <div className="item-text">{item.text || 'No description'}</div>
          </div>
          <div className="item-actions">
            <button onClick={() => onAction('open', item.id, item)}>Open</button>
            <button onClick={() => onAction('edit', item.id, item)}>Edit</button>
            <button onClick={() => onAction('delete', item.id, item)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
