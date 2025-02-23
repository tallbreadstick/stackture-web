import { onMount } from "solid-js";
import Navigation from "../components/Navigation";
import "./pages.css";

function Dashboard() {

    onMount(() => {
        document.title = "Stackture - Dashboard";
    });

    return (
        <div id="dashboard-page" class="page">
            <Navigation />
            <div class="page-content">
                
            </div>
        </div>
    );
}

export default Dashboard;