import { useNavigate } from "react-router-dom"
import HomePageGoal from "./HomePageGoal"

function Goals(){

    //Creating the navigator for the website 
    const navigator = useNavigate()

    return(
        <div className="Goals">
            {/* Will have the Your Goal Title and the square for the Goals to go in */}
            {/* Then, for each goal the user has, it will then display within this square */}
            {/* If there are no goals, then another message will pop up */}
            <div className="GoalsHeader flexItems">
                <span onClick={() => navigator("/MyGoals")}>My Goals</span>
            </div>
            <div className="IndividualGoals flexItems">
                {/* Outputs the HomePageGoal component for every goal where the user has SHOWN ON HOME PAGE active */}
                <HomePageGoal />
                <HomePageGoal />
                <HomePageGoal />
            </div>
        </div>
    )
}

export default Goals