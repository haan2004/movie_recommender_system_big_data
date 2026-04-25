from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer
import uuid

class MovieVectorDB:
    def __init__(self, host="localhost", port=6333, collection_name="movie_content"):
        self.client = QdrantClient(host=host, port=port)
        self.collection_name = collection_name
        self.model = SentenceTransformer('all-MiniLM-L6-v2')

    def init_collection(self, vector_size=384):
        if self.client.collection_exists(self.collection_name):
            self.client.delete_collection(self.collection_name)
        self.client.create_collection(
            collection_name=self.collection_name,
            vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
        )

    def generate_uuid(self, movie_id):
        return str(uuid.uuid5(uuid.NAMESPACE_DNS, str(int(movie_id))))

    def upsert_movies(self, df, batch_size=250):
        points = []
        for index, row in df.iterrows():
            rich_text = f"Title: {row['title']} ({row.get('year', 'Unknown')}). Genres: {row['genres']}. Description: {row['description']}"
            vector = self.model.encode(rich_text).tolist()
            
            payload = {
                "movie_ref": int(row['movieId']),
                "title": str(row['title']),
                "genres": str(row['genres']),
                "description": str(row['description'])
            }
            
            points.append(PointStruct(
                id=self.generate_uuid(row['movieId']),
                vector=vector,
                payload=payload
            ))
            
            if len(points) >= batch_size:
                self.client.upsert(collection_name=self.collection_name, points=points)
                points = []
        if points:
            self.client.upsert(collection_name=self.collection_name, points=points)

    def search(self, query_text, limit=5):
        vector = self.model.encode(query_text).tolist()
        results = self.client.query_points(
            collection_name=self.collection_name,
            query=vector,
            limit=limit
        )
        return results.points

    def get_recommendations(self, movie_id, limit=5):
        point_id = self.generate_uuid(movie_id)
        points = self.client.retrieve(
            collection_name=self.collection_name,
            ids=[point_id],
            with_vectors=True
        )
        if not points:
            return []
        
        search_result = self.client.query_points(
            collection_name=self.collection_name,
            query=points[0].vector,
            limit=limit + 1
        )
        # Filter out the source movie
        return [hit for hit in search_result.points if hit.payload.get('movie_ref') != int(movie_id)][:limit]
