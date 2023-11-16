export default class FormUtil {
  formValidator(formData, minPasswordLength = 1, rePass = null) {
    if (Object.keys(formData).length === 0) {
      throw new Error("Form must be filled!");
    }

    let emailPattern =
    /^(?!\.)[-\w\!\#\.\(\)\$\%\&\'\*\+\/\=\?\"\'\^\[\]\`\{\|\}\~]+?(?<!\.)@(?!\.)[-\w\!\#\.\(\)\$\%\&\'\*\+\/\=\?\"\'\^\[\]\`\{\|\}\~]+?\.[-\w\!\#\.\(\)\$\%\&\'\*\+\/\=\?\"\'\^\[\]\`\{\|\}\~]+(?<!\.)$/g;


    for (let key in formData) {
      if (formData[key] === "") {
        throw new Error(`${key} must be filled!`);
      }
      if (key === "email") {
        if (!emailPattern.test(formData[key])) {
          throw new Error("Please enter a valid email");
        }
        emailPattern.lastIndex = 0;
      } else if (
        key === "password" &&
        formData[key].length < Math.max(1, minPasswordLength)
      ) {
        throw new Error(
          `Password must be at least ${minPasswordLength} characters long!`
        );
      }
    }
    if (rePass && formData[rePass] !== formData.password) {
      throw new Error("Both passwords must match!");
    }
    return true;
  }

  valueConverter (value) {
    if (typeof value === 'string') {
      value = value.toLowerCase();
      if (['true', 'false'].includes(value)) {
        return value === 'true' ? true : false;
      } else if (!isNaN(Number(value))) {
        return Number(value)
      } else {
        return value;
      }
    }
    return null;
  }
}
