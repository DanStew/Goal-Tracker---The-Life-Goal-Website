import MyAccount from "./MyAccount"
import Goals from "./Goals"
import TimeTableComp from "./TimetableComp"
import SettingsComp from "./SettingsComp"

function MainContent({webpage,currentUser,colourScheme, changedColourScheme, setChangedColourScheme}){
    return(
        <div className="content flexItems">
          {/* Conditionally rendering the elements, depending on what the webpage value is */}
          {webpage == "My Account" ? <MyAccount currentUser={currentUser} colourScheme={colourScheme}/>: <div style={{display:"none"}}></div>}
          {webpage == "Home" ? 
            <div className="content flexItems">
              <Goals currentUser={currentUser} colourScheme={colourScheme}/>
              <TimeTableComp currentUser={currentUser} colourScheme={colourScheme}/>
            </div> : <div style={{display:"none"}}></div>}
          {webpage == "My Goals" ? <Goals currentUser={currentUser} colourScheme={colourScheme}/> : <div style={{display:"none"}}></div>}
          {webpage == "Settings" ? <SettingsComp currentUser={currentUser} changedColourScheme={changedColourScheme} setChangedColourScheme={(e) => setChangedColourScheme(e)} colourScheme={colourScheme}/> : <div style={{display:"none"}}></div>}
          {webpage == "Timetable" ? <TimeTableComp currentUser={currentUser} colourScheme={colourScheme}/> : <div style={{display:"none"}}></div>}
        </div>
    )
}

export default MainContent