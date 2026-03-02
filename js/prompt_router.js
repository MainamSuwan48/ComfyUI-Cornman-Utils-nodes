import { app } from "../../scripts/app.js";

const MAX_SLOTS = 10;

const STYLES = `
.pr-container {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 4px 8px 10px;
    font-family: sans-serif;
}
.pr-rows {
    display: flex;
    flex-direction: column;
    gap: 3px;
}
.pr-row {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 24px;
}
.pr-toggle {
    width: 22px;
    height: 22px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    color: #fff;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
}
.pr-toggle.on  { background: #2a7a2e; }
.pr-toggle.off { background: #7a2a2a; opacity: 0.7; }
.pr-label {
    color: #aaa;
    font-size: 11px;
    flex: 1;
    user-select: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.pr-label.dim { opacity: 0.4; }
.pr-del {
    width: 20px;
    height: 20px;
    border: none;
    border-radius: 3px;
    background: transparent;
    color: #855;
    cursor: pointer;
    font-size: 14px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.5;
    transition: opacity 0.15s, background 0.15s;
}
.pr-del:hover { opacity: 1; background: #3a2020; }
.pr-add {
    height: 26px;
    background: transparent;
    color: #696;
    border: 1px dashed #454;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
    margin-top: 5px;
    flex-shrink: 0;
    transition: background 0.15s, color 0.15s;
}
.pr-add:hover { background: #1a2a1a; color: #8b8; }
`;

let stylesInjected = false;
function injectStyles() {
    if (stylesInjected) return;
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    stylesInjected = true;
}

function getState(widget) {
    try {
        const s = JSON.parse(widget.value);
        if (s && typeof s.count === "number") return s;
    } catch { /* fall through */ }
    return { count: 2, toggles: new Array(MAX_SLOTS).fill(true) };
}

function saveState(widget, state) {
    const t = state.toggles.slice();
    while (t.length < MAX_SLOTS) t.push(true);
    widget.value = JSON.stringify({ count: state.count, toggles: t });
}

function hideWidget(w) {
    if (!w) return;
    w.type = "converted-widget";
    w.computeSize = () => [0, -4];
    if (w.inputEl) w.inputEl.style.display = "none";
}

function syncInputSlots(node, target) {
    while (node.inputs.length > target) {
        const idx = node.inputs.length - 1;
        if (node.inputs[idx]?.link != null) {
            node.disconnectInput(idx);
        }
        node.removeInput(idx);
    }
    while (node.inputs.length < target) {
        const n = node.inputs.length + 1;
        node.addInput(`prompt_${n}`, "STRING");
    }
}

function getSourceName(node, slotIndex) {
    const input = node.inputs?.[slotIndex];
    if (!input || input.link == null) return null;
    const link = app.graph.links[input.link];
    if (!link) return null;
    const srcNode = app.graph.getNodeById(link.origin_id);
    return srcNode?.title || srcNode?.type || null;
}

function updateSlotLabels(node, toggles) {
    if (!node.inputs) return;
    for (let i = 0; i < node.inputs.length; i++) {
        const on = toggles[i] !== false;
        const name = getSourceName(node, i) || `prompt_${i + 1}`;
        node.inputs[i].label = on ? name : `${name} (off)`;
    }
}

function createUI(node, stateW) {
    injectStyles();

    const container = document.createElement("div");
    container.className = "pr-container";
    container.addEventListener("mousedown", (e) => e.stopPropagation());
    container.addEventListener("keydown", (e) => e.stopPropagation());

    const rowsEl = document.createElement("div");
    rowsEl.className = "pr-rows";
    container.appendChild(rowsEl);

    const addBtn = document.createElement("button");
    addBtn.className = "pr-add";
    addBtn.textContent = "+ Add Prompt";
    container.appendChild(addBtn);

    function resize() {
        requestAnimationFrame(() => {
            node.setSize(node.computeSize());
            app.graph.setDirtyCanvas(true);
        });
    }

    function render() {
        const state = getState(stateW);
        const count = node.inputs ? node.inputs.length : state.count;
        updateSlotLabels(node, state.toggles);
        rowsEl.innerHTML = "";

        for (let i = 0; i < count; i++) {
            const row = document.createElement("div");
            row.className = "pr-row";
            const on = state.toggles[i] !== false;

            const tog = document.createElement("button");
            tog.className = `pr-toggle ${on ? "on" : "off"}`;
            tog.textContent = on ? "✓" : "✕";
            tog.addEventListener("click", () => {
                state.toggles[i] = !state.toggles[i];
                saveState(stateW, state);
                render();
                app.graph.setDirtyCanvas(true);
            });

            const name = getSourceName(node, i) || `prompt_${i + 1}`;
            const label = document.createElement("span");
            label.className = "pr-label" + (on ? "" : " dim");
            label.textContent = name;

            row.append(tog, label);

            if (i === count - 1 && count > 1) {
                const del = document.createElement("button");
                del.className = "pr-del";
                del.textContent = "−";
                del.title = "Remove last prompt";
                del.addEventListener("click", () => {
                    if (node.inputs.length <= 1) return;
                    const lastIdx = node.inputs.length - 1;
                    if (node.inputs[lastIdx]?.link != null) {
                        node.disconnectInput(lastIdx);
                    }
                    node.removeInput(lastIdx);
                    state.count = node.inputs.length;
                    saveState(stateW, state);
                    render();
                    resize();
                });
                row.appendChild(del);
            }

            rowsEl.appendChild(row);
        }

        addBtn.style.display = count >= MAX_SLOTS ? "none" : "";
    }

    addBtn.addEventListener("click", () => {
        if (node.inputs.length >= MAX_SLOTS) return;
        const n = node.inputs.length + 1;
        node.addInput(`prompt_${n}`, "STRING");
        const state = getState(stateW);
        state.count = n;
        saveState(stateW, state);
        render();
        resize();
    });

    render();
    container._render = render;
    return container;
}

app.registerExtension({
    name: "Cornman.PromptRouter",

    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name !== "PromptRouter") return;

        const origCfg = nodeType.prototype.onConfigure;
        nodeType.prototype.onConfigure = function () {
            origCfg?.apply(this, arguments);
            const sw = this.widgets?.find((w) => w.name === "state_json");
            if (sw) {
                const state = getState(sw);
                syncInputSlots(this, state.count);
            }
            if (this._prUI?._render) {
                this._prUI._render();
                requestAnimationFrame(() => {
                    this.setSize(this.computeSize());
                });
            }
        };

        const origConn = nodeType.prototype.onConnectionsChange;
        nodeType.prototype.onConnectionsChange = function () {
            origConn?.apply(this, arguments);
            this._prUI?._render?.();
        };
    },

    nodeCreated(node) {
        if (node.comfyClass !== "PromptRouter") return;

        const stateW = node.widgets.find((w) => w.name === "state_json");
        if (!stateW) return;

        hideWidget(stateW);

        const state = getState(stateW);
        syncInputSlots(node, state.count);

        const ui = createUI(node, stateW);
        node._prUI = ui;

        const domW = node.addDOMWidget("pr_toggles", "custom", ui, {
            serialize: false,
            hideOnZoom: false,
        });

        domW.computeSize = function (width) {
            const count = node.inputs ? node.inputs.length : 2;
            return [width, count * 27 + 50];
        };

        requestAnimationFrame(() => {
            syncInputSlots(node, state.count);
            ui._render();
            node.setSize(node.computeSize());
            app.graph.setDirtyCanvas(true);
        });
    },
});
