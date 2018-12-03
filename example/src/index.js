import React from "react"
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

const App = () => (
    <Provider store={store}>
        <div>
            <p>Open redux devtools to see it in action!</p>
            <Counter
                id="counter1"
                store={store}
                key="counter1"
                embedded={embedded}
            />
            <Counter
                id="counter2"
                store={store}
                key="counter2"
                embedded={embedded}
            />
            <Counter
                id="counter3"
                store={store}
                key="counter3"
                embedded={embedded}
            />
            <Counter
                id="counter4"
                store={store}
                key="counter4"
                embedded={embedded}
            />
        </div>
    </Provider>
)

ReactDOM.render(<App />, document.getElementById("root"))
