import CloseButton from "./../assets/close.svg";

function TextPrompt(props) {

    let self;

    return (
        <div ref={self} id="vignette">
            <div class="text-prompt">
                <div class="prompt-exit" onClick={props.onClose}>
                    <img src={CloseButton} width="30px" />
                </div>
                <h3>{props.title}</h3>
                {props.children}
                <button onClick={props.onSubmit}>Submit</button>
            </div>
        </div>
    );
}

export default TextPrompt;