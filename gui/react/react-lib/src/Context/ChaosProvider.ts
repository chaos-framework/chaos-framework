import * as React from 'react';
import { QueryAPI } from '@chaos-framework/api';

export const ChaosQueryContext = React.createContext<QueryAPI | undefined>(new QueryAPI());
export const ChaosProvider = ChaosQueryContext.Provider;
export function useChaosAPI(): QueryAPI {
  const c = React.useContext(ChaosQueryContext);
  if (c === undefined) throw new Error('useChaosAPI must be inside a Provider with a value');
  return c as QueryAPI;
}
