from .nodes import ResolutionPicker

NODE_CLASS_MAPPINGS = {
    "ResolutionPicker": ResolutionPicker,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "ResolutionPicker": "Resolution Picker",
}

WEB_DIRECTORY = "./js"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
