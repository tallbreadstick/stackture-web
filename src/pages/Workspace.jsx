import { createSignal, onMount, onCleanup } from "solid-js";
import Navigation from "../components/Navigation";
import HandIcon from "./../assets/hand_icon.svg";
import "./pages.css";
import { createStore } from "solid-js/store";
import toast from "solid-toast";
import { logout } from "../App";
import { useNavigate } from "@solidjs/router";
import ELK from "elkjs/lib/elk.bundled.js";


function Workspace() {

    let gridContainerRef;

    const navigate = useNavigate();

    const [tree, setTree] = createStore([]);
    const [nodes, setNodes] = createSignal([]);
    const [edges, setEdges] = createSignal([]);

    const [chatOpen, setChatOpen] = createSignal(false);
    const [messages, setMessages] = createSignal([]);
    const [input, setInput] = createSignal('');
    const [isDraggable, setIsDraggable] = createSignal(false);
    const [isDragging, setIsDragging] = createSignal(false);
    const [dragStart, setDragStart] = createSignal({ x: 0, y: 0 });
    const [canvasPosition, setCanvasPosition] = createSignal({ x: 0, y: 0 });
    const [spaceKeyPressed, setSpaceKeyPressed] = createSignal(false);

    function getWorkspaceState() {
        const workspace_id = localStorage.getItem("workspace");
        const token = localStorage.getItem("authToken");
        if (!token) {
            toast.error("Unauthorized Action. Please sign in.");
            logout();
            navigate("/");
            return;
        }
        fetch(`http://stackture.eloquenceprojects.org/api/workspace/get/${workspace_id}`, {
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
                console.log(err);
                toast.error("Failed to get workspace state");
                return;
            }
            if (!response.ok) {
                if (data.error === "TokenExpired") {
                    toast.error("Token expired. Please log in.");
                    logout();
                    navigate("/");
                    return;
                }
                throw new Error(data.error || `Error: ${response.status}`);
            }
            if (data.length === 0) {
                setTree([]);
                return;
            }
            setTree(data);
            console.log(data);
        })
        .catch(error => {
            console.error("Failed to get workspace state:", error);
            toast.error("Failed to get workspace. Try again later.");
        })
    }

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

    function makeDummyState() {
        let dummy = [
            {
                "id": 1,
                "name": "Root Problem",
                "summary": "The main problem to solve.",
                "optional": false,
                "resolved": false,
                "icon": "📌",
                "branches": [2, 3],
                "parents": []
            },
            {
                "id": 2,
                "name": "Subproblem A",
                "summary": "A required step.",
                "optional": false,
                "resolved": false,
                "icon": "📎",
                "branches": [],
                "parents": [1]
            },
            {
                "id": 3,
                "name": "Subproblem B",
                "summary": "An alternative path.",
                "optional": true,
                "resolved": false,
                "icon": "📎",
                "branches": [],
                "parents": [1]
            }
        ];
        setTree(dummy);
        updateGraph(tree);
    }

    async function updateGraph(treeData) {
        if (!treeData.length) return;
    
        // Find actual root node (node without parents)
        const childIds = new Set(treeData.flatMap(node => node.branches));
        const rootNode = treeData.find(node => !childIds.has(node.id));
        if (!rootNode) return;
    
        // Create ELK Graph structure
        const elkGraph = {
            id: String(rootNode.id),
            children: treeData.map(node => ({ id: String(node.id), width: 50, height: 50 })), // Circular size
            edges: treeData.flatMap(node => node.branches.map(branchId => ({
                id: `edge-${node.id}-${branchId}`,
                sources: [String(node.id)],
                targets: [String(branchId)]
            })))
        };
    
        const elk = new ELK();
        const layout = await elk.layout(elkGraph, {
            layoutOptions: {
                "elk.algorithm": "layered",
                "elk.direction": "DOWN",
                "nodePlacement.strategy": "NETWORK_SIMPLEX"
            }
        });
    
        if (!layout.children) return; // Avoid crashes if ELK fails
    
        // Get canvas width (assuming the canvas has `class="grid-container"`)
        const canvas = document.querySelector(".grid-container");
        const canvasWidth = canvas ? canvas.offsetWidth : 800; // Default width if not found
        const centerX = canvasWidth / 2;
    
        // Find root's current x position
        const rootLayout = layout.children.find(n => n.id === String(rootNode.id));
        const rootX = rootLayout ? rootLayout.x || 0 : 0;
    
        // Compute offset so root starts at the center of the canvas
        const offsetX = centerX - rootX;
    
        // === BFS to determine node levels ===
        const levelMap = new Map();
        const queue = [{ id: String(rootNode.id), depth: 0 }];
    
        while (queue.length) {
            const { id, depth } = queue.shift();
            if (!levelMap.has(depth)) levelMap.set(depth, []);
            levelMap.get(depth).push(id);
    
            // Add children to queue
            const children = layout.edges
                .filter(edge => edge.sources[0] === id)
                .map(edge => ({ id: edge.targets[0], depth: depth + 1 }));
    
            queue.push(...children);
        }
    
        // === Adjust node positions based on levelMap ===
        const xSpacing = 200; // Space between siblings
        const ySpacing = 150; // Space between levels
        const rootOffsetY = 300; // Move root node down by 300px
    
        const updatedNodes = layout.children.map(n => {
            const depth = [...levelMap.entries()].find(([, ids]) => ids.includes(n.id))?.[0] || 0;
            const siblings = levelMap.get(depth) || [];
    
            const levelWidth = siblings.length * xSpacing;
            const xPosition = centerX - levelWidth / 2 + siblings.indexOf(n.id) * xSpacing;
    
            const nodeData = treeData.find(t => String(t.id) === n.id);
    
            return {
                id: n.id,
                position: { x: xPosition, y: depth * ySpacing + rootOffsetY }, // Apply root offset
                data: { label: nodeData?.icon || "❓" }, // Emoji as label
                style: {
                    width: 60,  // Slightly bigger node
                    height: 60,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "30px", // Bigger emoji
                    backgroundColor: "#1e80d6", // Node color
                    color: "white", // Ensure emoji is visible
                    border: "2px solid #000"
                }
            };
        });
    
        setNodes(updatedNodes);
        setEdges(layout.edges.map(e => ({
            id: e.id,
            source: e.sources[0],
            target: e.targets[0],
            style: { stroke: "#1a1774", strokeWidth: 2 } // Edge color
        })));
    }
    
    onMount(() => {
        document.title = "Stackture - Workspace";
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        // getWorkspaceState();
        makeDummyState();
        console.log(tree);
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
                    <svg width="100%" height="100%">
                        {edges().map(edge => (
                            <line
                                x1={nodes().find(n => n.id === edge.source).position.x}
                                y1={nodes().find(n => n.id === edge.source).position.y}
                                x2={nodes().find(n => n.id === edge.target).position.x}
                                y2={nodes().find(n => n.id === edge.target).position.y}
                                stroke="#00b1b1"
                                style="stroke-width:5"
                                strokeLinecap="round"
                                filter="url(#shadow)"
                                vectorEffect="non-scaling-stroke"
                            />
                        ))}
                        {nodes().map(node => (
                            <g transform={`translate(${node.position.x}, ${node.position.y})`} key={node.id}>
                                <circle
                                    r="30"
                                    fill="#1e80d6"
                                    filter="url(#shadow)"
                                />
                                <text 
                                    x="0" 
                                    y="0" 
                                    textAnchor="middle" 
                                    dominantBaseline="middle" 
                                    fontSize="2rem" 
                                    fill="white"
                                >
                                    {node.data.label}
                                </text>
                            </g>
                        ))}
                        <defs>
                            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                                <feDropShadow dx="3" dy="3" stdDeviation="4" floodColor="black" />
                            </filter>
                        </defs>
                    </svg>
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