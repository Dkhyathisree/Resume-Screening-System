/* ---------- TAB SWITCH ---------- */

function showTab(id, btn) {
  // hide all panels
  document.querySelectorAll(".panel").forEach(p => {
    p.classList.remove("show");
  });

  // show selected panel
  document.getElementById(id).classList.add("show");

  // update active button
  document.querySelectorAll(".tabbtn").forEach(b => {
    b.classList.remove("active");
  });

  if (btn) btn.classList.add("active");
}


/* ---------- UPLOAD ---------- */

async function upload() {
  try {
    const file = document.getElementById("file").files[0];
    const name = document.getElementById("studentName").value;

    if (!file) return alert("Choose file");
    if (!name) return alert("Enter name");

    const fd = new FormData();
    fd.append("resume", file);
    fd.append("name", name);

    const res = await fetch("/upload", {
      method: "POST",
      body: fd
    });

    document.getElementById("status").innerText = await res.text();

  } catch (e) {
    alert("Upload failed");
  }
}


/* ---------- RENDER RESULTS ---------- */

function render(list) {
  const box = document.getElementById("results");
  box.innerHTML = "";

  if (!list || list.length === 0) {
    box.innerHTML = "<p>No results</p>";
    return;
  }

  list.forEach(r => {

    const scoreHtml = (typeof r.score === "number")
      ? `<b>Score:</b> <span class="score">${(r.score * 100).toFixed(1)}%</span><br>`
      : "";

    const skillsHtml = r.skills
      ? `<b>Skills:</b> ${r.skills}<br>`
      : "";

    const pdfBtn = r.filename
      ? `<a href="/files/${r.filename}" target="_blank">
           <button>View PDF</button>
         </a>`
      : "";
    const emailHtml = r.email ? `<b>Email:</b> ${r.email}<br>` : "";
    const phoneHtml = r.phone ? `<b>Phone:</b> ${r.phone}<br>` : "";
    const summaryHtml = r.summary ? `<b>Summary:</b> ${r.summary}<br>` : "";

    box.innerHTML += `
      <div class="resume">
        <b>Name:</b> ${r.name || "Student"}<br>
        ${skillsHtml}
        ${scoreHtml}
        ${emailHtml}
        ${phoneHtml}
        ${summaryHtml}
        ${pdfBtn}
        <button onclick="deleteResume(${r.id})">Delete</button>
        <button onclick="shortlist(${r.id})">Shortlist</button>
  
        </div>
    `;
  });
}


/* ---------- SHOW ALL ---------- */

async function loadAll() {
  try {
    const r = await fetch("/list");
    const data = await r.json();
    render(data);
  } catch (e) {
    console.error(e);
    alert("Load failed");
  }
}


/* ---------- SEARCH ---------- */

async function search() {
  try {
    const q = document.getElementById("searchBox").value || "";

    const r = await fetch("/search?q=" + encodeURIComponent(q));
    const data = await r.json();

    render(data);
  } catch (e) {
    console.error(e);
    alert("Search failed");
  }
}


/* ---------- RANK ---------- */

async function rate() {
  try {
    const jobDesc = document.getElementById("jobDesc").value;

    if (!jobDesc) {
      alert("Enter job description");
      return;
    }

    const r = await fetch("/rate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ jobDesc })
    });

    const data = await r.json();
    render(data);

  } catch (e) {
    console.error(e);
    alert("Ranking failed");
  }
}

async function deleteResume(id) {
  if (!confirm("Delete this resume?")) return;

  await fetch("/delete/" + id, {
    method: "DELETE"
  });

  loadAll(); // refresh list
}


async function shortlist(id) {
  await fetch("/shortlist/" + id, {
    method: "POST"
  });

  alert("Added to shortlist");
}

function exportCSV() {
  window.open("/shortlist/export");
}

async function viewShortlist() {
  const r = await fetch("/shortlist");
  const data = await r.json();
  render(data);
}
