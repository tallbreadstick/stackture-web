import { onMount } from "solid-js";
import Navigation from "../components/Navigation";
import "./pages.css";

function Home() {

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
                    <div class="title-box">
                        <h1>Stackture</h1>
                        <h3>Structure Your Stack</h3>
                        <div class="title-auth">
                            <button>Sign In</button>
                            <button>Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;