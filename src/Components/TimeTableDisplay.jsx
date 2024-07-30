import { useEffect, useState } from "react";
import leftArrowWhite from "../Images/leftArrowWhite.jpg";
import rightArrowWhite from "../Images/rightArrowWhite.jpg";
import { db } from "../Config/firebase.js";
import { arrayRemove, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { decreaseDate, increaseDate } from "../Functions/changingDates.js";
import { getCurrentDate, getCurrentDateObj } from "../Functions/dates.js";
import { getEventRecord, getUserGoalsData } from "../Functions/records.js";

function TimeTableDisplay({ currentUser, colourScheme, eventAdded }) {

  //Changing from number months to alphabetical months
  const numMonthtoAlph = {
    "01": "January",
    "02": "February",
    "03": "March",
    "04": "April",
    "05": "May",
    "06": "June",
    "07": "July",
    "08": "August",
    "09": "September",
    10: "October",
    11: "November",
    12: "December",
  };

  //Usestate variable to store the date of the start of the week (Monday)
  const [mondayDate, setMondayDate] = useState(null);

  //Usestate variable to store week variable, from the start to the end of the week
  const [weekString, setWeekString] = useState("");

  //Usestate variable to store all the dates within a week
  const [weekDates, setWeekDates] = useState([]);

  //Storing formatted dates
  const [formattedDates, setFormattedDates] = useState([]);

  //Usestate array to store all the events that are happening on each event
  //The events on the same date share the same index as the weekDates array
  const [weekDateEvents, setWeekDateEvents] = useState([
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ]);

  //Usestate variable to note that events have changed in some way
  const [eventChanged, setEventChanged] = useState(false);

  //Useeffect to find the current week we are on
  useEffect(() => {
    const mainFunction = () => {
      //Getting the current date as a recognisable string
      let currentDate = new Date();
      let currentDateString = getDateString();
      //Finding the date of Monday, the beginning of the week
      if (currentDate.getDay() == 0) {
        //The day is sunday, so you need to go to the start of the previous week
        setMondayDate(decreaseDate(currentDateString, 6));
      } else {
        setMondayDate(
          decreaseDate(currentDateString, currentDate.getDay() - 1)
        );
      }
    };

    mainFunction();
  }, []);

  //Useeffect to get ALL the dates within a week, until you get to Sunday
  //Loops everytime the Monday date changes
  useEffect(() => {
    const mainFunction = () => {
      //Resetting the weekDates array
      setWeekDates([]);
      //Making a temporary array to store dates
      let tempArr = [mondayDate];
      //Looping through all the dates in the week, until we get to Sunday
      //Keeping track of what the date it, outside the for loop as well
      let currentDate = mondayDate;
      for (let i = 0; i <= 5; i++) {
        //Increasing the date by 1, storing it as the new date
        currentDate = increaseDate(currentDate, 1);
        //Appending the date to the temp arr
        tempArr.push(currentDate);
      }
      //Storing the tempArr as the actual WeekDates arr
      setWeekDates(tempArr);
    };

    //Ensuring that the mondayDate isn't currently empty
    if (mondayDate != null) {
      mainFunction();
    }
  }, [mondayDate]);

  //Useeffect function to get all the events from the weekDates in the current week
  useEffect(() => {
    const mainFunction = async () => {
      setWeekDateEvents([[],[],[],[],[],[],[]])
      //Formatting date strings to make them more readable
      const formatDate = (date,year) => {
        let dateElements = date.split("-");
        //Finding what the ending of the days part is
        let day = parseInt(dateElements[2], 10); //Parseint removes the 0s from the fron tof the day
        let daysEnding = "";
        if (day == 1 || day == 21 || day == 31) {
          daysEnding = "st";
        } else if (day == 2 || day == 22) {
          daysEnding = "nd";
        } else {
          daysEnding = "th";
        }
        //Finding what the name of the month is
        let month = numMonthtoAlph[dateElements[1]];
        //Seeing whether the year needs to be returned or not
        if (year == true) {
          return day + daysEnding + " " + month + " " + dateElements[0];
        } else {
          return day + daysEnding + " " + month;
        }
      };

      //Making a temporary array for all the events to be stored within the week
      //Each day has its own array, to store the events for that day
      let tempArr = [[], [], [], [], [], [], []];
      //Getting the users userGoals record
      let userGoalsData = await getUserGoalsData(currentUser.uid)
      //Mapping through all of the events
      await userGoalsData.events.map(async (eventId) => {
        //Getting the event record
        let eventRecord = await getEventRecord(eventId);
        if (weekDates.includes(eventRecord.eventDate)) {
          //Finding the index of this event, from the weekDates array
          let index = weekDates.indexOf(eventRecord.eventDate);
          //Appending the event at this index in the tempArr
          tempArr[index].push(eventRecord);
          //Storing the new array
        }
        setWeekDateEvents(tempArr);
      });

      //Correctly formatting the dates and week string
      //Formatting the date strings
      let tempDates = [];
      weekDates.map((date) => {
        let newDate = formatDate(date, true);
        tempDates.push(newDate);
      });
      setFormattedDates(tempDates);
      //Formatting the weekString
      //Making the weekstring using the first and last day
      let formattedStartDate = formatDate(weekDates[0], false);
      let formattedEndDate = formatDate(weekDates[6], true);
      setWeekString(formattedStartDate + " - " + formattedEndDate);
    };

    //Ensuring that the weekdates have actually been collected
    if (weekDates[0] && currentUser.uid != undefined) {
      mainFunction();
    }
  }, [weekDates, eventAdded, eventChanged]);

  //Function to make the current date into a recognisable string
  function getDateString() {
    let currentDateObj = getCurrentDateObj()
    //Putting all this information into a single string, will be stored later
    let currentDateString =
      currentDateObj.year +
      "-" +
      currentDateObj.month +
      "-" +
      currentDateObj.day;

    return currentDateString;
  }

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
  async function completeEvent(eventId) {
    //Updating the completed attribute, to be true
    await updateDoc(doc(db, "Events", eventId), {
      completed: true,
    });
    //Recollecting the event records
    setEventChanged(!eventChanged);
  }

  //Function to delete the event selected
  async function deleteEvent(eventId) {
    //Removing the doc from the userGoals record
    await updateDoc(doc(db,"userGoals",currentUser.uid),{
      events : arrayRemove(eventId)
    })
    //Deleting the doc
    await deleteDoc(doc(db,"Events",eventId))
    //Recollecting the events
    setEventChanged(!eventChanged)
  }

  //Function to move to the previous week
  function previousWeek() {
    setMondayDate(decreaseDate(mondayDate, 7));
  }

  //Function to move to the next week
  function futureWeek() {
    setMondayDate(increaseDate(mondayDate, 7));
  }

  return (
    <div className={"TimeTableDisplay flexSetup column noGap " + colourScheme}>
      <div className="TTDHeader flexSetup noGap flexItems">
        {/* This is where the weekname and toggle week buttons will be displayed */}
        <img className="corners" onClick={() => previousWeek()} src={leftArrowWhite} alt="" />
        <p>{weekString}</p>
        <img className="corners" onClick={() => futureWeek()} src={rightArrowWhite} alt="" />
      </div>
      <div className="TTDMain flexItems">
        {/* Looping through all the days in the week */}
        {formattedDates ? (
          <div>
            {formattedDates.map((dayDate, index) => {
              return (
                <div key={dayDate} className="timetableDay flexSetup column noGap flexItems">
                  <div className="dayHeader flexItems">
                    <p>{dayDate}</p>
                  </div>
                  <div className="dayEvents flexSetup column noGap flexItems">
                    {/* Looping through all the events the day has */}
                    {weekDateEvents[index].map((eventInfo, index2) => {
                      return (
                        <div
                          className="eventLine flexSetup noGap flexItems"
                          key={eventInfo.uid}
                        >
                          {/* Grouping the events into groups of 3 */}
                          {/* This is done by displaying 3 at one time, and then skipping till we get to the next group of 3 */}
                          {index2 % 3 == 0 ? (
                            <div className="eventLine flexSetup noGap flexItems">
                              {eventInfo.completed != true ? (
                                <div className="event left flexItems">
                                  {optionsId != eventInfo.uid ? (
                                    <div>
                                      <div className="eventContent flexItems">
                                        <p className="eventName flexItems ">
                                          {eventInfo.eventName}
                                        </p>
                                        <p className="eventDetails flexItems">
                                          {eventInfo.eventDetails}
                                        </p>
                                      </div>
                                      <div className="eventFooter flexSetup noGap flexItems">
                                        <div className="blank flexItems"></div>
                                        <div
                                          onClick={() =>
                                            toggleOptions(eventInfo.uid)
                                          }
                                          className="button flexItems"
                                        ></div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="event left flexItems">
                                      <div
                                        onClick={() =>
                                          toggleOptions(eventInfo.uid)
                                        }
                                        className="option flexItems"
                                      >
                                        <p>Close</p>
                                      </div>
                                      <div
                                        onClick={() =>
                                          completeEvent(eventInfo.uid)
                                        }
                                        className="option flexItems"
                                      >
                                        <p>Complete Event</p>
                                      </div>
                                      <div
                                        onClick={() =>
                                          deleteEvent(eventInfo.uid)
                                        }
                                        className="option flexItems"
                                      >
                                        <p>Delete Event</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="event left complete flexItems">
                                  <div className="eventContent flexItems">
                                    <p className="eventName">
                                      {eventInfo.eventName}
                                    </p>
                                    <p className="eventDetails">
                                      {eventInfo.eventDetails}
                                    </p>
                                  </div>
                                  <div className="eventFooter flexItems">
                                    <p className="completed">-- Completed --</p>
                                  </div>
                                </div>
                              )}
                              {weekDateEvents[index][index2 + 1] ? (
                                <div className="event middle flexItems">
                                  {weekDateEvents[index][index2 + 1]
                                    .completed != true ? (
                                    <div>
                                      {optionsId !=
                                      weekDateEvents[index][index2 + 1].uid ? (
                                        <div>
                                          <div className="eventContent flexItems">
                                            <p className="eventName">
                                              {
                                                weekDateEvents[index][
                                                  index2 + 1
                                                ].eventName
                                              }
                                            </p>
                                            <p className="eventDetails">
                                              {
                                                weekDateEvents[index][
                                                  index2 + 1
                                                ].eventDetails
                                              }
                                            </p>
                                          </div>
                                          <div className="eventFooter flexSetup noGap flexItems">
                                            <div className="blank flexItems"></div>
                                            <div
                                              onClick={() =>
                                                toggleOptions(
                                                  weekDateEvents[index][
                                                    index2 + 1
                                                  ].uid
                                                )
                                              }
                                              className="button flexItems"
                                            ></div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div>
                                          <div
                                            onClick={() =>
                                              toggleOptions(
                                                weekDateEvents[index][
                                                  index2 + 1
                                                ].uid
                                              )
                                            }
                                            className="option flexItems"
                                          >
                                            <p>Close</p>
                                          </div>
                                          <div
                                            onClick={() =>
                                              completeEvent(
                                                weekDateEvents[index][
                                                  index2 + 1
                                                ].uid
                                              )
                                            }
                                            className="option flexItems"
                                          >
                                            <p>Complete Event</p>
                                          </div>
                                          <div
                                            onClick={() =>
                                              deleteEvent(
                                                weekDateEvents[index][
                                                  index2 + 1
                                                ].uid
                                              )
                                            }
                                            className="option flexItems"
                                          >
                                            <p>Delete Event</p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="event complete">
                                      <div className="eventContent flexItems">
                                        <p className="eventName">
                                          {
                                            weekDateEvents[index][index2 + 1]
                                              .eventName
                                          }
                                        </p>
                                        <p className="eventDetails">
                                          {
                                            weekDateEvents[index][index2 + 1]
                                              .eventDetails
                                          }
                                        </p>
                                      </div>
                                      <div className="eventFooter flexItems">
                                        <p className="completed">
                                          -- Completed --
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="event blank flexItems"></div>
                              )}
                              {weekDateEvents[index][index2 + 2] ? (
                                <div className="event right flexItems">
                                  {weekDateEvents[index][index2 + 1]
                                    .completed != true ? (
                                    <div>
                                      {optionsId !=
                                      weekDateEvents[index][index2 + 2].uid ? (
                                        <div>
                                          <div className="eventContent flexItems">
                                            <p className="eventName">
                                              {
                                                weekDateEvents[index][
                                                  index2 + 2
                                                ].eventName
                                              }
                                            </p>
                                            <p className="eventDetails">
                                              {
                                                weekDateEvents[index][
                                                  index2 + 2
                                                ].eventDetails
                                              }
                                            </p>
                                          </div>
                                          <div className="eventFooter flexSetup noGap flexItems">
                                            <div className="blank flexItems"></div>
                                            <div
                                              onClick={() =>
                                                toggleOptions(
                                                  weekDateEvents[index][
                                                    index2 + 2
                                                  ].uid
                                                )
                                              }
                                              className="button flexItems"
                                            ></div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div>
                                          <div
                                            onClick={() =>
                                              toggleOptions(
                                                weekDateEvents[index][
                                                  index2 + 2
                                                ].uid
                                              )
                                            }
                                            className="option flexItems"
                                          >
                                            <p>Close</p>
                                          </div>
                                          <div
                                            onClick={() =>
                                              completeEvent(
                                                weekDateEvents[index][
                                                  index2 + 2
                                                ].uid
                                              )
                                            }
                                            className="option flexItems"
                                          >
                                            <p>Complete Event</p>
                                          </div>
                                          <div
                                            onClick={() =>
                                              deleteEvent(
                                                weekDateEvents[index][
                                                  index2 + 2
                                                ].uid
                                              )
                                            }
                                            className="option flexItems"
                                          >
                                            <p>Delete Event</p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="event complete">
                                      <div className="eventContent flexItems">
                                        <p className="eventName">
                                          {
                                            weekDateEvents[index][index2 + 2]
                                              .eventName
                                          }
                                        </p>
                                        <p className="eventDetails">
                                          {
                                            weekDateEvents[index][index2 + 2]
                                              .eventDetails
                                          }
                                        </p>
                                      </div>
                                      <div className="eventFooter flexItems">
                                        <p className="completed">
                                          -- Completed --
                                        </p>
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
                    {weekDateEvents[index][0] == undefined ? (
                      <div className="eventLine flexSetup noGap flexItems">
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
        ) : (
          <div style={{ display: "none" }}></div>
        )}
      </div>
    </div>
  );
}

export default TimeTableDisplay;
