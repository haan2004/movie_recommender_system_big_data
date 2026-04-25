from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams

# Connect to your local Qdrant container
qdrant = QdrantClient(host="localhost", port=6333)
collection_name = "movie_content"

# This instantly wipes all points and creates a fresh, empty database
qdrant.recreate_collection(
    collection_name=collection_name,
    vectors_config=VectorParams(size=384, distance=Distance.COSINE),
)

print(f"All points deleted! Collection '{collection_name}' is now empty.")