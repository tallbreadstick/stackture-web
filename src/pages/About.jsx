import { onMount } from "solid-js";
import "./pages.css";
import "../assets/tailwind.css";
import Navigation from "../components/Navigation";

function About() {
    onMount(() => {
        document.title = "Stackture - About";
    });

    return (
        <>
        <Navigation />
        <div id="about-page" class="page absolute top-0">
            <img src="/src/assets/about.jpeg" class="fixed top-0 left-0 w-screen h-screen -z-[1]" />
            <div class="page-content !pt-28 !bg-[#05042c] !bg-opacity-80">
                <div class="introduction-space">
                    <h1>About Stackture</h1>
                    <h3>Breaking Down Complex Problems Into Manageable Solutions</h3>
                    <p>Stackture is an innovative learning platform designed to transform how you approach complex topics and challenges.</p>
                </div>
                
                <div class="content-container">
                    <div class="description-space">
                        <h2>Our Approach</h2>
                        <p>Using a divide-and-conquer methodology, Stackture helps you break down complicated subjects into smaller, more digestible components structured in a visual tree system.</p>
                        <p>This hierarchical approach allows you to:</p>
                        <ul>
                            <li>Visualize complex relationships between concepts</li>
                            <li>Focus on one manageable piece at a time</li>
                            <li>Track your progress as you master each component</li>
                            <li>Build confidence through structured learning</li>
                        </ul>
                    </div>
                    <div class="image-space">
                        <img src="/src/assets/binary_tree.png" alt="Stackture Tree Visualization" />
                        <p class="caption">Stackture's hierarchical problem-solving approach</p>
                    </div>
                </div>
            </div>
            <div class="page-content pt-9 !bg-gradient-to-b !from-transparent !to-[#05042c]">
                <div class="principles-section">
                    <h2>Our Core Principles</h2>
                    <div class="principles-container">
                        <div class="principle-item">
                            <h4>Zero-Waste Learning</h4>
                            <p>Every study path should be efficient and intentional. No redundant exercises, no generic study plans—just the most direct and effective route to mastering a concept.</p>
                        </div>
                        <div class="principle-item">
                            <h4>Hierarchical Problem Decomposition</h4>
                            <p>Learning isn't linear; it's hierarchical. Stackture helps users break down big problems into manageable subproblems, ensuring they always tackle what they're ready for.</p>
                        </div>
                        <div class="principle-item">
                            <h4>Mastery Before Progression</h4>
                            <p>You can't move up until you've truly understood what's below. Stackture enforces a post-order resolution (learn subproblems before the main problem).</p>
                        </div>
                        <div class="principle-item">
                            <h4>Human-AI Synergy</h4>
                            <p>The AI assists in structuring learning but doesn't replace the user's own problem-solving ability. Users must engage deeply, not just passively consume AI-generated content.</p>
                        </div>
                        <div class="principle-item">
                            <h4>Long-Term Impact Over Trends</h4>
                            <p>No gimmicks, no temporary hype. Stackture is built with sustainability in mind, meaning features should be robust, thoughtful, and enduring.</p>
                        </div>
                    </div>
                </div>
                
                <div class="tech-section">
                    <h2>Built with Modern Technology</h2>
                    <div class="tech-container">
                        <div class="tech-item">
                            <h4>SolidJS</h4>
                            <p>For reactive UI components and efficient DOM updates</p>
                        </div>
                        <div class="tech-item">
                            <h4>Solid Auth</h4>
                            <p>Secure authentication and user management</p>
                        </div>
                        <div class="tech-item">
                            <h4>Interactive Visualization</h4>
                            <p>Dynamic tree structures for intuitive navigation</p>
                        </div>
                    </div>
                </div>
                
                <div class="team-section">
                    <h2>Our Mission</h2>
                    <p>At Stackture, we believe that even the most complex problems become manageable when approached systematically. Our mission is to empower learners and problem-solvers to tackle challenges through structured decomposition and methodical learning.</p>
                </div>
            </div>
        </div>
        </>
    );
}

export default About;