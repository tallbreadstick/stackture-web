import { createSignal, onMount, onCleanup } from "solid-js";
import Navigation from "../components/Navigation";
import HandIcon from "./../assets/hand_icon.svg";
import "./pages.css";

function Workspace() {
    let gridContainerRef;
    const [chatOpen, setChatOpen] = createSignal(false);
    const [messages, setMessages] = createSignal([]);
    const [input, setInput] = createSignal('');
    const [isDraggable, setIsDraggable] = createSignal(false);
    const [isDragging, setIsDragging] = createSignal(false);
    const [dragStart, setDragStart] = createSignal({ x: 0, y: 0 });
    const [canvasPosition, setCanvasPosition] = createSignal({ x: 0, y: 0 });
    const [spaceKeyPressed, setSpaceKeyPressed] = createSignal(false);

    function toggleChat() {
        setChatOpen(!chatOpen());
    }

    function sendMessage() {
        if (!input().trim()) return;
        
        setMessages([...messages(), { text: input(), sender: 'user' }]);
        
        setTimeout(() => {
            setMessages([...messages(), { 
                text: "I'm your AI assistant. How can I help with your workspace?", 
                sender: 'ai' 
            }]);
        }, 1000);
        
        setInput('');
    }

    function handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    function toggleDraggable() {
        setIsDraggable(!isDraggable());
    }

    function handleMouseDown(e) {
        if (isDraggable() || spaceKeyPressed()) {
            setIsDragging(true);
            setDragStart({ x: e.clientX, y: e.clientY });
        }
    }

    function handleMouseMove(e) {
        if (isDragging()) {
            const deltaX = e.clientX - dragStart().x;
            const deltaY = e.clientY - dragStart().y;
            
            const currentX = canvasPosition().x;
            const currentY = canvasPosition().y;
            
            let newX = currentX + deltaX;
            let newY = currentY + deltaY;
            
            const gridRect = gridContainerRef.getBoundingClientRect();
            const canvasRect = gridContainerRef.parentElement.getBoundingClientRect();
            
            const extraWidth = (gridRect.width - canvasRect.width) / 2;
            const extraHeight = (gridRect.height - canvasRect.height) / 2;
            
            const minX = -extraWidth;
            const maxX = extraWidth;  
            const minY = -extraHeight; 
            const maxY = extraHeight;  
            
            newX = Math.max(minX, Math.min(newX, maxX));
            newY = Math.max(minY, Math.min(newY, maxY));
            
            setCanvasPosition({ x: newX, y: newY });
            setDragStart({ x: e.clientX, y: e.clientY });
        }
    }
    function handleMouseUp() {
        setIsDragging(false);
    }

    function handleKeyDown(e) {
        if (e.code === 'Space' && !spaceKeyPressed()) {
            e.preventDefault();
            setSpaceKeyPressed(true);
        }
    }

    function handleKeyUp(e) {
        if (e.code === 'Space') {
            setSpaceKeyPressed(false);
        }
    }
    
    onMount(() => {
        document.title = "Stackture - Workspace";

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    });

    onCleanup(() => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    });

    return (
        <div id="workspace-page" class="page">
            <Navigation />
            <div 
                class={`ws-canvas ${isDraggable() || spaceKeyPressed() ? 'draggable' : ''} ${isDragging() ? 'dragging' : ''}`} 
                onMouseDown={handleMouseDown}
            >
                <div 
                    class="grid-container" 
                    ref={gridContainerRef}
                    style={`transform: translate(${canvasPosition().x}px, ${canvasPosition().y}px)`}
                >
                </div>
            </div>
            <div class="ws-toolbar">
                <div class={`tool-icon ${isDraggable() ? 'active' : ''}`} onClick={toggleDraggable} title="Toggle Pan Mode {space + hold}">
                    <img src={HandIcon} height="25px" style="filter: brightness(0) invert(1);"></img>
                </div>
                <div class="tool-icon">
                </div>
                <div class="tool-icon">
                </div>
                <div class="tool-icon">
                </div>
                <div class="tool-icon">
                </div>
                <div class="tool-icon">
                </div>
            </div>
            <div class={`ws-chat ${chatOpen() ? 'open' : ''}`}>
                <div class="chat-header" onClick={toggleChat} style="cursor: pointer;">
                    <h3>AI Assistant</h3>
                </div>
                <div class="chat-messages">
                    {messages().map((message, index) => (
                        <div class={`message ${message.sender}`}>
                            {message.text}
                        </div>
                    ))}
                </div>
                <div class="chat-input-area">
                    <textarea 
                        value={input()} 
                        onInput={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask something about your workspace..."
                    />
                    <button onClick={sendMessage}>
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Workspace;