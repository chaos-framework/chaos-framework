import loadingReducer, { LoadingState, setLoaded } from './loadingSlice';

describe('loading reducer', () => {
  const initialState: LoadingState = {
    loaded: false
  };
  it('should handle initial state', () => {
    expect(loadingReducer(undefined, { type: 'unknown' })).toEqual({
      loaded: false
    });
  });

  it('should handle increment', () => {
    const actual = loadingReducer(initialState, setLoaded());
    expect(actual.loaded).toEqual(true);
  });
});
