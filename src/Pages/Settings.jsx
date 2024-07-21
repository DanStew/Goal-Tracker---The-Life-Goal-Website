import DefaultWebPage from "../Components/DefaultWebPage";

function Settings({colourScheme,changedColourScheme,setChangedColourScheme}) {
  return (<DefaultWebPage colourScheme={colourScheme} webpage={"Settings"} changedColourScheme={changedColourScheme} setChangedColourScheme={setChangedColourScheme}/>);
}

export default Settings;
