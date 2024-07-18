//This file includes the functions used to increase and decrease a date by x number (usually 7 or less)
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
  10: 31,
  11: 30,
  12: 31,
};

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
export const increaseDate = (date, nmbDays) => {
  //Breaking down the date into a date object
  let dateObj = getDateObj(date);
  //Increasing the day by 1
  dateObj.day =
    +dateObj.day + nmbDays < 10
      ? "0" + (+dateObj.day + nmbDays)
      : +dateObj.day + nmbDays;
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
    let dayDifference = +dateObj.day - maximumDay;
    //Incrementing the month by 1, resetting the days
    dateObj.month =
      +dateObj.month + 1 < 10 ? "0" + (+dateObj.month + 1) : +dateObj.month + 1;
    dateObj.day = dayDifference < 10 ? "0" + dayDifference : dayDifference;
    //Seeing if the months are now incorrect, as you have gone too far
    if (+dateObj.month > 12) {
      //Incrementing the year by 1, resetting the months
      dateObj.year = +dateObj.year + 1;
      dateObj.month = "01";
    }
  }
  //Formatting the dateObj into a new string, and returning it
  let dateString = dateObj.year + "-" + dateObj.month + "-" + dateObj.day;
  return dateString;
};

//Function to decrease the current date by 1 day
export const decreaseDate = (date, nmbDays) => {
  //Breaking down the date into a date object
  let dateObj = getDateObj(date);
  //Seeing if the day now has gone to 0
  if (+dateObj.day - nmbDays < 1) {
    //Setting this value to be the negative number that we have, it will be overwritten later
    dateObj.day = +dateObj.day - nmbDays;
    //Decrease the month by 1, resetting the days
    dateObj.month =
      +dateObj.month - 1 < 10 ? "0" + (+dateObj.month - 1) : +dateObj.month - 1;
    //Resetting the days
    //Checking to see if the month is now February
    if (dateObj.month == "02") {
      //Seeing if the year is a leap year or not
      if (
        (0 == +dateObj.year % 4 && 0 != +dateObj.year % 100) ||
        0 == +dateObj.year % 400
      ) {
        //As leap year, set days to 29
        dateObj.day = daysInMonths[dateObj.month][1] + +dateObj.day;
      } else {
        //Not a leap year, so 28
        dateObj.day = daysInMonths[dateObj.month][0] + +dateObj.day;
      }
    }
    //Otherwise, set to the maximum day in the month
    else {
      //Ensuring that a year change doesn't need to occur
      if (dateObj.month != "00") {
        dateObj.day = daysInMonths[dateObj.month] + +dateObj.day;
      }
    }
    //Seeing if the months are now incorrect, as you have gone too far
    if (+dateObj.month < 1) {
      //Decrease the year by 1, resetting the months
      dateObj.year = +dateObj.year - 1;
      dateObj.month = "12";
      dateObj.day = daysInMonths[dateObj.month] + +dateObj.day;
    }
  } else {
    //Decreasing the day by nmbDays
    dateObj.day =
      +dateObj.day - nmbDays < 10
        ? "0" + (+dateObj.day - nmbDays)
        : +dateObj.day - nmbDays;
  }
  //Formatting the dateObj into a new string, and returning it
  let dateString = dateObj.year + "-" + dateObj.month + "-" + dateObj.day;
  return dateString;
};
