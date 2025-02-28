import { createSignal, onCleanup, onMount } from "solid-js";
import { render } from "solid-js/web";

export function spawnContext(e, children) {
    const existingMenu = document.querySelector(".context-menu");
    if (existingMenu) {
        existingMenu.remove();
    }
    e.preventDefault();
    if (!contextOpen()) {
        render(() => (
            <ContextMenu x={e.clientX} y={e.clientY}>
                {children}
            </ContextMenu>
        ), document.getElementById("app"));
        setContextOpen(true);
    }
}

const [contextOpen, setContextOpen] = createSignal(false);

function ContextMenu(props) {
    
    let self;

    function handleClickOff(e) {
        self?.parentElement?.removeChild(self);
        setContextOpen(false);
        allowScroll();
    }

    function disableScroll(e) {
        e.preventDefault();
    }

    function preventScrollKeys(e) {
        if (["ArrowUp", "ArrowDown", "Space", "PageUp", "PageDown"].includes(e.code)) {
            e.preventDefault();
        }
    }

    function allowScroll() {
        document.removeEventListener("click", handleClickOff);
        document.removeEventListener("contextmenu", handleClickOff);
        window.removeEventListener("wheel", disableScroll);
        window.removeEventListener("keydown", preventScrollKeys);
    }

    onMount(() => {
        document.addEventListener("click", handleClickOff);
        document.addEventListener("contextmenu", handleClickOff);
        window.addEventListener("wheel", disableScroll, { passive: false });
        window.addEventListener("keydown", preventScrollKeys, { passive: false});
    });

    onCleanup(() => {
        allowScroll();
    });
    
    return (
        <div style={`top: ${props.y}px; left: ${props.x}px`} ref={self} class="context-menu">
            {props.children}
        </div>
    );
}

export default ContextMenu;