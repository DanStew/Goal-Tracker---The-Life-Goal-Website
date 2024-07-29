export const getCurrentDate = (type) => {
  //Getting the current date and putting it into an object
  let currentDateObj = getCurrentDateObj();
  return getDateString(currentDateObj,"full")
};

//Creating a date string, using an inputted date object
export const getDateString = (dateObj, type) => {
  //Returning a formatted string back to the function
  if (type == "full") {
    return (
      dateObj.year +
      "/" +
      dateObj.month +
      "/" +
      dateObj.day +
      " " +
      dateObj.hours +
      ":" +
      dateObj.minutes
    );
  } else {
    return (
      dateObj.year +
      "/" +
      dateObj.month +
      "/" +
      dateObj.day
    );
  }
};

//Function which makes the current date into a object, with all its parts
export const getCurrentDateObj = () => {
  let currentDate = new Date();
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
  return currentDateObj;
};

//Creating a date obj, using the date enterred by a user
export const createDateObj = (date) => {
  let dateArr = date.split("-");
  let dateObj = {
    year: dateArr[0],
    month: dateArr[1],
    day: dateArr[2],
  };
  return dateObj;
};

//Function to check whether two dates are consecutive or not
//Function which checks whether two dates are consecutive or not
export const checkConsecutive = (date1, date2) => {
  function createDateObject(date) {
    let dateArr = date.split("/");
    let dateObj = {
      day: dateArr[2],
      month: dateArr[1],
      year: dateArr[0],
    };
    return dateObj;
  }

  //Making the dates into objects, split into days, months and years
  date1 = createDateObject(date1);
  date2 = createDateObject(date2);

  //Checking the different situations where you have consecutive days
  //Situation 1 : Days are consectuive
  if (
    date1.year == date2.year &&
    date1.month == date2.month &&
    Math.abs(date1.day - date2.day) == 1
  ) {
    return true;
  }

  //Situation 2 : Month changes
  if (date1.year == date2.year && Math.abs(date1.month - date2.month) == 1) {
    //Finding out which date has the increased month
    let increasedDate = date1.month > date2.month ? date1 : date2;
    if (increasedDate.day == 1) {
      return true;
    }
  }

  //Situation 3 : Year changes
  if (Math.abs(date1.year - date2.year) == 1) {
    //Finding out which date has the higher year
    let increasedDate = date1.year > date2.year ? date1 : date2;
    if (increasedDate.month == 1 && increasedDate.day == 1) {
      return true;
    }
  }

  //If date fails all three conditions, return false
  return false;
};
