//This files includes some of the functions involved in allowing the selection sort to happen
//The selection sort is the sort that I chose in order to do all sorting in the application

//This file includes some generic functions, such as findMinIndex() and swapElements() but some unique functions
export const sortByLastUpdated = (tempArr) => {
  //Performing an selection sort on the new array, to sort all the elements
  for (let k = 0; k < tempArr.length; k++) {
    //Finding the index with the lowest value
    let minIndex = findMinIndex(tempArr, k, "lastUpdated");
    //Swapping the current and smallest index
    tempArr = swapElements(tempArr, k, minIndex);
  }
  return tempArr;
};

export const sortByDeadlineDate = (tempArr) => {
  //Performing an selection sort on the new array, to sort all the elements
  for (let k = 0; k < tempArr.length; k++) {
    //Finding the index with the lowest value
    let minIndex = findMinDeadline(tempArr, k);

    //Swapping the current and smallest index
    tempArr = swapElements(tempArr, k, minIndex);
  }
  return tempArr;
};

export const sortEntriesByDate = (tempArr) => {
  //Performing an selection sort on the new array, to sort all the elements
  for (let k = 0; k < tempArr.length; k++) {
    //Finding the index with the lowest value
    let minIndex = findMinIndex(tempArr, k, "date");
    //Swapping the current and smallest index
    tempArr = swapElements(tempArr, k, minIndex);
  }
  return tempArr;
};

//Function to swap two elements at different indexes
const swapElements = (arr, i, j) => {
  let temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
  return arr;
};

//Function to find the minimum date
const findMinIndex = (arr, start, sorter) => {
  let minValue = sorter == "date" ? arr[start].Date : arr[start].LastUpdated;
  let minIndex = start;
  while (start < arr.length) {
    if (
      (sorter == "date" && arr[start].Date > minValue) ||
      (sorter == "lastUpdated" && arr[start].LastUpdated > minValue)
    ) {
      minValue = sorter == "date" ? arr[start].Date : arr[start].LastUpdated;
      minIndex = start;
    }
    start = start + 1;
  }
  return minIndex;
};

//Function to find the minimum date
const findMinDeadline = (arr, start) => {
  let minValue = arr[start].DeadlineDate;
  if (minValue == "") {
    minValue = "9999/12/30";
  }
  let minIndex = start;
  while (start < arr.length) {
    let currentDeadlineDate = arr[start].DeadlineDate;
    if (currentDeadlineDate == "") {
      currentDeadlineDate = "9999/12/30";
    }
    if (currentDeadlineDate < minValue) {
      minValue = arr[start].DeadlineDate;
      minIndex = start;
    }
    start = start + 1;
  }
  return minIndex;
};
