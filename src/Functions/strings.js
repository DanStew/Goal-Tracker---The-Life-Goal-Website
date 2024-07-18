  //Function used to correctly format the given input
  export const formatString = (inputString) => {
    //Copying the string without mutating and Making it formatted
    let copyString = "";
    for (let i = 0; i <= inputString.length; i++) {
      if (i == 0) {
        copyString += inputString.charAt(i).toUpperCase();
        continue;
      }
      copyString += inputString.charAt(i).toLowerCase();
    }
    return copyString;
  }