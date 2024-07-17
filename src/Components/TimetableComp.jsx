import { useState } from "react";
import TimetableDisplay from "./TimeTableDisplay.jsx";
import exitButton from "../Images/exitButton.jpg";
import { v4 as uuidv4 } from "uuid";
import { arrayUnion, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../Config/firebase.js";

function TimetableComp({ currentUser,colourScheme }) {
  //Usestate to display whether the window is shown or not
  const [windowShown, setWindowShown] = useState(false);
  const [mainClass, setMainClass] = useState("timetable " + colourScheme);

  //Function to toggle the showing of the Make An Event Window
  function toggleWindow() {
    setWindowShown(!windowShown);
    windowShown
      ? setMainClass("timetable " + colourScheme)
      : setMainClass("timetable hideGoals " + colourScheme);
  }

  //Usestate variables to store the inputs from the form
  const [eventName, setEventName] = useState("");
  const [eventDetails, setEventDetails] = useState("");
  const [eventDate, setEventDate] = useState(null);

  //Usestate variable to toggle when event added
  const [eventAdded,setEventAdded] = useState(false)

  //Usestate variable to store the errorMsg on the system
  const [errorMsg, setErrorMsg] = useState("");

  //Function to process the inputs from the user
  async function processForm() {
    //Resetting error message
    setErrorMsg("")

    //Validating the inputs
    if (eventName == "") {
        setErrorMsg("Event Name is empty, please retry...")
        return
    }

    if (eventDetails == ""){
        setErrorMsg("Event Details is empty, please retry...")
        return
    }

    if (eventDate == null){
        setErrorMsg("No Event Date set, please retry...")
        return
    }
    
    //Generating the random recordId
    let recordId = uuidv4()

    //Making the event record
    await setDoc(doc(db,"Events",recordId),{
        uid : recordId,
        eventName : eventName,
        eventDetails : eventDetails,
        eventDate: eventDate
    })

    //Appending the record id to the users list of events
    await updateDoc(doc(db,"userGoals",currentUser.uid),{
        events : arrayUnion(recordId)
    })

    //Resetting the values for next time
    setEventName("")
    setEventDetails("")
    setEventDate(null)

    //Incrementing event added variable
    setEventAdded(!eventAdded)

    //Closing out of the window
    toggleWindow()
  }

  return (
    <div className={mainClass}>
      <div className="timetableHeader hideElement flexItems">
        <p>Timetable</p>
        <button onClick={() => toggleWindow()}>Add Event</button>
      </div>
      {windowShown ? (
        <div id="MakeForm" className={colourScheme}>
          <div className="formHeader">
            <p className="headerTitle">Make An Event</p>
          </div>
          <div className="formContent">
            <form action="#">
              <div className="formLine">
                <span>Event Name : </span>
                <div className="lineInput">
                  <input
                    onChange={(e) => setEventName(e.target.value)}
                    value={eventName}
                    type="text"
                    placeholder="Event Name..."
                  />
                </div>
              </div>
              <div className="formLine">
                <span>Event Details : </span>
                <div className="lineInput">
                  <input
                    onChange={(e) => setEventDetails(e.target.value)}
                    value={eventDetails}
                    type="text"
                    placeholder="Event Details..."
                  />
                </div>
              </div>
              <div className="formLine">
                <span>Event Date : </span>
                <div className="lineInput">
                  <input
                    onChange={(e) => setEventDate(e.target.value)}
                    type="date"
                  />
                </div>
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
                <button type="button" onClick={() => processForm()}>
                  Make Event
                </button>
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
      ) : (
        <div style={{ display: "none" }}></div>
      )}
      <div className="timetableMain hideElement">
        <TimetableDisplay currentUser={currentUser} colourScheme={colourScheme} eventAdded={eventAdded}/>
      </div>
    </div>
  );
}

export default TimetableComp;
