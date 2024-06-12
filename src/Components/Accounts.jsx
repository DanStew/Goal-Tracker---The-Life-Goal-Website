import { useEffect, useState } from "react";
import exitButton from "../Images/exitButton.jpg"
import { arrayUnion, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../Config/firebase";
import {v4 as uuidv4} from 'uuid';

function Accounts({goalName,goalUid, entryIds, windowShown2, showWindow2}) {
  //Usestate to store the inputs from the form
  const [entryName, setEntryName] = useState("");
  const [currentSkill,setCurrentSkill] = useState("")
  const [skillsArray, setSkillsArray] = useState([]);
  const [entryDetails, setEntryDetails] = useState("")
  const [errorMsg,setErrorMsg] = useState("")

  //Function used to correctly format the given input
  function formatString(inputString){
    //Copying the string without mutating and Making it formatted
    let copyString = ""
    for (let i=0 ; i<=inputString.length; i++){
        if (i==0){
            copyString += inputString.charAt(i).toUpperCase()
            continue
        }
        copyString += inputString.charAt(i).toLowerCase()
    }
    return copyString
  }

  //Function to add the current enterred skill to the skill array, and set the skill variable to null
  function addSkill() {
    //If the skill is empty, reject it
    if (currentSkill == "") {
      return;
    }
    //Formatting the string correctly
    let formattedString = formatString(currentSkill);
    /* Appending the new skills to the skills array */
    setSkillsArray((prevSkillsArr) => {
      return [...prevSkillsArr, formattedString];
    });
    setCurrentSkill("");
    document.getElementById("skillInput").value = "";
  }

  //Function to remove a given skill from an array
  function removeSkill(skillName) {
    //Making a copy of the array without cloning it
    let tempArray = skillsArray.slice();
    //Finding the index of the item to be removed
    let index = tempArray.indexOf(skillName);
    //Removing the item at that index
    tempArray.splice(index, 1);
    //Setting the changed array to be the actual array
    setSkillsArray(tempArray);
  }

  //UseEffect to reset the errorMsg
  useEffect(() => {
    setErrorMsg("")
    resetValues()
  },[windowShown2])

  function resetValues(){
      setEntryName("")
      setSkillsArray([])
      setEntryDetails("")
  }

  function getCurrentDate(){
    //Getting the current date and time, and formatting it
    let currentDate = new Date()
    //Putting all the date information into an object
    //The if statements are to ensure that the date is currently formatted, with 0s when needed
    let currentDateObj = {
            year : currentDate.getFullYear(), 
            month : currentDate.getMonth()+1 < 10? "0" + (currentDate.getMonth()+1) : currentDate.getMonth() + 1,
            day : currentDate.getDate() < 10 ? "0" + currentDate.getDate() : currentDate.getDate(),
            hours: currentDate.getHours() < 10 ? "0" + currentDate.getHours() : currentDate.getHours(),
            minutes: currentDate.getMinutes() < 10 ? "0" + currentDate.getMinutes() : currentDate.getMinutes()}
    //Returning a formatted string back to the function
    return currentDateObj.year + "/" + currentDateObj.month + "/" + currentDateObj.day + " " + currentDateObj.hours + ":" + currentDateObj.minutes
  }

  //Function to process and execute the function of the form
  async function processForm(){
    //Validating the inputs into the function
    if (entryName == ""){
        setErrorMsg("Entry Name cannot be empty")
        return
    }
    if (entryDetails == ""){
        setErrorMsg("Entry Details cannot be empty")
        return
    }

    //Getting the formatted entryName
    let formattedEntryName = formatString(entryName)

    //Getting the formatted current date string
    let currentDateString = getCurrentDate()

    //Making the entry record

    //Keeping track of the unique id we are using
    let uniqueId = uuidv4()

    //Making the entry record
    await setDoc(doc(db, "Entries", uniqueId),{
        EntryName : formattedEntryName,
        Date : currentDateString,
        Skills : skillsArray,
        EntryDetails : entryDetails
    })

    //Adding the entry record to the goals record
    await updateDoc(doc(db, "Goals", goalUid),{
        Entries : arrayUnion(uniqueId),
        LastUpdated : currentDateString
    })

    //To end the function, reset all the values of the inputs
    resetValues()

    //Closing the window
    showWindow2()
  }


  //Useeffect function to get the records of the entries, that need to be displayed to the screen
  useEffect(() => {
    const mainFunction = () => {
        console.log(entryIds)
    }

    mainFunction()
  },[entryIds])

  return (
    <div className="accounts">
      <div className="accountsHeader flexItems hideElement">
        <p className="subheading">Goal Accounts</p>
        <button onClick={() => showWindow2()}>Add Account</button>
      </div>
      {windowShown2 ? (
        <div id="MakeForm">
          <div className="formHeader flexItems">
            <p className="headerTitle flexItems">Make an Entry</p>
          </div>
          <div className="formContent">
            <form action="#">
              <div className="formLine flexItems">
                <div className="lineTitle flexItems">
                  <p>Entry Name : </p>
                </div>
                <div className="lineInput flexItems">
                  <input type="text" placeholder="Enter Entry Name..." onChange={(e) => setEntryName(e.target.value)}/>
                </div>
              </div>
              <div className="formLine flexItems">
                <div className="lineTitle flexItems">
                  <p>Goal Name : </p>
                </div>
                <div className="lineInput flexItems">
                  <p>{goalName}</p>
                </div>
              </div>
              <div className="skillsArea">
                {/* Enables the user to individually type in each skill they have */}
                <div className="formLine flexItems">
                  <div className="lineTitle flexItems">
                    <p>Skills :</p>
                  </div>
                  <div className="lineInput flexItems">
                    <input id="skillInput" type="text" placeholder="Enter Skill..." onChange={(e) => setCurrentSkill(e.target.value)} />
                  </div>
                  <div className="lineInput flexItems">
                    <button type="button" className="addSkill" onClick={() => addSkill()}>Add Skill</button>
                  </div>
                </div>
                <div className="skillsOutput">
                  {/* For each item in the skills array, output them here */}
                  {/* NOTE : The skills are output in groups of two, that is why the code may be a bit funny */}
                  {skillsArray.map((skill, index) => {
                    return (
                      <div key={index}>
                        {index % 4 == 0 ? (
                          <div className="skillLine flexItem">
                            <div className="individualSkill flexItem">
                              <p>{skillsArray[index]}</p>
                              {/* Button to enable the user to remvoe the skill from the array */}
                              <button type="button" onClick={() => removeSkill(skillsArray[index])}>-</button>
                            </div>
                            {skillsArray[index + 1] ? (
                              <div className="individualSkill flexItem">
                                <p>{skillsArray[index + 1]}</p>
                                <button type="button" onClick={() =>removeSkill(skillsArray[index + 1])}>-</button>
                              </div>
                            ) : (
                              <div className="individualSkill flexItem"> </div>
                            )}
                            {skillsArray[index + 2] ? (
                              <div className="individualSkill flexItem">
                                <p>{skillsArray[index + 2]}</p>
                                <button type="button" onClick={() =>removeSkill(skillsArray[index + 2])}>-</button>
                              </div>
                            ) : (
                              <div className="individualSkill flexItem"> </div>
                            )}
                            {skillsArray[index + 3] ? (
                              <div className="individualSkill flexItem">
                                <p>{skillsArray[index + 3]}</p>
                                <button type="button" onClick={() =>removeSkill(skillsArray[index + 3])}>-</button>
                              </div>
                            ) : (<div className="individualSkill flexItem"> </div>)}
                          </div>
                        ) : (<div style={{ display: "none" }}></div>)}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="EntryDetails flexItems">
                <p>Entry Details : </p>
                <textarea type="text" placeholder="Enter Entry Details..." onChange={(e) => setEntryDetails(e.target.value)}/>
              </div>
              {/* Displaying the error msg to the screen, if there is one */}
              {errorMsg != ""? 
                <div className="error">
                    <p>{errorMsg}</p>
                </div>
              : <div style={{display:"none"}}></div>}
              <div className="buttonLine">
                <div>
                    {/* Allowing the user to submit the information they have enterred on the form */}
                    <button type="button" onClick={() => processForm()}>Make Goal</button>
                </div>
                <div>
                    {/* Exiting the user from the window */}
                    <img src={exitButton} alt="Exit Button" className="exitImg" onClick={showWindow2}/>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (<div style={{ display: "none" }}></div>)}
      <div className="accountsMain flexItems hideElement">
        <p>Account1</p>
        <p>Account2</p>
      </div>
    </div>
  );
}

export default Accounts;
