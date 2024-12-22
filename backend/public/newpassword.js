document.getElementById('form').addEventListener('submit', handleSubmit);

console.log("In password reset handler");

function handleSubmit(e) {
    e.preventDefault();

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
        document.getElementById("mydiv").innerText = 'Invalid or missing reset token.';
        return;
    }

    const p1 = document.getElementById('p1').value;
    const p2 = document.getElementById('p2').value;

    if (p1 !== p2) {
        document.getElementById("mydiv").innerText = "Passwords do not match!";
        return;
    }

    if (p1.length < 8) {
        document.getElementById("mydiv").innerText = 'Password must be at least 8 characters long.';
        return;
    }

    if (!/[!@#$%^&*]/.test(p1)) {
        document.getElementById("mydiv").innerText = 'Password must include at least one special character (!@#$%^&*).';
        return;
    }

    axios.post(`http://localhost:5000/password/resetpassword/${token}`, { password: p1 }, {
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        if (response.status === 200) {
            alert('Password reset successful');
            window.location.href = `${window.location.origin}/login.html`;
        } else {
            document.getElementById("mydiv").innerText = response.data.message || 'An unexpected error occurred';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        if (error.response && error.response.data) {
            document.getElementById("mydiv").innerText = error.response.data.message || 'An error occurred while resetting the password';
        } else {
            document.getElementById("mydiv").innerText = 'An unexpected error occurred. Please try again.';
        }
    });
}
