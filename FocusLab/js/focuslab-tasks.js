// FocusLab - Notion Mode (Frontend logic)

function applyPriorityStyle(card, value) {
    card.classList.remove("high", "mid", "low");

    if (value === "high") card.classList.add("high");
    if (value === "mid") card.classList.add("mid");
    if (value === "low") card.classList.add("low");
}

// editar feedback visual
document.addEventListener("input", function (e) {
    if (e.target.classList.contains("editable")) {
        e.target.style.background = "#fff3cd";

        setTimeout(() => {
            e.target.style.background = "transparent";
        }, 300);
    }
});

// prioridad dinámica
document.addEventListener("change", function (e) {
    if (e.target.classList.contains("priority")) {
        let card = e.target.closest(".notion-card");
        applyPriorityStyle(card, e.target.value);
    }
});

// crear nueva card (solo UI)
document.getElementById("addTask").addEventListener("click", function () {

    let container = document.getElementById("taskContainer");

    let col = document.createElement("div");
    col.className = "col-md-4 mb-4";

    col.innerHTML = `
        <div class="notion-card mid">
            <h6 contenteditable="true" class="editable">Nueva tarea</h6>
            <p contenteditable="true" class="editable text-muted">Descripción...</p>

            <select class="form-control form-control-sm priority">
                <option value="high">Alta</option>
                <option value="mid" selected>Media</option>
                <option value="low">Baja</option>
            </select>
        </div>
    `;

    container.insertBefore(col, document.getElementById("addTask").parentElement);
});