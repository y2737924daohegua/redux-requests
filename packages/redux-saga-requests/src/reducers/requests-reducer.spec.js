import {
  success,
  error,
  abort,
  createSuccessAction,
  createErrorAction,
} from '../actions';
import requestsReducer from './requests-reducer';

describe('reducers', () => {
  describe('requestsReducer', () => {
    const actionType = 'ACTION';

    describe('simple', () => {
      const defaultState = {
        data: null,
        error: null,
        pending: 0,
      };

      it('returns correct default state', () => {
        expect(requestsReducer(undefined, {}, actionType)).toEqual(
          defaultState,
        );
      });

      it('returns correct state for not handled action', () => {
        const state = 'some_state';
        expect(requestsReducer(state, {}, actionType)).toBe(state);
      });

      it('returns correct state for request action', () => {
        expect(
          requestsReducer(defaultState, { type: actionType }, actionType),
        ).toEqual({
          data: null,
          error: null,
          pending: 1,
        });
      });

      it('returns correct state for success action', () => {
        const data = 'data';
        const action = {
          type: success(actionType),
          response: { data },
        };
        expect(requestsReducer(defaultState, action, actionType)).toEqual({
          data,
          error: null,
          pending: -1,
        });
      });

      it('returns correct state for error action', () => {
        const someError = 'error';
        const action = {
          type: error(actionType),
          error: someError,
        };
        expect(requestsReducer(defaultState, action, actionType)).toEqual({
          data: null,
          error: someError,
          pending: -1,
        });
      });

      it('returns correct state for abort action', () => {
        const action = { type: abort(actionType) };
        expect(requestsReducer(defaultState, action, actionType)).toEqual({
          data: null,
          error: null,
          pending: -1,
        });
      });

      it('supports FSA actions for getting data and error by default', () => {
        const action = {
          type: actionType,
          payload: {
            request: {
              url: '/',
            },
          },
        };

        expect(
          requestsReducer(
            defaultState,
            createSuccessAction(action, { data: 'data' }),
            actionType,
          ),
        ).toEqual({
          data: 'data',
          error: null,
          pending: -1,
        });

        expect(
          requestsReducer(
            defaultState,
            createErrorAction(action, 'error'),
            actionType,
          ),
        ).toEqual({
          data: null,
          error: 'error',
          pending: -1,
        });
      });
    });

    describe('with mutations', () => {
      const MUTATION_ACTION = 'MUTATION_ACTION';
      const defaultState = {
        data: null,
        error: null,
        pending: 0,
      };

      it('can update data optimistic', () => {
        expect(
          requestsReducer(
            defaultState,
            {
              type: MUTATION_ACTION,
              meta: {
                mutations: {
                  [actionType]: {
                    updateDataOptimistic: () => 'data',
                  },
                },
              },
            },
            actionType,
          ),
        ).toEqual({
          data: 'data',
          error: null,
          pending: 0,
        });
      });

      it('handles updateData customized per mutation', () => {
        expect(
          requestsReducer(
            defaultState,
            {
              type: success(MUTATION_ACTION),
              response: { data: { nested: 'response' } },
              meta: {
                requestAction: { type: MUTATION_ACTION },
                mutations: {
                  [actionType]: (data, mutationData) => mutationData.nested,
                },
              },
            },
            actionType,
          ),
        ).toEqual({
          data: 'response',
          error: null,
          pending: 0,
        });
      });

      it('handles updateData customized per mutation defined in updateData object key', () => {
        expect(
          requestsReducer(
            defaultState,
            {
              type: success(MUTATION_ACTION),
              response: { data: { nested: 'response' } },
              meta: {
                requestAction: { type: MUTATION_ACTION },
                mutations: {
                  [actionType]: {
                    updateData: (data, mutationData) => mutationData.nested,
                  },
                },
              },
            },
            actionType,
          ),
        ).toEqual({
          data: 'response',
          error: null,
          pending: 0,
        });
      });

      it('reverts optimistic update on mutation error', () => {
        expect(
          requestsReducer(
            defaultState,
            {
              type: error(MUTATION_ACTION),
              error: 'error',
              meta: {
                requestAction: { type: MUTATION_ACTION },
                mutations: {
                  [actionType]: {
                    updateDataOptimistic: () => 'data',
                    revertData: () => 'oldData',
                  },
                },
              },
            },
            actionType,
          ),
        ).toEqual({
          data: 'oldData',
          error: null,
          pending: 0,
        });
      });

      it('doesnt change data on mutation error without optimistic update revertData', () => {
        expect(
          requestsReducer(
            { ...defaultState, data: 'data' },
            {
              type: error(MUTATION_ACTION),
              error: 'error',
              meta: {
                requestAction: { type: MUTATION_ACTION },
                mutations: {
                  [actionType]: {
                    updateDataOptimistic: () => 'data2',
                  },
                },
              },
            },
            actionType,
          ),
        ).toEqual({
          data: 'data',
          error: null,
          pending: 0,
        });
      });

      it('reverts optimistic update on mutation abort', () => {
        expect(
          requestsReducer(
            defaultState,
            {
              type: abort(MUTATION_ACTION),
              meta: {
                requestAction: { type: MUTATION_ACTION },
                mutations: {
                  [actionType]: {
                    updateDataOptimistic: () => 'data2',
                    revertData: () => 'oldData',
                  },
                },
              },
            },
            actionType,
          ),
        ).toEqual({
          data: 'oldData',
          error: null,
          pending: 0,
        });
      });
    });

    describe('with local mutations', () => {
      const LOCAL_MUTATION_ACTION = 'LOCAL_MUTATION_ACTION';
      const defaultState = {
        data: null,
        error: null,
        pending: 0,
      };

      it('updates data for local mutation and doesnt keep local mutation state', () => {
        expect(
          requestsReducer(
            defaultState,
            {
              type: LOCAL_MUTATION_ACTION,
              meta: {
                mutations: {
                  [actionType]: {
                    local: true,
                    updateData: () => 'data local',
                  },
                },
              },
            },
            actionType,
          ),
        ).toEqual({ ...defaultState, data: 'data local' });
      });
    });
  });
});
