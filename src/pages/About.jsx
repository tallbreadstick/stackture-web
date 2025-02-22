import { onMount } from "solid-js";
import "./pages.css";
import Navigation from "../components/Navigation";

function About() {

    onMount(() => {
        document.title = "Stackture - About";
    });

    return (
        <div id="about-page">
            <Navigation />
            <div class="page-content">

            </div>
        </div>
    );
}

export default About;