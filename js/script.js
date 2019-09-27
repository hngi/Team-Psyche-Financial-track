import { TOKEN_NAME, BASE_URL, getValues, log, Notification, trace, $, $$, setFormValues } from "./base.js";

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
      tr.addEventListener(
        "click",
        evt => {
          if (evt.target === tr.querySelector("[role=edit]")) {
            const event = new CustomEvent('item-update', {  
              detail: { props }, 
              bubbles: true 
            });
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

function activeForms() {
  const forms = [
    {
      formElement: $('[role="add-form"]'),
      fields: ["name", "description", "price"],
      handle(fieldValueObject) {
        createExpenseForUser(fieldValueObject, 1)
          .then(newExpense => {
            ExpenseList.set(newExpense.id, newExpense);
            renderExpenses([...ExpenseList.values()]);
            this.formElement.reset();
            notification.make({ text: "Expense added", type: "success" });
          })
          .catch(
            handleError("Can't add an Expense at the moment. Try again later")
          );
      }
    },
    {
      formElement: $('[role="edit-form"]'),
      fields: ["name", "description", "price", "id"],
      handle(fieldValueObject) {
        const event = new CustomEvent('update-item', { bubbles: true, detail: fieldValueObject });
        this.formElement.dispatchEvent(event);
      }
    }
  ];

  forms.forEach((entry) => {
    entry.formElement.addEventListener('submit', (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      evt.stopImmediatePropagation();

      const fieldValueMap = getValues(entry.formElement, entry.fields)
      entry.handle(Object.fromEntries(fieldValueMap));
    })
  })

  // reset button
  let resetBtn = document.getElementById("btnReset");
  resetBtn.addEventListener('click', () => {
    $('[role="add-form"]').reset();
  });
}

  //SHOW ADD NEW EXPENSE SECTION
function activeTableActions() {
  const show = (el) => el.hidden = false
  const hide = (el) => el.hidden = true
  const toggle = (el) => el.hidden ? show(el) : hide(el);

  return [show, hide, toggle];
}

// on page load
window.addEventListener("load", async () => {
  activeForms();
  const forms = [$("#show-expense-tbl"), $("#edit-form")];
  const addButton = $('#new-expenses');
  const [show, hide, toggle] = activeTableActions();
  const showAddForm = () => { 
    show(forms[0]);
    hide(forms[1])
  }
  const showUpdateForm = () => {
    show(forms[1]);
    hide(forms[0])
  }

  addButton.addEventListener('click', () => toggle(forms[0]));

  // get expenses
  const expenses = await getExpenses()
  expenses.map(expenseFactory).map(e => ExpenseList.set(e.id, e));
  renderExpenses([...ExpenseList.values()]);

  document.addEventListener('item-update', ({ detail: { props }}) => {
    const current = ExpenseList.get(props.id)
    const form = $('[role=edit-form]');
    showUpdateForm();

    setFormValues(form, [
      { id: current.id },
      { name: current.name },
      { description: current.description },
      { price: current.price },
    ])
  })

  document.addEventListener('update-item', ({ detail }) => {
    const expense = expenseFactory(detail);
    expense.update().then(a => {
        ExpenseList.set(parseInt(expense.id), expense);
        renderExpenses([...ExpenseList.values()]);
        hide(forms[1])
        notification.make({ text: 'Expense updated', type: 'success' });
      }).catch(handleError("Error Updating"));
  })
});


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
