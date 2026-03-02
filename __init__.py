from .nodes import ResolutionPicker, PromptRouter, PromptWeight

NODE_CLASS_MAPPINGS = {
    "ResolutionPicker": ResolutionPicker,
    "PromptRouter": PromptRouter,
    "PromptWeight": PromptWeight,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "ResolutionPicker": "Resolution Picker",
    "PromptRouter": "Prompt Router",
    "PromptWeight": "Prompt Weight",
}

WEB_DIRECTORY = "./js"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
