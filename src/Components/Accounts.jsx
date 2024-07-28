import { useEffect, useState } from "react";
import exitButton from "../Images/exitButton.jpg";
import {arrayRemove,deleteDoc,doc,updateDoc,} from "firebase/firestore";
import { db } from "../Config/firebase";
import { formatString } from "../Functions/strings";
import { sortEntriesByDate } from "../Functions/selectionSort";
import { processMakeAccountForm } from "../Functions/processingForms";
import { getEntryObj } from "../Functions/records";

function Accounts({goalName,goalUid,entryIds,windowShown2,showWindow2,setNewEntry,newEntry,subgoalRecords,currentUser,goalRecord,colourScheme,}) {
  //Usestate to store the inputs from the form
  const [entryName, setEntryName] = useState("");
  const [currentSkill, setCurrentSkill] = useState("");
  const [skillsArray, setSkillsArray] = useState([]);
  const [entryDetails, setEntryDetails] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  //Usestate to store all the entries objs that this goal has
  const [entriesObjArray, setEntriesObjArray] = useState([]);
  const [subgoalEntriesArray, setSubgoalEntriesArray] = useState([]);
  const [combinedEntriesArray, setCombinedEntriesArray] = useState([]);

  //Usestate to control whether to show account options or not
  const [showOptions, setShowOptions] = useState(false);

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
    setErrorMsg("");
    resetValues();
  }, [windowShown2]);

  function resetValues() {
    setEntryName("");
    setSkillsArray([]);
    setEntryDetails("");
  }

  //Function to process the inputs from the form
  async function processForm() {
    //Calling the main function to process the form
    let newErrorMsg =  await processMakeAccountForm(currentUser,{entryName:entryName,entryDetails:entryDetails,skillsArray:skillsArray},goalName,goalUid);
    setErrorMsg(newErrorMsg)

    //Applying other component specific code
    if (newErrorMsg == ""){
      //Telling system new entry made
      setNewEntry(!newEntry);
  
      //To end the function, reset all the values of the inputs
      resetValues();
  
      //Closing the window
      showWindow2();
    }
  }

  //Useeffect function to get the records of the entries, that need to be displayed to the screen
  useEffect(() => {
    const mainFunction = () => {
      //Clearing the array
      setEntriesObjArray([]);
      //Looping through all the entryIds
      entryIds.map(async (entryId) => {
        //Getting the entryObj of the current entry
        const entryObj = await getEntryObj(entryId);
        //Adding the goalInformation to the GoalsObjArray
        setEntriesObjArray((prevArr) => {
          return [...prevArr, entryObj];
        });
      });
    };

    mainFunction();
  }, [entryIds]);

  //UseEffect to get all the entry records from the subgoals
  useEffect(() => {
    const mainFunction = () => {
      setSubgoalEntriesArray([]);
      subgoalRecords.map((subgoalRecord) => {
        subgoalRecord.Entries.map(async (entryId) => {
          const entryObj = await getEntryObj(entryId);
          //Adding it to the subgoal entries
          setSubgoalEntriesArray((prevArr) => {
            return [...prevArr, entryObj];
          });
        });
      });
    };

    mainFunction();
  }, [subgoalRecords]);

  //UseEffect function to sort all the entry records via date
  useEffect(() => {
    const mainFunction = () => {
      let tempArr = [].concat(subgoalEntriesArray).concat(entriesObjArray);
      tempArr = sortEntriesByDate(tempArr);
      //Storing the tempArr into the actual array to be used
      setCombinedEntriesArray(tempArr);
    };

    mainFunction();
  }, [subgoalEntriesArray, entriesObjArray]);

  //Function to delete the current account the user is selecting
  async function deleteEntry(entryObj) {
    //Removing the id of the entry from the goal obj
    await updateDoc(doc(db, "Goals", goalUid), {
      Entries: arrayRemove(entryObj.uid),
    });
    //Deleting the entry from the database
    await deleteDoc(doc(db, "Entries", entryObj.uid));

    //Making the website reload, and recollect the goal obj
    setNewEntry(!newEntry);
    window.location.reload(false);
  }

  return (
    <div className={"accounts flexSetup column " + colourScheme}>
      <div className="accountsHeader flexItems hideElement">
        <p className="subheading">Goal Accounts</p>
        {/* Conditionally rendering the button, depending on whehter the goal is complete or not */}
        {!goalRecord.Completed ? (
          <button onClick={() => showWindow2()}>Add Account</button>
        ) : (
          <div style={{ display: "none" }}></div>
        )}
      </div>
      {windowShown2 ? (
        <div id="MakeForm" className={"accounts flexSetup column flexItems " + colourScheme}>
          <div className="formHeader flexSetup column flexItems">
            <p className="headerTitle flexItems">Make an Entry</p>
          </div>
          <div className={"formContent flexSetup column " + colourScheme}>
            <form className="flexSetup column noGap flexItems" action="#">
              <div className={"formLine flexSetup flexItems " + colourScheme}>
                <div className={"lineTitle flexItems " + colourScheme}>
                  <p>Entry Name : </p>
                </div>
                <div className={"lineInput flexItems " + colourScheme}>
                  <input type="text" placeholder="Enter Entry Name..." onChange={(e) => setEntryName(e.target.value)}/>
                </div>
              </div>
              <div className={"formLine flexSetup flexItems " + colourScheme}>
                <div className={"lineTitle flexItems " + colourScheme}>
                  <p>Goal Name : </p>
                </div>
                <div className={"lineInput flexItems " + colourScheme}>
                  <p>{goalName}</p>
                </div>
              </div>
              <div className="skillsArea">
                {/* Enables the user to individually type in each skill they have */}
                <div className={"formLine flexSetup flexItems " + colourScheme}>
                  <div className={"lineTitle flexItems " + colourScheme}>
                    <p>Skills :</p>
                  </div>
                  <div className={"lineInput flexItems " + colourScheme}>
                    <input id="skillInput" type="text" placeholder="Enter Skill..." onChange={(e) => setCurrentSkill(e.target.value)}/>
                  </div>
                  <div className={"lineInput flexItems " + colourScheme}>
                    <button type="button" className="submit addSkill" onClick={() => addSkill()}>Add Skill</button>
                  </div>
                </div>
                <div className="skillsOutput flexSetup column">
                  {/* For each item in the skills array, output them here */}
                  {/* NOTE : The skills are output in groups of two, that is why the code may be a bit funny */}
                  {skillsArray.map((skill, index) => {
                    return (
                      <div key={index}>
                        {index % 4 == 0 ? (
                          <div className="skillLine flexSetup flexItems">
                            <div className="individualSkill flexItems">
                              <p>{skillsArray[index]}</p>
                              {/* Button to enable the user to remvoe the skill from the array */}
                              <button type="button" onClick={() => removeSkill(skillsArray[index])}>-</button>
                            </div>
                            {skillsArray[index + 1] ? (
                              <div className="individualSkill flexItems">
                                <p>{skillsArray[index + 1]}</p>
                                <button type="button" onClick={() => removeSkill(skillsArray[index + 1])}>-</button>
                              </div>
                            ) : (
                              <div className="individualSkill flexItems"> </div>
                            )}
                            {skillsArray[index + 2] ? (
                              <div className="individualSkill flexItems">
                                <p>{skillsArray[index + 2]}</p>
                                <button type="button" onClick={() => removeSkill(skillsArray[index + 2])}>-</button>
                              </div>
                            ) : (
                              <div className="individualSkill flexItems"> </div>
                            )}
                            {skillsArray[index + 3] ? (
                              <div className="individualSkill flexItems">
                                <p>{skillsArray[index + 3]}</p>
                                <button type="button" onClick={() => removeSkill(skillsArray[index + 3])}>-</button>
                              </div>
                            ) : (
                              <div className="individualSkill flexItems"> </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: "none" }}></div>
                        )}
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
              {errorMsg != "" ? (
                <div className="error">
                  <p>{errorMsg}</p>
                </div>
              ) : (
                <div style={{ display: "none" }}></div>
              )}
              <div className="buttonLine">
                <div>
                  {/* Allowing the user to submit the information they have enterred on the form */}
                  <button className="submit" type="button" onClick={() => processForm()}>Make Goal</button>
                </div>
                <div>
                  {/* Exiting the user from the window */}
                  <img src={exitButton} alt="Exit Button" className="exitImg" onClick={showWindow2}/>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div style={{ display: "none" }}></div>
      )}
      <div className="accountsMain flexSetup column flexItems hideElement">
        {combinedEntriesArray.map((entryObj) => {
          return (
            <div key={entryObj.uid} className={"entry flexItems " + colourScheme}>
              <div>
                <div>
                  <p className={"title centered " + colourScheme}>
                    {entryObj.EntryName}
                  </p>
                  {entryObj.entryOf != goalName ? (
                    <p className={"entryOf centered " + colourScheme}>
                      -- From {entryObj.entryOf} --{" "}
                    </p>
                  ) : (
                    <div style={{ display: "none" }}></div>
                  )}
                  <p className={"centered " + colourScheme}>{entryObj.Date}</p>
                </div>
                <div>
                  {entryObj.Skills[0] ? (
                    <p className={colourScheme}>Skills Improved : </p>
                  ) : (
                    <div display={{ display: "none" }}></div>
                  )}
                  {/* Displaying 4 skills in one line, like before */}
                  {entryObj.Skills.map((skill, index) => {
                    return (
                      <div key={index}>
                        {index % 4 == 0 ? (
                          <div className="skillLine flexSetup noGap flexItems">
                            <div className="individualSkill">
                              <p className={"skill " + colourScheme}>
                                {entryObj.Skills[index]} |
                              </p>
                            </div>
                            {entryObj.Skills[index + 1] ? (
                              <div className="individualSkill">
                                <p className={"skill " + colourScheme}>
                                  {entryObj.Skills[index + 1]} |
                                </p>
                              </div>
                            ) : (
                              <div className="individualSkill"> </div>
                            )}
                            {entryObj.Skills[index + 2] ? (
                              <div className="individualSkill">
                                <p className={"skill " + colourScheme}>
                                  {entryObj.Skills[index + 2]} |
                                </p>
                              </div>
                            ) : (
                              <div className="individualSkill"> </div>
                            )}
                            {entryObj.Skills[index + 3] ? (
                              <div className="individualSkill">
                                <p className={"skill " + colourScheme}>
                                  {entryObj.Skills[index + 3]} |
                                </p>
                              </div>
                            ) : (
                              <div className="individualSkill"> </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: "none" }}></div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div>
                  <p className={colourScheme}>Entry Details : </p>
                  <p className={"entryDetails centered " + colourScheme}>
                    {entryObj.EntryDetails}
                  </p>
                </div>
              </div>
              {/* Conditionally displaying the options button, depending on whether the goal has been completed or not */}
              {!goalRecord.Completed ? (
                <div className="entryFooter flexSetup flexItems">
                  <div className="emptySpace flexItems"></div>
                  <div className="entryOptions flexItems" onClick={() => setShowOptions(!showOptions)}></div>
                </div>
              ) : (
                <div style={{ display: "none" }}></div>
              )}
              {showOptions ? (
                <div className="options flexItems">
                  <div className="optionsEmpty flexItems"></div>
                  <div className="optionsContent">
                    <button className="delete" onClick={() => deleteEntry(entryObj)}>Delete Account</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "none" }}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Accounts;
