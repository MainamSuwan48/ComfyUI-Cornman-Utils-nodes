# ComfyUI-Cornman-Utils-nodes

Utility nodes for ComfyUI.

## Where to find the nodes

These nodes are **local** (in your `custom_nodes` folder). They do **not** appear in ComfyUI-Manager’s install list, because that list only shows nodes from the Comfy Registry and the community list.

To use them in ComfyUI:

1. **Right‑click** on the canvas → **Add Node**
2. Open the **Cornman-Utils** category, or
3. Use the search box and type **Resolution Picker** (or the node name)

## Nodes

### Resolution Picker

Picks a random **width** and **height** from a set of resolution pairs.

- **Resolutions**: Multiline text, one pair per line as `WIDTHxHEIGHT`. Start a line with `#` to disable that pair.
- **Include custom**: Toggle to include the custom width/height pair in the pool.
- **Custom width / height**: One extra pair when “Include custom” is on.
- **Seed**: Controls which pair is chosen (same seed ⇒ same result).
- **Outputs**: `width` (INT), `height` (INT). Connect these to **Empty Latent Image** (or similar) width/height inputs.

## Showing up in ComfyUI-Manager

To have the pack listed in ComfyUI-Manager as an installable node, it must be:

- Published to the [Comfy Registry](https://docs.comfy.org/registry/overview), or  
- Added to the community [custom-node-list](https://github.com/ltdrdata/ComfyUI-Manager/blob/main/custom-node-list.json).

Until then, the pack is “manual install” only; the nodes still load and appear under **Add Node → Cornman-Utils**.
