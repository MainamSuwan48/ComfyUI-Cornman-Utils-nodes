import random


class ResolutionPicker:
    """Pick a random width/height from a pool of active resolution pairs."""

    CATEGORY = "Cornman-Utils"

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "resolutions": ("STRING", {
                    "default": "1024x1024\n768x1344\n1344x768\n896x1152\n1152x896",
                    "multiline": True,
                    "placeholder": "One per line: WIDTHxHEIGHT (prefix # to disable)",
                }),
                "include_custom": ("BOOLEAN", {"default": False, "label_on": "On", "label_off": "Off"}),
                "custom_width": ("INT", {"default": 1024, "min": 64, "max": 8192, "step": 8}),
                "custom_height": ("INT", {"default": 1024, "min": 64, "max": 8192, "step": 8}),
                "seed": ("INT", {"default": 0, "min": 0, "max": 0xFFFFFFFFFFFFFFFF}),
            },
        }

    RETURN_TYPES = ("INT", "INT")
    RETURN_NAMES = ("width", "height")
    FUNCTION = "pick_resolution"

    def pick_resolution(self, resolutions, include_custom, custom_width, custom_height, seed):
        pairs = []

        for line in resolutions.strip().splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            parts = line.lower().replace(" ", "").split("x")
            if len(parts) != 2:
                continue
            try:
                w, h = int(parts[0]), int(parts[1])
                if w > 0 and h > 0:
                    pairs.append((w, h))
            except ValueError:
                continue

        if include_custom and custom_width > 0 and custom_height > 0:
            pairs.append((custom_width, custom_height))

        if not pairs:
            raise ValueError("No active resolution pairs. Add at least one WIDTHxHEIGHT line or enable the custom pair.")

        rng = random.Random(seed)
        width, height = rng.choice(pairs)
        return (width, height)
