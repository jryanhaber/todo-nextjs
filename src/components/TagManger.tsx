// components/TagManager.tsx
import { useState, useEffect, useRef } from 'react';
import { fetchAllTags } from '../lib/data-store';

interface TagManagerProps {
  initialTags?: string[];
  onChange?: (tags: string[]) => void;
}

export default function TagManager({ initialTags = [], onChange }: TagManagerProps) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [inputValue, setInputValue] = useState('');
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load existing tags for autocomplete
    const loadTags = async () => {
      const existingTags = await fetchAllTags();
      setAllTags(existingTags);
    };

    loadTags();
  }, []);

  useEffect(() => {
    // Update parent component when tags change
    if (onChange) {
      onChange(tags);
    }
  }, [tags, onChange]);

  const addTag = (tagText: string) => {
    const trimmedTag = tagText.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag];
      setTags(newTags);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove the last tag when backspace is pressed on empty input
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleTagClick = (tag: string) => {
    addTag(tag);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Filter suggestions based on input
  const filteredSuggestions = inputValue
    ? allTags.filter(
        (tag) => tag.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(tag)
      )
    : [];

  return (
    <div className="tag-manager">
      <div className="tag-input-container">
        <div className="tag-chips">
          {tags.map((tag) => (
            <span key={tag} className="tag-chip">
              {tag}
              <button type="button" className="tag-remove" onClick={() => removeTag(tag)}>
                ×
              </button>
            </span>
          ))}
        </div>

        <input
          ref={inputRef}
          type="text"
          className="tag-input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={tags.length > 0 ? '' : 'Add tags...'}
          onFocus={() => setShowSuggestions(inputValue.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="tag-suggestions">
          {filteredSuggestions.map((tag) => (
            <div key={tag} className="tag-suggestion-item" onClick={() => handleTagClick(tag)}>
              {tag}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
