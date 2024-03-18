
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


async function getCarwashData() {
    const response = await fetch('/get-serivcer-data');
    const data = await response.json();
    // return data;
    console.log(data.data);

    // console.log(JSON.parse(data.data[0]['Services']))
    populateDate(data.data)
}

getCarwashData()


function populateDate(userInfo) {
    const frame = document.getElementById('frame')
    const getLocation = JSON.parse(userInfo[0]['geoLocation'])
    const compLocation = userInfo[0]['CompanyLocation']
    console.log(compLocation)
    console.log(getLocation)
    frame.setAttribute('src', `https://www.google.com/maps/embed/v1/place?key=AIzaSyBQiPQVE829TRTQxv27e6iBS6m-_fAJJq8&q=${compLocation}`)

    const username = document.getElementById('username')
    const companyName = document.getElementById('companyName')
    const email = document.getElementById('email')
    const phone = document.getElementById('phone')
    const companyLocation = document.getElementById('companyLocation')

    username.value = userInfo[0]['UserName']
    companyName.value = userInfo[0]['CompanyName']
    email.value = userInfo[0]['Email']
    phone.value = userInfo[0]['Phone']
    companyLocation.value = userInfo[0]['CompanyLocation']

    let output = ""
    if (userInfo[0].Car_Service) {
        output += " - Car Service\n"
    }
    if (userInfo[0].Car_Painting) {
        output += " - Car Painting\n"
    }
    if (userInfo[0].Car_Repair) {
        output += " - Car Repair\n"
    }
    if (userInfo[0].Car_Wash) {
        output += " - Car Wash\n"
    }
    if (userInfo[0].Car_Design) {
        output += " - Car Design\n"
    }
    services.value = output
    // userServices.forEach(service => {
    //     output += " - " + service + "\n"
    // });
    services.value = output
}