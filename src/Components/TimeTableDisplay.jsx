import { useEffect, useState } from "react";
import leftArrowWhite from "../Images/leftArrowWhite.jpg";
import rightArrowWhite from "../Images/rightArrowWhite.jpg";

function TimeTableDisplay({ colourScheme }) {
  //Object which says the number of days in each month
  //Singular value for every one other than February, where there may be multiple
  const daysInMonths = {
    "01": 31,
    "02": [28, 29],
    "03": 31,
    "04": 30,
    "05": 31,
    "06": 30,
    "07": 31,
    "08": 31,
    "09": 30,
    "10": 31,
    "11": 30,
    "12": 31,
  };

  //Useeffect to find the current week we are on
  useEffect(() => {
    const mainFunction = () => {
      //Getting the current date as a recognisable string
      let currentDateString = getDateString();
      console.log(increaseDate("2024-12-29",3));
      console.log(decreaseDate("2024-12-29",3))
    };

    mainFunction();
  }, []);

  //Function to make the current date into a recognisable string
  function getDateString() {
    //Getting the current date and time (will be used later)
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
    //Putting all this information into a single string, will be stored later
    let currentDateString =
      currentDateObj.year +
      "-" +
      currentDateObj.month +
      "-" +
      currentDateObj.day;

    return currentDateString;
  }

  //Function to split a date into a date object
  function getDateObj(date) {
    //Splitting the date into separate elements
    let dateArray = date.split("-");
    //Making the object
    let dateObj = {
      year: dateArray[0],
      month: dateArray[1],
      day: dateArray[2],
    };
    //Returning the object to the system
    return dateObj;
  }

  //Function to increase the current date by 1 day
  function increaseDate(date,nmbDays) {
    //Breaking down the date into a date object
    let dateObj = getDateObj(date);
    //Increasing the day by 1
    dateObj.day = (+dateObj.day+nmbDays) < 10 ? "0" + (+dateObj.day+nmbDays) : +dateObj.day + nmbDays;
    //Finding out the maximum day in that month
    //Checking if the month is February, if so, we'd need to check whether the year is a leap year or not
    let maximumDay = 0;
    if (dateObj.month == "02") {
      //Seeing if the year is a leap year
      if (
        (0 == +dateObj.year % 4 && 0 != +dateObj.year % 100) ||
        0 == +dateObj.year % 400
      ) {
        //If it a year, so that maximum days will be 29, stored in the 1 position
        maximumDay = daysInMonths[dateObj.month][1];
      } else {
        //Not a year, so get the 0 position
        maximumDay = daysInMonths[dateObj.month][0];
      }
    } else {
      //Setting the maximum day normally
      maximumDay = daysInMonths[dateObj.month];
    }
    //Seeing if the day now contradicts the number of days in the month
    if (+dateObj.day > maximumDay) {
      //Finding out the difference between the day and the max number
      //The difference will be the current day of the next month that we are on
      let dayDifference = +dateObj.day - maximumDay
      //Incrementing the month by 1, resetting the days
      dateObj.month = (+dateObj.month + 1) < 10 ? "0" + (+dateObj.month+1) : +dateObj.month+1;
      dateObj.day = dayDifference < 10 ? "0" + dayDifference : dayDifference;
      //Seeing if the months are now incorrect, as you have gone too far
      if (+dateObj.month > 12) {
        //Incrementing the year by 1, resetting the months
        dateObj.year = +dateObj.year + 1;
        dateObj.month = "01";
      }
    }
    //Formatting the dateObj into a new string, and returning it
    let dateString = dateObj.year + "-" + dateObj.month + "-" + dateObj.day
    return dateString
  }

  //Function to decrease the current date by 1 day
  function decreaseDate(date,nmbDays) {
    //Breaking down the date into a date object
    let dateObj = getDateObj(date);
    //Seeing if the day now has gone to 0
    if (+dateObj.day - nmbDays < 1) {
      //Setting this value to be the negative number that we have, it will be overwritten later
      dateObj.day = +dateObj.day-nmbDays
      //Decrease the month by 1, resetting the days
      dateObj.month = (+dateObj.month - 1) < 10 ? "0" + (+dateObj.month-1) : +dateObj.month-1;;
      //Resetting the days
      //Checking to see if the month is now February
      if (dateObj.month == "02"){
        //Seeing if the year is a leap year or not
        if (
          (0 == +dateObj.year % 4 && 0 != +dateObj.year % 100) ||
          0 == +dateObj.year % 400
        ) {
          //As leap year, set days to 29
          dateObj.day = daysInMonths[dateObj.month][1] + +dateObj.day
        }
        else{
          //Not a leap year, so 28
          dateObj.day = daysInMonths[dateObj.month][0] + +dateObj.day
        }
      }
      //Otherwise, set to the maximum day in the month
      else{
        //Ensuring that a year change doesn't need to occur
        if (dateObj.month != "00"){
          dateObj.day = daysInMonths[dateObj.month] + +dateObj.day
        }
      }
      //Seeing if the months are now incorrect, as you have gone too far
      if (+dateObj.month < 1) {
        //Decrease the year by 1, resetting the months
        dateObj.year = +dateObj.year - 1;
        dateObj.month = "12";
        dateObj.day = daysInMonths[dateObj.month] + +dateObj.day
      }
    }
    else{
      //Decreasing the day by nmbDays
      dateObj.day = (+dateObj.day-nmbDays) < 10 ? "0" + (+dateObj.day-nmbDays) : +dateObj.day - nmbDays;
    }
    //Formatting the dateObj into a new string, and returning it
    let dateString = dateObj.year + "-" + dateObj.month + "-" + dateObj.day
    return dateString
  }

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
  function completeEvent() {}

  //Function to delete the event selected
  function deleteEvent() {}

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
                                <div
                                  onClick={() => toggleOptions(index)}
                                  className="button flexItems"
                                ></div>
                              </div>
                            </div>
                          ) : (
                            <div className="event left flexItems">
                              <div
                                onClick={() => toggleOptions(index)}
                                className="option flexItems"
                              >
                                <p>Close</p>
                              </div>
                              <div
                                onClick={() => completeEvent()}
                                className="option flexItems"
                              >
                                <p>Complete Event</p>
                              </div>
                              <div
                                onClick={() => deleteEvent()}
                                className="option flexItems"
                              >
                                <p>Delete Event</p>
                              </div>
                            </div>
                          )}
                          {dayInformation[1][index + 1] ? (
                            <div className="event middle flexItems">
                              {optionsId != index + 1 ? (
                                <div>
                                  <div className="eventContent flexItems">
                                    <p>{dayInformation[1][index + 1][0]}</p>
                                    <p>{dayInformation[1][index + 1][1]}</p>
                                  </div>
                                  <div className="eventFooter flexItems">
                                    <div className="blank flexItems"></div>
                                    <div
                                      onClick={() => toggleOptions(index + 1)}
                                      className="button flexItems"
                                    ></div>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div
                                    onClick={() => toggleOptions(index + 1)}
                                    className="option flexItems"
                                  >
                                    <p>Close</p>
                                  </div>
                                  <div
                                    onClick={() => completeEvent()}
                                    className="option flexItems"
                                  >
                                    <p>Complete Event</p>
                                  </div>
                                  <div
                                    onClick={() => deleteEvent()}
                                    className="option flexItems"
                                  >
                                    <p>Delete Event</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="event blank flexItems"></div>
                          )}
                          {dayInformation[1][index + 1] ? (
                            <div className="event right flexItems">
                              {optionsId != index + 2 ? (
                                <div>
                                  <div className="eventContent flexItems">
                                    <p>{dayInformation[1][index + 2][0]}</p>
                                    <p>{dayInformation[1][index + 2][1]}</p>
                                  </div>
                                  <div className="eventFooter flexItems">
                                    <div className="blank flexItems"></div>
                                    <div
                                      onClick={() => toggleOptions(index + 2)}
                                      className="button flexItems"
                                    ></div>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div
                                    onClick={() => toggleOptions(index + 2)}
                                    className="option flexItems"
                                  >
                                    <p>Close</p>
                                  </div>
                                  <div
                                    onClick={() => completeEvent()}
                                    className="option flexItems"
                                  >
                                    <p>Complete Event</p>
                                  </div>
                                  <div
                                    onClick={() => deleteEvent()}
                                    className="option flexItems"
                                  >
                                    <p>Delete Event</p>
                                  </div>
                                </div>
                              )}
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
