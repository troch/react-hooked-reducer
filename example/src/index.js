import React, { useState } from "react"
import ReactDOM from "react-dom"
import { createStore, compose } from "redux"
import { Provider } from "react-redux"
import { hookedReducersEnhancer } from "react-hooked-reducer"
import Counter from "./Counter"

const store = createStore(
    (state = {}) => state,
    {},
    compose(
        ...[
            hookedReducersEnhancer,
            window.__REDUX_DEVTOOLS_EXTENSION__ &&
                window.__REDUX_DEVTOOLS_EXTENSION__()
        ].filter(Boolean)
    )
)

const embedded = true

const App = () => {
    const [count, setCount] = useState(4)

    return (
        <Provider store={store}>
            <div>
                <p>Open redux devtools to see it in action!</p>
                <p>
                    <button onClick={() => setCount(count + 1)}>
                        Add counter
                    </button>

                    <button
                        onClick={() => setCount(count - 1)}
                        disabled={count === 0}
                    >
                        Remove counter
                    </button>
                </p>

                {Array.from({ length: count }).map((_, index) => (
                    <Counter
                        id={`count${index}`}
                        store={store}
                        key={`count${index}`}
                        embedded={embedded}
                    />
                ))}
            </div>
        </Provider>
    )
}

ReactDOM.render(<App />, document.getElementById("root"))
