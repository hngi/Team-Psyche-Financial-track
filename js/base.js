// export const BASE_URL = "http://finance-app.test/api/v1";
// export const BASE_URL = "https://psyche-server.herokuapp.com/api/v1";
export const BASE_URL = "https://teamgravity.africa/psyche/api/v1";

export const log = (x, mes = "Log") => {
  console.log(mes, ":", x);
  return x;
};
export const TOKEN_NAME = "app_token";
export const trace = mes => x => log(x, mes);
export const $ = a => document.querySelector(a);
export const $$ = a => document.querySelectorAll(a);


export const setFormValues = (form, fields = []) => {
  fields.map((object) => {
    const [name, value] = Object.entries(object)[0] || [];
    const field = form.querySelector(`[name=${name}]`)
    if (field) 
      field.value = value;
  })
}
// impure function
export const fromEntries = (fieldsPair) => {
  return R.fromPairs([...fieldsPair]);
}

export const getValues = (form, fields = []) => {
  const getInput = (name, form) => {
    const field = form.querySelector(`[name=${name}]`)
    return (form && field) ? field : { value: "" };
  };
  
  return new Map(
    fields.map(e => {
      return [e, getInput(e, form).value];
    })
  );
}
export class Notification {
  constructor() {
    this.notification = this.createNotif();
  }

  getElement() {
    return this.notification;
  }

  changeText(text) {
    this.notification.querySelector("span").innerText = text;
    return this;
  }
  changeType(type) {
    const types = {
      danger: "is-danger",
      success: "is-success",
      warning: "is-warning",
      info: "is-info"
    };
    const keys = Object.keys(types);
    if (keys.includes(type)) {
      const className = types[type];
      const replaced = this.notification.classList[1];
      this.notification.classList.replace(replaced, className);
    }
  }

  make(opts = {}) {
    const { text, type, duration } = { type: 'info', duration: 4000, ...opts }
        
    this.changeText(text);
    this.changeType(type);
    setTimeout(() => {
      this.notification.classList.remove("swipe-left");
    }, duration);
    this.notification.classList.add("swipe-left");
  }

  createNotif() {
    const notif = createElement(
      "div",
      ["notification", "is-info"],
      [
        {
          rel: "js-notification js-notion"
        }
      ]
    );
    const span = createElement("span");
    notif.appendChild(span);

    return notif;
  }
}

function createElement(tag, classes = [], attribs = []) {
  const el = document.createElement(tag);

  classes.forEach(className => el.classList.add(className));
  attribs.forEach(attribute => {
    const key = Object.keys(attribute)[0];
    el.setAttribute(key, attribute[key]);
  });
  return el;
}
    