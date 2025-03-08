// components/ImportExport.tsx
'use client';
import { useState } from 'react';
import { saveItem } from '../lib/local-store';
import { WorkflowItem } from '../lib/types';

export default function ImportExport() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatus('Reading file...');

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        throw new Error('Invalid data format. Expected an array of items.');
      }

      setStatus(`Importing ${data.length} items...`);

      // Import items one by one
      for (const item of data) {
        await saveItem(item as WorkflowItem);
      }

      setStatus(`Successfully imported ${data.length} items!`);

      // Reload the page to show new items
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Import error:', error);
      setStatus(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    setLoading(true);
    setStatus('Exporting data...');

    try {
      const items = localStorage.getItem('workflowItems') || '[]';

      // Create a download link
      const blob = new Blob([items], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workflow-items-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus('Export complete!');
    } catch (error) {
      setStatus(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="import-export-container">
      <h2>Import/Export Data</h2>

      {status && <div className="status-message">{status}</div>}

      <div className="import-export-buttons">
        <div className="import-section">
          <label className="file-input-label">
            <input type="file" accept=".json" onChange={handleImport} disabled={loading} />
            <span>{loading ? 'Processing...' : 'Import Data'}</span>
          </label>
        </div>

        <div className="export-section">
          <button onClick={handleExport} disabled={loading} className="export-button">
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
}
