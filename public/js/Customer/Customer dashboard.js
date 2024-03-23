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

$("#menu-toggle").click(function (e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});
$("#menu-toggle-2").click(function (e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled-2");
    $('#menu ul').hide();
});

function initMenu() {
    $('#menu ul').hide();
    $('#menu ul').children('.current').parent().show();
    //$('#menu ul:first').show();
    $('#menu li a').click(
        function () {
            var checkElement = $(this).next();
            if ((checkElement.is('ul')) && (checkElement.is(':visible'))) {
                return false;
            }
            if ((checkElement.is('ul')) && (!checkElement.is(':visible'))) {
                $('#menu ul:visible').slideUp('normal');
                checkElement.slideDown('normal');
                return false;
            }
        }
    );
}
$(document).ready(function () {
    initMenu();
});


async function getCustomerRequests() {
    const response = await fetch('/get-customer-requests');
    const data = await response.json();
    // return data;
    console.log(data.data);

    if (response.status === 500) {
        createNotification('Error getting requests', 'error');
    }


    // console.log(JSON.parse(data.data[0]['Services']))
    populateData(data.data)
}
getCustomerRequests();

function populateData(requests) {
    const table = document.getElementById('table');
    table.innerHTML = "";
    requests.forEach((request) => {
        const row = document.createElement('tr');
        const date = document.createElement('td');
        date.innerText = request.Date;
        const location = document.createElement('td');
        location.innerText = request.LocationOfService;
        const serviceLocation = document.createElement('td');
        serviceLocation.innerText = request.Customer_Location || "N/A";
        const purpose = document.createElement('td');
        purpose.innerText = request.Purpose;
        const description = document.createElement('td');
        description.innerText = request.Description;
        const pickup = document.createElement('td');
        pickup.innerText = request.Pickup;
        const status = document.createElement('td');
        status.innerText = request.Status;
        if (request.Status === "PENDING") {
            status.style.color = 'orange';
        }
        if (request.Status === "ACCEPTED") {
            status.style.color = 'green';
        }
        if (request.Status === "REJECTED" || request.Status === "CANCELLED") {
            status.style.color = 'red';
        }


        const actions = document.createElement('td')


        const moreInfo = document.createElement('button');
        moreInfo.innerText = "More Info";

        moreInfo.onclick = () => {
            console.log("More info request " + request.ID)
            window.location.href = `/customer-dashboard/request-details?requestID=${request.ID}`;
        }


        const cancelButton = document.createElement('button');
        cancelButton.innerText = "Cancel";

        cancelButton.onclick = async () => {

            if (confirm(`Are you sure you want to cancel this request? \nNote that this action cannot be undone.`)) {
                console.log("Cancel request " + request.ID)
                await cancelRequest(request.ID);
            }
            else {
                console.log("Don't cancel request " + request.ID)
                return;
            }
        }

        actions.appendChild(moreInfo);

        if (request.Status === "PENDING") {
            actions.appendChild(cancelButton);

        }

        // row.appendChild(date,location,purpose,description,pickup);
        row.appendChild(date)
        row.appendChild(location)
        row.appendChild(serviceLocation)
        row.appendChild(purpose)
        row.appendChild(description)
        row.appendChild(pickup)
        row.appendChild(status)
        row.appendChild(actions)
        table.appendChild(row);
    });
}

async function cancelRequest(requestID) {
    const response = await fetch('/cancel-request', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requestID })
    });

    const data = await response.json();

    if (response.status === 500) {
        createNotification('Error cancelling request', 'error');
    }
    else {
        createNotification('Request cancelled successfully', 'success');
        getCustomerRequests()
    }
}