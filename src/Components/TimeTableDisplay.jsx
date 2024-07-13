import { useEffect, useState } from "react";
import leftArrowWhite from "../Images/leftArrowWhite.jpg";
import rightArrowWhite from "../Images/rightArrowWhite.jpg";

function TimeTableDisplay({ colourScheme }) {
  //Usestate array to store all the information about the events happening in the week
  const [weekArray, setWeekArray] = useState([]);

  useEffect(() => {
    setWeekArray([]);
    let tempArray = [[
      "Monday",
      [
        ["Event 1", "Event Details"],
        ["Event 2", "Event 2 Details"],
        ["Event 3", "Event 3 Details"],
        ["Event 4", "Event 4 Details"],
      ]
    ],["Tuesday", []]]

    setWeekArray(tempArray)
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
        {weekArray.map((dayInformation,index) => {
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
                          <div className="event left flexItems">
                            <div className="eventContent flexItems">
                              <p>{eventInfo[0]}</p>
                              <p>{eventInfo[1]}</p>
                            </div>
                            <div className="eventFooter flexItems">
                                <div className="blank flexItems"></div>
                                <div className="button flexItems"></div>
                              </div>
                          </div>
                          {dayInformation[1][index + 1] ? (
                            <div className="event middle flexItems">
                              <div className="eventContent flexItems">
                                <p>{dayInformation[1][index + 1][0]}</p>
                                <p>{dayInformation[1][index + 1][1]}</p>
                              </div>
                              <div className="eventFooter flexItems">
                                <div className="blank flexItems"></div>
                                <div className="button flexItems"></div>
                              </div>
                            </div>
                          ) : (
                            <div className="event blank flexItems"></div>
                          )}
                          {dayInformation[1][index + 2] ? (
                            <div className="event right flexItems">
                              <div className="eventContent">
                                <p>{dayInformation[1][index + 2][0]}</p>
                                <p>{dayInformation[1][index + 2][1]}</p>
                              </div>
                              <div className="eventFooter flexItems">
                                <div className="blank flexItems"></div>
                                <div className="button flexItems"></div>
                              </div>
                            </div>
                          ) : (
                            <div className="event blank flexItems"></div>
                          )}
                        </div>
                      ) : (
                        <div style={{ display: "none" }}></div>
                      )}
                    </div>
                  );
                })}
                {/* Outputting text if there are no events on the current day */}
                {console.log(dayInformation[1][0] == undefined)}
                {dayInformation[1][0] == undefined ? <div className="eventLine flexItems">
                  <p className="noEvents">No events on this day...</p>
                  </div> : <div style={{display:"none"}}></div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TimeTableDisplay;
