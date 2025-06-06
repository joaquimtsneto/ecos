
// Admin password logic
const ADMIN_HASH = "abcdef0123456789abcdef0123456789:88e5312480112959a8156b9b35294a59183279c04db2f1a1b9780fb4925907ff"; // "isaias403"
const PBKDF2_ITER = 100000;
const PBKDF2_HASH = "SHA-256";

function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
  return bytes.buffer;
}
function bufferToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes).map(b => b.toString(16).padStart(2,"0")).join("");
}
async function deriveKeyFromPassword(password, saltHex) {
  const salt = hexToBuffer(saltHex);
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveBits"]
  );
  const derivedBits = await window.crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt, iterations: PBKDF2_ITER, hash: PBKDF2_HASH },
    keyMaterial, 256
  );
  return bufferToHex(derivedBits);
}

// Toggle theme
const btnTheme = document.getElementById("btn-toggle-theme");
const themeIcon = btnTheme.querySelector("span");
btnTheme.addEventListener("click", () => {
  const isDark = document.body.classList.contains("theme-dark");
  if (isDark) {
    document.body.classList.replace("theme-dark","theme-light");
    themeIcon.className = "icon-moon";
    localStorage.setItem("theme","light");
  } else {
    document.body.classList.replace("theme-light","theme-dark");
    themeIcon.className = "icon-sun";
    localStorage.setItem("theme","dark");
  }
});
function applyTheme() {
  const saved = localStorage.getItem("theme") || "light";
  if (saved==="dark") {
    document.body.classList.replace("theme-light","theme-dark");
    themeIcon.className = "icon-sun";
  }
}
applyTheme();

// Font size change
const fontSelector = document.getElementById("font-size-selector");
fontSelector.addEventListener("change", () => {
  document.body.classList.remove("font-small","font-medium","font-large","font-xlarge");
  document.body.classList.add("font-"+fontSelector.value);
  localStorage.setItem("fontSize", fontSelector.value);
});
function applyFontSize() {
  const size = localStorage.getItem("fontSize") || "medium";
  document.body.classList.add("font-"+size);
  fontSelector.value = size;
}
applyFontSize();

// Admin modal logic
const adminModal = document.getElementById("admin-modal");
document.getElementById("btn-open-admin").addEventListener("click", () => {
  adminModal.classList.remove("hidden");
});
document.getElementById("btn-admin-cancel").addEventListener("click", () => {
  adminModal.classList.add("hidden");
});
document.getElementById("btn-admin-login").addEventListener("click", async () => {
  const pwd = document.getElementById("admin-password").value;
  const [saltHex, hashHex] = ADMIN_HASH.split(":");
  const derived = await deriveKeyFromPassword(pwd, saltHex);
  if (derived === hashHex) {
    alert("Login bem-sucedido!");
    adminModal.classList.add("hidden");
  } else {
    document.getElementById("login-error").classList.remove("hidden");
  }
});
