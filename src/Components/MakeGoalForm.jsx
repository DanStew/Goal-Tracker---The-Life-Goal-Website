import { useState } from "react";
import exitButton from "../Images/exitButton.jpg";
import { formatString } from "../Functions/strings";
import { processMakeGoalForm } from "../Functions/processingForms";

function MakeGoalForm({
  toggleWindow,
  currentUser,
  goalAddedRef,
  setGoalAddedRef,
  goalNames,
  goalsObjArray,
  subgoalNames,
  subgoalsObjArray,
  showNone,
  colourScheme
}) {
  //UseState variables to store information from the form
  const [goalName, setGoalName] = useState("");
  const [subgoalOf, setSubgoalOf] = useState("");
  const [skillsArray, setSkillsArray] = useState([]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [deadline, setDeadline] = useState("No");
  const [deadlineDate, setDeadlineDate] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  //Function to add the current enterred skill to the skill array, and set the skill variable to null
  function addSkill() {
    setErrorMsg("")
    //If the skill is empty, reject it
    if (currentSkill == "") {
      return;
    }
    if (currentSkill.length > 8){
      setErrorMsg("Skills must have maximum 8 characters")
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

  //Code to wipe all stored information from the system
  function resetValues() {
    setGoalName("");
    setSubgoalOf("");
    setSkillsArray([]);
    setCurrentSkill("");
    setDeadline("No");
    setDeadlineDate(null);
  }

  //Function used to call the function to process the form
  async function processForm(){
    //Calling the main function to process the form
    let newErrorMsg = await processMakeGoalForm(currentUser,{goalName: goalName,subgoalOf: subgoalOf,deadline:deadline,deadlineDate:deadlineDate,skillsArray:skillsArray},goalNames,() => setErrorMsg(),showNone,goalsObjArray,subgoalsObjArray)
    setErrorMsg(newErrorMsg)
    //Running the code that couldn't run in the above function, webpage specific code
    if (newErrorMsg == ""){
      //Telling goals that a goal has been added
      setGoalAddedRef(!goalAddedRef);
      //To end the function, reset all the values of the inputs
      resetValues();
      //Closing the window
      toggleWindow();
    }
  }

  return (
    <div id="MakeForm" className={"flexSetup column flexItems " + colourScheme}>
      {/* The title and button to exit the form */}
      <div className="formHeader flexSetup column flexItems">
        <p className="headerTitle flexItems">Make Goal</p>
      </div>
      <div className={"formContent flexSetup column flexItems " + colourScheme}>
        {/* The form, the main element of this window */}
        <form className="flexSetup column noGap flexItems" action="#">
          <div className={"formLine flexSetup flexItems " + colourScheme}>
            <div className={"lineTitle flexItems " + colourScheme}>
              <p>Goal Name : </p>
            </div>
            <div className={"lineInput flexItems " + colourScheme}>
              <input
                type="text"
                placeholder="Enter Goal Name..."
                onChange={(e) => setGoalName(e.target.value)}
              />
            </div>
          </div>
          <div className={"formLine flexSetup flexItems " + colourScheme}>
            <div className={"lineTitle flexItems " + colourScheme}>
              <p>Subgoal of : </p>
            </div>
            <div className={"lineInput flexItems " + colourScheme}>
              {/* Will output an option for every main goal that the website has */}
              <select
                className={colourScheme}
                onChange={(e) => setSubgoalOf(e.target.value)}
                name="SubgoalOf"
                id="SubgoalOf"
              >
                {showNone ? (
                  <option value="none">None</option>
                ) : (
                  <option style={{ display: "none" }}></option>
                )}
                {/* Going through and displaying all the goalNames there are */}
                {goalNames.map((goalName) => (
                  <option key={goalName} value={goalName}>
                    {goalName}
                  </option>
                ))}
                {subgoalNames.map((goalName) => (
                  <option key={goalName} value={goalName}>
                    {goalName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="skillsArea">
            {/* Enables the user to individually type in each skill they have */}
            <div className={"formLine flexSetup flexItems " + colourScheme}>
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
            <div className="skillsOutput flexSetup column">
              {/* For each item in the skills array, output them here */}
              {/* NOTE : The skills are output in groups of two, that is why the code may be a bit funny */}
              {skillsArray.map((skill, index) => {
                return (
                  <div key={index}>
                    {index % 4 == 0 ? (
                      <div className="skillLine flexSetup flexItem">
                        <div className="individualSkill flexSetup flexItem">
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
                          <div className="individualSkill flexSetup flexItem">
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
                          <div className="individualSkill flexSetup flexItem"> </div>
                        )}
                        {skillsArray[index + 2] ? (
                          <div className="individualSkill flexSetup flexItem">
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
                          <div className="individualSkill flexSetup flexItem"> </div>
                        )}
                        {skillsArray[index + 3] ? (
                          <div className="individualSkill flexSetup flexItem">
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
                          <div className="individualSkill flexSetup flexItem"> </div>
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
          {/* Enables the user to choose if they want a deadline date or not */}
          <div className={"formLine flexSetup flexItems " + colourScheme}>
            <div className={"lineTitle flexItems " + colourScheme}>
              <p>Deadline Date :</p>
            </div>
            <div className={"lineInput flexItems " + colourScheme}>
              <select
                className={colourScheme}
                onChange={(e) => setDeadline(e.target.value)}
                name="DeadlineDate"
                id="DeadlineDate"
              >
                {/* No is first as that is the default option in the form */}
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>
          {/* Allowing the user to pick a deadline date, if they have deadline selected yes */}
          {deadline == "Yes" ? (
            <div className={"formLine flexSetup flexItems indent " + colourScheme}>
              <div className={"lineTitle flexItems " + colourScheme}>
                <p>-- Pick Date :</p>
              </div>
              <div className={"lineInput flexItems " + colourScheme}>
                <input
                  type="date"
                  onChange={(e) => setDeadlineDate(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: "none" }}></div>
          )}
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
              <button className="submit" type="button" onClick={() => processForm()}>
                Make Goal
              </button>
            </div>
            <div>
              {/* Exiting the user from the window */}
              <img
                src={exitButton}
                alt="Exit Button"
                className="exitImg"
                onClick={toggleWindow}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MakeGoalForm;
