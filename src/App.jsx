import { Route, Router } from "@solidjs/router";
import { createSignal, lazy } from "solid-js";
import "./index.css";
import { Toaster } from "solid-toast";

export const [user, setUser] = createSignal(null);

const Home = lazy(() => import("./pages/Home"));
const About  = lazy(() => import("./pages/About"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Workspace = lazy(() => import("./pages/Workspace"));

function App() {

    return (
        <div id="app">
            <Router>
                <Route path="/" component={Home} />
                <Route path="/about" component={About} />
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/workspace" component={Workspace} />
            </Router>
            <Toaster />
        </div>
    );
}

export default App;
