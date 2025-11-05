# LLM Selection and API Key Management

This document describes the functionality and placement details for selecting LLMs and managing API keys.

## Placement

This section is collapsible and located on the right side of the `anyLLM.html` page. When the page loads, this section is expanded. After the user selects a folder and the data from a previous session is loaded, it will automatically collapse if both primary and secondary LLMs are loaded from the saved file. In the collapsed state, it will show the names of the primary and secondary LLMs.

## Features

*   **Folder Selection:** A "Select Folder" button at the top allows the user to choose a directory for storing conversations and settings.
*   **LLM Configuration:**
    *   The user can select a primary and a secondary LLM from dropdown menus (options: GPT, Gemini, with version numbers).
    *   Next to both dropdowns, text inputs will allow the user to enter the API keys for the selected LLMs.
*   **System Prompts:** The user can provide a system prompt for both the primary and secondary LLMs in a large textarea next to the API key textbox.
*   **Saving:** The selected models, system prompts, and API keys will be saved in a `model.json` file in the user-selected folder.
*   **Loading:** When a folder is selected, the application will load the settings from the `model.json` file if it exists. It will populate all the above fields with the saved data.

**Security Note:** Storing API keys in a plain text file is a security risk. For this MVP, we will proceed with this approach, but it is highly recommended to implement a more secure solution in the future, such as using environment variables or a dedicated secrets management service.
