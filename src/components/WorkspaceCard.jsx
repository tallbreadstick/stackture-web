import { useNavigate } from "@solidjs/router";
import { spawnContext } from "../menus/ContextMenu";
import TrashIcon from "./../assets/trash.svg";
import LinkIcon from "./../assets/link.svg";
import toast from "solid-toast";
import {workspaces, setWorkspaces} from "../pages/Dashboard"
import { sessionTimeout } from "../App";

function WorkspaceCard(props) {
    const navigate = useNavigate();

    function navigateToWorkspace() {
        localStorage.setItem("workspace", props.id);
        navigate("/workspace");
    }

    function deleteWorkspace() {
        const token = localStorage.getItem("authToken");

        fetch(
            "http://stackture.eloquenceprojects.org/api/workspace/delete/" + props.id,
            {
                method: "delete",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        ).then((res) => {
            if (res.status == 204) {
                toast.success("Workspace successfully deleted")
                setWorkspaces(workspaces.filter((val) => {return val.id != props.id}))
            } else {
                res.json().then(
                    (data) => {
                        if (data.error === "TokenExpired") {
                            sessionTimeout()
                        } else {
                            toast.error("Unable to delete workspace");
                        }
                    }
                ).catch(() => {toast.error("Unable to delete workspace")});
            }
        })
    }   

    function spawnCardContext(e) {
        spawnContext(e,
            <>
                <div onClick={deleteWorkspace}>
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

            <h1 class="border-0 border-b border-[#717417] border-solid border-opacity-45 pb-2">{props.title}</h1>
            <p class="mt-2">{props.description}</p>
        </div>
    );
}

export default WorkspaceCard;