# Big Data Recommender System 🎬

A real-time, hybrid recommendation system leveraging **Kafka** for event streaming, **Qdrant** for semantic vector search, and **PySpark** for scalable collaborative filtering.

## 🚀 Project Architecture
The system follows a modern decoupled architecture for processing and recommending content:

1.  **Frontend (Flask UI)**: An interactive dashboard where users can search, click, and rate movies.
2.  **Streaming Layer (Kafka)**: User interactions (clicks, ratings) are pushed to specific topics in real-time.
3.  **Real-time Logic (Content-Based)**: A background consumer retrieves the semantic vector of the interacted movie from Qdrant and finds similar content instantly.
4.  **Batch Layer (Collaborative Filtering)**: A PySpark job (placeholder) designed to process large historical datasets using ALS (Alternating Least Squares) to identify user patterns.
5.  **Vector DB (Qdrant)**: Stores embeddings for 26,000+ movies, enabling lightning-fast similarity queries.

---

## 🛠 Tech Stack
- **Languages**: Python, HTML/JS
- **Streaming**: Apache Kafka (via Confluent-Kafka)
- **Vector Database**: Qdrant
- **ML Models**: Sentence-Transformers (`all-MiniLM-L6-v2`)
- **Big Data**: Apache Spark (PySpark)
- **Web Framework**: Flask
- **Containerization**: Docker & Docker Compose

---

## 📊 System Components

### 1. Data Pipeline
- **`indexer.py`**: Processes the MovieLens dataset, generates semantic embeddings for movie descriptions, and upserts them to Qdrant with rich metadata.
- **`search.py`**: Provides utility functions for semantic search across the collection.

### 2. Kafka Streaming
- **`producer.py`**: A robust wrapper for sending user interaction JSON payloads to Kafka.
- **`web_dashboard.py`**: Hosts the web server and runs a background thread to consume Kafka events and trigger recommendations.

### 3. Spark Recommendation (Upcoming)
- **`spark_jobs/collaborative_filtering.py`**: Foundation for the batch recommendation engine. It will handle the Matrix Factorization logic to provide "User-to-User" recommendations.

---

## 📥 Input & Output
- **Input**:
    - `data/process_movie.csv`: Movie metadata (Titles, Genres, Overviews).
    - User Interactions: Real-time JSON streams (User ID, Movie ID, Timestamp, Action Type).
- **Output**:
    - **Real-time**: "Because you viewed X, you might like Y" (Semantic similarity).
    - **Search**: Top-K movies matching a natural language query.
    - **Batch (Planned)**: Top-K recommendations based on global user behavior.

---

## 📏 Metrics for Success
- **Relevance**: 
    - *Content-Based*: Cosine similarity score between vectors.
    - *Collaborative Filtering*: Root Mean Squared Error (RMSE) on rating predictions.
- **Performance**: 
    - *Latency*: UI update speed after a click (Target: < 500ms).
    - *Throughput*: Number of Kafka messages processed per second.
- **User Engagement**: Click-Through Rate (CTR) on suggested movies.

---

## ⚙️ Installation & Setup
1. **Infrastructure**:
   ```bash
   docker-compose up -d
   ```
2. **Environment**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Indexing**:
   ```bash
   python data_processing_pipeline/indexer.py
   ```
4. **Run Dashboard**:
   ```bash
   python kafka_streaming/web_dashboard.py
   ```
5. **Run frontend**:
    open a new terminal
    ```bash
   cd frontend
   npm run dev -- --host
   ```
   Some urls may not work in WSL so try opening all 3 of them

---

## 🔮 Roadmap
- [x] Kafka Producer/Consumer Integration.
- [x] Semantic Search (Natural Language).
- [x] Real-time Content-Based Feedback Loop.
- [ ] **Next Step**: Implement full ALS training in PySpark.
- [ ] **Next Step**: Hybridize the results (Combine Content + Collaborative scores).
