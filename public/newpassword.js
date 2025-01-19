
document.getElementById('form').addEventListener('submit', handleSubmit);

console.log("In password reset handler");

function handleSubmit(e) {
    e.preventDefault();

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    console.log("Reset token from URL:", token);

    if (!token) {
        document.getElementById("mydiv").innerText = 'Invalid or missing reset token.';
        return;
    }

    const p1 = document.getElementById('p1').value;
    const p2 = document.getElementById('p2').value;

    console.log("Password 1:", p1);
    console.log("Password 2:", p2);

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

    axios.post(`http://184.73.149.88:5000/password/resetpassword/${token}`, { password: p1 }, {
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        console.log("API Response:", response);
        if (response.status === 200) {
            alert('Your password has been reset successfully. Redirecting to login...');
            window.location.href = `${window.location.origin}/login.html`;
        } else {
            document.getElementById("mydiv").innerText = response.data.message || 'An unexpected error occurred';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById("mydiv").innerText = error.response?.data?.message || 'Something went wrong. Please try again.';
    });
}
