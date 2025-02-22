import ProfilePlaceholder from "./../assets/user_profile.webp";

import { user } from "../App";
import { A } from "@solidjs/router";

function Navigation() {
    return (
        <div class="navigation">
            <A href="/">Home</A>
            <A href="/about">About</A>
            <Show when={user() !== null}>
                <div>
                    <label>Username</label>
                    <label>Email</label>
                </div>
                <div>
                    <img src={ProfilePlaceholder} height="30px" />
                </div>
            </Show>
        </div>
    );
}

export default Navigation;