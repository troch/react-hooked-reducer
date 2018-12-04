import {
    StoreCreator,
    Reducer,
    StoreEnhancer,
    Store,
    Action,
    DeepPartial
} from "redux"
import { Dispatch } from "react"

type UnsubscribeFn = () => void
export const ACTION_TYPE_NAMESPACE = "@@hooked-reducer"

const omit = (obj, keyToRemove) =>
    Object.keys(obj)
        .filter(key => key !== keyToRemove)
        .reduce((acc, key) => {
            acc[key] = obj[key]
            return acc
        }, {})

export interface WithHookedReducers {
    registerLocalDispatch: (
        dispatch: Dispatch<any>,
        reducerId: string
    ) => UnsubscribeFn

    registerHookedReducer: <S, A extends Action = Action<any>>(
        reducer: Reducer<S, A>,
        initialState: S,
        reducerId: string
    ) => UnsubscribeFn
}

export const hookedReducersEnhancer = (
    createStore: StoreCreator
): StoreCreator => (
    reducer: Reducer<any, Action<any>>,
    initialState: any,
    enhancer?: StoreEnhancer<WithHookedReducers, {}>
): Store<any, any> & WithHookedReducers => {
    const hookedReducers: Record<
        string | number,
        Reducer<any, Action<any>>
    > = {}
    const localDispatchers: Record<string | number, Dispatch<Action<any>>> = {}

    const enhancedReducer = (state, action) => {
        const isHookedReducerAction =
            action.type.indexOf(ACTION_TYPE_NAMESPACE) === 0
        const isHookedReducerInitAction =
            isHookedReducerAction && /\/init$/.test(action.type)
        const isHookedReducerTeardownAction =
            isHookedReducerAction && /\/teardown$/.test(action.type)
        const { hookedState = {}, ...existingState } = state

        const currentHookedState = isHookedReducerTeardownAction
            ? omit(hookedState, action.payload.reducerId)
            : { ...hookedState }

        return {
            ...(isHookedReducerAction
                ? existingState
                : (reducer(state, action) as {})),
            hookedState: Object.keys(hookedReducers).reduce(
                (acc, reducerId) => {
                    const hookedReducer = hookedReducers[reducerId]
                    const hookedReducerState = hookedState[reducerId]
                    const hookedReducerAction = isHookedReducerAction
                        ? action.payload.action
                        : action
                    const isForCurrentReducer =
                        action.payload && action.payload.reducerId === reducerId

                    if (isHookedReducerInitAction && isForCurrentReducer) {
                        acc[reducerId] = action.payload.initialState
                    } else if (!isHookedReducerAction || isForCurrentReducer) {
                        acc[reducerId] = hookedReducer(
                            hookedReducerState,
                            hookedReducerAction
                        )
                    } else {
                        acc[reducerId] = hookedReducerState
                    }

                    return acc
                },
                currentHookedState
            )
        }
    }
    const store = createStore<any, any, WithHookedReducers, {}>(
        enhancedReducer,
        initialState,
        enhancer
    )

    const dispatch = store.dispatch

    store.registerLocalDispatch = (localDispatch, reducerId) => {
        localDispatchers[reducerId] = localDispatch

        return () => {
            delete localDispatchers[reducerId]
        }
    }

    store.registerHookedReducer = (reducer, initialState, reducerId) => {
        hookedReducers[reducerId] = reducer

        store.dispatch({
            type: `${ACTION_TYPE_NAMESPACE}/${reducerId}/init`,
            payload: {
                reducerId,
                initialState
            }
        })

        return () => {
            delete hookedReducers[reducerId]

            store.dispatch({
                type: `${ACTION_TYPE_NAMESPACE}/${reducerId}/teardown`,
                payload: {
                    reducerId
                }
            })
        }
    }

    store.dispatch = (action: any) => {
        const isHookedReducerAction = action.type.indexOf(hookedReducers) === 0
        const hookedReducer = isHookedReducerAction
            ? hookedReducers[action.payload.reducerId]
            : undefined
        const localAction = isHookedReducerAction
            ? action.payload.action
            : action

        Object.keys(localDispatchers).forEach(reducerId => {
            if (
                !isHookedReducerAction ||
                reducerId === action.payload.reducerId
            ) {
                localDispatchers[reducerId](localAction)
            }
        })

        if (!isHookedReducerAction || hookedReducer) {
            return dispatch(action)
        }
    }

    return store
}
