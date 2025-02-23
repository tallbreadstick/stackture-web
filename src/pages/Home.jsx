import { createSignal, onMount, Switch } from "solid-js";
import Navigation from "../components/Navigation";
import CloseButton from "./../assets/close.svg";
import "./pages.css";
import { useNavigate } from "@solidjs/router";
import toast from "solid-toast";

function Home() {

    const navigate = useNavigate();

    const [pageState, setPageState] = createSignal(null);

    function openLogin() {
        setPageState("login");
    }

    function openRegister() {
        setPageState("register");
    }

    function closeAuth() {
        setPageState(null);
    }

    function navigateToDashboard() {
        navigate("/dashboard");
        toast.success("Successfully logged in");
    }

    onMount(() => {
        document.title = "Stackture - Structure Your Stack";
    });

    return (
        <div id="home-page" class="page">
            <Navigation />
            <div class="page-content">
                <div class="description-space">
                    <div class="description-box">
                        <h2>Engage in focused learning sessions.</h2>
                        <h2>Design structured and precise study plans.</h2>
                        <h2>Divide. Conquer. Repeat.</h2>
                    </div>
                </div>
                <div class="title-space">
                    <Switch>
                        <Match when={pageState() === null}>
                            <div class="title-box">
                                <h1>Stackture</h1>
                                <h3>Structure Your Stack</h3>
                                <div class="title-auth">
                                    <button onClick={openLogin}>Sign In</button>
                                    <button onClick={openRegister}>Sign Up</button>
                                </div>
                            </div>
                        </Match>
                        <Match when={pageState() === "login"}>
                            <div class="auth-box">
                                <div onClick={closeAuth} class="auth-exit">
                                    <img src={CloseButton} width="25px" />
                                </div>
                                <h2>Sign In</h2>
                                <input type="text" placeholder="Username" />
                                <input type="password" placeholder="Password" />
                                <label></label>
                                <button onClick={navigateToDashboard}>Submit</button>
                            </div>
                        </Match>
                        <Match when={pageState() === "register"}>
                            <div class="auth-box">
                                <div onClick={closeAuth} class="auth-exit">
                                    <img src={CloseButton} width="25px" />
                                </div>
                                <h2>Sign Up</h2>
                                <input type="text" placeholder="Username" />
                                <input type="text" placeholder="Email" />
                                <input type="password" placeholder="Password" />
                                <input type="password" placeholder="Confirm Password" />
                                <label></label>
                                <button>Submit</button>
                            </div>
                        </Match>
                    </Switch>
                </div>
            </div>
        </div>
    );
}

export default Home;