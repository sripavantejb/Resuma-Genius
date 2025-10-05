let loginButton = document.getElementById("loginButton");
let loginPage = document.getElementById("login-page-full");
let fullPage = document.getElementById("full-page");
let registerPage = document.getElementById("register-page-full");
let registerNavButton = document.getElementById("registerNavButton");
let goToLogin = document.getElementById("goToLogin");
const upload = document.getElementById("upload-pdf-button");
const result = document.getElementById("result");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navLinks = document.getElementById("navLinks");
const menuIcon = document.querySelector(".menu-icon");
const closeIcon = document.querySelector(".close-icon");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");


if (loginButton) {
    loginButton.onclick = function() {
        fullPage.classList.add("d");
        registerPage.classList.add("d");
        loginPage.classList.remove("d");
    };
}

if (registerNavButton) {
    registerNavButton.onclick = function() {
        fullPage.classList.add("d");
        loginPage.classList.add("d");
        registerPage.classList.remove("d");
    };
}

if (goToLogin) {
    goToLogin.onclick = function(e) {
        e.preventDefault();
        registerNavButton && (registerPage.classList.add("d"));
        loginPage.classList.remove("d");
    };
}


mobileMenuBtn.onclick = function() {
    navLinks.classList.toggle("show");


    if (menuIcon.style.display === "none") {
        menuIcon.style.display = "block";
        closeIcon.style.display = "none";
    } else {
        menuIcon.style.display = "none";
        closeIcon.style.display = "block";
    }
}

const fileInput = document.getElementById("fileinput");
const dropzone = document.getElementById("dropzone");
const selectedFileName = document.getElementById("selectedFileName");
let uploadedTextContent = "";

// Click to browse
if (dropzone) {
    dropzone.addEventListener("click", function() {
        fileInput && fileInput.click();
    });

    // Drag & drop handlers
    ["dragenter", "dragover"].forEach(function(eventName) {
        dropzone.addEventListener(eventName, function(e) {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add("dragover");
        });
    });

    ["dragleave", "drop"].forEach(function(eventName) {
        dropzone.addEventListener(eventName, function(e) {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove("dragover");
        });
    });

    dropzone.addEventListener("drop", function(e) {
        const files = e.dataTransfer && e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            const name = (file.name || "").toLowerCase();
            if (!name.endsWith('.txt')) {
                selectedFileName && (selectedFileName.textContent = `${file.name} (not supported for scoring)`);
                uploadedTextContent = "";
                result.textContent = "Only .txt files can be analyzed for ATS score right now.";
                return;
            }
            readFileAsText(file);
        }
    });
}

// File input change
if (fileInput) {
    fileInput.addEventListener("change", function(e) {
        const target = e.target;
        const files = target && target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const name = (file.name || "").toLowerCase();
            if (!name.endsWith('.txt')) {
                selectedFileName && (selectedFileName.textContent = `${file.name} (not supported for scoring)`);
                uploadedTextContent = "";
                result.textContent = "Only .txt files can be analyzed for ATS score right now.";
                return;
            }
            readFileAsText(file);
        }
    });
}

function readFileAsText(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        uploadedTextContent = (evt.target && evt.target.result) || "";
        if (selectedFileName) {
            selectedFileName.textContent = file.name;
        }
    };
    reader.onerror = function() {
        result.textContent = "Error reading file.";
    };
    reader.readAsText(file);
}


function handleFile() {
    if (!uploadedTextContent || uploadedTextContent.trim() === "") {
        result.textContent = "Please upload a .txt resume file first.";
        return;
    }
    let gemini_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBzG0HUPFWEWm7Dhut8Au-Z7nPX0i1yyOA";
    let gemini_config = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "contents": [{
                "parts": [{
                    "text": uploadedTextContent + " check the ats score and give me the final ats score out of 100 value only"
                }]
            }]
        })
    };



    fetch(gemini_url, gemini_config)
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            let var1 = response.candidates[0];
            let var2 = var1.content.parts[0];
            let geminiText = var2.text;
            result.textContent = geminiText;
            console.log(geminiText);
        })
        .catch(function(error) {
            result.textContent = "Error: " + error.message;
            console.error("API Error:", error);
        });
}

// THEME: load and toggle
function applyTheme(theme) {
    if (theme === "dark") {
        document.documentElement.classList.add("dark");
        if (themeIcon) themeIcon.textContent = "☀️";
    } else {
        document.documentElement.classList.remove("dark");
        if (themeIcon) themeIcon.textContent = "🌙";
    }
}

const savedTheme = localStorage.getItem("theme-preference") || "light";
applyTheme(savedTheme);

if (themeToggle) {
    themeToggle.addEventListener("click", function() {
        const next = document.documentElement.classList.contains("dark") ? "light" : "dark";
        localStorage.setItem("theme-preference", next);
        applyTheme(next);
    });
}