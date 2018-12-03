# react-hooked-reducer

> This package is a PoC and in development

Use reducers in React, like with `useReducer` but with the following additional benefits:

-   Receive actions from a `store`
-   Optionally embed your reducer inside a `store` and fully benefit

```
yarn add react-hooked-reducer
# or
npm install react-hooked-reducer
```

## Why

Using global reducers for React components has several disadvantages:

-   You end up having to manage **initialisation or reset actions**
-   Having multiple instances of a same component requires you to use add and remove actions, to identify actions and to add a wrapping reducer.

The solution is to couple reducers to their component instances, like in [react-local-reducer](https://github.com/troch/react-local-reducer) or the newly created react hook [`useReducer`](`https://reactjs.org/docs/hooks-reference.html#usereducer`)

However, by doing so we loose the developer experience that comes with Redux: inspecting actions and state, time travelling.

**This package allows to have the best of both: local reducers with great DX!**

## Usage

#### hookedReducersEnhancer

For this package to work, you need to enhance your store with `hookedReducersEnhancer`:

```js
import { hookedReducersEnhancer } from "react-hooked-reducer"

const store = createStore(reducer, initialState, hookedReducersEnhancer)
```

See [https://redux.js.org/api/compose](https://redux.js.org/api/compose) for more info on how to compose store enhancers together.

#### useReducer(reducer, initialState, store, reducerId, hooked)

-   `reducer`: your reducer
-   `initialState`: the initial state for your reducer
-   `store`: your store instance
-   `reducerId`: an unique ID to identify your reducer
-   `hooked`: if `true`, your reducer will be "embedded" inside your store.

#### Things you can do

-   You can set `hooked` to `true` in development, and `false` in production: when your reducer is not attached to your store, changes in its state won't cause a new store state to be emitted.
-   You can create your own custom hook to avoid having to pass down `store`: add it to a custom context and then use `useContext`:

    ```js
    import { useHookedReducer } from "react-hooked-reducer"
    import StoreContext from "./context"

    export default function useReducer(reducer, initialState, reducerId) {
        const store = useContext(StoreContext)
        return useHookedReducer(
            reducer,
            initialState,
            reducerId,
            store,
            process.env.NODE_ENV === "development"
        )
    }
    ```

#### Example

```js
import { useReducer } from "react-hooked-reducer"

function Counter({ store, id, embedded = false }) {
    const [count, dispatch] = useReducer(
        (state, action) => {
            if (action.type === "+") {
                return state + 1
            }
            if (action.type === "-") {
                return state - 1
            }
            return state
        },
        0,
        store,
        id,
        embedded
    )

    return (
        <div>
            <button onClick={() => dispatch({ type: "-" })}>-</button> {count}{" "}
            <button onClick={() => dispatch({ type: "+" })}>+</button>
        </div>
    )
}
```
