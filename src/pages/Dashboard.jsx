import { onMount } from "solid-js";
import Navigation from "../components/Navigation";
import "./pages.css";
import WorkspaceCard from "../components/WorkspaceCard";
import AddIcon from "./../assets/add.svg";
import { useNavigate } from "@solidjs/router";

function Dashboard() {
    const navigate = useNavigate();

    function navigateToWorkspace() {
        navigate("/workspace");
    }

    onMount(() => {
        document.title = "Stackture - Dashboard";
    });

    return (
        <div id="dashboard-page" class="page">
            <Navigation />
            <div class="page-content">
                <h1>Workspaces</h1>
                <h3>These are isolated spaces where you can have study sessions.</h3>
                <div id="workspaces">
                    <div class="workspace-card" onClick={navigateToWorkspace} style="cursor: pointer;">
                        <div class="new-card">
                            <img src={AddIcon} width="30px" />
                            <label>New Workspace</label>
                        </div>
                    </div>
                    <WorkspaceCard
                        title="Math Practice"
                        description="Algebra exercises and formulas" />
                    <WorkspaceCard
                        title="History Notes"
                        description="Key events from World War II" />
                    <WorkspaceCard
                        title="Physics Concepts"
                        description="Newton’s laws and motion" />
                    <WorkspaceCard
                        title="Biology Review"
                        description="Cell structure and DNA replication" />
                    <WorkspaceCard
                        title="Programming Basics"
                        description="JavaScript fundamentals and exercises" />
                    <WorkspaceCard
                        title="Essay Draft"
                        description="English literature analysis on Shakespeare" />
                    <WorkspaceCard
                        title="Chemistry Lab"
                        description="Periodic table and chemical reactions" />
                    <WorkspaceCard
                        title="Economics Study"
                        description="Supply and demand principles" />
                    <WorkspaceCard
                        title="Spanish Vocabulary"
                        description="Common phrases and grammar rules" />
                    <WorkspaceCard
                        title="Exam Prep"
                        description="Mock questions and review sheets" />
                    <WorkspaceCard
                        title="Art Portfolio"
                        description="Sketches and painting references" />
                    <WorkspaceCard
                        title="Psychology Notes"
                        description="Cognitive biases and learning theories" />
                    <WorkspaceCard
                        title="Machine Learning"
                        description="Intro to AI and neural networks" />
                    <WorkspaceCard
                        title="Philosophy Reading"
                        description="Plato’s Republic discussion points" />
                    <WorkspaceCard
                        title="Public Speaking"
                        description="Speech practice and presentation tips" />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;