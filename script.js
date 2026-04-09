const inputContainer = document.getElementById("inputContainer");
const inputTemplate = document.getElementById("inputCardTemplate");
const addCardBtn = document.getElementById("addCardBtn");
const codeTypeSelect = document.getElementById("codeType");

const shipmentForm = document.getElementById("shipmentForm");
const shipmentTableBody = document.getElementById("shipmentTableBody");
const verifyShipmentId = document.getElementById("verifyShipmentId");
const verifyForm = document.getElementById("verifyForm");
const generateOtpBtn = document.getElementById("generateOtpBtn");
const otpPreview = document.getElementById("otpPreview");
const deliveryLog = document.getElementById("deliveryLog");

const STORAGE_KEY = "ecolab_shipments_v2";
let activeOtp = "";
let shipments = loadShipments();

function loadShipments() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function persistShipments() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shipments));
}

function addInputCard() {
  const node = inputTemplate.content.cloneNode(true);
  const card = node.querySelector(".input-card");
  const input = node.querySelector(".code-input");
  const output = node.querySelector(".output");
  const modeButtons = [...node.querySelectorAll(".mode-btn")];

  let mode = "BC";

  function renderOutput() {
    const value = input.value.trim();
    output.innerHTML = "";
    if (!value) return;

    if (mode === "QR" || codeTypeSelect.value === "QR") {
      const qrHolder = document.createElement("div");
      output.appendChild(qrHolder);
      new QRCode(qrHolder, {
        text: value,
        width: 90,
        height: 90
      });
      return;
    }

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    output.appendChild(svg);
    try {
      JsBarcode(svg, value, {
        format: codeTypeSelect.value,
        lineColor: "#111827",
        width: 1.6,
        height: 56,
        displayValue: true,
        fontSize: 13,
        margin: 4
      });
    } catch {
      output.textContent = "Invalid input for selected barcode format";
    }
  }

  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      modeButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      mode = btn.dataset.mode;
      renderOutput();
    });
  });

  input.addEventListener("input", renderOutput);
  codeTypeSelect.addEventListener("change", renderOutput);

  inputContainer.appendChild(card);
}

function renderShipments() {
  shipmentTableBody.innerHTML = "";
  verifyShipmentId.innerHTML = '<option value="">Select shipment</option>';
  deliveryLog.innerHTML = "";

  shipments.forEach((shipment) => {
    const row = document.createElement("tr");
    const statusClass =
      shipment.status === "Verified Delivered" ? "verified" : "created";

    row.innerHTML = `
      <td>${shipment.id}</td>
      <td>${shipment.customer}</td>
      <td><span class="status ${statusClass}">${shipment.status}</span></td>
      <td>${shipment.address}</td>
    `;
    shipmentTableBody.appendChild(row);

    const option = document.createElement("option");
    option.value = shipment.id;
    option.textContent = `${shipment.id} - ${shipment.customer}`;
    verifyShipmentId.appendChild(option);

    if (shipment.verification) {
      const item = document.createElement("div");
      item.className = "log-item";
      item.innerHTML = `
        <strong>${shipment.id}</strong> verified by ${shipment.verification.receiver}<br />
        OTP: ${shipment.verification.otp} | Geo: ${shipment.verification.geo}<br />
        Signature: ${shipment.verification.signature}<br />
        Time: ${shipment.verification.time}
      `;
      deliveryLog.appendChild(item);
    }
  });
}

shipmentForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("shipmentId").value.trim();
  const customer = document.getElementById("customerName").value.trim();
  const address = document.getElementById("address").value.trim();

  if (!id || !customer || !address) return;
  if (shipments.some((s) => s.id === id)) {
    alert("Shipment ID already exists.");
    return;
  }

  shipments.unshift({
    id,
    customer,
    address,
    status: "Created",
    verification: null
  });
  persistShipments();
  renderShipments();
  shipmentForm.reset();
});

generateOtpBtn.addEventListener("click", () => {
  activeOtp = String(Math.floor(100000 + Math.random() * 900000));
  otpPreview.textContent = `OTP: ${activeOtp}`;
});

verifyForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const shipmentId = verifyShipmentId.value;
  const receiver = document.getElementById("receiverName").value.trim();
  const otp = document.getElementById("receiverOtp").value.trim();
  const geo = document.getElementById("geoTag").value.trim();
  const signature = document.getElementById("signatureText").value.trim();

  if (!activeOtp) {
    alert("Please generate OTP first.");
    return;
  }
  if (otp !== activeOtp) {
    alert("OTP does not match.");
    return;
  }

  const shipment = shipments.find((s) => s.id === shipmentId);
  if (!shipment) {
    alert("Please select a valid shipment.");
    return;
  }

  shipment.status = "Verified Delivered";
  shipment.verification = {
    receiver,
    otp,
    geo,
    signature,
    time: new Date().toLocaleString()
  };

  activeOtp = "";
  otpPreview.textContent = "OTP: ------";
  verifyForm.reset();
  persistShipments();
  renderShipments();
});

addCardBtn.addEventListener("click", addInputCard);

for (let i = 0; i < 6; i += 1) addInputCard();
renderShipments();
