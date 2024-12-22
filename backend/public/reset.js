
const forgetPasswordForm = document.getElementById("forget-password-form");
const errorMsg = document.getElementById('error');

forgetPasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;

    try {
        const response = await axios.post(`http://localhost:3000/password/forgotpassword`, { email });

        window.location.href = "/login.html";
    }  catch(error){
        console.log('Error adding user: ',error);
    }

});
