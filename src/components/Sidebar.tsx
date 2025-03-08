'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
// import { fetchAllTags, fetchGtdCounts } from '../lib/data-store';
import { fetchAllTags, fetchGtdCounts } from '../lib/local-store';

import { subscribeToDataChanges } from '../lib/event-emitter';
import { GtdCounts } from '../lib/types';

export default function Sidebar() {
  const pathname = usePathname();
  const [tags, setTags] = useState<string[]>([]);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [counts, setCounts] = useState<GtdCounts>({
    inbox: 0,
    'next-actions': 0,
    'waiting-for': 0,
    someday: 0,
    reference: 0,
    completed: 0
  });

  useEffect(() => {
    const loadData = async () => {
      const tagList = await fetchAllTags();
      setTags(tagList);

      const gtdCounts = await fetchGtdCounts();
      setCounts(gtdCounts);
    };

    loadData();

    // Set up listener for data changes
    const unsubscribe = subscribeToDataChanges('items-changed', () => loadData());
    return () => unsubscribe();
  }, []);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h2>GTD Workflow</h2>
        <div className="gtd-menu">
          <Link
            href="/dashboard"
            className={`gtd-menu-item ${pathname === '/dashboard' ? 'active' : ''}`}
            data-gtd-stage="inbox"
          >
            <span className="gtd-icon">I</span>
            <span className="gtd-label">Inbox</span>
            <span className="gtd-count">{counts.inbox}</span>
          </Link>

          <Link
            href="/dashboard/next-actions"
            className={`gtd-menu-item ${pathname === '/dashboard/next-actions' ? 'active' : ''}`}
            data-gtd-stage="next-actions"
          >
            <span className="gtd-icon">N</span>
            <span className="gtd-label">Next Actions</span>
            <span className="gtd-count">{counts['next-actions']}</span>
          </Link>

          {/* Other GTD stages... */}
        </div>
      </div>

      <div className="sidebar-section">
        <h2>Tags</h2>
        <div className="tag-list">
          {tags.map((tag) => (
            <div
              key={tag}
              className={`sidebar-tag ${activeTags.includes(tag) ? 'active' : ''}`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
