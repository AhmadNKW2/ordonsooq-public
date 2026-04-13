'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { clientAutocomplete } from './api';
import type { AutocompleteSuggestion } from './types';

const AUTOCOMPLETE_CACHE_MAX_ENTRIES = 100;
const autocompleteCache = new Map<string, AutocompleteSuggestion[]>();

function getAutocompleteCacheKey(query: string): string {
  return query.trim().toLowerCase();
}

function setAutocompleteCache(key: string, suggestions: AutocompleteSuggestion[]) {
  if (autocompleteCache.has(key)) {
    autocompleteCache.delete(key);
  }

  autocompleteCache.set(key, suggestions);

  if (autocompleteCache.size > AUTOCOMPLETE_CACHE_MAX_ENTRIES) {
    const oldestKey = autocompleteCache.keys().next().value;
    if (oldestKey) {
      autocompleteCache.delete(oldestKey);
    }
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

export function useAutocomplete(minChars = 2, debounceMs = 450) {
  const [query, setQuery]             = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [isOpen, setIsOpen]           = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < minChars) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
      abortRef.current = null;
      setIsLoading(false);
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    const cacheKey = getAutocompleteCacheKey(normalizedQuery);
    const cachedSuggestions = autocompleteCache.get(cacheKey);

    if (cachedSuggestions) {
      setIsLoading(false);
      setSuggestions(cachedSuggestions);
      setIsOpen(cachedSuggestions.length > 0);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      setIsLoading(true);

      try {
        const data = await clientAutocomplete(normalizedQuery, 8, controller.signal);
        setAutocompleteCache(cacheKey, data.suggestions);
        setSuggestions(data.suggestions);
        setIsOpen(data.suggestions.length > 0);
      } catch (error) {
        if (isAbortError(error)) return;

        setSuggestions([]);
        setIsOpen(false);
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }

        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, [query, minChars, debounceMs]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return { query, setQuery, suggestions, isLoading, isOpen, close };
}
