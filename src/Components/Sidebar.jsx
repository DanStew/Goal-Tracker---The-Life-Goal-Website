import SidebarElement from "./SidebarElement.jsx"

function Sidebar({colourScheme}){
    return(
        <div className={"sideBarContent flexItems " + colourScheme}>
            <SidebarElement elementName="Home" elementLink="/" colourScheme={colourScheme}/>
            <SidebarElement elementName="My Goals" elementLink="/MyGoals" colourScheme={colourScheme}/>
            <SidebarElement elementName="Timetable" elementLink="/Timetable" colourScheme={colourScheme}/>
            <SidebarElement elementName="Account" elementLink="/Account" colourScheme={colourScheme}/>
            <SidebarElement elementName="Settings" elementLink="/Settings" colourScheme={colourScheme}/>
        </div>
    )
}

export default Sidebar