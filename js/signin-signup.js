import { BASE_URL, TOKEN_NAME, trace, log } from "./base.js";

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

  const onSuccess = res => {
    if (res.message === "Unauthorized" || res.errors) {
      errBox.show("Invalid email/password provided", 5000);
      throw Error(res.message);
    }
    if (res.access_token) {
      localStorage.setItem(TOKEN_NAME, JSON.stringify(res));
      window.location = "/dashboard.html";
    }

    return res;
  };

  const onFail = trace("An error occured");

  const forms = [
    {
      selector: "#signInForm",
      endpoint: BASE_URL + "/login",
      fields: ["email", "password"],
      handlers: [onSuccess, onFail]
    },
    {
      selector: "#signUpForm",
      endpoint: BASE_URL + "/register",
      fields: ["name", "email", "password", "password_confirmation"],
      handlers: [
        res => {
          if (res.errors) if (res.errors.email) msgBox.show(res.errors.email);

          if (res.message === "Successfully created user!") {
            msgBox.show("Account created successfully");
            slider.moveLeft();
          }
        },
        onFail
      ]
    }
  ];

  const prepareForm = (form, endpoint, fields, handlers) => evt => {
    evt.preventDefault();
    const [onSuccess, onFail] = handlers;
    const getInput = (name, form) => {
      return form ? form.querySelector(`[name=${name}]`) : { value: "" };
    };
    const fieldsObj = new Map(
      fields.map(e => {
        return [e, getInput(e, form).value];
      })
    );
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest"
      },
      body: JSON.stringify(Object.fromEntries(fieldsObj))
    };

    fetch(endpoint, options)
      .then(res => res.json())
      .then(onSuccess)
      .catch(onFail);
  };

  forms.map(({ selector, handlers, endpoint, fields }) => {
    const form = document.querySelector(selector);
    if (form) {
      const submitForm = prepareForm(form, endpoint, fields, handlers);
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
