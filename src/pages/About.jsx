import { onMount } from "solid-js";
import "./pages.css";
import Navigation from "../components/Navigation";

function About() {

    onMount(() => {
        document.title = "Stackture - About";
    });

    return (
        <div id="about-page" class="page">
            <Navigation />
            <div class="page-content">
                    <div class="introduction-space">
                        <h1>About Stackture</h1>
                        <p>Stackture is a platform that allows you to structure your learning by breaking down problems into smaller digestible parts.</p>
                        <p>It is built with Solid.js and Solid Auth.</p>
                    </div>
                    <div class="content-container">
                        <div class="description-space">
                            <p>Stakture uses a divide-and-conquer style algorithm to break down topics using a tree system </p>
                        </div>
                        <div class="image-space">
                            <img src="/src/assets/binary_tree.png"></img>
                        </div>
                    </div>
            </div>
        </div>
    );
}

export default About;