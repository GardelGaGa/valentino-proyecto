const STORAGE_KEY = "focuslab_notion_blocks";

// guardar bloques
function saveBlocks() {
    const blocks = [];

    document.querySelectorAll(".notion-block").forEach(el => {
        blocks.push(el.innerText);
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
}

// cargar bloques
function loadBlocks() {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!data) return;

    document.querySelectorAll(".notion-block").forEach((el, i) => {
        if (data[i]) {
            el.innerText = data[i];
        }
    });
}

// auto save al escribir
document.addEventListener("input", (e) => {
    if (e.target.classList.contains("notion-block")) {
        saveBlocks();
    }
});

// init
window.addEventListener("load", () => {
    loadBlocks();
});