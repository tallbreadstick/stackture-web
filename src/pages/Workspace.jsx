import { createSignal, onMount, onCleanup, Show } from "solid-js";
import Navigation from "../components/Navigation";
import HandIcon from "./../assets/hand_icon.svg";
import "./pages.css";
import { createStore, unwrap } from "solid-js/store";
import toast from "solid-toast";
import { logout, user } from "../App";
import { useNavigate } from "@solidjs/router";
import ELK from "elkjs/lib/elk.bundled.js";
import Tooltip from "../menus/Tooltip";

function Workspace() {

    let gridContainerRef;

    const navigate = useNavigate();

    const [tree, setTree] = createStore([]);
    const [nodes, setNodes] = createSignal([]);
    const [edges, setEdges] = createSignal([]);
    const [messages, setMessages] = createStore([]);

    const [socket, setSocket] = createSignal(null);
    const [tooltip, setTooltip] = createSignal(null);
    const [chatOpen, setChatOpen] = createSignal(false);

    // const [input, setInput] = createSignal('');
    const [isDraggable, setIsDraggable] = createSignal(false);
    const [isDragging, setIsDragging] = createSignal(false);
    const [dragStart, setDragStart] = createSignal({ x: 0, y: 0 });
    const [canvasPosition, setCanvasPosition] = createSignal({ x: 0, y: 0 });
    const [spaceKeyPressed, setSpaceKeyPressed] = createSignal(false);

    function encodeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

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
                updateGraph(tree);
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
        const input = document.querySelector(".chat-input-area textarea");
        const message = input.value.trim();
        if (messages.length > 0 && messages[messages.length - 1].is_user === true) return;
        if (!message) return;
        setMessages([...messages, { message: message, is_user: true }]);
        if (socket()) {
            socket().send(message);
        }
        input.value = "";
    }


    function handleKeyPress(e) {
        if (e.key.toLowerCase() === 'm' && e.ctrlKey) {
            toggleDraggable();
            e.preventDefault();
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

    // DEBUG FUNCTION TO INITIALIZE DUMMY TREE STATE
    function makeDummyState() {
        // let dummy = [
        //     {
        //         "id": 1,
        //         "name": "Build a Chat App with PHP & MySQL",
        //         "summary": "The main problem to solve.",
        //         "optional": false,
        //         "resolved": false,
        //         "icon": "🏆",
        //         "branches": [2, 3, 4],
        //         "parents": []
        //     },
        //     {
        //         "id": 2,
        //         "name": "Set Up Development Environment",
        //         "summary": "Install necessary tools like PHP, MySQL, and a web server.",
        //         "optional": false,
        //         "resolved": false,
        //         "icon": "🖥",
        //         "branches": [5, 6],
        //         "parents": [1]
        //     },
        //     {
        //         "id": 3,
        //         "name": "Design the Database Schema",
        //         "summary": "Plan tables for users, messages, and chat rooms.",
        //         "optional": false,
        //         "resolved": false,
        //         "icon": "🗄",
        //         "branches": [7, 8],
        //         "parents": [1]
        //     },
        //     {
        //         "id": 4,
        //         "name": "Set Up User Authentication",
        //         "summary": "Allow users to register and log in securely.",
        //         "optional": false,
        //         "resolved": false,
        //         "icon": "🔐",
        //         "branches": [9, 10],
        //         "parents": [1]
        //     },
        //     {
        //         "id": 5,
        //         "name": "Install PHP & MySQL",
        //         "summary": "Ensure PHP, MySQL, and a server like Apache or Nginx are installed.",
        //         "optional": false,
        //         "resolved": false,
        //         "icon": "⚙️",
        //         "branches": [],
        //         "parents": [2]
        //     },
        //     {
        //         "id": 6,
        //         "name": "Set Up Local Dev Server",
        //         "summary": "Use XAMPP, MAMP, or manual setup to create a development server.",
        //         "optional": false,
        //         "resolved": false,
        //         "icon": "🌍",
        //         "branches": [],
        //         "parents": [2]
        //     },
        //     {
        //         "id": 7,
        //         "name": "Create Users Table",
        //         "summary": "Define columns for user info like username, email, and password.",
        //         "optional": false,
        //         "resolved": false,
        //         "icon": "👤",
        //         "branches": [],
        //         "parents": [3]
        //     },
        //     {
        //         "id": 8,
        //         "name": "Create Messages Table",
        //         "summary": "Store messages with sender, receiver, and timestamps.",
        //         "optional": false,
        //         "resolved": false,
        //         "icon": "💬",
        //         "branches": [],
        //         "parents": [3]
        //     },
        //     {
        //         "id": 9,
        //         "name": "Implement Login System",
        //         "summary": "Handle user sessions and authentication using PHP sessions.",
        //         "optional": false,
        //         "resolved": false,
        //         "icon": "🔑",
        //         "branches": [],
        //         "parents": [4]
        //     },
        //     {
        //         "id": 10,
        //         "name": "Implement User Registration",
        //         "summary": "Allow new users to sign up and store credentials securely.",
        //         "optional": false,
        //         "resolved": false,
        //         "icon": "📝",
        //         "branches": [],
        //         "parents": [4]
        //     }
        // ];

        // let dummy = [
        //     {"id":1,"name":"Complete Bullet-Hell Game with Levels","summary":"Deliver a fully functional bullet-hell game with multiple levels using LibGDX.","optional":false,"resolved":false,"icon":"🏆","branches":[4],"parents":[]},
        //     {"id":2,"name":"Set Up Development Environment","summary":"Establish the development environment by initializing the project and configuring settings.","optional":false,"resolved":false,"icon":"🛠","branches":[5,6],"parents":[7,8,9,10,11]},
        //     {"id":3,"name":"Implement Core Game Mechanics","summary":"Develop essential game features—player movement, enemy behavior, collision, and level loading—that cannot begin until the environment is ready.","optional":false,"resolved":false,"icon":"🎮","branches":[7,8,9,10,11],"parents":[12,13]},
        //     {"id":4,"name":"Deploy, Optimize, and Package the Game","summary":"Finalize the game with performance optimizations and prepare for distribution; this step requires complete core mechanics.","optional":false,"resolved":false,"icon":"🚀","branches":[12,13],"parents":[1]},
        //     {"id":5,"name":"Initialize LibGDX Project","summary":"Create a new LibGDX project with all necessary dependencies.","optional":false,"resolved":false,"icon":"📂","branches":[],"parents":[2]},
        //     {"id":6,"name":"Configure Game Window and Settings","summary":"Set up resolution, FPS, and input configurations.","optional":false,"resolved":false,"icon":"🖥","branches":[],"parents":[2]},
        //     {"id":7,"name":"Implement Player Movement","summary":"Develop responsive controls for player navigation.","optional":false,"resolved":false,"icon":"👾","branches":[2],"parents":[3]},
        //     {"id":8,"name":"Implement Bullet Patterns and Shooting","summary":"Design and code diverse enemy bullet patterns and player shooting mechanics.","optional":false,"resolved":false,"icon":"🔫","branches":[2],"parents":[3]},
        //     {"id":9,"name":"Implement Enemy AI","summary":"Develop enemy behavior and spawning logic.","optional":false,"resolved":false,"icon":"🤖","branches":[2],"parents":[3]},
        //     {"id":10,"name":"Implement Collision Detection and Scoring","summary":"Set up collision systems and score tracking; this is critical for gameplay feedback.","optional":false,"resolved":false,"icon":"💥","branches":[2],"parents":[3]},
        //     {"id":11,"name":"Implement Level Design and Loading","summary":"Design level layouts and implement level loading mechanisms to support multiple stages.","optional":false,"resolved":false,"icon":"🎨","branches":[2],"parents":[3]},
        //     {"id":12,"name":"Optimize Performance","summary":"Enhance game performance through code and asset optimizations.","optional":false,"resolved":false,"icon":"⚡","branches":[3],"parents":[4]},
        //     {"id":13,"name":"Export and Package for Distribution","summary":"Package the game for various platforms and prepare for release.","optional":false,"resolved":false,"icon":"📦","branches":[3],"parents":[4]}
        // ];

        // let dummy = [
        //     { "id": 1, "name": "Complete Home Server Setup for Family & Business", "summary": "Achieve a fully operational home server supporting a business website alongside existing services.", "optional": false, "resolved": false, "icon": "🏠", "branches": [4], "parents": [] },
        //     { "id": 2, "name": "Set Up Hardware, Network, and OS", "summary": "Establish the foundational environment by procuring hardware, configuring the network, and installing a robust server OS.", "optional": false, "resolved": false, "icon": "🖥", "branches": [5, 6, 7], "parents": [8, 9, 10, 11] },
        //     { "id": 3, "name": "Implement Business Website", "summary": "Develop and deploy a business website with domain acquisition, web design, and coding; these steps require a ready environment.", "optional": false, "resolved": false, "icon": "🌐", "branches": [8, 9, 10, 11], "parents": [12, 13] },
        //     { "id": 4, "name": "Deploy, Secure, and Maintain Home Server", "summary": "Finalize server setup by securing, optimizing, and maintaining all services, including the business website.", "optional": false, "resolved": false, "icon": "🔒", "branches": [12, 13], "parents": [1] },
        //     { "id": 5, "name": "Procure Server Hardware", "summary": "Purchase energy-efficient hardware suitable for a home server.", "optional": false, "resolved": false, "icon": "💻", "branches": [], "parents": [2] },
        //     { "id": 6, "name": "Configure Network & Power Backup", "summary": "Set up networking equipment, router, and UPS for reliable operation.", "optional": false, "resolved": false, "icon": "🌐", "branches": [], "parents": [2] },
        //     { "id": 7, "name": "Install and Configure Server OS", "summary": "Install a server OS (e.g., Unraid, Proxmox) to manage services effectively.", "optional": false, "resolved": false, "icon": "🛠", "branches": [], "parents": [2] },
        //     { "id": 8, "name": "Acquire Domain and Hosting", "summary": "Obtain a domain name and hosting service for the business website.", "optional": false, "resolved": false, "icon": "🔗", "branches": [2], "parents": [3] },
        //     { "id": 9, "name": "Learn Web Design Principles", "summary": "Study modern web design to create a user-friendly business website.", "optional": false, "resolved": false, "icon": "🎨", "branches": [2], "parents": [3] },
        //     { "id": 10, "name": "Develop Website Code (HTML/CSS/JS)", "summary": "Write and refine website code using HTML, CSS, and JavaScript.", "optional": false, "resolved": false, "icon": "💻", "branches": [2], "parents": [3] },
        //     { "id": 11, "name": "Deploy Business Website", "summary": "Launch the business website on the acquired hosting platform.", "optional": false, "resolved": false, "icon": "🚀", "branches": [2], "parents": [3] },
        //     { "id": 12, "name": "Optimize and Secure Website", "summary": "Enhance website performance and apply robust security measures.", "optional": false, "resolved": false, "icon": "⚡", "branches": [3], "parents": [4] },
        //     { "id": 13, "name": "Set Up Monitoring and Maintenance Tools", "summary": "Implement tools for continuous monitoring and routine maintenance of the website and server.", "optional": false, "resolved": false, "icon": "🛠", "branches": [3], "parents": [4] }
        // ];

        let dummy = [
            {"id":1,"name":"Master all Learning Requirements","summary":"Balance and complete studies in physics, calculus, networking principles and develop finance software skills for business.","optional":false,"resolved":false,"icon":"🎓","branches":[2,3],"parents":[]},
            {"id":2,"name":"Complete Academic Studies","summary":"Cover core academic subjects required for computer engineering: physics, calculus, and networking.","optional":false,"resolved":false,"icon":"📘","branches":[4,5,6],"parents":[1]},
            {"id":3,"name":"Develop Finance Software Skills","summary":"Acquire finance-related knowledge and build a finance software application for business purposes.","optional":false,"resolved":false,"icon":"💼","branches":[10,11,12],"parents":[1]},
            {"id":4,"name":"Study Physics","summary":"Learn fundamental physics principles that support engineering concepts.","optional":false,"resolved":false,"icon":"🔬","branches":[],"parents":[2]},
            {"id":5,"name":"Study Calculus","summary":"Master calculus topics essential for problem solving in engineering.","optional":false,"resolved":false,"icon":"∫","branches":[],"parents":[2]},
            {"id":6,"name":"Study Networking Principles","summary":"Understand key networking concepts including subnetting, error correction/detection, and VLSM.","optional":false,"resolved":false,"icon":"🌐","branches":[7,8,9],"parents":[2]},
            {"id":7,"name":"Learn Subnetting","summary":"Master subnetting techniques to efficiently segment networks.","optional":false,"resolved":false,"icon":"📡","branches":[],"parents":[6]},
            {"id":8,"name":"Learn Error Correction and Detection","summary":"Study methods for error correction and detection in data transmission.","optional":false,"resolved":false,"icon":"⚙️","branches":[],"parents":[6]},
            {"id":9,"name":"Learn VLSM","summary":"Understand Variable Length Subnet Masking for optimal IP address allocation.","optional":false,"resolved":false,"icon":"🛠","branches":[],"parents":[6]},
            {"id":10,"name":"Study Statistics and Quantitative Models","summary":"Learn key statistical methods and quantitative models used in finance and business.","optional":false,"resolved":false,"icon":"📊","branches":[],"parents":[3]},
            {"id":11,"name":"Design Finance Software Requirements","summary":"Outline and design requirements for a finance software application.","optional":false,"resolved":false,"icon":"📝","branches":[],"parents":[3]},
            {"id":12,"name":"Develop Finance Software Application","summary":"Build the finance software application using the acquired quantitative and design knowledge.","optional":false,"resolved":false,"icon":"💻","branches":[],"parents":[3,10,11]}
        ];

        // let dummy = [
        //     { "id": 1, "name": "Introduction to Mechanical Engineering", "summary": "Overview of the field, its applications, and importance", "icon": "📚", "parents": [], "branches": [2, 3], "optional": false, "resolved": false },
        //     { "id": 2, "name": "Foundational Subjects", "summary": "Mathematics, Physics, Chemistry", "icon": "📝", "parents": [1], "branches": [4, 5], "optional": false, "resolved": false },
        //     { "id": 3, "name": "Specialized Fields", "summary": "Introduction to various mechanical engineering fields", "icon": "🤖", "parents": [1], "branches": [6, 7], "optional": true, "resolved": false },
        //     { "id": 4, "name": "Mathematics for Mechanical Engineering", "summary": "Calculus, Linear Algebra, Differential Equations", "icon": "📐", "parents": [2], "branches": [8, 9], "optional": false, "resolved": false },
        //     { "id": 5, "name": "Physics for Mechanical Engineering", "summary": "Mechanics, Thermodynamics, Electromagnetism", "icon": "⚖️", "parents": [2], "branches": [10, 11], "optional": false, "resolved": false },
        //     { "id": 6, "name": "Design and Manufacturing", "summary": "Introduction to design principles and manufacturing processes", "icon": "🎨", "parents": [3], "branches": [12, 13], "optional": true, "resolved": false },
        //     { "id": 7, "name": "Mechatronics and Robotics", "summary": "Introduction to mechatronics and robotics", "icon": "🤖", "parents": [3], "branches": [14, 15], "optional": true, "resolved": false },
        //     { "id": 8, "name": "Calculus", "summary": "Differential Calculus, Integral Calculus", "icon": "∫", "parents": [4], "branches": [], "optional": false, "resolved": false },
        //     { "id": 9, "name": "Linear Algebra", "summary": "Vector Spaces, Linear Transformations", "icon": "⬆️", "parents": [4], "branches": [], "optional": false, "resolved": false },
        //     { "id": 10, "name": "Mechanics", "summary": "Kinematics, Dynamics, Statics", "icon": "⚙️", "parents": [5], "branches": [], "optional": false, "resolved": false },
        //     { "id": 11, "name": "Thermodynamics", "summary": "Laws of Thermodynamics, Thermodynamic Systems", "icon": "🔥", "parents": [5], "branches": [], "optional": false, "resolved": false },
        //     { "id": 12, "name": "Design Principles", "summary": "Introduction to design principles and methodologies", "icon": "📋", "parents": [6], "branches": [], "optional": true, "resolved": false },
        //     { "id": 13, "name": "Manufacturing Processes", "summary": "Introduction to various manufacturing processes", "icon": "🛠️", "parents": [6], "branches": [], "optional": true, "resolved": false },
        //     { "id": 14, "name": "Mechatronics", "summary": "Introduction to mechatronics and its applications", "icon": "🤖", "parents": [7], "branches": [], "optional": true, "resolved": false },
        //     { "id": 15, "name": "Robotics", "summary": "Introduction to robotics and its applications", "icon": "🤖", "parents": [7], "branches": [], "optional": true, "resolved": false }
        // ];

        setTree(dummy);
        updateGraph(dummy);
    }

    // === Main Function to Update the Graph ===
    async function updateGraph(treeData) {
        if (!treeData?.length) return;

        const rootNode = findRootNode(treeData);
        if (!rootNode) return;

        // Calculate positions for each node using our custom logic that handles shared children.
        const updatedNodes = adjustNodePositions(treeData, rootNode);

        // Generate edges via DFS with edge-level tracking (same as before)
        const updatedEdges = generateEdges(treeData, String(rootNode.id));

        setNodes(updatedNodes);
        setEdges(updatedEdges);
    }

    // === Helper: Identify the Root Node ===
    function findRootNode(treeData) {
        const childIds = new Set(treeData.flatMap(node => node.branches));
        return treeData.find(node => !childIds.has(node.id));
    }

    // === New Helper: Compute Subtree Width with Memoization ===
    // This function computes how much horizontal space a node’s subtree requires.
    // For a leaf we return a fixed width (60). For internal nodes, we sum the widths
    // of their children (plus spacing) but memoize the results to avoid double counting.
    function computeSubtreeWidthUnique(node, treeData, spacing = 50, memo = new Map()) {
        if (memo.has(node.id)) return memo.get(node.id);
        if (!node.branches || node.branches.length === 0) {
            memo.set(node.id, 60);
            return 60;
        }
        let totalWidth = 0;
        node.branches.forEach((childId, index) => {
            const child = treeData.find(n => String(n.id) === String(childId));
            if (child) {
                const childWidth = computeSubtreeWidthUnique(child, treeData, spacing, memo);
                totalWidth += childWidth;
                if (index < node.branches.length - 1) totalWidth += spacing;
            }
        });
        totalWidth = Math.max(totalWidth, 60);
        memo.set(node.id, totalWidth);
        return totalWidth;
    }

    // === New Helper: Recursively Assign Positions with Shared-Parent Handling ===
    // For each node we assign an x position (and y based on level).
    // If a node is reached more than once (shared child), we add the new candidate x
    // and average them so the child is balanced between all its parents.
    function assignPositions(node, treeData, xStart, y, levelSpacing = 150, spacing = 25, positions = {}) {
        // If the node hasn't been positioned yet, assign a candidate position based on its subtree width.
        if (!positions[node.id]) {
            const subtreeWidth = computeSubtreeWidthUnique(node, treeData, spacing);
            const x = xStart + subtreeWidth / 2;
            positions[node.id] = { x, y, candidates: [x] };
        }

        // Process each branch
        let currentX = xStart;
        if (node.branches && node.branches.length > 0) {
            node.branches.forEach(childId => {
                const child = treeData.find(n => String(n.id) === String(childId));
                if (!child) return;
                const childSubtreeWidth = computeSubtreeWidthUnique(child, treeData, spacing);
                const proposedX = currentX + childSubtreeWidth / 2;

                if (!positions[child.id]) {
                    positions[child.id] = { x: proposedX, y: y + levelSpacing, candidates: [proposedX] };
                } else {
                    // If this child has been positioned already, add the new candidate position
                    positions[child.id].candidates.push(proposedX);
                    const sum = positions[child.id].candidates.reduce((a, b) => a + b, 0);
                    positions[child.id].x = sum / positions[child.id].candidates.length;
                }

                // Recurse for the child, passing in the currentX as the starting x for its subtree.
                assignPositions(child, treeData, currentX, y + levelSpacing, levelSpacing, spacing, positions);

                // Increment currentX by the width of the child's subtree plus spacing.
                currentX += childSubtreeWidth + spacing;
            });
        }
        return positions;
    }

    // === New Version: Adjust Node Positions Using Subtree Grouping with Shared-Parent Handling ===
    function adjustNodePositions(treeData, rootNode) {
        const canvas = document.querySelector(".grid-container");
        const canvasWidth = canvas ? canvas.offsetWidth : 800;
        const rootOffsetY = 200;
        const spacing = 25;
        const levelSpacing = 150;

        // Compute total width of the tree from the root
        const totalWidth = computeSubtreeWidthUnique(rootNode, treeData, spacing);
        // Center the tree within the canvas
        const xStart = (canvasWidth - totalWidth) / 2;
        const positions = assignPositions(rootNode, treeData, xStart, rootOffsetY, levelSpacing, spacing);

        // Map each treeData node to our updated node definition
        return treeData.map(node => {
            const pos = positions[node.id] ? { x: positions[node.id].x, y: positions[node.id].y } : { x: 0, y: rootOffsetY };
            const label = node.icon || node.name || node.id;
            return {
                id: String(node.id),
                position: pos,
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
                if (!seenEdges.has(edgeKey)) {
                    edges.push({
                        id: `edge-${nodeId}-${childId}`,
                        source: String(nodeId),
                        target: String(childId),
                        style: { stroke: "#1a1774", strokeWidth: 2 }
                    });
                    seenEdges.add(edgeKey);
                }
                dfs(childId);
            });
        }

        dfs(String(rootId));
        return edges;
    }

    // connection logic
    const connectWebSocket = () => {
        
        toast("Connecting to chat...");
        const ws = new WebSocket("ws://stackture.eloquenceprojects.org/chat");
    
        ws.onopen = () => {
            console.log("Connected to WebSocket chat!");
            toast.success("Connected to workspace chat!");
            ws.send(JSON.stringify({
                workspace_id: parseInt(localStorage.getItem("workspace")),
                node_id: 0,
                token: localStorage.getItem("authToken")
            }));
        };
    
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.status === "error") {
                    ws.onerror(new Event("Handshake Error"));
                } else {
                    ws.onmessage = (event) => {
                        try {
                            const data = JSON.parse(event.data);
                            if ("message" in data) {
                                setMessages([...messages, { message: data.message, is_user: false }]);
                                const msgs = document.querySelector(".chat-messages");
                                msgs.scrollTop = msgs.scrollHeight - 10;
                            }
                            if ("generated_tree" in data && data.generated_tree !== null) {
                                setTree(data.generated_tree);
                                updateGraph(tree);
                            }
                        } catch (error) {
                            console.error("Failed to parse WebSocket message:", error);
                        }
                    };
                }
            } catch (error) {
                console.error("Failed to parse WebSocket message:", error);
            }
        };
    
        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            toast.error("Chat connection error.");
        };
    
        ws.onclose = () => {
            console.warn("Connection closed. Attempting to reconnect...");
    
            setTimeout(() => {
                connectWebSocket(); // Retry connection
            }, 5000); // Exponential backoff
        };
    
        setSocket(ws);
    };

    function fetchMessages() {
        const workspace_id = localStorage.getItem("workspace");
        const token = localStorage.getItem("authToken");
        if (!token) {
            toast.error("Unauthorized Action. Please sign in.");
            logout();
            navigate("/");
            return;
        }
        fetch(`http://stackture.eloquenceprojects.org/chat/fetch/${workspace_id}/0`, {
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
                    toast.error("Failed to get chats");
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
                if (!data || data.length === 0) {
                    setMessages([]);
                    return;
                }
                setMessages(data.filter(msg => !(!msg.is_user && msg.message === "")));
                const messages = document.querySelector(".chat-messages");
                messages.scrollTop = messages.scrollHeight + 10;
                console.log(data);
            })
            .catch(error => {
                console.error("Failed to get chat state:", error);
                toast.error("Failed to get chats. Try again later.");
            })
    }

    onMount(() => {
        document.title = "Stackture - Workspace";
        if (user() === null) {
            navigate("/");
        }
        window.addEventListener('keydown', handleKeyPress);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        getWorkspaceState();
        fetchMessages();
        // makeDummyState();
        connectWebSocket();
    });

    onCleanup(() => {
        window.removeEventListener('keydown', handleKeyPress);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        if (socket()) {
            socket().close();
        }
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
                                x1={nodes()?.find(n => n.id === edge.source).position.x + 2}
                                y1={nodes()?.find(n => n.id === edge.source).position.y}
                                x2={nodes()?.find(n => n.id === edge.target).position.x - 2}
                                y2={nodes()?.find(n => n.id === edge.target).position.y}
                                stroke="#00b1b1"
                                style="stroke-width:4"
                                strokeLinecap="round"
                                filter="url(#shadow)"
                                shapeRendering="geometricPrecision"
                                vectorEffect="non-scaling-stroke"
                            />
                        ))}
                        {nodes().map(node => (
                            <g
                                transform={`translate(${node.position.x}, ${node.position.y})`}
                                key={node.id}
                                onMouseEnter={(e) => {
                                    const fullNode = unwrap(tree.find(n => n.id == node.id));
                                    if (fullNode) {
                                        setTooltip({
                                            name: fullNode.name,
                                            summary: fullNode.summary,
                                            x: e.clientX,
                                            y: e.clientY
                                        });
                                    }
                                }}
                                onMouseMove={(e) => {
                                    const fullNode = unwrap(tree.find(n => n.id == node.id));
                                    if (fullNode) {
                                        setTooltip({
                                            name: fullNode.name,
                                            summary: fullNode.summary,
                                            x: e.clientX,
                                            y: e.clientY
                                        });
                                    }
                                }}
                                onMouseLeave={() => setTooltip(null)}>
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
                <div class={`tool-icon ${isDraggable() ? 'active' : ''}`} onClick={toggleDraggable} title="Toggle Pan Mode [CTRL + M]">
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
                    <For each={messages}>
                        {(message, index) => (
                            <div class={`message ${message.is_user ? 'user' : 'ai'}`} innerHTML={message.message.split('\n').map(encodeHtml).join('<br>')} />
                        )}
                    </For>
                </div>
                <div class="chat-input-area">
                    <textarea
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                const messages = document.querySelector(".chat-messages");
                                messages.scrollTop = messages.scrollHeight - 10;
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        placeholder="Ask something about your workspace..."
                    />
                    <button onClick={sendMessage}>
                        <i class="fa fa-paper-plane"></i>
                    </button>
                </div>
            </div>
            <Show when={tooltip() !== null}>
                <Tooltip
                    name={tooltip().name}
                    summary={tooltip().summary}
                    x={tooltip().x}
                    y={tooltip().y} />
            </Show>
        </div>
    );
}

export default Workspace;