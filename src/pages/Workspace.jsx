import { onMount } from "solid-js";
import "./pages.css";

function Workspace() {

    onMount(() => {
        document.title = "Stackture - Workspace";
    })

    return (
        <div id="workspace-page" class="page">
            <div class="ws-toolbar">

            </div>
            <div class="ws-canvas">

            </div>
            <div class="ws-chat">

            </div>
        </div>
    );
}

export default Workspace;