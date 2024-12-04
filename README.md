
# News Explorer: Dynamic Mode Selector with LLM Integration

## Overview

News Explorer is a dynamic news app powered by the [World News API](https://worldnewsapi.com/) and Google's **Gemini** Large Language Model (LLM). The app fetches and displays news articles, allowing users to switch between different modes. Each mode dynamically updates the title and description, with rankings from 1 to 10 for a customized experience.

---

## Features

- **News Fetching**: Leverages the World News API for real-time global news updates.
- **Mode Selector**: Choose from multiple modes to filter news content. 
- **Dynamic Updates**: Gemini LLM dynamically updates the title and description for each mode.
- **Smooth UI**: Built with React (Vite) for a fast, interactive user experience.
- **Responsive Design**: Styled with CSS for a clean and adaptive layout.

---

## Technologies Used

- **Frontend**: React (with Vite)
- **Styling**: CSS
- **Logic**: JavaScript
- **APIs**:
  - [World News API](https://worldnewsapi.com/) for fetching news data.
  - **Google Gemini LLM** for generating mode-specific titles and descriptions.

---


## How It Works

1. **News Fetching:**
   - On load, the app retrieves news articles from the World News API.
   - Data includes headlines, descriptions, and relevant metadata.

2. **Mode Selection:**
   - Modes are represented numerically (1–10).
   - Clicking a mode triggers the Gemini LLM to generate a mode-specific title and description.

3. **Dynamic Updates:**
   - Mode changes update the UI in real-time, modifying the displayed title and description.

---

## Future Enhancements

- Add user authentication for personalized mode preferences.
- Expand mode functionality to include more granular filters (e.g., categories or regions).
- Enable saving and sharing of favorite articles.
- Introduce analytics for user behavior and mode preferences.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## Contact

For questions or feedback, feel free to reach out


