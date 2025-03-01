function Tooltip(props) {
    return (
        <div 
            className="tooltip" 
            style={{ position: "absolute", top: props.y + "px", left: props.x + "px" }}
        >
            <label>{props.name}</label>
            <p>{props.summary}</p>
            {/* <button onClick={props.onClick}>Open Chat</button> */}
        </div>
    );
}

export default Tooltip;
