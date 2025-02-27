import "./index.css";
import "./App.css";
import React, { useState, useEffect } from "react";

function App() {
    const [text, setText] = useState("");
    const [translatedText, setTranslatedText] = useState("");
    const [sourceLanguage, setSourceLanguage] = useState("auto");
    const [targetLanguage, setTargetLanguage] = useState("fr");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [darkMode, setDarkMode] = useState(
        window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    );

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e) => setDarkMode(e.matches);
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const handleVoiceInput = () => {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = sourceLanguage !== "auto" ? sourceLanguage : "en-US";

        setText("🎤 Listening...");
        recognition.start();

        recognition.onresult = (event) => {
            const spokenText = event.results[0][0].transcript;
            setText(spokenText);
        };

        recognition.onerror = (event) => {
            console.error("Speech Recognition Error:", event.error);
            setError("Speech recognition failed. Try again.");
        };
    };

    const translateText = async () => {
        if (!text.trim()) {
            setError("Please enter text to translate.");
            return;
        }

        try {
            setIsLoading(true);
            setTranslatedText("🔄 Translating...");
            setError(null);

            const response = await fetch("http://127.0.0.1:8000/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, target_language: targetLanguage }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Translation failed.");
            }

            setTranslatedText(data.translated_text);
        } catch (error) {
            console.error("Translation Error:", error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSpeak = () => {
        if (!translatedText) return;
        const utterance = new SpeechSynthesisUtterance(translatedText);
        utterance.lang = targetLanguage;
        speechSynthesis.speak(utterance);
    };

    return (
        <div className={`app-container ${darkMode ? "dark-mode" : "light-mode"}`}>
            <div className="container">
                <h1>Healthcare Translation App</h1>

                <button className="toggle-btn" onClick={toggleDarkMode}>
                    {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
                </button>

                <div className="controls">
                    <button onClick={handleVoiceInput} className="hover-effect">🎤 Speak</button>
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter text..."
                        className="hover-input"
                    />
                </div>

                <div className="language-selection">
                    <label>Source:</label>
                    <select value={sourceLanguage} onChange={(e) => setSourceLanguage(e.target.value)} className="hover-select">
                        <option value="auto">Auto Detect</option>
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="es">Spanish</option>
                        <option value="de">German</option>
                    </select>

                    <label>Target:</label>
                    <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)} className="hover-select">
                        <option value="fr">French</option>
                        <option value="es">Spanish</option>
                        <option value="de">German</option>
                    </select>
                </div>

                <button onClick={translateText} disabled={isLoading} className="hover-effect">
                    {isLoading ? <span className="spinner"></span> : "Translate"}
                </button>

                {error && <p className="error-message">{error}</p>}

                <div className="transcript-container">
                    <div className="transcript">
                        <h2>Original:</h2>
                        <p>{text}</p>
                    </div>
                    <div className="transcript">
                        <h2>Translated:</h2>
                        <p>{translatedText}</p>
                    </div>
                </div>

                <button onClick={handleSpeak} disabled={!translatedText || isLoading} className="hover-effect">
                    🔊 Speak
                </button>
            </div>
        </div>
    );
}

export default App;
