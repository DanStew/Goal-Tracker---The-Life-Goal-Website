import leftArrowWhite from "../Images/leftArrowWhite.jpg"
import rightArrowWhite from "../Images/rightArrowWhite.jpg"

function TimeTableDisplay({colourScheme}){
    
    //Usestate array to store all the information about the events happening in the week
    const [weekArray, setWeekArray] = useState([])

    //Adding temporary data
    //This data is formatted : [Weekday, [Event Information...]]
    //The event information 
    setWeekArray(weekArray.push(["Monday",[["Event 1", "Event Details"],["Event 2","Event 2 Details"]]]))


    return(
        <div className={"TimeTableDisplay " + colourScheme}>
            <div className="TTDHeader">
                {/* This is where the weekname and toggle week buttons will be displayed */}
                <img src={leftArrowWhite} alt="" />
                <p>xx Feb - yy Feb</p>
                <img src={rightArrowWhite} alt="" />
            </div>

        </div>
    )
}

export default TimeTableDisplay