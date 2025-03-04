import ProfilePlaceholder from "./../assets/user_profile.webp";

import { logout, user } from "../App";
import { A, useNavigate } from "@solidjs/router";
import { createSignal, Match, onCleanup, onMount, Switch } from "solid-js";
import "../assets/font-awesome/css/font-awesome.min.css";

function Navigation() {

    let profileMenu;

    const navigate = useNavigate();

    const [profileOpen, setProfileOpen] = createSignal(false);

    function openProfileMenu() {
        setTimeout(() => setProfileOpen(true), 0);
    }

    function handleClickOff(e) {
        console.log(profileMenu);
        if (!profileMenu?.contains(e.target)) {
            setProfileOpen(false);
        }
    }

    function logOutAndReturn() {
        logout();
        navigate("/");
    }

    onMount(() => {
        document.addEventListener("click", handleClickOff);
        document.addEventListener("contextmenu", handleClickOff);
    });

    onCleanup(() => {
        document.removeEventListener("click", handleClickOff);
        document.removeEventListener("contextmenu", handleClickOff);
    });

    return (
        <div class="navigation z-10">
            <A href={user() !== null ? "/dashboard" : "/"}><i class="fa fa-home" aria-hidden="true"></i> Home</A>
            <A href="/about"><i class="fa fa-info-circle" aria-hidden="true"></i> About</A>
            <Show when={user() !== null}>
                <Switch>
                    <Match when={!profileOpen()}>
                        <div class="user-profile" onClick={openProfileMenu}>
                            <div class="user-details">
                                <label>{user()}</label>
                                <p>Signed In</p>
                            </div>
                            <img src={ProfilePlaceholder} class="rounded-3xl" height="35px" />
                        </div>
                    </Match>
                    <Match when={profileOpen()}>
                        <div ref={el => (profileMenu = el)} class="profile-menu">
                            <label>Sign out from <u>{user()}</u>?</label>
                            <button onClick={logOutAndReturn}>Yes</button>
                            <button onClick={() => setProfileOpen(false)}>No</button>
                        </div>
                    </Match>
                </Switch>
            </Show>
        </div>
    );
}

export default Navigation;