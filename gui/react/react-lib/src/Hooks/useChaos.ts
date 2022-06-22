import { useState, useEffect } from 'react';
import { Query } from '@chaos-framework/api';
import { v4 as uuidv4 } from 'uuid';

import { useChaosAPI } from '../internal.js';

export function useChaos<T extends Query>(query: T): [any, T] {
  // Get handle to Chaos API, ideally provided by a ChaosQueryProvider
  const api = useChaosAPI();
  if (api === null || api === undefined) {
    console.error('useChaos called by component without a proper game API passed as context');
  }
  // Set up a real useState, and another that we'll pass a random object to so we can force rerender
  // This is because useState and useReducer both do shallow comparison and won't rerender any collections
  const [value, callback] = useState(query.value);
  const [random, forceRerender] = useState({});
  const unMemoized = (value: any) => {
    forceRerender({});
    callback(value);
  };
  // Empty array as second arg ensures this will get called once
  useEffect(() => {
    const uuid = uuidv4();
    // Subscribe to the API for updates on this value
    const path = api.addSubsciption(query, uuid, unMemoized);
    // Leave callback to unsubscribe when calling component is unmounted
    return () => api.removeSubscription(path);
  }, []);
  // Return actual value itself for this render
  return [value, query];
}
