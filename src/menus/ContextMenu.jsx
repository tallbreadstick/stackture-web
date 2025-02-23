import { onCleanup, onMount } from "solid-js";
import { render } from "solid-js/web";

export function spawnContext(e, children) {
    e.preventDefault();
    render(() => (
        <ContextMenu x={e.clientX} y={e.clientY}>
            {children}
        </ContextMenu>
    ), document.getElementById("app"));
}

function ContextMenu(props) {
    
    let self;

    function handleClickOff(e) {
        self.parentElement.removeChild(self);
    }

    onMount(() => {
        document.addEventListener("click", handleClickOff);
        document.addEventListener("contextmenu", handleClickOff);
    });

    onCleanup(() => {
        document.removeEventListener("click", handleClickOff);
        document.removeEventListener("contextmenu", handleClickOff);
    })
    
    return (
        <div style={`top: ${props.y}px; left: ${props.x}px`} ref={self} class="context-menu">
            {props.children}
        </div>
    );
}

export default ContextMenu;