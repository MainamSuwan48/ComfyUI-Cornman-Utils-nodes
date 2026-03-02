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
