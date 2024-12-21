

document.getElementById('form').addEventListener('submit', handleSubmit);

console.log("in new pass");

function handleSubmit(e) {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    e.preventDefault();

    const p1 = document.getElementById('p1').value;
    const p2 = document.getElementById('p2').value;

    if (p1 !== p2) {
        document.getElementById("mydiv").innerText = "Passwords do not match!";
        return;
    }

    axios.post(`http://184.73.149.88:5000/password/resetpassword/${token}`, { password: p1 })
        .then(response => {
            if (response.status === 200) {
                alert(response.data.message);
                const formHtml = `
                <form action="${response.data.resetFormAction}" method="get">
                    <label for="newpassword">Enter New Password</label>
                    <input name="newpassword" type="password" required>
                    <button>Reset Password</button>
                </form>
            `;
            document.getElementById("reset-form-container").innerHTML = formHtml;
                window.location.href = 'http://184.73.149.88:5000/login.html';
            } else {
                document.getElementById("mydiv").innerText = response.data.message || 'An unexpected error occurred';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById("mydiv").innerText = 'An error occurred while resetting the password';
        });
}
