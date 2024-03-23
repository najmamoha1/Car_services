
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



async function getServicerRequests() {
    const response = await fetch('/get-servicer-requests');
    const data = await response.json();
    // return data;
    console.log(data.data);

    if (response.status === 500) {
        createNotification('Error getting requests', 'error');
    }


    // console.log(JSON.parse(data.data[0]['Services']))
    populateData(data.data)
}
getServicerRequests();


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


        const rejectButton = document.createElement('button');
        rejectButton.innerText = "Reject";

        rejectButton.onclick = async () => {

            if (confirm(`Are you sure you want to reject this request? \nNote that this action cannot be undone.`)) {
                console.log("Reject request " + request.ID)
                await rejectRequest(request.ID);
            }
            else {
                console.log("Don't reject request " + request.ID)
                return;
            }
        }

        
        const acceptButton = document.createElement('button');
        acceptButton.innerText = "Accept";

        acceptButton.onclick = async () => {
                
                if (confirm(`Are you sure you want to accept this request?`)) {
                    console.log("Accept request " + request.ID)
                    await acceptRequest(request.ID);
                }
                else {
                    console.log("Don't accept request " + request.ID)
                    return;
                }
            }


        actions.appendChild(moreInfo);

        if (request.Status === "PENDING") {
            actions.appendChild(rejectButton);
        }
        
        if (request.Status === "PENDING") {
            actions.appendChild(acceptButton);
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


async function rejectRequest(requestID) {
    const response = await fetch('/reject-request', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requestID })
    });

    const data = await response.json();

    if (response.status === 500) {
        createNotification('Error rejecting request', 'error');
    }
    else {
        createNotification('Request rejected successfully', 'success');
        getServicerRequests()
    }
}

async function acceptRequest(requestID) {
    const response = await fetch('/accept-request', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requestID })
    });

    const data = await response.json();

    if (response.status === 500) {
        createNotification('Error accepting request', 'error');
    }
    else {
        createNotification('Request accepted successfully', 'success');
        getServicerRequests()
    }
}