import { app } from "../../scripts/app.js";

const STYLES = `
.rp-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 4px 8px 8px;
    font-family: sans-serif;
}
.rp-rows {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.rp-row {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    border-radius: 4px;
    padding: 0 2px;
    transition: background 0.15s, opacity 0.2s;
}
.rp-row.dragging {
    opacity: 0.4;
}
.rp-row.drag-over {
    background: rgba(100, 150, 255, 0.1);
    box-shadow: 0 -2px 0 0 #5588cc inset;
}
.rp-grip {
    cursor: grab;
    color: #555;
    font-size: 11px;
    flex-shrink: 0;
    user-select: none;
    padding: 0 2px;
    letter-spacing: 1px;
}
.rp-grip:active { cursor: grabbing; }
.rp-toggle {
    width: 26px;
    height: 26px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    color: #fff;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
}
.rp-toggle.on  { background: #2a7a2e; }
.rp-toggle.off { background: #7a2a2a; opacity: 0.7; }
.rp-input {
    width: 60px;
    height: 24px;
    background: #1a1a1a;
    color: #ccc;
    border: 1px solid #444;
    border-radius: 3px;
    text-align: center;
    font-size: 11px;
    padding: 0 2px;
    -moz-appearance: textfield;
}
.rp-input::-webkit-inner-spin-button,
.rp-input::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
.rp-input:focus { border-color: #777; outline: none; }
.rp-input.dim   { opacity: 0.35; }
.rp-dim-label {
    color: #666;
    font-size: 9px;
    flex-shrink: 0;
    user-select: none;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.rp-dim-label.dim { opacity: 0.35; }
.rp-sep {
    color: #666;
    font-size: 12px;
    flex-shrink: 0;
    user-select: none;
}
.rp-sep.dim { opacity: 0.35; }
.rp-del {
    width: 22px;
    height: 22px;
    border: none;
    border-radius: 3px;
    background: transparent;
    color: #855;
    cursor: pointer;
    font-size: 15px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.5;
    transition: opacity 0.15s, background 0.15s;
}
.rp-del:hover { opacity: 1; background: #3a2020; }
.rp-add {
    height: 26px;
    background: transparent;
    color: #696;
    border: 1px dashed #454;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
    margin-top: 4px;
    flex-shrink: 0;
    transition: background 0.15s, color 0.15s;
}
.rp-add:hover { background: #1a2a1a; color: #8b8; }
`;

let stylesInjected = false;
function injectStyles() {
    if (stylesInjected) return;
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    stylesInjected = true;
}

function round8(v) {
    return Math.max(64, Math.round(v / 8) * 8);
}

function getData(widget) {
    try {
        const d = JSON.parse(widget.value);
        if (Array.isArray(d) && d.length > 0) return d;
    } catch { /* fall through */ }
    return [{ w: 1024, h: 1024, on: true }];
}

function setData(widget, data) {
    widget.value = JSON.stringify(data);
}

function createEditor(node, dataWidget) {
    injectStyles();

    const container = document.createElement("div");
    container.className = "rp-container";

    container.addEventListener("mousedown", (e) => e.stopPropagation());
    container.addEventListener("keydown",   (e) => e.stopPropagation());
    container.addEventListener("wheel",     (e) => e.stopPropagation());

    const rowsEl = document.createElement("div");
    rowsEl.className = "rp-rows";
    container.appendChild(rowsEl);

    const addBtn = document.createElement("button");
    addBtn.className = "rp-add";
    addBtn.textContent = "+ Add Resolution";
    container.appendChild(addBtn);

    let dragIdx = -1;

    function render() {
        const data = getData(dataWidget);
        rowsEl.innerHTML = "";

        data.forEach((res, i) => {
            const row = document.createElement("div");
            row.className = "rp-row";
            row.draggable = true;
            row.dataset.idx = i;
            const dim = !res.on;

            const grip = document.createElement("span");
            grip.className = "rp-grip";
            grip.textContent = "⠿";
            grip.title = "Drag to reorder";

            const tog = document.createElement("button");
            tog.className = `rp-toggle ${res.on ? "on" : "off"}`;
            tog.textContent = res.on ? "✓" : "✕";
            tog.addEventListener("click", () => {
                data[i].on = !data[i].on;
                setData(dataWidget, data);
                render();
            });

            const wLabel = document.createElement("span");
            wLabel.className = "rp-dim-label" + (dim ? " dim" : "");
            wLabel.textContent = "W";

            const wIn = document.createElement("input");
            wIn.type = "number";
            wIn.className = "rp-input" + (dim ? " dim" : "");
            wIn.value = res.w;
            wIn.min = 64; wIn.max = 8192; wIn.step = 8;
            wIn.addEventListener("change", () => {
                data[i].w = round8(Number.parseInt(wIn.value) || 1024);
                wIn.value = data[i].w;
                setData(dataWidget, data);
            });

            const sep = document.createElement("span");
            sep.className = "rp-sep" + (dim ? " dim" : "");
            sep.textContent = "×";

            const hLabel = document.createElement("span");
            hLabel.className = "rp-dim-label" + (dim ? " dim" : "");
            hLabel.textContent = "H";

            const hIn = document.createElement("input");
            hIn.type = "number";
            hIn.className = "rp-input" + (dim ? " dim" : "");
            hIn.value = res.h;
            hIn.min = 64; hIn.max = 8192; hIn.step = 8;
            hIn.addEventListener("change", () => {
                data[i].h = round8(Number.parseInt(hIn.value) || 1024);
                hIn.value = data[i].h;
                setData(dataWidget, data);
            });

            const del = document.createElement("button");
            del.className = "rp-del";
            del.textContent = "−";
            del.title = "Remove";
            if (data.length <= 1) del.style.visibility = "hidden";
            del.addEventListener("click", () => {
                if (data.length <= 1) return;
                data.splice(i, 1);
                setData(dataWidget, data);
                render();
                requestAnimationFrame(() => {
                    node.setSize(node.computeSize());
                    app.graph.setDirtyCanvas(true);
                });
            });

            row.addEventListener("dragstart", (e) => {
                dragIdx = i;
                row.classList.add("dragging");
                e.dataTransfer.effectAllowed = "move";
            });
            row.addEventListener("dragend", () => {
                dragIdx = -1;
                row.classList.remove("dragging");
                for (const r of rowsEl.children) r.classList.remove("drag-over");
            });
            row.addEventListener("dragover", (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                for (const r of rowsEl.children) r.classList.remove("drag-over");
                if (i !== dragIdx) row.classList.add("drag-over");
            });
            row.addEventListener("dragleave", () => {
                row.classList.remove("drag-over");
            });
            row.addEventListener("drop", (e) => {
                e.preventDefault();
                row.classList.remove("drag-over");
                if (dragIdx < 0 || dragIdx === i) return;
                const [moved] = data.splice(dragIdx, 1);
                data.splice(i, 0, moved);
                dragIdx = -1;
                setData(dataWidget, data);
                render();
            });

            row.append(grip, tog, wLabel, wIn, sep, hLabel, hIn, del);
            rowsEl.appendChild(row);
        });
    }

    addBtn.addEventListener("click", () => {
        const data = getData(dataWidget);
        data.push({ w: 1024, h: 1024, on: true });
        setData(dataWidget, data);
        render();
        requestAnimationFrame(() => {
            node.setSize(node.computeSize());
            app.graph.setDirtyCanvas(true);
        });
    });

    render();
    container._render = render;
    return container;
}

app.registerExtension({
    name: "Cornman.ResolutionPicker",

    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name !== "ResolutionPicker") return;

        const orig = nodeType.prototype.onConfigure;
        nodeType.prototype.onConfigure = function () {
            orig?.apply(this, arguments);
            if (this._rpEditor?._render) {
                this._rpEditor._render();
                requestAnimationFrame(() => {
                    this.setSize(this.computeSize());
                });
            }
        };
    },

    nodeCreated(node) {
        if (node.comfyClass !== "ResolutionPicker") return;

        const dw = node.widgets.find((w) => w.name === "resolutions_json");
        if (!dw) return;

        dw.type = "converted-widget";
        dw.computeSize = () => [0, -4];
        if (dw.inputEl) dw.inputEl.style.display = "none";

        const editor = createEditor(node, dw);
        node._rpEditor = editor;

        const domW = node.addDOMWidget("rp_editor", "custom", editor, {
            serialize: false,
            hideOnZoom: false,
        });

        domW.computeSize = function (width) {
            const data = getData(dw);
            return [width, data.length * 32 + 46];
        };

        requestAnimationFrame(() => {
            node.setSize(node.computeSize());
            app.graph.setDirtyCanvas(true);
        });
    },
});
