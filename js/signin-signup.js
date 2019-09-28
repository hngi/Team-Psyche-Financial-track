import { BASE_URL, TOKEN_NAME, fromEntries, trace, log, getValues } from "./base.js";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
  }
});

// MsgBox
class MessageBox {
  constructor(element, type = "info") {
    this.box = element;
    this.type = type !== "info" ? "#FF8282" : "#5eccf1";
  }

  show(msg = "", delay = 10000) {
    this.box.textContent = msg;
    this.box.classList.add("misc");
    this.box.style.background = this.type;

    setTimeout(() => {
      this.hide();
    }, delay);
  }

  hide() {
    this.box.classList.remove("misc");
  }
}

const msgBox = new MessageBox(document.getElementById("error-box"));
const errBox = new MessageBox(document.getElementById("error-box"), "error");

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
      selector: "#signInForm",
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
            const { data, status } = err.response;
            if (status === 401) {
              errBox.show("Invalid email/password provided", 5000);
              throw Error(data.message);
            }
          });
      }
    },
    {
      selector: "#signUpForm",
      endpoint: "/register",
      fields: ["name", "email", "password", "password_confirmation"],
      handler: async res => {
        if (res.errors) if (res.errors.email) msgBox.show(res.errors.email);

        if (res.message === "Successfully created user!") {
          msgBox.show("Account created successfully");
          slider.moveLeft();
        }
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

  forms.map(({ selector, handler, endpoint, fields }) => {
    const form = document.querySelector(selector);
    if (form) {
      const submitForm = prepareForm(form, endpoint, fields, handler);
      form.addEventListener("submit", submitForm);
    }
  });
});

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
