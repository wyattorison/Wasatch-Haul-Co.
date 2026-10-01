// ---------- Load estimator ----------
const LOADS = [
  { key: "single",        price: 99,  fill: 12,  desc: "A single item: a couch, washer, or water heater." },
  { key: "quarter",       price: 199, fill: 25,  desc: "A quarter trailer: a small room or a few pieces." },
  { key: "half",          price: 329, fill: 50,  desc: "Half a trailer: a garage corner or a basement room." },
  { key: "three_quarter", price: 449, fill: 75,  desc: "Three-quarters of a trailer: most of a garage." },
  { key: "full",          price: 549, fill: 100, desc: "A full trailer: several rooms or a small estate." },
];

const slider = document.getElementById("loadSlider");
const fill = document.getElementById("trailerFill");
const priceEl = document.getElementById("loadPrice");
const descEl = document.getElementById("loadDesc");
const loadSelect = document.getElementById("loadSelect");

function updateEstimator() {
  const load = LOADS[Number(slider.value)];
  fill.style.width = load.fill + "%";
  priceEl.textContent = "$" + load.price;
  descEl.textContent = load.desc;
  loadSelect.value = load.key; // carry the choice into the quote form
}
slider.addEventListener("input", updateEstimator);
updateEstimator();

// "Book a cleanout" in the agent section pre-selects "Real estate agent"
document.querySelectorAll('[data-role="agent"]').forEach((a) =>
  a.addEventListener("click", () => {
    document.querySelector('select[name="customer_type"]').value = "agent";
  })
);

// ---------- Quote form ----------
const form = document.getElementById("quoteForm");
const errorEl = document.getElementById("formError");
const submitBtn = document.getElementById("submitBtn");
const successEl = document.getElementById("formSuccess");
const fallbackEl = document.getElementById("formFallback");
const fallbackText = document.getElementById("fallbackText");
const copyBtn = document.getElementById("copyBtn");

function readForm() {
  const d = Object.fromEntries(new FormData(form).entries());
  return {
    name: (d.name || "").trim(),
    phone: (d.phone || "").trim(),
    zip: (d.zip || "").trim() || null,
    customer_type: d.customer_type,
    load_size: d.load_size,
    needed_by: d.needed_by || null,
    details: (d.details || "").trim() || null,
    website: d.website || "",
  };
}

function buildTextMessage(q) {
  const loadLabel = loadSelect.querySelector(`option[value="${q.load_size}"]`)?.textContent || q.load_size;
  const typeLabel = form.customer_type.selectedOptions[0].textContent;
  return [
    "Quote request – Wasatch Haul Co.",
    `Name: ${q.name}`,
    `Phone: ${q.phone}`,
    q.zip ? `Zip: ${q.zip}` : null,
    `I'm a: ${typeLabel}`,
    `Load: ${loadLabel}`,
    q.needed_by ? `Needed by: ${q.needed_by}` : null,
    q.details ? `What's going: ${q.details}` : null,
  ].filter(Boolean).join("\n");
}

function showFallback(q) {
  fallbackText.textContent = buildTextMessage(q);
  fallbackEl.hidden = false;
}

async function saveToSupabase(q) {
  const url = window.SUPABASE_URL;
  const key = window.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase not configured yet");

  const { website, ...row } = q; // don't send the spam-trap field
  const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/quote_requests`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`Supabase error ${res.status}: ${await res.text()}`);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const q = readForm();

  form.name.classList.toggle("invalid", !q.name);
  form.phone.classList.toggle("invalid", !q.phone);
  if (!q.name || !q.phone) { errorEl.hidden = false; return; }
  errorEl.hidden = true;

  if (q.website) { successEl.hidden = false; return; } // bot filled the hidden field

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";
  fallbackEl.hidden = true;

  try {
    await saveToSupabase(q);
    successEl.hidden = false;
    submitBtn.hidden = true;
    form.querySelectorAll("input, select, textarea").forEach((el) => (el.disabled = true));
  } catch (err) {
    console.warn(err);
    showFallback(q);
    submitBtn.disabled = false;
    submitBtn.textContent = "Send quote request";
  }
});

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(fallbackText.textContent);
    copyBtn.textContent = "Copied!";
  } catch {
    copyBtn.textContent = "Select and copy the text above";
  }
});
