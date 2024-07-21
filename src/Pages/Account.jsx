//Importing the components into the component
import DefaultWebPage from "../Components/DefaultWebPage.jsx";

function Account({colourScheme}) {
  return (<DefaultWebPage colourScheme={colourScheme} webpage={"My Account"}/>);
}

export default Account;
