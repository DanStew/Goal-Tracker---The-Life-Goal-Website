import { useEffect, useState } from "react";
import exitButton from "../Images/exitButton.jpg";
import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../Config/firebase";
import { v4 as uuidv4 } from "uuid";
import { get } from "firebase/database";
import { checkConsecutive, getCurrentDate } from "../Functions/dates";
import { formatString } from "../Functions/strings";
import { sortEntriesByDate } from "../Functions/selectionSort";

function Accounts({
  goalName,
  goalUid,
  entryIds,
  windowShown2,
  showWindow2,
  setNewEntry,
  newEntry,
  subgoalRecords,
  currentUser,
  goalRecord,
  colourScheme,
}) {
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

  //Function to process and execute the function of the form
  async function processForm() {
    //Validating the inputs into the function
    if (entryName == "") {
      setErrorMsg("Entry Name cannot be empty");
      return;
    }
    if (entryDetails == "") {
      setErrorMsg("Entry Details cannot be empty");
      return;
    }

    //Getting the formatted entryName
    let formattedEntryName = formatString(entryName);

    //Getting the formatted current date string
    let currentDateString = getCurrentDate("full");

    //Making the entry record

    //Keeping track of the unique id we are using
    let uniqueId = uuidv4();

    //Making the entry record
    await setDoc(doc(db, "Entries", uniqueId), {
      EntryName: formattedEntryName,
      Date: currentDateString,
      Skills: skillsArray,
      EntryDetails: entryDetails,
      uid: uniqueId,
      entryOf: goalName,
    });

    //Getting the goal doc, to check entry streak
    let goalDoc = await getDoc(doc(db, "Goals", goalUid));
    let goalData = goalDoc.data();
    //Getting the current date
    let entryDate = getCurrentDate("");
    //Keeping track of the entry streak returned
    let entryStreak = 0;
    //Checking whether an entry date has been set or not
    if (goalData.lastEntryDate == "") {
      entryStreak = 1; //Starting the streak
    } else {
      //Finding out whether the different in two dates is 1
      let consecutiveDates = checkConsecutive(
        goalData.lastEntryDate,
        entryDate
      );
      if (consecutiveDates) {
        entryStreak = goalData.currentEntryStreak + 1; //Incrementing the streak
      } else {
        entryStreak = 1; //Resetting the streak
      }
    }

    //Adding the entry to the goal doc
    await updateDoc(doc(db, "Goals", goalUid), {
      Entries: arrayUnion(uniqueId),
      currentEntryStreak: entryStreak,
      lastEntryDate: entryDate,
    });

    //Updating the entries made attribute of users record
    let userRecord = await getDoc(doc(db, "users", currentUser.uid));
    let userData = userRecord.data();
    //Storing the value of the users entry date
    let userEntryStreak = 0;
    //Checking whether the entry date has been set or not
    if (userData.lastEntryDate == "") {
      userEntryStreak = 1;
    } else {
      //Checking for consecutive dates
      let consecutiveDates = checkConsecutive(
        userData.lastEntryDate,
        entryDate
      );
      if (consecutiveDates) {
        userEntryStreak = userData.entryStreak + 1;
      } else {
        userEntryStreak = 1;
      }
    }

    //Checking for a new highest entry streak
    let highestEntryStreak = userData.highestEntryStreak;
    if (userData.highestEntryStreak < userEntryStreak) {
      highestEntryStreak = userEntryStreak;
    }

    await updateDoc(doc(db, "users", currentUser.uid), {
      entriesMade: userData.entriesMade + 1,
      lastEntryDate: entryDate,
      entryStreak: userEntryStreak,
      highestEntryStreak: highestEntryStreak,
    });

    //Function called to update all parent goals that this goal has been updated
    updateParentGoals(goalRecord, currentDateString, entryDate);

    //Telling system new entry made
    setNewEntry(!newEntry);

    //To end the function, reset all the values of the inputs
    resetValues();

    //Closing the window
    showWindow2();
  }

  //Function to update the LastUpdated variable of parent goals
  async function updateParentGoals(
    currentGoalRecord,
    currentDateString,
    entryDate
  ) {
    //Function which uses the name of a goal to find its record
    async function getParentUid(goalName) {
      //Getting the userGoals record
      let userGoals = await getDoc(doc(db, "userGoals", currentUser.uid));
      let userGoalsData = userGoals.data();
      //Looping through all of the goals
      return await Promise.all(
        userGoalsData.goals.map(async (goalUid) => {
          let goalRecord = await getGoalRecord(goalUid);
          if (goalRecord.GoalName == goalName) {
            return goalRecord;
          }
        })
      );
    }

    //Function which uses a goal record uid to find the goal record
    async function getGoalRecord(goalUid) {
      let goalRecord = await getDoc(doc(db, "Goals", goalUid));
      let goalData = goalRecord.data();
      return goalData;
    }

    //Processing the entry streak information
    //Creating a variable to store information
    let entryStreak = 0;
    if (currentGoalRecord.lastEntryDate == "") {
      entryStreak = 1;
    } else {
      let consecutiveDates = checkConsecutive(
        currentGoalRecord.lastEntryDate,
        entryDate
      );
      entryStreak = consecutiveDates
        ? currentGoalRecord.currentEntryStreak + 1
        : 1;
    }

    //Updating the lastUpdated property for the current goal
    await updateDoc(doc(db, "Goals", currentGoalRecord.uid), {
      LastUpdated: currentDateString,
      lastEntryDate: entryDate,
      currentEntryStreak: entryStreak,
    });

    //Seeing if the current goal is a subgoal
    if (currentGoalRecord.Subgoal == true) {
      let parentUids = await getParentUid(currentGoalRecord.SubgoalOf);
      //Looping through to find the non undefined output
      parentUids.map(async (subgoalRecord) => {
        if (subgoalRecord != undefined) {
          updateParentGoals(subgoalRecord, currentDateString, entryDate);
        }
      });
    }
  }

  //Finding the goal information from the goal ids
  const getEntryObj = async (entryId) => {
    //Getting the goal record data, using id
    const entryRef = doc(db, "Entries", entryId);
    const docSnap = await getDoc(entryRef);
    const entryData = docSnap.data();
    //Returning the goal data to the system
    return entryData;
  };

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

  //UseEffect to get all the goal records from the subgoals
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
  async function deleteAccount(entryObj) {
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
    <div className={"accounts " + colourScheme}>
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
        <div id="MakeForm" className={colourScheme}>
          <div className="formHeader flexItems">
            <p className="headerTitle flexItems">Make an Entry</p>
          </div>
          <div className={"formContent " + colourScheme}>
            <form action="#">
              <div className={"formLine flexItems " + colourScheme}>
                <div className={"lineTitle flexItems " + colourScheme}>
                  <p>Entry Name : </p>
                </div>
                <div className={"lineInput flexItems " + colourScheme}>
                  <input
                    type="text"
                    placeholder="Enter Entry Name..."
                    onChange={(e) => setEntryName(e.target.value)}
                  />
                </div>
              </div>
              <div className={"formLine flexItems " + colourScheme}>
                <div className={"lineTitle flexItems " + colourScheme}>
                  <p>Goal Name : </p>
                </div>
                <div className={"lineInput flexItems " + colourScheme}>
                  <p>{goalName}</p>
                </div>
              </div>
              <div className="skillsArea">
                {/* Enables the user to individually type in each skill they have */}
                <div className={"formLine flexItems " + colourScheme}>
                  <div className={"lineTitle flexItems " + colourScheme}>
                    <p>Skills :</p>
                  </div>
                  <div className={"lineInput flexItems " + colourScheme}>
                    <input
                      id="skillInput"
                      type="text"
                      placeholder="Enter Skill..."
                      onChange={(e) => setCurrentSkill(e.target.value)}
                    />
                  </div>
                  <div className={"lineInput flexItems " + colourScheme}>
                    <button
                      type="button"
                      className="addSkill"
                      onClick={() => addSkill()}
                    >
                      Add Skill
                    </button>
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
                              <button
                                type="button"
                                onClick={() => removeSkill(skillsArray[index])}
                              >
                                -
                              </button>
                            </div>
                            {skillsArray[index + 1] ? (
                              <div className="individualSkill flexItem">
                                <p>{skillsArray[index + 1]}</p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeSkill(skillsArray[index + 1])
                                  }
                                >
                                  -
                                </button>
                              </div>
                            ) : (
                              <div className="individualSkill flexItem"> </div>
                            )}
                            {skillsArray[index + 2] ? (
                              <div className="individualSkill flexItem">
                                <p>{skillsArray[index + 2]}</p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeSkill(skillsArray[index + 2])
                                  }
                                >
                                  -
                                </button>
                              </div>
                            ) : (
                              <div className="individualSkill flexItem"> </div>
                            )}
                            {skillsArray[index + 3] ? (
                              <div className="individualSkill flexItem">
                                <p>{skillsArray[index + 3]}</p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeSkill(skillsArray[index + 3])
                                  }
                                >
                                  -
                                </button>
                              </div>
                            ) : (
                              <div className="individualSkill flexItem"> </div>
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
                <textarea
                  type="text"
                  placeholder="Enter Entry Details..."
                  onChange={(e) => setEntryDetails(e.target.value)}
                />
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
                  <button type="button" onClick={() => processForm()}>
                    Make Goal
                  </button>
                </div>
                <div>
                  {/* Exiting the user from the window */}
                  <img
                    src={exitButton}
                    alt="Exit Button"
                    className="exitImg"
                    onClick={showWindow2}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div style={{ display: "none" }}></div>
      )}
      <div className="accountsMain flexItems hideElement">
        {combinedEntriesArray.map((entryObj) => {
          return (
            <div
              key={entryObj.uid}
              className={"entry flexItems " + colourScheme}
            >
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
                          <div className="skillLine flexItem">
                            <div className="individualSkill flexItem">
                              <p className={"skill " + colourScheme}>
                                {entryObj.Skills[index]} |
                              </p>
                            </div>
                            {entryObj.Skills[index + 1] ? (
                              <div className="individualSkill flexItem">
                                <p className={"skill " + colourScheme}>
                                  {entryObj.Skills[index + 1]} |
                                </p>
                              </div>
                            ) : (
                              <div className="individualSkill flexItem"> </div>
                            )}
                            {entryObj.Skills[index + 2] ? (
                              <div className="individualSkill flexItem">
                                <p className={"skill " + colourScheme}>
                                  {entryObj.Skills[index + 2]} |
                                </p>
                              </div>
                            ) : (
                              <div className="individualSkill flexItem"> </div>
                            )}
                            {entryObj.Skills[index + 3] ? (
                              <div className="individualSkill flexItem">
                                <p className={"skill " + colourScheme}>
                                  {entryObj.Skills[index + 3]} |
                                </p>
                              </div>
                            ) : (
                              <div className="individualSkill flexItem"> </div>
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
                <div className="entryFooter">
                  <div className="emptySpace flexItems"></div>
                  <div
                    className="entryOptions flexItems"
                    onClick={() => setShowOptions(!showOptions)}
                  ></div>
                </div>
              ) : (
                <div style={{ display: "none" }}></div>
              )}
              {showOptions ? (
                <div className="options flexItems">
                  <div className="optionsEmpty flexItems"></div>
                  <div className="optionsContent">
                    <button
                      className="delete"
                      onClick={() => deleteAccount(entryObj)}
                    >
                      Delete Account
                    </button>
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
