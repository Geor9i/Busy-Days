export class FormUtil {
  formValidator(formData, minPasswordLength = 1, rePass = undefined) {
    let isFilled = true;
    let emailPattern =
      /^[-\w]+@[\w\.]+[^\-\.\,\s\t\n\\\=\@\^\&\%\£\"\!\'\#\~\?\>\<\/\¬\`\;\:]$/g;
    for (let key in formData) {
      if (formData[key] === "") {
        isFilled = false;
        throw new Error("All fields must be filled!");
        break;
      }
      if (key === "email") {
        if (!emailPattern.test(formData[key])) {
          throw new Error("Please enter a valid email");
          isFilled = false;
        }
        emailPattern.lastIndex = 0;
      } else if (
        key === "password" &&
        formData[key].length < Math.max(1, minPasswordLength)
      ) {
        throw new Error(
          `Password must be at least ${minPasswordLength} characters long!`
        );
        isFilled = false;
      }
    }
    if (rePass && formData[rePass] !== formData.password) {
      isFilled = false;
      throw new Error("Both passwords must match!");
    }
    return isFilled;
  }
}
