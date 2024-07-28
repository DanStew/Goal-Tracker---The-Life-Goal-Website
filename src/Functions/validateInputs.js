//Function to validate the user's inputs, to ensure they are correct
export const validateInputs = (inputsObj) => {
    //Only validating some of the options if the type is full
    if (inputsObj.firstName != undefined){
        //Making the regex test, to ensure all letters are alphabetical
        let regex = /^[a-zA-Z]+$/;
      
        //Ensure firstname is valid
        if (inputsObj.firstName == "") {
          return "First Name must not be empty";
        }
        if (!regex.test(inputsObj.firstName)) {
          return "All characters in First Name must be alphabetical";
        }
      
        //Ensure lastname is valid
        if (inputsObj.lastName == "") {
          return "Last Name must not be empty";
        }
        if (!regex.test(inputsObj.lastName)) {
          return "All characters in Last Name must be alphabetical";
        }
      
        //Ensuring that a profile picture is present
        if (inputsObj.profilePic == null) {
          return "You must have enterred a profile picture";
        }
    }

  //Ensuring email is valid
  if (inputsObj.email == "") {
    return "Email input must not be empty";
  }

  //Ensuring that an @ occurs in the email
  if (inputsObj.email.indexOf("@") == -1) {
    return "All email inputs must have an @";
  }
  //Ensuring that the email input ends in .com
  if (inputsObj.email.indexOf(".com") == -1) {
    return "All emails must end with a .com";
  }

  //Ensuring that the password is valid
  if (inputsObj.password == "" || inputsObj.password.length < 6) {
    return "Password inputs must be of atleast length 6";
  }

  //If all validations have passed, return nothing
  return "";
};
