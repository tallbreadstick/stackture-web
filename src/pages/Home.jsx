import { createSignal, onMount, Switch } from "solid-js";
import Navigation from "../components/Navigation";
import CloseButton from "./../assets/close.svg";
import "./pages.css";
import { useNavigate } from "@solidjs/router";
import toast from "solid-toast";
import { validateLogin, validateSignup } from "../scripts/auth";
import { login, setUser } from "../App";

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
            fetch("http://stackture.eloquenceprojects.org/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username(),
                    password: password()
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    switch(data.error) {
                        case "InvalidCredentials":
                            setErrors({...errors(), password: "Invalid username or password"});
                            break;
                        case "InvalidRequest":
                            toast.error("Invalid request format");
                            break;
                        case "TokenCreationFailed":
                        case "DatabaseOperationFailed":
                        default:
                            toast.error("Login failed. Please try again later.");
                    }
                } else if (data.token) {
                    localStorage.setItem("authToken", data.token);
                    login(username());
                    navigate("/dashboard");
                    toast.success("Successfully logged in");
                }
            })
            .catch(error => {
                console.error("Login error:", error);
                toast.error("Login failed. Please check your connection.");
            });
        } else {
            setErrors(loginValidation.errors);
        }
    }

    function handleSignup(e) {
        e.preventDefault();
        const signupValidation = validateSignup(username(), email(), password(), confirmPassword());
        
        if (signupValidation.isValid) {
            fetch("http://stackture.eloquenceprojects.org/auth/register", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username(),
                    email: email(),
                    password: password()
                })
            })
            .then(async response => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    const data = await response.json();
                    throw new Error(data.error || `Error: ${response.status}`);
                }
            })
            .then(data => {
                if (data.token) {
                    localStorage.setItem("authToken", data.token);
                    toast.success("Successfully registered!");
                    login(username());
                    closeAuth();
                    navigate("/dashboard");
                } else {
                    toast.error("Token failed to generate. Please try again.");
                }
            })
            .catch(error => {
                console.error("Registration error:", error.message);
                if (error.message === "UserAlreadyExists") {
                    setErrors({...errors(), username: "Username already exists"});
                } else if (error.message === "EmailAlreadyUsed") {
                    setErrors({...errors(), email: "Email already in use"});
                } else {
                    toast.error(`Registration failed: ${error.message}`);
                }
            });
        } else {
            setErrors(signupValidation.errors);
        }
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