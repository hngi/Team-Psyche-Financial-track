const submitLogin = (e) => {
    e.preventDefault();
    const BASE_URL = "http://cbf3b88a.ngrok.io";
    const signInEmail = document.getElementById('signInEmail').value;
    const signInPass = document.getElementById('signInPass').value;
    // console.log(signInEmail, signInPass);
    
    // validate the input fields

    const loginEndpoint = `${BASE_URL}/api/v1/login`;
    fetch(loginEndpoint, {
        method : 'POST',
        Headers : {
            'Content-Type' : 'application/json',
            'X-Request-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
            email : signInEmail,
            password : signInPass
        })
    })
    .then(res => { res.json() })
    .then((data) => { console.log(data) })
    .catch((err) => { console.error(err) })
}

const signInBtn = document.getElementById('signInBtn');
signInBtn.addEventListener('click', submitLogin);

