function HomePageGoal(){

    //The variable that will store the completedGoals / nmbGoals calculation
    var progressTotal = 100

    return(
        <div className="homePageGoal flexItems">
            {/* Making the header of the Goal Component */}
            <div className="hpgHeader flexItems">
                <div>
                    {/* Displaying the GoalName of the Goal */}
                    <span>GoalName</span>
                </div>
                {/* Displaying information about the goals */}
                <div className="hpgHeaderLine">
                    <p>Progress : </p>
                    {/* Making the progress bar for the system */}
                    <div className="container">
                        {/* This line of code fill in the bar the variable amount that has currently been complete */}
                        <div style={{width: `${progressTotal}%`}} className="progress-bar">CptGoals/NmbGoals</div>
                    </div>
                </div>
                {/* Displaying information about the goals */}
                <div className="hpgHeaderLine">
                    <div>
                        <p>Last Updated : </p>
                    </div>
                    <div>
                        <p>Date</p>
                    </div>
                </div>
            </div>
            {/* Displaying the subgoals of the goal, allowing the user to be able to click on them */}
            <div className="hpgMain flexItems">
                <p>Subgoal1</p>
                <p>Subgoal2</p>
                <p>Subgoal3</p>
            </div>
            <div className="hpgFooter flexItems">
                <div className="hpgFooterEmpty flexItems"></div>
                <div className="hpgFooterContent flexItems"></div>
            </div>
        </div>
    )
}

export default HomePageGoal