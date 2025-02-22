import { onMount } from "solid-js";
import "./pages.css";

function Workspace() {

    onMount(() => {
        document.title = "Stackture - Workspace";
    })

    return (
        <div id="workspace-page" class="page">

        </div>
    );
}

export default Workspace;