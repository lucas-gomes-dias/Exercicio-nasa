const form = document.getElementById("apod-form");
const input = document.getElementById("birthdate");
const statusBox = document.getElementById("status");
const resultBox = document.getElementById("result");

const titleEl = document.getElementById("apod-title");
const dateEl = document.getElementById("apod-date");
const imgEl = document.getElementById("apod-image");
const videoContainer = document.getElementById("apod-video");
const videoFrame = document.getElementById("apod-video-frame");
const explanationEl = document.getElementById("apod-explanation");
const copyrightEl = document.getElementById("apod-copyright");
const hdLinkEl = document.getElementById("apod-hd-link");

const API_BASE_URL = "http://localhost:8000";

// Limites de data (APOD a partir de 1995-06-16 até hoje)
if (input) {
  input.min = "1995-06-16";
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  input.max = `${yyyy}-${mm}-${dd}`;
}

function setStatus(message, isError = false) {
  if (!message) {
    statusBox.classList.add("hidden");
    statusBox.textContent = "";
    statusBox.classList.remove("error");
    return;
  }

  statusBox.classList.remove("hidden");
  statusBox.textContent = message;
  statusBox.classList.toggle("error", isError);
}

async function fetchApod(date) {
  const response = await fetch(`${API_BASE_URL}/api/apod?date=${encodeURIComponent(date)}`);
  if (!response.ok) {
    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new Error("Erro desconhecido ao buscar dados na API.");
    }
    const msg = payload.error || "Não foi possível obter os dados da NASA.";
    throw new Error(msg);
  }
  return response.json();
}

function renderResult(data) {
  resultBox.classList.remove("hidden");

  titleEl.textContent = data.title || "Imagem do dia";
  dateEl.textContent = data.date ? `Registrado em ${data.date}` : "";
  explanationEl.textContent = data.explanation || "";

  if (data.media_type === "video") {
    imgEl.classList.add("hidden");
    videoContainer.classList.remove("hidden");
    videoFrame.src = data.url || "";
  } else {
    videoContainer.classList.add("hidden");
    videoFrame.src = "";
    imgEl.classList.remove("hidden");
    imgEl.src = data.url || "";
  }

  if (data.hdurl) {
    hdLinkEl.classList.remove("hidden");
    hdLinkEl.href = data.hdurl;
  } else {
    hdLinkEl.classList.add("hidden");
    hdLinkEl.removeAttribute("href");
  }

  if (data.copyright) {
    copyrightEl.textContent = `Créditos: ${data.copyright}`;
  } else {
    copyrightEl.textContent = "";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const date = input.value;

  if (!date) {
    setStatus("Por favor, selecione uma data válida.", true);
    return;
  }

  setStatus("Buscando a sua foto cósmica de aniversário...");
  resultBox.classList.add("hidden");

  const button = form.querySelector("button[type='submit']");
  button.disabled = true;

  try {
    const data = await fetchApod(date);
    renderResult(data);
    setStatus("");
  } catch (error) {
    console.error(error);
    setStatus(error.message, true);
  } finally {
    button.disabled = false;
  }
});

