function WorkspaceCard(props) {
    return (
        <div class="workspace-card">
            <h1>{props.title}</h1>
            <p>{props.description}</p>
        </div>
    );
}

export default WorkspaceCard;