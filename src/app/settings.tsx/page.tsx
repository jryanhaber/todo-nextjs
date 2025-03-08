// app/settings/page.tsx
'use client';
import ImportExport from '@/components/ImportExport';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="settings-page">
      <header className="settings-header">
        <h1>Settings</h1>
        <Link href="/dashboard">Back to Dashboard</Link>
      </header>

      <div className="settings-content">
        <ImportExport />

        <div className="settings-section">
          <h2>Local Storage</h2>
          <p>Currently using local storage only. No sign-in required.</p>
          <p>Your data is stored in your browser and will not sync across devices.</p>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="danger-button"
          >
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
}
