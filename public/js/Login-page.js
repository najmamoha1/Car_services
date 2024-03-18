
async function CustomerLogin() {
    const url = '/login-customer'
    const data = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
    }
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    };
    const response = await fetch(url, options)
    const outcome = await response.json();
    if (response.status === 401) {
        // console.log(outcome.message)
        console.log("Invalid details")
        createNotification(outcome.message, 'error')
    }
    else {
        createNotification(outcome.message + ", redirecting", 'success')
        setTimeout(() => {
            window.location.href = "/customer-dashboard"
        }, 1000)
    }
}

async function ServicerLogin() {
    const url = '/login-servicer'
    const data = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
    }
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    };
    const response = await fetch(url, options)
    const outcome = await response.json();
    if (response.status === 401) {
        createNotification(outcome.message, 'error')
    }
    else {
        createNotification(outcome.message + ", Redirecting ", 'success')
        setTimeout(() => {
            window.location.href = "/servicer-dashboard"
        }, 1000)
    }

}

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

document.querySelector('form').addEventListener('submit',e=>{
    e.preventDefault();
    if (document.getElementById('email').value === "" || document.getElementById('password').value === "" || document.getElementById('type').value === ""){
        console.log("Please fill in all the fields")
        createNotification('Please fill in all the fields','warning')
        return
    }
    // First verify if the  fields are empty or not
    const type = document.getElementById('type').value

    if (type === "Customer"){
        CustomerLogin()
    }
    else if (type === "Servicer"){
        ServicerLogin()
    }
    else {
        console.log("Invalid user type")
        createNotification("Please select a user type",'error')
    }

})
