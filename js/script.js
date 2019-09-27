import { TOKEN_NAME, BASE_URL, getValues, log, Notification, trace, $, $$ } from "./base.js";

//SHOW ADD NEW EXPENSE SECTION
let show = document.getElementById("new-expenses");
let showTable = document.getElementById("show-expense-tbl");

showTable.hidden = true;

show.onclick = function() {
  showTable.hidden = false;
};

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: "Bearer " + getToken(),
    "Content-Type": "application/json"
  }
});

// Expenses List
const handleError = (text = "The Error") => err => {
  log(err, "Error")
  notification.make({ text, type: 'danger' });
}

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
window.notification = notification

const ExpenseList = new Map([]);

window.ExpenseList = ExpenseList

const expenseFactory = props => {
  if (!props.id) throw Error("Id property required");

  const url = `/items/${props.id}`;
  const { id, name, description, price } = props;

  return {
    ...props,
    short_description: (/(.{0,15})/g.exec(description)[0] || "") + "...",
    update() {
      api
        .patch(url, { ...props })
        .then(a => {
          ExpenseList.set(id, props)
          renderExpenses([...ExpenseList.values()])
        })
        .catch(handleError("Error Updating"));
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
      tr.addEventListener(
        "click",
        evt => {
          if (evt.target === tr.querySelector("[role=edit]")) {
            const event = new Event('item-update', {  id, bubbles: true });
            tr.dispatchEvent(event);

          } else if (evt.target === tr.querySelector("[role=delete]")) {
            this.delete();
          }
        }
      );
      return tr;
    },
    delete() {
      api
        .delete(url)
        .then(() => {
          notification.make({ text: 'Expense Deleted', type: 'success' })
          ExpenseList.delete(id)
          renderExpenses([ ...ExpenseList.values() ]);
        })
        .catch(handleError("Error deleting"));
    }
  };
};

function activeAddForm() {
  const forms = [
    { 
      selector: '[role="add-form"]', 
      endpoint: BASE_URL + '/items',
      fields: ['name', 'description', 'price'],
    }
  ];

  forms.forEach((entry) => {
    const form = $(entry.selector);

    form.addEventListener('submit', (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      evt.stopImmediatePropagation();

      const fieldValueMap = getValues(form, entry.fields)
      createExpenseForUser(Object.fromEntries(fieldValueMap), 1)
        .then((newExpense) => {
          ExpenseList.set(newExpense.id, newExpense);
          renderExpenses([...ExpenseList.values()]);
          form.reset();
          notification.make({ text: 'Expense added', type: 'success' });
        }).catch(handleError("Can't add an Expense at the moment. Try again later"));
    })
  })
}

// on page load
window.addEventListener("load", async () => {
  activeAddForm();

  // get expenses
  const expenses = await getExpenses()
  expenses.map(expenseFactory).map(e => ExpenseList.set(e.id, e));
  renderExpenses([...ExpenseList.values()]);
});

window.addEventListener('item-update', (evt) => {
  log(evt);
})

// RESET BUTTON
let resetBtn = document.getElementById("btnReset");
resetBtn.onclick = function() {
  document.getElementById("expenditure").placeholder = "Lunch";
  (document.getElementById("price").placeholder = 5), 3556.0;
};

window.addEventListener("load", () => {
  verifyAuth();
  // logout
  $("[role=logout]").addEventListener("click", logout);
});

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
    // window.location = "/login.html?token=false";
  }
}

// setInterval(verifyAuth, 2000);
