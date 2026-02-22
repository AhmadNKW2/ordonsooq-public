'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { clientAutocomplete } from './api';
import type { AutocompleteSuggestion } from './types';

export function useAutocomplete(minChars = 2, debounceMs = 250) {
  const [query, setQuery]             = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [isOpen, setIsOpen]           = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.length < minChars) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await clientAutocomplete(query);
        setSuggestions(data.suggestions);
        setIsOpen(data.suggestions.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, minChars, debounceMs]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return { query, setQuery, suggestions, isLoading, isOpen, close };
}
