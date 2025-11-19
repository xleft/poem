# 诗隐 Shi Yin - Poetry Hermit

> 墨韵流转，意会古今。
> Ink & Soul, Timeless Echoes.

A traditional Chinese ink-wash style application that matches your mood to Tang/Song poetry, explores cultural keywords, and enables conversation with ancient poets.

## Features

*   **Mood to Poem**: Enter your feelings to find a matching Tang/Song poem or Western classic.
*   **Cultural Immersion**: "Ink Wash" UI design with fluid animations.
*   **Deep Analysis**: Explore keywords (Geography, Phenology, Customs) within the poems.
*   **Poet Correspondence**: Receive personalized letters from ancient poets based on your mood.
*   **Collection**: Save your favorite poems, keywords, and letters.
*   **Dual Language**: Full support for Chinese (Classic Poetry) and English (Western Poetry).

## Setup

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up Environment Variables:
    Create a `.env` file in the root directory and add your Google Gemini API Key:
    ```env
    VITE_API_KEY=your_google_gemini_api_key_here
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```

## Tech Stack

*   React + TypeScript
*   Vite
*   Tailwind CSS
*   Google Gemini API (@google/genai)

## License

MIT
