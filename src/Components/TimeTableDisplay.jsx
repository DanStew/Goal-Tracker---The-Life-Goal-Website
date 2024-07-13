import { useEffect, useState } from "react";
import leftArrowWhite from "../Images/leftArrowWhite.jpg";
import rightArrowWhite from "../Images/rightArrowWhite.jpg";

function TimeTableDisplay({ colourScheme }) {
  //Usestate array to store all the information about the events happening in the week
  const [weekArray, setWeekArray] = useState([]);

  //Usestate variable to store the index of the event which is currently open
  const [optionsId, setOptionsId] = useState(null);

  //Function to toggle the options of an event
  //NOTE: You can't have two options of different events open at the same time
  //NOTE: When events are made, the optionsIndex variable will store the id of the variable that it needs to open
  function toggleOptions(eventId) {
    //If the options are already open, close them
    if (optionsId == eventId) {
      setOptionsId(null);
    }
    //Else, open the options
    else {
      setOptionsId(eventId);
    }
  }

  //Function to complete the event selected
  function completeEvent(){

  }

  //Function to delete the event selected
  function deleteEvent(){
    
  }

  useEffect(() => {
    setWeekArray([]);
    let tempArray = [
      [
        "Monday",
        [
          ["Event 1", "Event Details"],
          ["Event 2", "Event 2 Details"],
          ["Event 3", "Event 3 Details"],
          ["Event 4", "Event 4 Details"],
        ],
      ],
      ["Tuesday", []],
    ];

    setWeekArray(tempArray);
  }, [colourScheme]);

  return (
    <div className={"TimeTableDisplay " + colourScheme}>
      <div className="TTDHeader flexItems">
        {/* This is where the weekname and toggle week buttons will be displayed */}
        <img src={leftArrowWhite} alt="" />
        <p>xx Feb - yy Feb</p>
        <img src={rightArrowWhite} alt="" />
      </div>
      <div className="TTDMain flexItems">
        {/* Looping through all the days in the week */}
        {console.log(weekArray)}
        {weekArray.map((dayInformation, index) => {
          return (
            <div key={index} className="timetableDay flexItems">
              <div className="dayHeader flexItems">
                <p>{dayInformation[0]}</p>
              </div>
              <div className="dayEvents flexItems">
                {/* Looping through all the events the day has */}
                {dayInformation[1].map((eventInfo, index) => {
                  return (
                    <div className="eventLine flexItems" key={index}>
                      {/* Grouping the events into groups of 3 */}
                      {/* This is done by displaying 3 at one time, and then skipping till we get to the next group of 3 */}
                      {index % 3 == 0 ? (
                        <div className="eventLine flexItems">
                            {optionsId != index ? (
                              <div className="event left flexItems">
                                <div className="eventContent flexItems">
                                  <p>{eventInfo[0]}</p>
                                  <p>{eventInfo[1]}</p>
                                </div>
                                <div className="eventFooter flexItems">
                                  <div className="blank flexItems"></div>
                                  <div onClick={() => toggleOptions(index)} className="button flexItems"></div>
                                </div>
                              </div>
                            ) : (
                              <div className="event left flexItems">
                                <div onClick={() => toggleOptions(index)} className="option flexItems"><p>Close</p></div>
                                <div onClick={() => completeEvent()} className="option flexItems"><p>Complete Event</p></div>
                                <div onClick={() => deleteEvent()} className="option flexItems"><p>Delete Event</p></div>
                              </div>
                            )}
                          {dayInformation[1][index + 1] ? (
                            <div className="event middle flexItems">
                              {optionsId != index+1 ? (
                              <div>
                                <div className="eventContent flexItems">
                                <p>{dayInformation[1][index + 1][0]}</p>
                                <p>{dayInformation[1][index + 1][1]}</p>
                                </div>
                                <div className="eventFooter flexItems">
                                  <div className="blank flexItems"></div>
                                  <div onClick={() => toggleOptions(index+1)} className="button flexItems"></div>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div onClick={() => toggleOptions(index+1)} className="option flexItems"><p>Close</p></div>
                                <div onClick={() => completeEvent()} className="option flexItems"><p>Complete Event</p></div>
                                <div onClick={() => deleteEvent()} className="option flexItems"><p>Delete Event</p></div>
                              </div>
                            )}
                            </div>)
                             : (<div className="event blank flexItems"></div>
                          )}
                          {dayInformation[1][index + 1] ? (
                            <div className="event right flexItems">
                              {optionsId != index+2 ? (
                              <div>
                                <div className="eventContent flexItems">
                                <p>{dayInformation[1][index + 2][0]}</p>
                                <p>{dayInformation[1][index + 2][1]}</p>
                                </div>
                                <div className="eventFooter flexItems">
                                  <div className="blank flexItems"></div>
                                  <div onClick={() => toggleOptions(index+2)} className="button flexItems"></div>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div onClick={() => toggleOptions(index+2)} className="option flexItems"><p>Close</p></div>
                                <div onClick={() => completeEvent()} className="option flexItems"><p>Complete Event</p></div>
                                <div onClick={() => deleteEvent()} className="option flexItems"><p>Delete Event</p></div>
                              </div>
                            )}
                            </div>)
                             : (<div className="event blank flexItems"></div>
                          )}
                        </div>
                      ) : (
                        <div style={{ display: "none" }}></div>
                      )}
                    </div>
                  );
                })}
                {/* Outputting text if there are no events on the current day */}
                {dayInformation[1][0] == undefined ? (
                  <div className="eventLine flexItems">
                    <p className="noEvents">No events on this day...</p>
                  </div>
                ) : (
                  <div style={{ display: "none" }}></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TimeTableDisplay;
