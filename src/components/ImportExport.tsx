// components/ImportExport.tsx
import { useState } from 'react';
import { importItems } from '../lib/data-store';
import { WorkflowItem } from '../lib/types';

export default function ImportExport() {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [status, setStatus] = useState('');

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setStatus('Reading file...');

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        throw new Error('Invalid data format. Expected an array of items.');
      }

      setStatus(`Importing ${data.length} items...`);

      // Process items in batches to avoid overwhelming the system
      const batchSize = 20;
      const batches = Math.ceil(data.length / batchSize);

      for (let i = 0; i < batches; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, data.length);
        const batch = data.slice(start, end);

        setStatus(`Importing batch ${i + 1}/${batches}...`);
        await importItems(batch as WorkflowItem[]);
      }

      setStatus('Import complete!');
    } catch (error) {
      console.error('Import error:', error);
      setStatus(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setStatus('Preparing data for export...');

    try {
      // Load all items
      const { fetchItems } = await import('../lib/data-store');
      const items = await fetchItems();

      // Create JSON file
      const json = JSON.stringify(items, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `workflow-items-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus('Export complete!');
    } catch (error) {
      console.error('Export error:', error);
      setStatus(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="import-export">
      <h2>Import/Export Data</h2>

      {status && <div className="status-message">{status}</div>}

      <div className="import-export-actions">
        <div className="import-section">
          <h3>Import from Chrome Extension</h3>
          <p>Import data from a JSON file exported from the Chrome extension.</p>

          <label className="file-input-label">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={importing || exporting}
            />
            <span>{importing ? 'Importing...' : 'Choose File'}</span>
          </label>
        </div>

        <div className="export-section">
          <h3>Export Data</h3>
          <p>Export your data as a JSON file.</p>

          <button onClick={handleExport} disabled={importing || exporting} className="export-btn">
            {exporting ? 'Exporting...' : 'Export Data'}
          </button>
        </div>
      </div>
    </div>
  );
}
