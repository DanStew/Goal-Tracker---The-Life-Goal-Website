import { useNavigate } from "react-router-dom"

function SidebarElement({elementName,elementLink,colourScheme}){

   //Making the navigator for this file
   const navigator = useNavigate()

   return(
        <div onClick={() => navigator(elementLink)} className={"sideBarElement flexItems " + colourScheme}>
            <span>{elementName}</span>
        </div>
   )
}

export default SidebarElement