import { CollectionQuery, IndividualQuery } from '@chaos-framework/api';

export const getQueriesPaginated = <T extends IndividualQuery<C>, C = any>(
  collectionQuery: CollectionQuery<T, C>,
  currentPage: number,
  pageLength: number
): C[] => {
  const result: C[] = [];
  const startingIndex = currentPage * pageLength;

  // If the page is not in range just return an empty array
  if (startingIndex >= collectionQuery.value.size) {
    console.log(`too big fam ${collectionQuery.value.size}`);
    return result;
  }

  const iterator = collectionQuery.iterator();

  // Get up to the starting index
  console.log(`starting index ${startingIndex}`);
  for (let i = 0; i < startingIndex; i++) {
    const next = iterator.next();
    console.log(`skipping ${next.value}`);
  }

  // Get all the queries for this page
  for (let i = 0; i < pageLength; i++) {
    const next = iterator.next();
    if (next.done) {
      break;
    }
    console.log(`pushing ${i}`);
    result.push(next.value[1] as C);
  }

  console.log(result.length);

  return result;
};
