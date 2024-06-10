import { useNavigate } from "react-router-dom"
import HomePageGoal from "./HomePageGoal"
import ToggleSwitch from "./ToggleSwitch"
import { useEffect, useState } from "react"
import MakeGoalForm from "./MakeGoalForm"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../Config/firebase"

function Goals({showOptions,currentUser}){

    //Creating the navigator for the website 
    const navigator = useNavigate()

    //Creating a useState variable to see whether the Goal Options need to be displayed or not
    const [goalOptions, setGoalOptions] = useState(false)

    //Creating useState variables for the different goal options the user can choose
    const [hideSubgoals, setHideSubgoals] = useState(false) //Hides the subgoals from being displayed
    const [hideCompleteGoals, setHideCompleteGoals] = useState(false) //Hides completed goals from being displayed
    const [sortLastUpdated, setSortLastUpdated] = useState(true) //Sorts goals by Last Updated
    const [sortDueDate, setSortDueDate] = useState(false) //Sorts goals by closest Due Date

    //Object that connects the main goal names to the names of the subgoals that they have
    let goalToSubgoalConnector = {}

    //Function to sort how the goals are sorted on the page
    function sortPriority(priorityOption,priorityValue){

    }

    //Usestate the store what the mainClass of the page will be, used to trigger hiding screen or not
    const [mainClass, setMainClass] = useState("Goals")
    //Usestate to determine whether the Make A Goal window is currently being shown
    const [windowShown, setWindowShown] = useState(false)

    //Function to trigger the showing of the window on the screen
    function showWindow(){
        //Showing / Hiding goals depending on whether window shown or not
        windowShown? setMainClass("Goals") : setMainClass("Goals hideGoals")
        //Hiding the options, as the user doesn't need to see them anymore
        setGoalOptions(false)
        //Toggling windowShown
        setWindowShown(!windowShown)
    }
    
    //Usestates to determine whether a goal has been added and what the name of the goal is
    //This is so that the new goal can be appended to the screen
    const [goalAddedRef,setGoalAddedRef] = useState("")
    
    //Usestate array to store all of the goals  and subgoals from the user
    //Its called goalsObj as it will store goal objects, made from the goal records
    const [goalsObjArray, setGoalsObjArray] = useState([])
    const [subgoalsObjArray, setSubgoalsObjArray] = useState([])
    
    //Making an array to store all the goal names and subgoal names, this will be used in the Subgoal of part of the form
    const [goalNames, setGoalNames] = useState([])
    const [subgoalNames, setSubgoalNames] = useState([])

    //Connecting the subgoals to the maingoals in the system
    const [subgoalsToMaingoals,setSubgoalsToMaingoals] = useState(false)
    const [subgoalsToMaingoalsConnector, setSubgoalsToMaingoalsConnector] = useState({})

    //Useeffect to collect all the goal information from the screen
    useEffect(() => {
        //Finding the users UserGoal record
        const getUserGoals = async() => {
            const userGoalsRef = doc(db,"userGoals",currentUser.uid)
            const docSnap = await getDoc(userGoalsRef)
            return docSnap.data()
        }

        //Finding the goal information from the goal ids
        const getGoalObj = async(goalId) => {
            //Getting the goal record data, using id 
            const goalRef = doc(db,"Goals",goalId)
            const docSnap = await getDoc(goalRef)
            const goalData = docSnap.data()
            //Returning the goal data to the system
            return goalData
        }

        //Making the main function
        const mainFunction = async() => {
            //Making sure that the website does have a current user 
            if (currentUser.uid){
                //Getting the userGoals record data
                const userGoalsData = await getUserGoals()
                //Resetting the goalsObj and goalNames array
                setGoalsObjArray([])
                setSubgoalsObjArray([])
                setGoalNames([])
                setSubgoalNames([])
                setGoalAddedRef(false)
                //Looping through the different goal types and storing all the information
                //Finding the goal data from all of the users goals
                userGoalsData.goals.forEach( async (goalId) => {
                    //Getting the goal information and putting it into an object
                    const goalObj = await getGoalObj(goalId)
                    //Adding the goal name to the goalnames array
                    setGoalNames(prevNames => {
                        return [
                            ...prevNames,
                            goalObj.GoalName
                        ]
                    }) 
                    //Adding the goalInformation to the GoalsObjArray
                    setGoalsObjArray(prevArr => {
                        return [
                            ...prevArr,
                            goalObj
                        ]
                    })
                })
                //Finding the goal data from all of the users goals
                userGoalsData.subgoals.forEach( async (subgoalId) => {
                    //Getting the goal information and putting it into an object
                    const subgoalObj = await getGoalObj(subgoalId)
                    //Adding the subgoal name to the array
                    setSubgoalNames(prevSubgoalNames => {
                        return ([
                            ...prevSubgoalNames,
                            subgoalObj.GoalName
                            ])
                        })
                    //Adding the goalInformation to the GoalsObjArray
                    setSubgoalsObjArray(prevArr => {
                        return [
                            ...prevArr,
                            subgoalObj
                        ]
                    })
                }
                )
            }
        }

        mainFunction()
      }, [currentUser,goalAddedRef]);

      useEffect(() => {
        const mainFunction = () => {
            let tempObj = {}
            //Looping through all the main goals in the array
            //NOTE : You don't need to loop through the subgoals as no subgoals will have subgoals
            goalsObjArray.forEach((goalObj) => {
                //Seeing if the goal has subgoals
                if (goalObj.Subgoals != []){
                    let subgoalsArr = []
                    //Matching the subgoalsUid, to find the names of the subgoals
                    goalObj.Subgoals.forEach((subgoalUid) => {
                        goalsObjArray.forEach((subgoalObj) => {
                            if (subgoalObj.uid == subgoalUid){
                                subgoalsArr.push([subgoalObj.GoalName])
                            }
                        })
                        subgoalsObjArray.forEach((subgoalObj) => {
                            if (subgoalObj.uid == subgoalUid){
                                subgoalsArr.push([subgoalObj.GoalName])
                            }
                        })
                    })
                    //Connecting the item temporarily
                    tempObj[goalObj.GoalName] = subgoalsArr
                }
            })
            //Permanently storing the changes made
            setSubgoalsToMaingoalsConnector(tempObj)
        } 

        mainFunction()
      }, [goalsObjArray])

    return(
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
                    {showOptions?
                        <div>
                            {/* The Buttons to be displayed to the website, in its own level */}
                            <div className="buttonArea flexItems hideElement">
                                    <button className="AddGoalButton" onClick={() => showWindow()}>Add Goal</button>
                                    {/* Ensuring that the form window isn't currently being shown */}
                                    <button onClick={() => !windowShown? setGoalOptions(!goalOptions) : setGoalOptions(false)}>Show Options</button>
                            </div>
                            {/* The code to conditionally render the form for the user to Make a Goal */}
                            {windowShown?
                                <MakeGoalForm toggleWindow={() => showWindow()} currentUser={currentUser} setGoalAddedRef={() => setGoalAddedRef()} goalNames={goalNames} goalsObjArray={goalsObjArray} subgoalNames={subgoalNames} subgoalsObjArray={subgoalsObjArray}/> : <div style={{display:"none"}}></div>
                            }
                            {/* The goalOptions, conditionally rendered below the buttons */}
                            {goalOptions?
                                <div className="goalOptionsArea flexItems hideElement">
                                    {/* First level of goal options */}
                                    <div className="optionsLevel flexItems">
                                        <div className="option flexItems">
                                            <span>Show Subgoals</span>
                                            <ToggleSwitch onClick={() => setHideSubgoals(!hideSubgoals)}/>
                                        </div> 
                                        <div className="option flexItems">
                                            <span>Show Completed Goals</span>
                                            <ToggleSwitch onClick={() => setHideCompleteGoals(!hideCompleteGoals)}/>
                                        </div>
                                    </div>
                                    {/* Second level of goal options */}
                                    <div className="optionsLevel flexItems">
                                        <div className="option flexItems">
                                            <span>Sort by Last Updated</span>
                                            <ToggleSwitch onClick={() => sortPriority("Last Updated", !sortLastUpdated)}/>
                                        </div>
                                        <div className="option flexItems">
                                            <span>Sort by Due Date</span>
                                            <ToggleSwitch onClick={() => sortPriority("Due Date", !sortDueDate)}/>
                                        </div>
                                    </div>
                                </div> 
                                : <div display="none"></div>
                            }
                        </div> 
                        : <div style={{display:"none"}}></div>
                    }
                </div>
            </div>
            <div className="IndividualGoals flexItems hideElement">
                {goalsObjArray.map((goalObj) =>
                    <div key={goalObj.uid}>
                        <HomePageGoal goalObj={goalObj} subgoalToMaingoalConnector={subgoalsToMaingoalsConnector}/>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Goals