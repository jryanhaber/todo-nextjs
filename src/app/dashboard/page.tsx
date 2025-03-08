// app/dashboard/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
// import { fetchItems, deleteItem, saveItem } from '../../lib/data-store';
import { fetchItems, deleteItem, saveItem } from '../../lib/local-store';
import Link from 'next/link';

import { subscribeToDataChanges } from '../../lib/event-emitter';
import Sidebar from '../../components/Sidebar';
import ItemCard from '../../components/ItemCard';
import ItemList from '../../components/ItemList';
import ItemDetailView from '../../components/ItemDetailView';
import GtdProcessor from '../../components/GtdProcessor';
import { WorkflowItem, ItemFilters, ViewMode, ItemAction } from '../../lib/types';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<WorkflowItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WorkflowItem[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<WorkflowItem | null>(null);
  const [showGtdProcessor, setShowGtdProcessor] = useState(false);

  useEffect(() => {
    // Load initial preferences
    const storedViewMode = (localStorage.getItem('preferredView') as ViewMode) || 'card';
    setViewMode(storedViewMode);

    // Get filter from URL if present
    const filterParam = searchParams.get('filter');
    if (filterParam) {
      setCurrentFilter(filterParam);
    }

    loadItems();

    // Subscribe to data changes
    const unsubscribe = subscribeToDataChanges('items-changed', () => loadItems());
    return () => unsubscribe();
  }, [searchParams]);

  const loadItems = async () => {
    const allItems = await fetchItems();
    setItems(allItems);
    applyFilters(allItems, currentFilter, searchTerm);
  };

  const applyFilters = (itemsToFilter: WorkflowItem[], filter: string, search: string) => {
    let filtered = [...itemsToFilter];

    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter((item) => item.type === filter);
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          (item.title && item.title.toLowerCase().includes(searchLower)) ||
          (item.text && item.text.toLowerCase().includes(searchLower)) ||
          (item.tags && item.tags.some((tag) => tag.toLowerCase().includes(searchLower)))
      );
    }

    setFilteredItems(filtered);
  };

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
    applyFilters(items, filter, searchTerm);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyFilters(items, currentFilter, value);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('preferredView', mode);
  };

  const handleItemAction = async (action: ItemAction, id: number, item: WorkflowItem) => {
    switch (action) {
      case 'open':
        window.open(item.url, '_blank');
        break;
      case 'edit':
        setSelectedItem(item);
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this item?')) {
          await deleteItem(id);
          await loadItems();
        }
        break;
      case 'process':
        setSelectedItem(item);
        setShowGtdProcessor(true);
        break;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>WorkflowCapture</h1>
        <Link href="/settings" className="settings-link">
          Settings
        </Link>

        <div className="filter-controls">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${currentFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${currentFilter === 'todo' ? 'active' : ''}`}
              onClick={() => handleFilterChange('todo')}
            >
              <span className="status-dot todo-dot"></span>Todo
            </button>
            {/* Other filter buttons... */}
          </div>

          <div className="search-container">
            <input
              type="text"
              id="search-input"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'card' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('card')}
            >
              Cards
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('list')}
            >
              List
            </button>
          </div>
        </div>
      </header>

      <main className="app-content">
        <Sidebar />

        <div className="items-container">
          {viewMode === 'card' ? (
            <div className="items-grid">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} onAction={handleItemAction} />
              ))}
            </div>
          ) : (
            <ItemList items={filteredItems} onAction={handleItemAction} />
          )}
        </div>
      </main>

      {selectedItem && !showGtdProcessor && (
        <ItemDetailView
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSave={async (updatedItem) => {
            await saveItem(updatedItem);
            setSelectedItem(null);
            await loadItems();
          }}
        />
      )}

      {showGtdProcessor && selectedItem && (
        <GtdProcessor
          item={selectedItem}
          onClose={() => {
            setShowGtdProcessor(false);
            setSelectedItem(null);
          }}
          onProcessed={async () => {
            setShowGtdProcessor(false);
            setSelectedItem(null);
            await loadItems();
          }}
        />
      )}
    </div>
  );
}
