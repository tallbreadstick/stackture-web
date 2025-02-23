import { createSignal, onMount, Switch } from "solid-js";
import Navigation from "../components/Navigation";
import CloseButton from "./../assets/close.svg";
import "./pages.css";
import { useNavigate } from "@solidjs/router";
import toast from "solid-toast";
import { validateLogin, validateSignup } from "../scripts/auth";

function Home() {

    const navigate = useNavigate();

    const [pageState, setPageState] = createSignal(null);

    const [username, setUsername] = createSignal('');
    const [email, setEmail] = createSignal('');
    const [password, setPassword] = createSignal('');
    const [confirmPassword, setConfirmPassword] = createSignal('');
    const [errors, setErrors] = createSignal({});

    function openLogin() {
        setPageState("login");
    }

    function openRegister() {
        setPageState("register");
    }

    function closeAuth() {
        setPageState(null);
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setErrors({});
    }

    function handleLogin(e) {
        e.preventDefault();
        const loginValidation = validateLogin(username(), password());
        
        if (loginValidation.isValid) {
            navigateToDashboard();
        } else {
            setErrors(loginValidation.errors);
        }
    }

    function handleSignup(e) {
        e.preventDefault();
        const signupValidation = validateSignup(username(), email(), password(), confirmPassword());
        
        if (signupValidation.isValid) {
            toast.success("Successfully registered!");
            closeAuth();
        } else {
            setErrors(signupValidation.errors);
        }
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
                                <input 
                                    type="text" 
                                    placeholder="Username"
                                    value={username()}
                                    onInput={(e) => setUsername(e.target.value)} 
                                />
                                {errors().username && <label class="error">{errors().username}</label>}
                                <input 
                                    type="password" 
                                    placeholder="Password"
                                    value={password()}
                                    onInput={(e) => setPassword(e.target.value)}
                                />
                                {errors().password && <label class="error">{errors().password}</label>}
                                <button onClick={handleLogin}>Submit</button>
                            </div>
                        </Match>
                        <Match when={pageState() === "register"}>
                            <div class="auth-box">
                                <div onClick={closeAuth} class="auth-exit">
                                    <img src={CloseButton} width="25px" />
                                </div>
                                <h2>Sign Up</h2>
                                <input 
                                    type="text" 
                                    placeholder="Username"
                                    value={username()}
                                    onInput={(e) => setUsername(e.target.value)}
                                />
                                {errors().username && <label class="error">{errors().username}</label>}
                                <input 
                                    type="text" 
                                    placeholder="Email"
                                    value={email()}
                                    onInput={(e) => setEmail(e.target.value)}
                                />
                                {errors().email && <label class="error">{errors().email}</label>}
                                <input 
                                    type="password" 
                                    placeholder="Password"
                                    value={password()}
                                    onInput={(e) => setPassword(e.target.value)}
                                />
                                {errors().password && <label class="error">{errors().password}</label>}
                                <input 
                                    type="password" 
                                    placeholder="Confirm Password"
                                    value={confirmPassword()}
                                    onInput={(e) => setConfirmPassword(e.target.value)}
                                />
                                {errors().confirmPassword && <label class="error">{errors().confirmPassword}</label>}
                                <button onClick={handleSignup}>Submit</button>
                            </div>
                        </Match>
                    </Switch>
                </div>
            </div>
        </div>
    );
}

export default Home;