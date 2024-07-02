//Importing the toggle switch styling
import "../Style/toggleSwitch.scss";
import { useNavigate } from "react-router-dom";
import HomePageGoal from "./HomePageGoal";
import { useEffect, useState } from "react";
import MakeGoalForm from "./MakeGoalForm";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../Config/firebase";

function Goals({currentUser}) {
  //Creating the navigator for the website
  const navigator = useNavigate();

  //Creating a useState variable to see whether the Goal Options need to be displayed or not
  const [goalOptions, setGoalOptions] = useState(false);

  //Creating useState variables for the different goal options the user can choose
  const [hideSubgoals, setHideSubgoals] = useState(true); //Hides the subgoals from being displayed
  const [hideCompleteGoals, setHideCompleteGoals] = useState(true); //Hides completed goals from being displayed
  const [sortLastUpdated, setSortLastUpdated] = useState(true); //Sorts goals by Last Updated

  //Usestate the store what the mainClass of the page will be, used to trigger hiding screen or not
  const [mainClass, setMainClass] = useState("Goals");
  //Usestate to determine whether the Make A Goal window is currently being shown
  const [windowShown, setWindowShown] = useState(false);

  //Function to trigger the showing of the window on the screen
  function showWindow() {
    //Showing / Hiding goals depending on whether window shown or not
    windowShown ? setMainClass("Goals") : setMainClass("Goals hideGoals");
    //Hiding the options, as the user doesn't need to see them anymore
    setGoalOptions(false);
    //Toggling windowShown
    setWindowShown(!windowShown);
  }

  //Usestates to determine whether a goal has been added and what the name of the goal is
  //This is so that the new goal can be appended to the screen
  const [goalAddedRef, setGoalAddedRef] = useState("");

  //Usestate array to store all of the goals  and subgoals from the user
  //Its called goalsObj as it will store goal objects, made from the goal records
  const [goalsObjArray, setGoalsObjArray] = useState([]);
  const [subgoalsObjArray, setSubgoalsObjArray] = useState([]);

  //Making an array to store all the goal names and subgoal names, this will be used in the Subgoal of part of the form
  const [goalNames, setGoalNames] = useState([]);
  const [subgoalNames, setSubgoalNames] = useState([]);

  //Connecting the subgoals to the maingoals in the system
  const [subgoalsToMaingoals, setSubgoalsToMaingoals] = useState(false);
  const [subgoalsToMaingoalsConnector, setSubgoalsToMaingoalsConnector] =
    useState({});

  //Usestate to determine whether a goal has been updated or not
  const [updatedGoal, setUpdatedGoal] = useState(false);

  //Usestate to notify that goalsObjArray has been changed
  const [goalsObjChanged, setGoalsObjChanged] = useState(false);

  //Useeffect to collect all the goal information from the screen
  useEffect(() => {
    //Finding the users UserGoal record
    const getUserGoals = async () => {
      const userGoalsRef = doc(db, "userGoals", currentUser.uid);
      const docSnap = await getDoc(userGoalsRef);
      return docSnap.data();
    };

    //Finding the goal information from the goal ids
    const getGoalObj = async (goalId) => {
      //Getting the goal record data, using id
      const goalRef = doc(db, "Goals", goalId);
      const docSnap = await getDoc(goalRef);
      const goalData = docSnap.data();
      //Returning the goal data to the system
      return goalData;
    };

    //Making the main function
    const mainFunction = async () => {
      //Making sure that the website does have a current user
      if (currentUser.uid) {
        //Getting the userGoals record data
        const userGoalsData = await getUserGoals();
        //Resetting the goalsObj and goalNames array
        setGoalsObjArray([]);
        setSubgoalsObjArray([]);
        setGoalNames([]);
        setSubgoalNames([]);
        setGoalAddedRef(false);
        //Looping through the different goal types and storing all the information
        //Finding the goal data from all of the users goals
        try {
          userGoalsData.goals.forEach(async (goalId) => {
            //Getting the goal information and putting it into an object
            const goalObj = await getGoalObj(goalId);
            //Adding the goal name to the goalnames array
            setGoalNames((prevNames) => {
              return [...prevNames, goalObj.GoalName];
            });
            //Adding the goalInformation to the GoalsObjArray
            setGoalsObjArray((prevArr) => {
              return [...prevArr, goalObj];
            });
          });
          //Finding the goal data from all of the users goals
          userGoalsData.subgoals.forEach(async (subgoalId) => {
            //Getting the goal information and putting it into an object
            const subgoalObj = await getGoalObj(subgoalId);
            //Adding the subgoal name to the array
            setSubgoalNames((prevSubgoalNames) => {
              return [...prevSubgoalNames, subgoalObj.GoalName];
            });
            //Adding the goalInformation to the GoalsObjArray
            setSubgoalsObjArray((prevArr) => {
              return [...prevArr, subgoalObj];
            });
          });
        } catch {
          setUpdatedGoal(!updatedGoal);
        }
        setGoalsObjChanged(!goalsObjChanged);
      }
    };

    mainFunction();
  }, [currentUser, goalAddedRef, updatedGoal]);

  useEffect(() => {
    const mainFunction = () => {
      let tempObj = {};
      //Resetting the mainGoal array
      setMainGoalArray([]);
      //Looping through all the main goals in the array
      //NOTE : You don't need to loop through the subgoals as no subgoals will have subgoals
      goalsObjArray.forEach( async (goalObj) => {
        //Seeing if the goal has subgoals
        if (goalObj.Subgoals != []) {
          let subgoalsArr = [];
          //Matching the subgoalsUid, to find the names of the subgoals
          goalObj.Subgoals.forEach((subgoalUid) => {
            goalsObjArray.forEach((subgoalObj) => {
              if (subgoalObj.uid == subgoalUid) {
                subgoalsArr.push([subgoalObj.GoalName]);
              }
            });
            subgoalsObjArray.forEach((subgoalObj) => {
              if (subgoalObj.uid == subgoalUid) {
                subgoalsArr.push([subgoalObj.GoalName]);
              }
            });
          });
          //Connecting the item temporarily
          tempObj[goalObj.GoalName] = subgoalsArr;
        }
        //Checking to see if the entry streak needs to be reset
      let currentDate = getCurrentDate()
      //If no entry date has been set, ignore it
      if (goalObj.lastEntryDate == ""){
        return
      }
      //Checking if the dates aren't equal and are not consecutive
      if (!(currentDate == goalObj.lastEntryDate) || !checkConsecutive(currentDate,goalObj.lastEntryDate)){
        //If so, reset the streak
        await updateDoc(doc(db,"Goals",goalObj.uid),{
          entryStreak : 0
        })
        setGoalAddedRef(false)
      }
      });
      //Permanently storing the changes made
      setSubgoalsToMaingoalsConnector(tempObj);
    };

    mainFunction();
  }, [goalsObjChanged]);

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
        currentDateObj.day)
  }

  //Function which checks whether two dates are consecutive or not
  function checkConsecutive(date1,date2){
    function createDateObject(date){
      let dateArr = date.split("/")
      let dateObj = {
        day: dateArr[2],
        month: dateArr[1],
        year : dateArr[0]
      }
      return dateObj
    }

    //Making the dates into objects, split into days, months and years
    date1 = createDateObject(date1)
    date2 = createDateObject(date2)

    //Checking the different situations where you have consecutive days
    //Situation 1 : Days are consectuive
    if ((date1.year == date2.year) && (date1.month == date2.month) && (Math.abs(date1.day-date2.day) == 1)){
      return true
    }

    //Situation 2 : Month changes
    if ((date1.year == date2.year) && (Math.abs(date1.month-date2.month) == 1)){
      //Finding out which date has the increased month
      let increasedDate = date1.month > date2.month ? date1 : date2
      if (increasedDate.day == 1){
        return true
      }
    }

    //Situation 3 : Year changes
    if (Math.abs(date1.year-date2.year) == 1){
      //Finding out which date has the higher year
      let increasedDate = date1.year > date2.year ? date1 : date2
      if ((increasedDate.month == 1) && (increasedDate.day == 1)){
        return true
      }
    }

    //If date fails all three conditions, return false
    return false
  }

  //Usestate to filter the goalObjsArray into different parts, and then display the parts the user wants
  //Array of all goals that will be displayed to the screen
  const [displayObjsArray, setDisplayObjsArray] = useState([]);
  //Arrays of the filterers
  const [mainGoalArray, setMainGoalArray] = useState([]);
  const [subgoalMainGoalsArray, setSubgoalMainGoalsArray] = useState([]);
  const [completedGoals, setCompletedGoals] = useState([]);
  //Notifying that changes have been made
  const [updatedArrays, setUpdatedArrays] = useState(false);
  const [updatedDisplayArray, setUpdatedDisplayArray] = useState(false);

  //Useeffect to correctly split the goalsObjArray into different sections
  useEffect(() => {
    //Resetting the arrays
    setMainGoalArray([]);
    setSubgoalMainGoalsArray([]);
    setCompletedGoals([]);
    //Looping through all the goals and adding them to the correct array
    goalsObjArray.map((goalRecord) => {
      if (goalRecord.Subgoal == false && goalRecord.Completed == false) {
        //Appending the goal to the main goal array
        setMainGoalArray((prevArr) => {
          return [...prevArr, goalRecord];
        });
      } else if (goalRecord.Completed) {
        //Appending the goal to the completed goals array
        setCompletedGoals((prevArr) => {
          return [...prevArr, goalRecord];
        });
      } else {
        //Appending the goal to the subgoals array
        setSubgoalMainGoalsArray((prevArr) => {
          return [...prevArr, goalRecord];
        });
      }
    });
    //Notifying that the arrays have been updated
    setUpdatedArrays(!updatedArrays);
  }, [goalsObjArray]);

  //Useeffect function to display the correct goals to the screen
  useEffect(() => {
    //Storing the main goals into the array
    setDisplayObjsArray(mainGoalArray);
    //If you want to see subgoals, or completed goals, adding them to the array
    if (!hideSubgoals) {
      setDisplayObjsArray(mainGoalArray.concat(subgoalMainGoalsArray));
    }
    if (!hideCompleteGoals) {
      //Looping through each goal and individually adding it to the array
      //This has to happen as the subgoals may have already been added to the array
      completedGoals.map((goalRecord) => {
        setDisplayObjsArray((prevArr) => {
          return [...prevArr, goalRecord];
        });
      });
    }
    setUpdatedDisplayArray(!updatedDisplayArray);
  }, [updatedArrays, hideSubgoals, hideCompleteGoals]);

  //Useeffect to sort the arrays into the correct order
  useEffect(() => {
    //Making a copy of the array, without mutating it
    let tempArr = [].concat(displayObjsArray);
    if (sortLastUpdated) {
      tempArr = sortByLastUpdated(tempArr);
    } else {
      tempArr = sortByDeadlineDate(tempArr);
    }
    //Storing the new sorted array
    setDisplayObjsArray(tempArr);
  }, [sortLastUpdated, updatedDisplayArray]);

  function sortByLastUpdated(tempArr) {
    //Function to find the minimum last updated date
    const findMinIndex = (arr, start) => {
      let minValue = arr[start].LastUpdated;
      let minIndex = start;
      while (start < arr.length) {
        if (arr[start].LastUpdated > minValue) {
          minValue = arr[start].LastUpdated;
          minIndex = start;
        }
        start = start + 1;
      }
      return minIndex;
    };

    //Performing an selection sort on the new array, to sort all the elements
    for (let k = 0; k < tempArr.length; k++) {
      //Finding the index with the lowest value
      let minIndex = findMinIndex(tempArr, k);
      //Swapping the current and smallest index
      tempArr = swapElements(tempArr, k, minIndex);
    }
    return tempArr;
  }

  function sortByDeadlineDate(tempArr) {
    //Function to find the minimum date
    const findMinIndex = (arr, start) => {
      let minValue = arr[start].DeadlineDate;
      if (minValue == "") {
        minValue = "9999/12/30";
      }
      let minIndex = start;
      while (start < arr.length) {
        let currentDeadlineDate = arr[start].DeadlineDate;
        if (currentDeadlineDate == "") {
          currentDeadlineDate = "9999/12/30";
        }
        if (currentDeadlineDate < minValue) {
          minValue = arr[start].DeadlineDate;
          minIndex = start;
        }
        start = start + 1;
      }
      return minIndex;
    };

    //Performing an selection sort on the new array, to sort all the elements
    for (let k = 0; k < tempArr.length; k++) {
      //Finding the index with the lowest value
      let minIndex = findMinIndex(tempArr, k);

      //Swapping the current and smallest index
      tempArr = swapElements(tempArr, k, minIndex);
    }
    return tempArr;
  }

  //Function to swap two elements at different indexes
  const swapElements = (arr, i, j) => {
    let temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
    return arr;
  };

  return (
    <div className={mainClass}>
      {/* Will have the Your Goal Title and the square for the Goals to go in */}
      {/* Then, for each goal the user has, it will then display within this square */}
      {/* If there are no goals, then another message will pop up */}
      <div className="GoalsHeader flexItems">
        <div className="titleArea flexItems hideElement">
          <span onClick={() => navigator("/MyGoals")}>My Goals</span>
        </div>
        {/* Code will only be shown on the My Goals page, not on the Home Page */}
        <div className="optionsArea flexItems">
          <div>
            {/* The Buttons to be displayed to the website, in its own level */}
            <div className="buttonArea flexItems hideElement">
              <button className="AddGoalButton" onClick={() => showWindow()}>
                Add Goal
              </button>
              {/* Ensuring that the form window isn't currently being shown */}
              <button
                onClick={() =>
                  !windowShown
                    ? setGoalOptions(!goalOptions)
                    : setGoalOptions(false)
                }
              >
                Show Options
              </button>
            </div>
            {/* The code to conditionally render the form for the user to Make a Goal */}
            {windowShown ? (
              <MakeGoalForm
                toggleWindow={() => showWindow()}
                currentUser={currentUser}
                setGoalAddedRef={() => setGoalAddedRef()}
                goalNames={goalNames}
                goalsObjArray={goalsObjArray}
                subgoalNames={subgoalNames}
                subgoalsObjArray={subgoalsObjArray}
                showNone={true}
              />
            ) : (
              <div style={{ display: "none" }}></div>
            )}
            {/* The goalOptions, conditionally rendered below the buttons */}
            {goalOptions ? (
              <div className="goalOptionsArea flexItems hideElement">
                {/* First level of goal options */}
                <div className="optionsLevel flexItems">
                  <div className="option flexItems">
                    <span>Show Subgoals</span>
                    <div>
                      <label className="switch">
                        {!hideSubgoals ? (
                          <input
                            onChange={() => setHideSubgoals(!hideSubgoals)}
                            type="checkbox"
                            defaultChecked
                          />
                        ) : (
                          <input
                            onChange={() => setHideSubgoals(!hideSubgoals)}
                            type="checkbox"
                          />
                        )}
                        <span className="slider input round"></span>
                      </label>
                    </div>
                  </div>
                  <div className="option flexItems">
                    <span>Show Completed Goals</span>
                    <div>
                      <label className="switch">
                        {!hideCompleteGoals ? (
                          <input
                            onChange={() =>
                              setHideCompleteGoals(!hideCompleteGoals)
                            }
                            type="checkbox"
                            defaultChecked
                          />
                        ) : (
                          <input
                            onChange={() =>
                              setHideCompleteGoals(!hideCompleteGoals)
                            }
                            type="checkbox"
                          />
                        )}
                        <span className="slider input round"></span>
                      </label>
                    </div>
                  </div>
                </div>
                {/* Second level of goal options */}
                <div className="optionsLevel flexItems">
                  {/* Conditionally rendering the correct button */}
                  {sortLastUpdated ? (
                    <button
                      onClick={() => setSortLastUpdated(!sortLastUpdated)}
                    >
                      Sort by Due Date
                    </button>
                  ) : (
                    <button
                      onClick={() => setSortLastUpdated(!sortLastUpdated)}
                    >
                      Sort by Last Updated
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div display="none"></div>
            )}
          </div>
        </div>
      </div>
      <div className="IndividualGoals flexItems hideElement">
        {displayObjsArray.map((goalObj) => (
          <div key={goalObj.uid}>
            <HomePageGoal
              goalObj={goalObj}
              subgoalToMaingoalConnector={subgoalsToMaingoalsConnector}
              setUpdatedGoal={() => setUpdatedGoal()}
              updatedGoal={updatedGoal}
              currentUser={currentUser}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Goals;
