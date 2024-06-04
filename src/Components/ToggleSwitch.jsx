import "../Style/toggleSwitch.scss"

function ToggleSwitch(){
    return(
        <div>
            <label className="switch">
                <input type="checkbox" />
                <span className="slider input round"></span>
            </label>
        </div>
    )
}

export default ToggleSwitch