import { useNavigate } from "react-router-dom"

function SidebarElement({elementName,elementLink}){

   //Making the navigator for this file
   const navigator = useNavigate()

   return(
        <div onClick={() => navigator(elementLink)} className="sideBarElement flexItems">
            <span>{elementName}</span>
        </div>
   )
}

export default SidebarElement