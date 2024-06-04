import { useNavigate } from "react-router-dom"
import HomePageGoal from "./HomePageGoal"
import ToggleSwitch from "./ToggleSwitch"
import { useState } from "react"
import MakeGoalForm from "./MakeGoalForm"

function Goals({showOptions}){

    //Creating the navigator for the website 
    const navigator = useNavigate()

    //Creating a useState variable to see whether the Goal Options need to be displayed or not
    const [goalOptions, setGoalOptions] = useState(false)

    //Creating useState variables for the different goal options the user can choose
    const [hideSubgoals, setHideSubgoals] = useState(false) //Hides the subgoals from being displayed
    const [hideCompleteGoals, setHideCompleteGoals] = useState(false) //Hides completed goals from being displayed
    const [sortLastUpdated, setSortLastUpdated] = useState(true) //Sorts goals by Last Updated
    const [sortDueDate, setSortDueDate] = useState(false) //Sorts goals by closest Due Date

    //Function to sort how the goals are sorted on the page
    function sortPriority(priorityOption,priorityValue){

    }

    const [mainClass, setMainClass] = useState("Goals")
    const [windowShown, setWindowShown] = useState(false)

    function showWindow(){
        //Showing / Hiding goals depending on whether window shown or not
        windowShown? setMainClass("Goals") : setMainClass("Goals hideGoals")
        //Hiding the options, as the user doesn't need to see them anymore
        setGoalOptions(false)
        //Toggling windowShown
        setWindowShown(!windowShown)
    }

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
                                <MakeGoalForm/> : <div style={{display:"none"}}></div>
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
                {/* Outputs the HomePageGoal component for every goal where the user has SHOWN ON HOME PAGE active */}
                <HomePageGoal />
                <HomePageGoal />
                <HomePageGoal />
            </div>
        </div>
    )
}

export default Goals