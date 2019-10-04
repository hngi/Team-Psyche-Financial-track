import { BASE_URL, TOKEN_NAME, Notification, fromEntries, trace, log, getValues, $ } from "./base.js";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
  }
});

// const api = axios.create({
//   baseURL: "http://2f4aa47e.ngrok.io/api",
//   headers: {
//     "Content-Type": "application/json",
//     "X-Requested-With": "XMLHttpRequest"
//   }
// });

const notif = new Notification()
document.body.append(notif.notification);
const errBox = (text, duration = 4000) => notif.make({ text, duration, type: 'danger'})
const msgBox = (text, duration = 4000) => notif.make({ text, duration, type: 'success'})

class Slider {
  constructor() {
    this.signIn = document.getElementById("kc-signIn");
    this.signUp = document.getElementById("kc-signUp");
    this.slider = document.getElementById("mainCont");
    this.mainContent = document.querySelector(".main");
    this.btn = document.getElementById("kc-btn");
    this.chevron = this.btn.querySelector("svg");
    this.span = this.btn.querySelector("span");
  }

  adjustHeight(name) {
    const theHeight = this[name].clientHeight + "px";
    this.slider.style.height = theHeight;
    this.mainContent.style.height = theHeight;
  }

  moveLeft() {
    this.adjustHeight("signIn");
    setTimeout(() => {
      this.span.innerText = "sign up";
      this.chevron.style.transform = "rotate(90deg)";
      this.slider.classList.toggle("move-right");
    }, 300);
  }

  moveRight() {
    this.span.innerText = "sign in";
    this.chevron.style.transform = "rotate(270deg)";
    this.slider.classList.toggle("move-right");
    setTimeout(() => {
      this.adjustHeight("signUp");
    }, 300);
  }

  toggle() {
    if (this.slider.classList.contains("move-right")) {
      this.moveLeft();
    } else {
      this.moveRight();
    }
  }
}

window.addEventListener("load", () => {
  const slider = new Slider();
  slider.adjustHeight("signIn");
  slider.btn.addEventListener("click", () => {
    slider.toggle();
  });

  const onFail = trace("An error occured");

  const forms = [
    {
      formEl: $("#signInForm"),
      endpoint: "/login",
      fields: ["email", "password"],
      handler: promise => {
        promise
          .then(({ data }) => {
            log(data, "The response data");
            if (data.access_token) {
              localStorage.setItem(TOKEN_NAME, JSON.stringify(data));
              window.location = "/dashboard.html";
            }
          })
          .catch(err => {
            const { data, status } = err.response || { data: '', status: 0 };

            if (status === 401) {
              errBox("Invalid email/password provided", 5000);
              throw Error(data.message);
              return
            }
            
            errBox("An unexpected error occured!, please try again later");
          });
      }
    },
    {
      formEl: $("#signUpForm"),
      endpoint: "/register",
      fields: ["name", "email", "password", "password_confirmation"],
      handler(promise) {
        promise.then(({ data: res }) => {
          if (res.message === "Successfully created user!") {
            msgBox("Account created successfully");
            slider.moveLeft();
          }
        }).catch((error) => {
          isResponseError(error, ({ message, errors }) => {
            if (errors) {
              let count = 0
              const findMessages = ([name, messages]) => {
                R.map((message) => {                   
                  if (/(already been taken)/g.test(message)) {
                    count += 1;
                    errBox('Email already taken')
                    return 
                  }
                }, messages)
              }
              R.map(findMessages, R.toPairs(errors))
              counts == 0 && errBox(message);
              return
            }
            errBox('Something went wrong, Please try again');
          })
          console.error('Unexpected failure!');
        })
      }
    }
  ];

  const prepareForm = (form, endpoint, fields, handlePromise) => evt => {
    evt.preventDefault();
    const fieldsPair = getValues(form, fields);
    const fieldsObject = fromEntries(fieldsPair);
    const body = JSON.stringify(fieldsObject)

    handlePromise(api.post(endpoint, body));
  };

  forms.map((form) => {
    const { formEl, endpoint, fields } = form
    if (formEl) {
      const submitForm = prepareForm(formEl, endpoint, fields, form.handler.bind(form));
      formEl.addEventListener("submit", submitForm);
    }
  });
});

function isResponseError (err, closure) {
  if (err.response) closure(err.response.data);
}
/* -----------------------------------INPUT VALIDATION FOR PASSWORD--------------------------------------------------- */
const mainPassword = document.getElementById("password");
const confirmPassword = document.getElementById("confirm-password");
const submitFormBtn = document.getElementById("submit-form");
const errorBoxUi = document.querySelector(".error-box-x");

const passwordMatch = () => {
  if (mainPassword.value === confirmPassword.value) {
    submitFormBtn.disabled = false;
  } else {
    submitFormBtn.disabled = true;
  }
};

document.querySelectorAll(".x-confirm").forEach(confam => {
  confam.addEventListener("keyup", passwordMatch);
});
