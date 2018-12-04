import {
    useReducer as useReactReducer,
    Reducer,
    useMemo,
    Dispatch,
    useState,
    useEffect
} from "react"
import { Store, Action } from "redux"
import { WithHookedReducers, ACTION_TYPE_NAMESPACE } from "./storeEnhancer"

export function useHookedReducer<S, A extends Action<any>>(
    reducer: Reducer<S, A>,
    initialState: S,
    store: Store<any, Action<any>> & WithHookedReducers,
    reducerId: string
) {
    const initialReducerState = useMemo(() => {
        const initialStateInStore = store.getState().hookedState[reducerId]
        return initialStateInStore === undefined
            ? initialState
            : initialStateInStore
    }, [])

    const [localState, setState] = useState(initialReducerState)

    const dispatch = useMemo<Dispatch<A>>(() => {
        const dispatch = (action: A) =>
            store.dispatch({
                type: `${ACTION_TYPE_NAMESPACE}/${reducerId}`,
                payload: {
                    reducerId,
                    action
                }
            })

        return dispatch
    }, [])

    useEffect(() => {
        const teardown = store.registerHookedReducer<S, A>(
            reducer,
            initialReducerState,
            reducerId
        )

        let lastHookedState = localState
        const unsubscribe = store.subscribe(() => {
            const storeState: any = store.getState()
            const hookedState = storeState.hookedState[reducerId]

            if (lastHookedState !== hookedState) {
                setState(hookedState)
            }

            lastHookedState = hookedState
        })

        return () => {
            unsubscribe()
            teardown()
        }
    }, [])

    return [localState, dispatch]
}

export function useDetachedReducer<S, A extends Action<any>>(
    reducer: Reducer<S, A>,
    initialState: S,
    store: Store & WithHookedReducers,
    reducerId: string
) {
    const [state, dispatch] = useReactReducer<S, A>(reducer, initialState)

    const teardown = useMemo(
        () => store.registerLocalDispatch(dispatch, reducerId),
        [dispatch]
    )

    useEffect(() => teardown, [])

    return [state, dispatch]
}

export function useReducer<S, A extends Action<any> = Action<any>>(
    reducer: Reducer<S, A>,
    initialState: S,
    store: Store & WithHookedReducers,
    reducerId: string,
    hooked: boolean
) {
    // Memoise initial value so that the type of hook cannot be changed
    const isHooked = useMemo(() => hooked, [])

    return isHooked
        ? useHookedReducer(reducer, initialState, store, reducerId)
        : useDetachedReducer(reducer, initialState, store, reducerId)
}
