const submitLogin = (e) => {
    e.preventDefault();
    const signInEmail = document.getElementById('signInEmail').value;
    const signInPass = document.getElementById('signInPass').value;
    console.log(signInEmail, signInPass);
   }

const signInBtn = document.getElementById('signInBtn');
signInBtn.addEventListener('click', submitLogin);

