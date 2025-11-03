# MVP_1: Complete Functionality

This document outlines the requirements for the first complete Minimum Viable Product (MVP).

The landing page is `anyLLM_1.html`.

## Functionality and features:

1.  **Folder Selection:**
    *   The application shall provide an interface for the user to browse and select a directory from their local filesystem. In this directory, each conversation is stored as a JSON file.

2.  **JSON File Loading:**
    *   Upon folder selection, the application will read all files with a `.json` extension from the chosen directory (which could be empty).

3.  **File Display:**
    *   The application will display a list of the loaded JSON files (aka conversations).
    *   This list will be sorted based on the `last_m_time` field in each JSON file, with the most recently modified files appearing first.
    *   Each item in the list will display the `title`, which is the first 50 characters of the `text` field (with newlines and spaces stripped). If `text` is empty, the title is empty.

4.  **Model Selection and API Key Management:**
    *   The user can select a primary LLM from a dropdown menu (options: GPT, Gemini, with version numbers).
    *   The user can select a secondary LLM from a dropdown menu (same options).
    *   Next to each dropdown, there will be a text input for the user to enter and save the API key for the selected LLM.
    *   The selections and keys will be saved in a `models.json` file within the selected folder.
    *   When a folder is selected, the application will look for `models.json` and load the saved model selections and API keys.

5.  **System Prompt Configuration:**
    *   Below the model selection, there will be two text areas for the system prompts for the primary and secondary LLMs.
    *   These prompts will also be saved in the `models.json` file.

6.  **Chat Interface:**
    *   A user-friendly chat interface will be provided.
    *   The user can type a message and send it.
    *   The application will use the primary LLM to generate a response.
    *   The response from the primary LLM will then be passed to the secondary LLM for refinement.
    *   The refined response will be displayed in the chat interface.

7.  **Conversation History:**
    *   The entire conversation (user prompts, primary LLM responses, and secondary LLM responses) will be saved in the corresponding JSON file for the conversation.
    *   The `last_m_time` of the JSON file will be updated with each new message.
