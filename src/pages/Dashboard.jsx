import { createSignal, onMount, Show } from "solid-js";
import Navigation from "../components/Navigation";
import "./pages.css";
import WorkspaceCard from "../components/WorkspaceCard";
import AddIcon from "./../assets/add.svg";
import LoadingAnimation from "./../assets/loading.gif";
import { createStore } from "solid-js/store";
import toast from "solid-toast";
import { useNavigate } from "@solidjs/router";
import { logout } from "../App";
import TextPrompt from "../menus/TextPrompt";

function Dashboard() {

    const navigate = useNavigate();
    const [creating, setCreating] = createSignal(false);
    const [workspaces, setWorkspaces] = createStore([]);

    function fetchWorkspaces() {
        const token = localStorage.getItem("authToken");
        if (!token) {
            toast.error("Unauthorized Action. Please sign in.");
            logout();
            navigate("/");
            return;
        }
        fetch("http://stackture.eloquenceprojects.org/api/workspace/fetch", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(async response => {
            let data;
            try {    
                data = await response.json();
            } catch (err) {
                toast.error("Failed to fetch workspaces");
                return;
            }
            if (!response.ok) {
                if (data.error === "TokenExpired") {
                    toast.error("Failed to fetch workspaces");
                    return;
                }
                throw new Error(data.error || `Error: ${response.status}`);
            }
            if (data.length === 0) {
                toast("No workspaces found. Create one to get started!");
                setWorkspaces([]);
                return;
            }
            setWorkspaces(data);
        })
        .catch(error => {
            console.error("Failed to fetch workspaces:", error);
            toast.error("Failed to load workspaces. Try again later.");
        })
    }

    function createWorkspace() {
        const title = document.getElementById("workspace-title");
        const description = document.getElementById("workspace-description");
        const token = localStorage.getItem("authToken");
        if (title.value === null || title.value.trim().length === 0) {
            toast.error("Workspace name cannot be blank!");
            return;
        }
        if (!token) {
            toast.error("Unauthorized Action. Please sign in.");
            logout();
            navigate("/");
            return;
        }
        fetch("http://stackture.eloquenceprojects.org/api/workspace/create", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title.value,
                description: description.value
            })
        })
        .then(async response => {
            let data;
            try {
                data = await response.json();
                console.log(data);
            } catch (err) {
                toast.error("Failed to create workspace");
                return;
            }
            if (!response.ok) {
                if (data.error === "TokenExpired") {
                    toast.error("Expired token. Please log in.");
                    return;
                }
                throw new Error(data.error || `Error: ${response.status}`);
            }
            // redirect user to new workspace
            const workspace_id = data.workspace_id;
            if (!workspace_id) throw new Error("Invalid response: Missing workspace_id");
            localStorage.setItem("workspace", workspace_id);
            navigate("/workspace");
        })
        .catch(error => {
            console.error("Failed to create workspace:", error);
            toast.error("Failed to create workspace.");
        })
    }

    function visitWorkspace(index) {
        const workspace_id = workspaces[index].id;
        console.log(workspace_id);
        // localStorage.setItem("workspace", workspace_id);
        // navigate("/workspace");
    }

    function openCreate() {
        setCreating(true);
    }

    function closeCreate() {
        setCreating(false);
    }

    onMount(() => {
        document.title = "Stackture - Dashboard";
        fetchWorkspaces();
    });

    return (
        <div id="dashboard-page" class="page">
            <Navigation />
            <Show when={creating()}>
                <TextPrompt title="Create A Workspace" onClose={closeCreate} onSubmit={createWorkspace} >
                    <label>Workspace Name</label>
                    <input id="workspace-title" type="text" />
                    <label>Description</label>
                    <textarea id="workspace-description" />
                </TextPrompt>
            </Show>
            <div class="page-content">
                <h1>Workspaces</h1>
                <h3>These are isolated spaces where you can have study sessions.</h3>
                <div id="workspaces">
                    <div class="workspace-card" onClick={openCreate}>
                        <div class="new-card">
                            <img src={AddIcon} width="30px" />
                            <label>New Workspace</label>
                        </div>
                    </div>
                    <Show when={workspaces === null || workspaces.length === 0}>
                        <img src={LoadingAnimation} width="200px" />
                    </Show>
                    <For each={workspaces}>
                        {(item, index) => (
                            <WorkspaceCard title={item.title} description={item.description} id={item.id} />
                        )}
                    </For>
                    {/* <WorkspaceCard
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
                        description="Speech practice and presentation tips" /> */}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;