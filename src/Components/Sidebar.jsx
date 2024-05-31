import SidebarElement from "./SidebarElement.jsx"

function Sidebar(){
    return(
        <div className="sideBarContent flexItems">
            <SidebarElement elementName="Home" elementLink="/"/>
            <SidebarElement elementName="My Goals" elementLink="/MyGoals"/>
            <SidebarElement elementName="Timetable" elementLink="/Timetable"/>
            <SidebarElement elementName="Account" elementLink="/Account"/>
            <SidebarElement elementName="Settings" elementLink="/Settings"/>
        </div>
    )
}

export default Sidebar