
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


const requestID = new URLSearchParams(window.location.search).get('requestID');

async function getServicerRequests() {
    const response = await fetch(`/get-servicer-requests-detail/${requestID}`);
    const data = await response.json();
    // return data;
    console.log(data.data);
    populateData(data.data)

    if (response.status === 500) {
        createNotification('Error getting requests', 'error');
    }
    if(data.data[0].GeoLocation !== null){
        initMap(JSON.parse(data.data[0].GeoLocation))
    }
}
getServicerRequests()

function populateData(data) {
    const date = document.getElementById('date');
    date.value = data[0].Date;
    const fname = document.getElementById('fname');
    fname.value = data[0].First_Name;
    const lname = document.getElementById('lname');
    lname.value = data[0].Last_Name;
    const email = document.getElementById('email');
    email.value = data[0].Email;
    const phone = document.getElementById('phone');
    phone.value = data[0].Phone;
    const customerLocation = document.getElementById('customerLocation');
    customerLocation.value = data[0].Customer_Location || 'N/A';
    const serviceLocation = document.getElementById('serviceLocation');
    serviceLocation.value = data[0].LocationOfService;
    const service = document.getElementById('service');
    service.value = data[0].Purpose;
    const pickup = document.getElementById('pickup');
    pickup.value = data[0].Pickup;
    const status = document.getElementById('status');
    status.value = data[0].Status;
    const description = document.getElementById('description');
    description.value = data[0].Description;
}


function initMap(myLatlng={lat: -1.283736488774029, lng: 36.8207174882673}) {
    // Initialize the map
    console.log(myLatlng);
    map = new google.maps.Map(document.getElementById('map'), {
        center: myLatlng,
        zoom: 20
    });

    var marker = new google.maps.Marker({
        position: myLatlng,
        title:"Hello World!"
    });

    marker.setMap(map);
    //get marker position and store in hidden input
    google.maps.event.addListener(marker, 'dragend', function (evt) {
        // document.getElementById("latInput").value = evt.latLng.lat();
        // document.getElementById("lngInput").value = evt.latLng.lng();
        userlocation.lat = evt.latLng.lat();
        userlocation.lng = evt.latLng.lng();
    });
    // gotoCurrentLocation()
}
