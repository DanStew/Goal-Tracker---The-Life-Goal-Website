import TimetableDisplay from "./TimeTableDisplay.jsx"

function TimetableComp(){
    return(
        <div className="timetable">
            <div className="timetableHeader flexItems">
                <p>Timetable</p>
                <button>Add Event</button>
            </div>
            <div className="timetableMain">
                <TimetableDisplay/>
            </div>
        </div>
    )
}

export default TimetableComp