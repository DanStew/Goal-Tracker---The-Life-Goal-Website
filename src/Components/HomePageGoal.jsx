import { doc, updateDoc } from "firebase/firestore"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { db } from "../Config/firebase"

function HomePageGoal({goalObj,subgoalToMaingoalConnector,setUpdatedGoal,updatedGoal}){

    //The variable that will store the completedGoals / nmbGoals calculation
    var progressTotal = goalObj.CompleteGoals / goalObj.NmbGoals

    //Showing a little bit of green, to not demotivate the user
    progressTotal == 0? progressTotal = 5 : progressTotal = progressTotal

    //Implementing the navigator
    const navigator = useNavigate()

    //Usestate variable to display the options of the page
    const [showOptions, setShowOptions] = useState(false)

    //Function used to toggle the homepage behaviour of the goal
    async function toggleHomepage(){
        //Adding the entry to the goal doc
        await updateDoc(doc(db, "Goals", goalObj.uid), {
            DisplayHomepage : !goalObj.DisplayHomepage
        });
        
        setUpdatedGoal(!updatedGoal)
    }

    //Function to delete the current goal
    function deleteGoal(){

    }

    return(
        <div className="homePageGoal flexItems">
            {/* Making the header of the Goal Component */}
            <div className="hpgHeader flexItems">
                <div>
                    {/* Displaying the GoalName of the Goal */}
                    <span onClick={() => navigator(`/Goals/${goalObj.GoalName}`)}>{goalObj.GoalName}</span>
                </div>
                {/* Displaying information about the goals */}
                <div className="hpgHeaderLine">
                    <p>Progress : </p>
                    {/* Making the progress bar for the system */}
                    <div className="container">
                        {/* This line of code fill in the bar the variable amount that has currently been complete */}
                        <div style={{width: `${progressTotal}%`}} className="progress-bar">{goalObj.CompleteGoals}/{goalObj.NmbGoals}</div>
                    </div>
                </div>
                {/* Displaying information about the goals */}
                <div className="hpgHeaderLine">
                    <div>
                        <p>Last Updated : </p>
                    </div>
                    <div>
                        <p>{goalObj.LastUpdated}</p>
                    </div>
                </div>
            </div>
            {/* Displaying the subgoals of the goal, allowing the user to be able to click on them */}
            <div className="hpgMain flexItems">
                {subgoalToMaingoalConnector[goalObj.GoalName] ? 
                    subgoalToMaingoalConnector[goalObj.GoalName].map((goalName) => {
                        return(
                            <div key={goalName}>
                                <p onClick={() => navigator(`/Goals/${goalName}`)}>{goalName}</p>
                            </div>
                        )})
                    : <div style={{display:"none"}}></div>}
            </div>
            <div className="hpgFooter flexItems">
                <div className="hpgFooterEmpty flexItems"></div>
                <div className="hpgFooterContent flexItems" onClick={() => setShowOptions(!showOptions)}></div>
            </div>
            {showOptions? 
                <div className="options flexItems">
                    <div className="optionsContent">
                        {goalObj.DisplayHomepage? 
                        <button className="hideHomepage" onClick={() => toggleHomepage()}>Hide From Homepage</button>
                        : <button onClick={() => toggleHomepage()}>Show on Homepage</button>}
                        <button className="delete" onClick={() => deleteGoal()}>Delete Goal</button>
                    </div>
                </div>
                : <div style={{display:"none"}}></div>
                }
        </div>
    )
}

export default HomePageGoal