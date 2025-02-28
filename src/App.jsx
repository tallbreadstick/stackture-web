import { Route, Router } from "@solidjs/router";
import { createSignal, lazy } from "solid-js";
import "./index.css";
import "./menus/menus.css";
import { Toaster } from "solid-toast";

function getStoredUser() {
    return localStorage.getItem("user") || null;
}

export const [user, setUser] = createSignal(getStoredUser());

export function login(username) {
    localStorage.setItem("user", username);
    setUser(username); // Keeps UI reactive
}

export function logout() {
    localStorage.removeItem("user");
    setUser(null);
}

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
            <Toaster
                toastOptions={{
                    style: {
                        background: '#00b1b1',
                        color: '#fff',
                        "font-family": "Kanit",
                        "font-size": "0.8rem"
                    }
                }}/>
        </div>
    );
}

export default App;
