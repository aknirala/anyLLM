
# 5. Conversation Flow

This document outlines the process of a user interacting with the primary LLM in the anyLLM application.

## User Interaction and Display

1.  **Sending a Message:**
    -   When a user types a message in the conversation pane and clicks "Send," the message is sent to the primary LLM.
    -   The user's message is immediately displayed in the chat interface. It will be left-aligned with a light blue background.

2.  **Receiving a Response:**
    -   Upon receiving a response from the LLM, the message is displayed in the chat interface.
    -   The LLM's response will be right-aligned with a light gray background.

## Data Sent to the LLM

The following data is sent to the primary LLM with each user message:

-   **LLM Configuration:** Information to identify and authenticate with the selected LLM (e.g., which LLM, API key).
-   **System Prompt:** The user-defined system prompt for the primary LLM.
-   **User Prompt:** The user's message.
-   **Chat History:** All previous messages in the conversation, unless a user has explicitly deselected a message.

## Chat History Management

-   Each message in the conversation has a checkbox to its left.
-   By default, all messages are checked and included in the chat history sent to the LLM.
-   Users can uncheck any message to exclude it from the chat history for subsequent turns in the conversation.

## Conversation Saving

-   The entire conversation is saved to a JSON file each time a user sends a message or an AI response is received.
-   The filename is the creation timestamp of the conversation (e.g., `<creation_time>.json`).

### JSON File Structure

The JSON file for each conversation will have the following structure:

```json
{
  "creation_time": "<timestamp>",
  "last_modified_time": "<timestamp>",
  "primary_model_selected": "<model_name>",
  "primary_model_system_prompt": "<system_prompt>",
  "secondary_model_selected": "<model_name>",
  "secondary_model_system_prompt": "<system_prompt>",
  "conversation": [
    {
      "user_message": "<user_message>",
      "user_timestamp": "<timestamp>",
      "ai_response": "<ai_response>",
      "ai_timestamp": "<timestamp>"
    }
  ]
}
```
