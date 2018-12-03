import React from "react"
import { useReducer } from "react-hooked-reducer"

export default function Counter({ store, id, embedded = false }) {
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
