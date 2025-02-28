import { useNavigate } from "@solidjs/router";
import { spawnContext } from "../menus/ContextMenu";
import TrashIcon from "./../assets/trash.svg";
import LinkIcon from "./../assets/link.svg";

function WorkspaceCard(props) {
    const navigate = useNavigate();

    function navigateToWorkspace() {
        navigate("/workspace");
    }

    function spawnCardContext(e) {
        spawnContext(e,
            <>
                <div>
                    <img src={TrashIcon} height="20px" />
                    <label>Delete Workspace</label>
                </div>
                <div>
                    <img src={LinkIcon} height="20px" />
                    <label>Copy Workspace Link</label>
                </div>
            </>
        );
    }

    return (
        <div 
            onClick={navigateToWorkspace} 
            onContextMenu={spawnCardContext} 
            class="workspace-card"
            style="cursor: pointer">

            <h1>{props.title}</h1>
            <p>{props.description}</p>
        </div>
    );
}

export default WorkspaceCard;