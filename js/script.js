import {
  TOKEN_NAME,
  BASE_URL,
  getValues,
  log,
  Notification,
  trace,
  $,
  $$,
  fromEntries,
  setFormValues
} from "./base.js";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: "Bearer " + getToken(),
    "Content-Type": "application/json"
  }
});

// Expenses List
const handleError = (text = "The Error") => err => {
  log(err, "Error");
  notification.make({ text, type: "danger" });
};

const getExpenses = async () => {
  const { data } = await api.get("/items");
  return data.data;
};

const renderExpenses = expenses => {
  const holder = $("[role=expenses-list]");

  holder.innerHTML = "";
  if (expenses.length > 0)
    expenses.forEach(expense => {
      holder.append(expense.render());
    });
  else {
    holder.innerHTML = `<tr >
      <td colspan="4" class="text-center font-italic">Seems, like you haven't spent any money yet.</td>
    </tr>`;
  }
};

const createExpenseForUser = async (props, user_id = 0) => {
  if (!user_id) throw Error("user_id property required");
  const { data } = await api.post("/items", { ...props, user_id });
  return expenseFactory(data.data);
};

// setup notifications
const notification = new Notification();
document.body.appendChild(notification.getElement());
window.notification = notification;

const ExpenseList = new Map([]);
const [showPreloader, hidePreloader] = activePreloaders();

const expenseFactory = props => {
  if (!props.id) throw Error("Id property required");

  const url = `/items/${props.id}`;
  const { id, name, description, price } = props;

  return {
    ...props,
    short_description: (/(.{0,15})/g.exec(description)[0] || "") + "...",
    async update() {
      return api.put(url, { ...props });
    },
    render() {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${this.name}</td>
        <td class="blue">${this.price}</td>
        <td>${this.short_description}</td>
        <td><img role="edit" src="assets/images/mdi_edit.png"></td>
        <td><img role="delete" src="assets/images/vector.png"></td>            
      `;
      tr.addEventListener("click", evt => {
        if (evt.target === tr.querySelector("[role=edit]")) {
          const event = new CustomEvent("show-edit-form", {
            detail: { props },
            bubbles: true
          });
          tr.dispatchEvent(event);
        } else if (evt.target === tr.querySelector("[role=delete]")) {
          this.delete();
        }
      });
      return tr;
    },
    delete() {
      api
        .delete(url)
        .then(() => {
          ExpenseList.delete(id);
          renderExpenses([...ExpenseList.values()]);
          notification.make({ text: "Expense Deleted", type: "success" });
        })
        .catch(handleError("Error deleting"));
    }
  };
};

function activeForms() {
  const forms = [
    {
      formElement: $('[role="add-form"]'),
      fields: ["name", "description", "price"],
      handle(fieldValueObject) {
        showPreloader("add-form");
        createExpenseForUser(fieldValueObject, getUser().id)
          .then(newExpense => {
            ExpenseList.set(newExpense.id, newExpense);
            renderExpenses([...ExpenseList.values()]);
            this.formElement.reset();
            notification.make({ text: "Expense added", type: "success" });
          })
          .catch(
            handleError("Can't add an Expense at the moment. Try again later")
          )
          .finally(() => hidePreloader("add-form"));
      }
    },
    {
      formElement: $('[role="edit-form"]'),
      fields: ["name", "description", "price", "id"],
      handle(fieldValueObject) {
        const event = new CustomEvent("update-item", {
          bubbles: true,
          detail: fieldValueObject
        });
        this.formElement.dispatchEvent(event);
      }
    }
  ];

  forms.forEach(entry => {
    entry.formElement.addEventListener("submit", evt => {
      evt.preventDefault();
      evt.stopPropagation();
      evt.stopImmediatePropagation();

      const fieldValueMap = getValues(entry.formElement, entry.fields);
      entry.handle(fromEntries(fieldValueMap));
    });
  });

  // reset button
  let resetBtn = document.getElementById("btnReset");
  resetBtn.addEventListener("click", () => {
    $('[role="add-form"]').reset();
  });
}

//SHOW ADD NEW EXPENSE SECTION
function activeTableActions() {
  const show = el => (el.hidden = false);
  const hide = el => (el.hidden = true);
  const toggle = el => (el.hidden ? show(el) : hide(el));

  return [show, hide, toggle];
}

// on page load
window.addEventListener("load", async () => {
  activeForms();
  const forms = [$("#show-expense-tbl"), $("#edit-form")];
  const addButton = $("#new-expenses");
  const [show, hide, toggle] = activeTableActions();
  const showAddForm = () => {
    show(forms[0]);
    hide(forms[1]);
  };
  const showUpdateForm = () => {
    show(forms[1]);
    hide(forms[0]);
  };

  addButton.addEventListener("click", () => {
    hide(forms[1])
    toggle(forms[0]) 
  });

  // get expenses

  const expenses = await getExpenses();
  hidePreloader("table");
  expenses.map(expenseFactory).map(e => ExpenseList.set(e.id, e));
  renderExpenses([...ExpenseList.values()]);

  document.addEventListener("show-edit-form", ({ detail: { props } }) => {
    const current = ExpenseList.get(props.id);
    const form = $("[role=edit-form]");
    showUpdateForm();

    if (current)
      setFormValues(form, [
        { id: current.id },
        { name: current.name },
        { description: current.description },
        { price: current.price }
      ]);
  });

  document.addEventListener("update-item", ({ detail }) => {
    showPreloader("update-form");
    const expense = expenseFactory(detail);
    expense
      .update()
      .then(a => {
        CustomEvents.fire('getCalculations')
        ExpenseList.set(parseInt(expense.id), expense);
        renderExpenses([...ExpenseList.values()]);
        forms.forEach(hide);
        notification.make({ text: "Expense updated", type: "success" });
      })
      .catch(handleError("Error Updating"))
      .finally(() => hidePreloader("update-form"));
  });

});

// get calculations
document.addEventListener("getCalculations", () => {
  api.get("/items/info").then(({ data }) => {
    for (const [period, value] of Object.entries(data)) {
      const element = $(`[data-${period}]`);
      if (element) element.innerText = value;
    }
  });
});

function activePreloaders() {
  const trigger = cond => value => {
    const preloaders = Array.from($$(".preloader"));
    const match = preloaders.find(
      e => e.getAttribute("data-preloader") === value
    );
    if (match) match.hidden = cond;
  };

  return [trigger(false), trigger(true)];
}

window.addEventListener("load", () => {
  verifyAuth();
  // logout
  $("[role=logout]").addEventListener("click", logout);
});

const eventNames = ['getCalculations'];
const pairEvents = eventName => [eventName, new CustomEvent(eventName, { bubbles: true })];
const CustomEvents = { 
  get events() {
    return R.fromPairs(R.map(pairEvents, eventNames))
  },
  fire(name) {
    document.body.dispatchEvent(CustomEvents.events[name]);
  } 
}

CustomEvents.fire('getCalculations');

function logout() {
  localStorage.removeItem(TOKEN_NAME);
  window.location.replace("/login.html");
}
function getToken() {
  return auth("access_token");
}

function getUser() {
  return auth("user");
}

function auth(prop) {
  try {
    return JSON.parse(localStorage.getItem(TOKEN_NAME))[prop];
  } catch (x) {
    return false;
  }
}

function verifyAuth() {
  if (!getToken()) {
    window.location.replace("/login.html?token=false");
  }
}

setInterval(verifyAuth, 2000);
