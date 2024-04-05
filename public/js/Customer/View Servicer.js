
let map;
let autocomplete;
var marker;
let userlocation = {}
function initMap() {
    // Initialize the map
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 0, lng: 0 },
        zoom: 20
    });

    // Initialize the autocomplete for the input field
    autocomplete = new google.maps.places.Autocomplete(
        document.getElementById('currentLocation'),
        { types: ['geocode'] }
    );
    // Place a draggable marker on the map
    marker = new google.maps.Marker({
        // position: myLatlng,
        map: map,
        draggable: true,
        title: "Drag me!"
    });

    //get marker position and store in hidden input
    google.maps.event.addListener(marker, 'dragend', function (evt) {
        // document.getElementById("latInput").value = evt.latLng.lat();
        // document.getElementById("lngInput").value = evt.latLng.lng();
        userlocation.lat = evt.latLng.lat();
        userlocation.lng = evt.latLng.lng();
    });
    gotoCurrentLocation()
}


function getCurrentLocationFunction() {
    console.log('Clicked')
    // Get the place details from the autocomplete object
    const place = autocomplete.getPlace();

    // Center the map on the selected location
    map.setCenter(place.geometry.location);
    map.setZoom(15);
    marker.setPosition(place.geometry.location);

    // You can also access other details from the place object, like:
    // place.name, place.formatted_address, place.geometry.location.lat(), place.geometry.location.lng()
}

function gotoCurrentLocation(){
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                marker.setPosition(pos);

                userlocation.lat = pos.lat;
                userlocation.lng = pos["lng"];

                map.setCenter(pos);
                console.log(pos)
            },
            () => {
                handleLocationError(true, infoWindow, map.getCenter());
            },
        );
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
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


let today = new Date().toISOString().slice(0, 10);
document.getElementById('date').value = today;
document.getElementById('date').min = today;
const purpose = document.getElementById("purpose")

purpose.addEventListener("change", function () {
    var select = this;
    var otherInput = document.getElementById("other-input");

    if (select.value === "Other") {
        otherInput.style.display = "inline-block";
    } else {
        otherInput.style.display = "none";
    }
});

document.getElementById('location').addEventListener('change', ()=>{
    const location = document.getElementById('location').value;
    console.log(location)
    if(location === "Other" || location === "Home"){
        document.getElementById('locationField').style.display = "block";
        // document.getElementById('currentLocation').style.display = "block";
        // document.getElementById('map').style.display = "block";
        // document.getElementById('getCurrentLocation').style.display = "block";
    }
    else{
        document.getElementById('locationField').style.display = "none";
        // document.getElementById('currentLocation').style.display = "none";
        // document.getElementById('map').style.display = "none";
        // document.getElementById('getCurrentLocation').style.display = "none";
    }
})


async function getAllServicers() {
    const response = await fetch('/get-all-servicers');
    const data = await response.json();
    console.log(data.data);
    populateData(data.data);    
}

getAllServicers();

function populateData(servicers){
    const table = document.getElementById('table');
    servicers.forEach((servicer)=>{
        const tr = document.createElement('tr');

        let services = ""
        if(servicer.Car_Service == 1){
            services += "Car Service, ";
        }
        if(servicer.Car_Wash == 1){
            services += "Car Wash, ";
        }
        if(servicer.Car_Repair == 1){
            services += "Car Repair, ";
        }
        if(servicer.Car_Painting == 1){
            services += "Car Painting, ";
        }
        if(servicer.Car_Design == 1){
            services += "Car Design, ";
        }
        
        const request = document.createElement('button');
        request.innerHTML = "Request";
        
        request.setAttribute('data-toggle', 'modal')
        request.setAttribute('data-target', '#requestCar')

        request.addEventListener('click', ()=>{
            const comp = document.getElementById('comp')
            comp.innerText = servicer.CompanyName
            const servicer_name = document.getElementById('servicer-name')
            servicer_name.innerText = servicer.UserName
            document.getElementById('submitRequestFrom').setAttribute('data-id', servicer.Email)
            purpose.innerHTML = "<option value = ''> Please select an option </option>"


            if(servicer.Car_Service == 1){
                const option = document.createElement('option')
                option.value = "Car Service"
                option.innerHTML = "Car Service"
                purpose.appendChild(option)
            }
            if(servicer.Car_Wash == 1){
                const option = document.createElement('option')
                option.value = "Car Wash"
                option.innerHTML = "Car Wash"
                purpose.appendChild(option)
            }
            if(servicer.Car_Repair == 1){
                const option = document.createElement('option')
                option.value = "Car Repair"
                option.innerHTML = "Car Repair"
                purpose.appendChild(option)
            }
            if(servicer.Car_Painting == 1){
                const option = document.createElement('option')
                option.value = "Car Painting"
                option.innerHTML = "Car Painting"
                purpose.appendChild(option)
            }
            if(servicer.Car_Design == 1){
                const option = document.createElement('option')
                option.value = "Car Design"
                option.innerHTML = "Car Design"
                purpose.appendChild(option)
            }


        })

        const username  = document.createElement('td');
        username.innerHTML = servicer.UserName;

        const companyname  = document.createElement('td');
        companyname.innerHTML = servicer.CompanyName;

        const companylocation  = document.createElement('td');
        companylocation.innerHTML = servicer.CompanyLocation;

        const email  = document.createElement('td');
        email.innerHTML = servicer.Email;

        const phone  = document.createElement('td');
        phone.innerHTML = servicer.Phone;

        const servicetype  = document.createElement('td');
        servicetype.innerHTML = services;

        tr.appendChild(username);
        tr.appendChild(companyname);
        tr.appendChild(companylocation);
        tr.appendChild(email);
        tr.appendChild(phone);
        tr.appendChild(servicetype);
        tr.appendChild(request);
        table.appendChild(tr);
    })
}

document.getElementById('submitRequestFrom').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const date = document.getElementById('date').value;
    const location = document.getElementById('location').value;
    const currentLocation = document.getElementById('currentLocation').value;
    const purpose = document.getElementById('purpose').value;
    const description = document.getElementById('description').value;
    const pickup = document.getElementById('pickup').value;
    const email = e.target.getAttribute('data-id');
    const servicer_name = document.getElementById('servicer-name').innerText;
    // console.log(marker.position)
    const position = {
        lat: marker.position.lat(),
        lng: marker.position.lng()
    };
    console.log(position)
    var data;
    if(location == "In House"){
        data ={
            date,
            location,
            purpose,
            description,
            pickup,
            email,
            servicer_name
        }
    }
    else{
        data = {
            date,
            location,
            currentLocation,
            purpose,
            description,
            pickup,
            position,
            email,
            servicer_name
        }
    }
    console.log(data)
    const response = await fetch('/request-car', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    const res = await response.json();
    console.log(res);
    if(response.status === 500){
        createNotification(res.message,'error')
    }
    else{
        window.location.reload()
        createNotification(res.message,'success')
    }
})