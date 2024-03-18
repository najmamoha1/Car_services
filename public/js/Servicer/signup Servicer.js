
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


let map;
let autocomplete;

function initMap() {
    // Initialize the autocomplete for the input field
    autocomplete = new google.maps.places.Autocomplete(
        document.getElementById('companyLocation'),
        { types: ['geocode'] }
    );
}


document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData) {
        data[key] = value;
    }
    data['geoLocation'] = autocomplete.getPlace().geometry.location.toJSON();
    console.log(data);
    fetch('/signup-servicer', {
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
                createNotification('Error creating account', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            createNotification('Error creating account', 'error');
        });
});