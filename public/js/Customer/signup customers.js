
// Notifications

const toasts = document.querySelector('#toasts');

const createNotification = (message, type) => {
    console.log(message, type);
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.innerText = message;
    toast.classList.add(type);
    toasts.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
};

document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData) {
        data[key] = value;
    }
    console.log(data);

    if(data.user_password !== data.user_password2) {
        createNotification('Passwords do not match', 'warning');
        return;
    }
    fetch('/signup-customer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.message === 'Success') {
                createNotification('Account created successfully', 'success');
                setTimeout(() => {
                    window.location.href = '/';
                }, 3000);
            }
            else {
                createNotification(data.message, 'warning');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            createNotification(data.message, 'error');
        });
});