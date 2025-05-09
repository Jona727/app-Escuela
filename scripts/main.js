const userInput = document.getElementById("user");
const passInput = document.getElementById("pass");
const submitButton = document.querySelector("button");
const resultContainer = document.getElementById("loginResultContainer");


submitButton.addEventListener("click", (evento) => {
 handleLoginFetch(); // Llama a tu función handleUser
});


userInput.addEventListener("click", () => {
    resultContainer.textContent = "";
});

function handleLoginFetch() {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");


    var raw = JSON.stringify(
        {
    username: userInput.value,
    password: passInput.value,
});


var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
};

fetch("http://localhost:5500/users/loginUser", requestOptions)
.then((respond) => respond.json())
.then((dataObject) => loginProcess(dataObject))
.catch((error) => console.log("error", error));
}

function loginProcess(dao) {
    console.log(dao);
    if (dao) {
        localStorage.setItem
        (
            "userData",
            JSON.stringify({ firstName: dao.firstName, lastName: dao.lastName })
        );
        window.location.href = "dashboard.html";
    } else resultContainer.textContent = "Usuario y/o password incorrecto";
}
