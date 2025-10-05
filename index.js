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
const loader = document.getElementById("loader");
const loaderText = document.getElementById("loaderText");
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
            handleFileSelection(file);
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
            handleFileSelection(file);
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
        hideLoading();
        result.textContent = "File ready. Click 'Check The ATS Score !'";
    };
    reader.onerror = function() {
        hideLoading();
        result.textContent = "Error reading file.";
    };
    reader.readAsText(file);
}

async function extractTextFromPdf(file) {
    showLoading("Scanning PDF...");
    const arrayBuffer = await file.arrayBuffer();
    if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
    const pdfjs = window.pdfjsLib || window['pdfjsLib'];
    if (!pdfjs || !pdfjs.getDocument) {
        hideLoading();
        throw new Error("PDF.js failed to load. Please refresh and try again.");
    }
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const strings = content.items.map(function(item) { return item.str; });
        fullText += strings.join(" ") + "\n";
    }
    hideLoading();
    return fullText;
}

async function extractTextFromImage(file) {
    showLoading("Running OCR on image...");
    const { data } = await Tesseract.recognize(file, 'eng');
    hideLoading();
    return data && data.text ? data.text : "";
}

async function handleFileSelection(file) {
    if (!file) return;
    const name = (file.name || "").toLowerCase();
    selectedFileName && (selectedFileName.textContent = file.name);
    result.textContent = "Processing file...";

    try {
        if (name.endsWith('.txt') || name.endsWith('.csv')) {
            showLoading("Reading file...");
            readFileAsText(file);
        } else if (name.endsWith('.pdf')) {
            const text = await extractTextFromPdf(file);
            uploadedTextContent = text;
            result.textContent = "PDF extracted. Ready to analyze.";
        } else if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg')) {
            const text = await extractTextFromImage(file);
            uploadedTextContent = text;
            result.textContent = "Image text extracted via OCR. Ready to analyze.";
        } else {
            uploadedTextContent = "";
            result.textContent = "Unsupported file type. Please upload .txt, .pdf, .png, .jpg/.jpeg, or .csv.";
        }
    } catch (e) {
        uploadedTextContent = "";
        hideLoading();
        result.textContent = "Error processing file: " + (e && e.message ? e.message : e);
        console.error(e);
    }
}

function showLoading(message) {
    if (loader && loader.classList) loader.classList.remove("d");
    if (loaderText) loaderText.textContent = message || "Processing...";
}

function hideLoading() {
    if (loader && loader.classList) loader.classList.add("d");
}


function handleFile() {
    if (!uploadedTextContent || uploadedTextContent.trim() === "") {
        result.textContent = "Please upload a file first (.txt, .pdf, .png/.jpg, or .csv).";
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



    showLoading("Analyzing with AI...");
    fetch(gemini_url, gemini_config)
        .then(function(response) { return response.json(); })
        .then(function(json) {
            hideLoading();
            try {
                if (json.error) {
                    result.textContent = "API Error: " + (json.error.message || JSON.stringify(json.error));
                    console.error("API Error payload:", json);
                    return;
                }
                if (json.candidates && json.candidates.length > 0) {
                    var candidate = json.candidates[0];
                    var parts = (candidate.content && candidate.content.parts) || candidate.parts || [];
                    var textPart = parts.find(function(p){ return typeof p.text === 'string'; });
                    var outputText = textPart ? textPart.text : (candidate.output_text || "");
                    if (!outputText) {
                        result.textContent = "No text returned. Please try again.";
                        console.warn("Unexpected response shape:", json);
                        return;
                    }
                    result.textContent = outputText;
                    console.log(outputText);
                    return;
                }
                result.textContent = "Unexpected response. Please try again later.";
                console.warn("Unexpected response:", json);
            } catch (e) {
                result.textContent = "Failed to parse response.";
                console.error("Parse error:", e, json);
            }
        })
        .catch(function(error) {
            hideLoading();
            result.textContent = "Network/Error: " + error.message;
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