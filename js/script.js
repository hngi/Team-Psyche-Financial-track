//SHOW ADD NEW EXPENSE SECTION
let show = document.getElementById("new-expenses");
let showTable = document.getElementById("show-expense-tbl");

showTable.hidden = true;

show.onclick = function(){
    showTable.hidden = false;
}



// RESET BUTTON
let resetBtn = document.getElementById("btnReset");
resetBtn.onclick = function(){
    document.getElementById("expenditure").placeholder = 'Lunch';
    document.getElementById('price').placeholder = 5,3556.00;
}
