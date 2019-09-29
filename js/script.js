import { TOKEN_NAME, BASE_URL, log, trace, $, $$ } from "./base.js";

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

const handleError = (msg = "The Error") => err => console.error(msg, err);
const getExpenses = async () => {
  const { data } = await api.get("/items");
  log(data, "XHR Data");
  return data.data;
};
const renderExpenses = expenses => {
  const holder = $("#expenses-list");
  holder.innerHTML = "";
  expenses.forEach(expense => {
    holder.append(expense.render());
  });
};

const createExpenseForUser = async (props, user_id = 0) => {
  if (!user_id) throw Error("user_id property required");
  const { data } = await api.post("/items", { ...props, user_id });
  return expenseFactory(data.data);
};

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
        .then(a => console.log(a))
        .catch(handleError("Error Updating"));
    },
    render() {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${this.name}</td>
                <td class="blue">${this.price}</td>
                <td>${this.short_description}</td>
                <td role="edit"><img src="assets/images/mdi_edit.png"></td>
                <td role="delete"><img src="assets/images/vector.png"></td>            
            `;
      tr.addEventListener(
        "click",
        evt => {
          if (evt.target === tr.querySelector("[role=edit]")) {
            log("happening");
          } else if (evt.target === tr.querySelector("[role=delete]")) {
            this.delete();
          }
        },
        true
      );
      return tr;
    },
    delete() {
      api
        .delete(url)
        .then(() => {
          console.log("deleting the request");
        })
        .catch(handleError("Error deleting"));
    }
  };
};

var target = document.querySelector("#expenses-list");
// create an observer instance
var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    console.log(mutation.type);
  });
});

observer.observe(target, {
  attributes: true,
  childList: true,
  characterData: true
});

// later, you can stop observing
observer.disconnect();

window.addEventListener("load", async () => {
  const expenses = await getExpenses();
  const ExpensesSet = new Set(expenses.map(expenseFactory));

  renderExpenses([...ExpensesSet.values()]);
  //expenseFactory))
  // createExpenseForUser({
  //     name: 'Testing',
  //     description: 'Nothing much',
  //     price: 300.23
  // }, getUser().id)
  // .then((a) => ExpensesSet.set(a))
  // .catch(handleError("Error creating expenses"));
});
window.expenseFactory = expenseFactory;

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
