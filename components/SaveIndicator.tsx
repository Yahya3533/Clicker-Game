import { useState, useEffect, useRef } from 'react';
import { useSettings } from '../hooks/useSettings';

interface SaveIndicatorProps {
  isSaving: boolean;
}

const SaveIndicator = ({ isSaving }: SaveIndicatorProps) => {
  const { t } = useSettings();
  const [showSaved, setShowSaved] = useState(false);
  const prevIsSaving = useRef(isSaving);
  const savedTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // If we transition from saving to not saving, show the "Saved!" message.
    if (prevIsSaving.current && !isSaving) {
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
      setShowSaved(true);
      savedTimeoutRef.current = window.setTimeout(() => {
        setShowSaved(false);
      }, 1500); // Show "Saved!" for 1.5 seconds
    }
    
    // If a new save starts while "Saved!" is showing, hide it immediately.
    if (isSaving) {
        setShowSaved(false);
        if (savedTimeoutRef.current) {
            clearTimeout(savedTimeoutRef.current);
        }
    }

    prevIsSaving.current = isSaving;

    return () => {
        if (savedTimeoutRef.current) {
            clearTimeout(savedTimeoutRef.current);
        }
    }
  }, [isSaving]);

  let content = null;
  if (isSaving) {
    content = '💾 ' + t('saving');
  } else if (showSaved) {
    content = '✅ ' + t('saved');
  }

  if (!content) {
    return <div className="h-6" />; // Keep layout stable
  }

  return (
    <div className="bg-gray-900/60 text-white text-xs font-semibold px-3 py-1 rounded-full transition-opacity duration-300">
      {content}
    </div>
  );
};

export default SaveIndicator;