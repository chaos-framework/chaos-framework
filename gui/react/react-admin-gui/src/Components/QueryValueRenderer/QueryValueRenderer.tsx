import { FC } from 'react';

import { IndividualQuery } from '@chaos-framework/api';
import { useChaos, useChaosNested } from '@chaos-framework/react-lib';

export interface QueryValueProps<T = IndividualQuery<any>> {
  query: T;
  queryKey?: string;
  formatter?: (s: string) => string;
}

export interface NestedQueryValueProps<T = IndividualQuery<any>> {
  queryFn: () => IndividualQuery<T>;
  parentQuery: IndividualQuery<any>;
}

export const QueryValue: FC<QueryValueProps> = (props: QueryValueProps) => {
  const { query, queryKey, formatter } = props;
  let [value] = useChaos(queryKey !== undefined ? (query as any)[queryKey]() : query);
  if (formatter !== undefined) {
    value = formatter(value);
  }
  return <span>{value}</span>;
};

export const NestedQueryValue: FC<NestedQueryValueProps> = (props: NestedQueryValueProps) => {
  const [value] = useChaosNested(props.queryFn, props.parentQuery);
  return <span>{value}</span>;
};
