import { useEffect, useState } from "react";
import exitButton from "../Images/exitButton.jpg";
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../Config/firebase";
import { v4 as uuidv4 } from "uuid";

function Accounts({
  goalName,
  goalUid,
  entryIds,
  windowShown2,
  showWindow2,
  setNewEntry,
  subgoalRecords,
  currentUser,
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

  //Function used to correctly format the given input
  function formatString(inputString) {
    //Copying the string without mutating and Making it formatted
    let copyString = "";
    for (let i = 0; i <= inputString.length; i++) {
      if (i == 0) {
        copyString += inputString.charAt(i).toUpperCase();
        continue;
      }
      copyString += inputString.charAt(i).toLowerCase();
    }
    return copyString;
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
    setErrorMsg("");
    resetValues();
  }, [windowShown2]);

  function resetValues() {
    setEntryName("");
    setSkillsArray([]);
    setEntryDetails("");
  }

  function getCurrentDate() {
    //Getting the current date and time, and formatting it
    let currentDate = new Date();
    //Putting all the date information into an object
    //The if statements are to ensure that the date is currently formatted, with 0s when needed
    let currentDateObj = {
      year: currentDate.getFullYear(),
      month:
        currentDate.getMonth() + 1 < 10
          ? "0" + (currentDate.getMonth() + 1)
          : currentDate.getMonth() + 1,
      day:
        currentDate.getDate() < 10
          ? "0" + currentDate.getDate()
          : currentDate.getDate(),
      hours:
        currentDate.getHours() < 10
          ? "0" + currentDate.getHours()
          : currentDate.getHours(),
      minutes:
        currentDate.getMinutes() < 10
          ? "0" + currentDate.getMinutes()
          : currentDate.getMinutes(),
    };
    //Returning a formatted string back to the function
    return (
      currentDateObj.year +
      "/" +
      currentDateObj.month +
      "/" +
      currentDateObj.day +
      " " +
      currentDateObj.hours +
      ":" +
      currentDateObj.minutes
    );
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
    let currentDateString = getCurrentDate();

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

    //Adding the entry to the goal doc
    await updateDoc(doc(db, "Goals", goalUid), {
      Entries: arrayUnion(uniqueId),
    });

    //Function called to update all parent goals that this goal has been updated
    updateParentGoals(goalUid, currentDateString);

    //Telling system new entry made
    setNewEntry(true);

    //To end the function, reset all the values of the inputs
    resetValues();

    //Closing the window
    showWindow2();
  }

  //Function to update the LastUpdated variable of parent goals
  async function updateParentGoals(currentGoalUid, currentDateString) {
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
            return goalRecord.uid;
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

    //Updating the lastUpdated property for the current goal
    await updateDoc(doc(db, "Goals", currentGoalUid), {
      LastUpdated: currentDateString,
    });

    //Getting the record of the current goal
    let goalRecord = await getDoc(doc(db, "Goals", currentGoalUid));
    let goalData = goalRecord.data();

    //Seeing if the current goal is a subgoal
    if (goalData.Subgoal == true) {
      let parentUids = await getParentUid(goalData.SubgoalOf);
      //Looping through to find the non undefined output
      parentUids.map((parentUid) => {
        if (parentUid != undefined) {
          console.log("Found correct uid");
          updateParentGoals(parentUid, currentDateString);
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
      //Function to find the minimum date
      const findMinIndex = (arr, start) => {
        let minValue = arr[start].Date;
        let minIndex = start;
        while (start < arr.length) {
          if (arr[start].Date > minValue) {
            minValue = arr[start].Date;
            minIndex = start;
          }
          start = start + 1;
        }
        return minIndex;
      };

      //Function to swap two elements at different indexes
      const swapElements = (arr, i, j) => {
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
        return arr;
      };

      let tempArr = [].concat(subgoalEntriesArray).concat(entriesObjArray);
      //Performing an selection sort on the new array, to sort all the elements
      for (let k = 0; k < tempArr.length; k++) {
        //Finding the index with the lowest value
        let minIndex = findMinIndex(tempArr, k);
        //Swapping the current and smallest index
        tempArr = swapElements(tempArr, k, minIndex);
      }
      //Storing the tempArr into the actual array to be used
      setCombinedEntriesArray(tempArr);
    };

    mainFunction();
  }, [subgoalEntriesArray, entriesObjArray]);

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
                  <input
                    type="text"
                    placeholder="Enter Entry Name..."
                    onChange={(e) => setEntryName(e.target.value)}
                  />
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
                    <input
                      id="skillInput"
                      type="text"
                      placeholder="Enter Skill..."
                      onChange={(e) => setCurrentSkill(e.target.value)}
                    />
                  </div>
                  <div className="lineInput flexItems">
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
            <div key={entryObj.uid} className="entry flexItems">
              <div>
                <div>
                  <p className="title centered">{entryObj.EntryName}</p>
                  {entryObj.entryOf != goalName ? (
                    <p className="entryOf centered">
                      -- From {entryObj.entryOf} --{" "}
                    </p>
                  ) : (
                    <div style={{ display: "none" }}></div>
                  )}
                  <p className="centered">{entryObj.Date}</p>
                </div>
                <div>
                  {entryObj.Skills[0] ? (
                    <p>Skills Improved : </p>
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
                              <p className="skill">
                                {entryObj.Skills[index]} |
                              </p>
                            </div>
                            {entryObj.Skills[index + 1] ? (
                              <div className="individualSkill flexItem">
                                <p className="skill">
                                  {entryObj.Skills[index + 1]} |
                                </p>
                              </div>
                            ) : (
                              <div className="individualSkill flexItem"> </div>
                            )}
                            {entryObj.Skills[index + 2] ? (
                              <div className="individualSkill flexItem">
                                <p className="skill">
                                  {entryObj.Skills[index + 2]} |
                                </p>
                              </div>
                            ) : (
                              <div className="individualSkill flexItem"> </div>
                            )}
                            {entryObj.Skills[index + 3] ? (
                              <div className="individualSkill flexItem">
                                <p className="skill">
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
                  <p>Entry Details : </p>
                  <p className="entryDetails centered">
                    {entryObj.EntryDetails}
                  </p>
                </div>
              </div>
              <div className="entryFooter">
                <div className="emptySpace flexItems"></div>
                <div className="entryOptions flexItems"></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Accounts;
