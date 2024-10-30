const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
const fullnameRegex = /^[a-zA-Z\s]*$/;

module.exports.validateInputEmail = (email) => {
  return emailRegex.test(email);
};

module.exports.validateInputUsername = (username) => {
  return usernameRegex.test(username);
};

module.exports.validateInputPassword = (password) => {
  return passwordRegex.test(password);
};

module.exports.validateInputFullname = (fullname) => {
  return fullnameRegex.test(fullname);
};
