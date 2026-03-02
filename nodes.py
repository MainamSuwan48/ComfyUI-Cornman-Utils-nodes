import json
import random


def round8(v):
    """Round to nearest multiple of 8, minimum 64."""
    return max(64, round(v / 8) * 8)


class ResolutionPicker:
    """Pick a random width/height from a pool of resolution pairs with toggles."""

    CATEGORY = "Cornman-Utils"

    @classmethod
    def INPUT_TYPES(cls):
        default = json.dumps([
            {"w": 1024, "h": 1024, "on": True},
            {"w": 768, "h": 1344, "on": True},
            {"w": 1344, "h": 768, "on": True},
            {"w": 896, "h": 1152, "on": True},
            {"w": 1152, "h": 896, "on": True},
        ])
        return {
            "required": {
                "resolutions_json": ("STRING", {"default": default}),
                "seed": ("INT", {"default": 0, "min": 0, "max": 0xFFFFFFFFFFFFFFFF}),
            },
        }

    RETURN_TYPES = ("INT", "INT")
    RETURN_NAMES = ("width", "height")
    FUNCTION = "pick_resolution"

    def pick_resolution(self, resolutions_json, seed):
        try:
            data = json.loads(resolutions_json)
        except (json.JSONDecodeError, TypeError):
            raise ValueError("Invalid resolution data.")

        pairs = [
            (round8(r["w"]), round8(r["h"]))
            for r in data
            if r.get("on", True) and r.get("w", 0) > 0 and r.get("h", 0) > 0
        ]

        if not pairs:
            raise ValueError("No active resolution pairs. Enable at least one pair.")

        rng = random.Random(seed)
        w, h = rng.choice(pairs)
        return (w, h)


MAX_PROMPT_SLOTS = 10
DEFAULT_STATE = {"count": 2, "toggles": [True] * MAX_PROMPT_SLOTS}


class PromptRouter:
    """Concatenate multiple prompt inputs with per-slot toggles."""

    CATEGORY = "Cornman-Utils"

    @classmethod
    def INPUT_TYPES(cls):
        inputs = {
            "required": {
                "separator": ("STRING", {"default": ", "}),
                "state_json": ("STRING", {"default": json.dumps(DEFAULT_STATE)}),
            },
            "optional": {},
        }
        for i in range(1, MAX_PROMPT_SLOTS + 1):
            inputs["optional"][f"prompt_{i}"] = ("STRING", {"forceInput": True})
        return inputs

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("prompt",)
    FUNCTION = "route"

    def route(self, separator, state_json, **kwargs):
        try:
            state = json.loads(state_json)
        except (json.JSONDecodeError, TypeError):
            state = DEFAULT_STATE

        toggles = state.get("toggles", [True] * MAX_PROMPT_SLOTS)
        count = state.get("count", MAX_PROMPT_SLOTS)
        parts = []

        for i in range(1, count + 1):
            val = kwargs.get(f"prompt_{i}")
            if val is None or not str(val).strip():
                continue
            enabled = toggles[i - 1] if i - 1 < len(toggles) else True
            if enabled:
                parts.append(str(val).strip())

        return (separator.join(parts),)


class PromptWeight:
    """Wrap a prompt string in (string:weight) format."""

    CATEGORY = "Cornman-Utils"

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "prompt": ("STRING", {"forceInput": True}),
                "weight": ("FLOAT", {"default": 1.0, "min": 0.0, "max": 3.0, "step": 0.05}),
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("prompt",)
    FUNCTION = "apply_weight"

    def apply_weight(self, prompt, weight):
        text = prompt.strip()
        if not text:
            return ("",)
        if weight == 1.0:
            return (text,)
        return (f"({text}:{weight:.2f})",)
