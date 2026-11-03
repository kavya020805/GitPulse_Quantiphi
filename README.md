# GitPulse: AI-Powered GitHub Developer Portfolio & Compatibility Engine

## Overview
**GitPulse** is a full-stack developer branding dashboard and analytics engine that visualizes GitHub activity, repository metrics, and coding streaks. Built with a strict server-side business logic architecture, it integrates directly with the GitHub REST and GraphQL APIs while leveraging a local SQLite caching engine to eliminate rate-limiting bottlenecks and ensure instantaneous page loads. 

Beyond standard metrics, GitPulse features an intelligent **"Vibe Check" Compatibility Engine** and **AI-Driven Portfolio Capabilities**, allowing recruiters and developers to evaluate technical alignment against real-world job descriptions and interact conversationally with the developer's codebase history.

---

## Core Features

### 1. Frontend UI & Visualizations
* **Interactive Contribution Heatmap:** A GitHub-style daily coding activity grid colored by commit intensity, complete with streak analytics (current streak, longest streak, and total annual contributions) computed on the server.
* **Dynamic Repository Showcase:** Filterable and sortable cards displaying key repository metrics including Star count, Fork count, primary Language tags with official GitHub color encodings, update timestamps, and descriptions.
* **Executive Profile Header:** A unified summary banner displaying bio details, follower/following counts, aggregated total stars across all repositories, and an interactive **Top Languages Donut/Pie Chart**.

### 2. Backend Architecture & Caching Engine
* **Hybrid GitHub API Integration:** Uses GitHub REST API v3 for profile and repository metadata and GitHub GraphQL API v4 (with automatic fallback calculation) for granular daily contribution calendar matrices.
* **SQLite Caching Engine:** Automatically caches user profiles, repository metadata, language breakdowns, and contribution heatmaps locally with Time-To-Live (TTL) validation. Includes a manual **"Force Sync"** trigger and visual cache-hit/miss indicators.
* **Strict Server-Side Business Logic:** All aggregations, language byte-to-percentage calculations, streak computations, and keyword matching algorithms are executed strictly on the backend. The frontend acts purely as a presentation and interaction layer.

### 3. The "Vibe Check": Tech Stack Compatibility Engine
* **Job Description Analyzer:** Users or recruiters can paste a target Job Description (JD) into the dashboard.
* **Server-Side Keyword & Synonym Matching:** The backend parses the JD using natural language token extraction and a curated technical taxonomy dictionary, comparing required skills against the languages, topics, and descriptions in the user's cached SQLite repository data.
* **Dynamic Match Badge:** Generates a prominent **"Match Percentage" badge** in the Profile Header, accompanied by a breakdown of *Matched Skills*, *Missing Skills*, and *Top Supporting Repositories*.

### 4. Bonus AI & Chatbot Capabilities
* **Feature 1: "Ask My Portfolio" Conversational AI Agent:** An interactive floating chatbot powered by Server-Side RAG (Retrieval-Augmented Generation) over the SQLite cache. Recruiters can ask natural language questions (e.g., *"What are their best Python projects?"* or *"How consistent is their coding streak?"*) and receive grounded answers citing specific repositories. Includes an intelligent deterministic rule-based fallback engine if no LLM API key is provided.
* **Feature 2: AI Tailored Pitch & README Bio Generator:** A contextual generator inside the Vibe Check module that synthesizes the user's top repositories and the inputted Job Description to draft a tailored elevator pitch/cover letter snippet and an optimized GitHub Profile README summary.