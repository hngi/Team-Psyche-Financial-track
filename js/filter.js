/* -------------FILTER BY NAME------------------------- */
const searcherByName = (e) => {
    searchInputAmt.value = '';
    let searchValue = e.target.value.toLowerCase();
    const expList = document.querySelectorAll('[role= expenses-list] tr');

    expList.forEach((exp) => {
        const title = exp.firstElementChild.textContent;
           if (title.toLowerCase().indexOf(searchValue) != -1) {
            exp.style.display = 'table-row';
            exp.style.verticalAlign = 'inherit';
           } else {
            exp.style.display = 'none';
           }

        });
}

const searchInputName  = document.getElementById('searchByName');
searchInputName.addEventListener('keyup', searcherByName)

/* ---------------FILTER BY AMOUNT------------------------ */

const searchByAmt = () => {
    searchInputName.value = '';

    let inputAmtValue = document.getElementById('searchbByNum').value;
    const expAmt = document.querySelectorAll('[role = expenses-list] tr');

    expAmt.forEach((amt) => {
        const amtValue = amt.childNodes[3].innerText;
        if (amtValue.indexOf(inputAmtValue) != -1 ) {
            amt.style.display = 'table-row';
            amt.style.verticalAlign = 'inherit';
        } else {
            amt.style.display = 'none';
        }
    })
}

const searchInputAmt = document.getElementById('searchbByNum');
searchInputAmt.addEventListener('keyup', searchByAmt)

/* REST BUTTON */

const reset = () => {
    searchInputName.value = '';
    searchInputAmt.value = '';
    searchByAmt();
}
const resetBtn = document.getElementById('reset');
resetBtn.addEventListener('click', reset);

