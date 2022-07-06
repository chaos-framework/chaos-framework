import { CollectionQuery, QueryAPI } from '@chaos-framework/api';
import { current } from '@reduxjs/toolkit';

export class PaginatedChaosCollection<T> {
  iterator: IterableIterator<[string, T]>;
  currentIndex: number = 0;

  constructor(public query: CollectionQuery<any, T>) {
    this.iterator = query.iterator();
  }

  getPage(pageNumber: number, perPage: number): T[] {
    const result: T[] = [];
    const startingIndex = pageNumber * perPage;
    // If the page is not in range just return an empty array
    if (startingIndex >= this.query.map.length) {
      return result;
    }
    // See if we're already past the selected index, if so run back to the page requested :/
    if (startingIndex < this.currentIndex) {
      this.iterator = this.query.iterator();
      this.currentIndex = 0;
      for (
        ;
        this.currentIndex < startingIndex && this.currentIndex < this.query.value.size;
        this.currentIndex++
      ) {
        this.iterator.next();
      }
    }
    for (let i = 0; i < perPage && i < this.query.value.size; i++) {
      result.push(this.iterator.next().value[1] as T);
    }
    return result;
  }

  invalidate(pageNumber: number, perPage: number): T[] {
    this.iterator = this.query.iterator();
    this.currentIndex = 0;
    return this.getPage(pageNumber, perPage);
  }
}
