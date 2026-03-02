# ComfyUI-Cornman-Utils-nodes

Utility nodes for ComfyUI.

## Where to find the nodes

These nodes are **local** (in your `custom_nodes` folder). They do **not** appear in ComfyUI-Manager's install list.

To use them: **right-click canvas → Add Node → Cornman-Utils**, or search by node name.

## Nodes

### Resolution Picker

Picks a random **width** and **height** from a set of resolution pairs.

Each row has:
- **Toggle** (green ✓ / red ✕) — enable or disable that pair
- **Width × Height** — editable number inputs
- **Delete** (−) — remove the row (hidden when only one pair remains)
- **+ Add Resolution** — add a new pair at the bottom

**Seed** controls which pair is chosen (same seed → same result).

**Outputs:** `width` (INT), `height` (INT) — connect to Empty Latent Image or similar.
