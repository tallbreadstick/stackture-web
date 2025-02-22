import { Route, Router } from "@solidjs/router";
import { createSignal, lazy } from "solid-js";
import Home from "./pages/Home";
import About from "./pages/About";
import "./index.css";

export const [user, setUser] = createSignal(null);

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Workspace = lazy(() => import("./pages/Workspace"));

function App() {
    return (
        <div id="app">
            <Router>
                <Route path="/" component={Home} />
                <Route path="/about" component={About} />
                {/* <Route path="/dashboard" component={Dashboard} /> */}
                {/* <Router path="/workspace" component={Workspace} /> */}
            </Router>
        </div>
    );
}

export default App;
