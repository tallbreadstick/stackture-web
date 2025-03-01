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
                "name": "Build a Chat App with PHP & MySQL",
                "summary": "The main problem to solve.",
                "optional": false,
                "resolved": false,
                "icon": "🏆",
                "branches": [2, 3, 4],
                "parents": []
            },
            {
                "id": 2,
                "name": "Set Up Development Environment",
                "summary": "Install necessary tools like PHP, MySQL, and a web server.",
                "optional": false,
                "resolved": false,
                "icon": "🖥",
                "branches": [5, 6],
                "parents": [1]
            },
            {
                "id": 3,
                "name": "Design the Database Schema",
                "summary": "Plan tables for users, messages, and chat rooms.",
                "optional": false,
                "resolved": false,
                "icon": "🗄",
                "branches": [7, 8],
                "parents": [1]
            },
            {
                "id": 4,
                "name": "Set Up User Authentication",
                "summary": "Allow users to register and log in securely.",
                "optional": false,
                "resolved": false,
                "icon": "🔐",
                "branches": [9, 10],
                "parents": [1]
            },
            {
                "id": 5,
                "name": "Install PHP & MySQL",
                "summary": "Ensure PHP, MySQL, and a server like Apache or Nginx are installed.",
                "optional": false,
                "resolved": false,
                "icon": "⚙️",
                "branches": [],
                "parents": [2]
            },
            {
                "id": 6,
                "name": "Set Up Local Dev Server",
                "summary": "Use XAMPP, MAMP, or manual setup to create a development server.",
                "optional": false,
                "resolved": false,
                "icon": "🌍",
                "branches": [],
                "parents": [2]
            },
            {
                "id": 7,
                "name": "Create Users Table",
                "summary": "Define columns for user info like username, email, and password.",
                "optional": false,
                "resolved": false,
                "icon": "👤",
                "branches": [],
                "parents": [3]
            },
            {
                "id": 8,
                "name": "Create Messages Table",
                "summary": "Store messages with sender, receiver, and timestamps.",
                "optional": false,
                "resolved": false,
                "icon": "💬",
                "branches": [],
                "parents": [3]
            },
            {
                "id": 9,
                "name": "Implement Login System",
                "summary": "Handle user sessions and authentication using PHP sessions.",
                "optional": false,
                "resolved": false,
                "icon": "🔑",
                "branches": [],
                "parents": [4]
            },
            {
                "id": 10,
                "name": "Implement User Registration",
                "summary": "Allow new users to sign up and store credentials securely.",
                "optional": false,
                "resolved": false,
                "icon": "📝",
                "branches": [],
                "parents": [4]
            }
        ];

        setTree(dummy);
        updateGraph(dummy);
    }

    // === Main Function to Update the Graph ===
    async function updateGraph(treeData) {
        if (!treeData?.length) return;

        const rootNode = findRootNode(treeData);
        if (!rootNode) return;

        // Build a flat ELK graph (only used for initial node position info)
        const elkGraph = createElkGraph(treeData, rootNode.id);
        const elk = new ELK();

        const layout = await elk.layout(elkGraph, {
            layoutOptions: {
                "elk.algorithm": "layered",
                "elk.direction": "DOWN",
                "elk.spacing.nodeNode": "50",
                "elk.layered.spacing.nodeNodeBetweenLayers": "30",
                "elk.edgeRouting": "ORTHOGONAL",
                "nodePlacement.strategy": "NETWORK_SIMPLEX"
            }
        });
        if (!layout.children) return;

        const nodeDepths = computeNodeDepths(treeData, rootNode.id);
        // Calculate positions for each node based on our custom logic
        const updatedNodes = adjustNodePositions(layout, treeData, nodeDepths);

        // Generate edges by doing an exhaustive DFS from the root,
        // making sure to skip duplicate edges with a seen set.
        const updatedEdges = generateEdges(treeData, String(rootNode.id));

        setNodes(updatedNodes);
        setEdges(updatedEdges);
    }

    // === Helper: Identify the Root Node ===
    function findRootNode(treeData) {
        const childIds = new Set(treeData.flatMap(node => node.branches));
        return treeData.find(node => !childIds.has(node.id));
    }

    // === Helper: Build the ELK Graph Structure ===
    function createElkGraph(treeData, rootId) {
        return {
            id: String(rootId),
            children: treeData.map(node => ({
                id: String(node.id),
                width: 60,
                height: 60
            })),
            edges: treeData.flatMap(node =>
                node.branches.map(branchId => ({
                    id: `edge-${node.id}-${branchId}`,
                    sources: [String(node.id)],
                    targets: [String(branchId)]
                }))
            )
        };
    }

    // === Helper: Compute Node Depths (DFS) ===
    function computeNodeDepths(treeData, rootId) {
        const depths = {};
        function dfs(nodeId, depth) {
            if (depths[nodeId] !== undefined) return;
            depths[nodeId] = depth;
            const node = treeData.find(n => String(n.id) === nodeId);
            if (node) {
                node.branches.forEach(childId => dfs(String(childId), depth + 1));
            }
        }
        dfs(String(rootId), 0);
        return depths;
    }

    // === Helper: Adjust Node Positions Based on Level Grouping ===
    function adjustNodePositions(elkLayout, treeData, nodeDepths) {
        const canvas = document.querySelector(".grid-container");
        const canvasWidth = canvas ? canvas.offsetWidth : 800;
        const ySpacing = 120;
        const rootOffsetY = 200;

        // Group nodes by depth level
        const levels = {};
        elkLayout.children.forEach(child => {
            const depth = nodeDepths[child.id] ?? 0;
            if (!levels[depth]) levels[depth] = [];
            levels[depth].push(child);
        });

        // For each node, assign an x position evenly within its level
        return elkLayout.children.map(child => {
            const depth = nodeDepths[child.id] ?? 0;
            const levelNodes = levels[depth];
            const count = levelNodes.length;
            const index = levelNodes.findIndex(n => n.id === child.id);

            // Evenly space nodes horizontally across the canvas width
            const gap = (canvasWidth - (canvasWidth / 2)) / (count + 1);
            const xPosition = gap * (index + 1);
            const yPosition = rootOffsetY + depth * ySpacing;

            // Get a dynamic label (using icon, name, or id)
            const treeNode = treeData.find(n => String(n.id) === child.id);
            const label = treeNode ? (treeNode.icon || treeNode.name || treeNode.id) : child.id;

            return {
                id: child.id,
                position: { x: xPosition, y: yPosition },
                data: { label },
                style: {
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "30px",
                    backgroundColor: "#1e80d6",
                    color: "white",
                    border: "2px solid #000",
                    textAlign: "center"
                }
            };
        });
    }

    // === Helper: Generate Edges via DFS with Edge-Level Tracking ===
    function generateEdges(treeData, rootId) {
        const edges = [];
        const seenEdges = new Set();

        function dfs(nodeId) {
            const node = treeData.find(n => String(n.id) === String(nodeId));
            if (!node) return;

            node.branches.forEach(childId => {
                const edgeKey = `${nodeId}->${childId}`;
                // Only add this edge if it hasn't been added yet
                if (!seenEdges.has(edgeKey)) {
                    console.log(`edge-${nodeId}-${childId}`);
                    edges.push({
                        id: `edge-${nodeId}-${childId}`,
                        source: String(nodeId),
                        target: String(childId),
                        style: { stroke: "#1a1774", strokeWidth: 2 }
                    });
                    seenEdges.add(edgeKey);
                }
                // Continue DFS from the child regardless of whether an edge was already drawn to it
                dfs(childId);
            });
        }

        dfs(String(rootId));
        console.log([...document.querySelectorAll("line")]);
        return edges;
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

    function getViewBox() {
        const minX = Math.min(...nodes().map(n => n.position.x), 0) - 50;
        const minY = Math.min(...nodes().map(n => n.position.y), 0) - 50;
        const maxX = Math.max(...nodes().map(n => n.position.x), 2000) + 50;
        const maxY = Math.max(...nodes().map(n => n.position.y), 2000) + 50;
        const viewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
        return viewBox;
    }

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
                    <svg width="100%" height="100%" viewBox={getViewBox()}>
                        {edges().map(edge => (
                            <line
                                x1={nodes().find(n => n.id === edge.source).position.x + 2}
                                y1={nodes().find(n => n.id === edge.source).position.y}
                                x2={nodes().find(n => n.id === edge.target).position.x - 2} 
                                y2={nodes().find(n => n.id === edge.target).position.y}
                                stroke="#00b1b1"
                                style="stroke-width:8"
                                strokeLinecap="round"
                                filter="url(#shadow)"
                                shapeRendering="geometricPrecision"
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