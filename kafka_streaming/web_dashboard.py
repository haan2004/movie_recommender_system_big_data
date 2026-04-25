import threading
import json
import os
import sys

# Add src to path for development if not installed
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from flask import Flask, render_template, jsonify, request
from recsys import InteractionProducer, MovieVectorDB
from confluent_kafka import Consumer, KafkaError

app = Flask(__name__)

# Global state
live_feed = []
recommendations = []

# Initialize Library Components
producer = InteractionProducer()
db = MovieVectorDB()

# Kafka Consumer Thread
def kafka_consumer_thread():
    consumer_config = {
        'bootstrap.servers': 'localhost:9092',
        'group.id': 'web-dashboard-group',
        'auto.offset.reset': 'latest'
    }
    consumer = Consumer(consumer_config)
    consumer.subscribe(['user-clicks', 'user-ratings'])

    print("[*] Library-powered Consumer thread started.")

    while True:
        msg = consumer.poll(1.0)
        if msg is None: continue
        if msg.error():
            continue

        try:
            data = json.loads(msg.value().decode('utf-8'))
            topic = msg.topic()
            movie_id = int(data['movie_id'])
            
            # Update feed
            event_msg = {
                "type": "Click" if topic == 'user-clicks' else "Rating",
                "user": data['user_id'],
                "movie": movie_id,
                "detail": data.get('rating', 'Clicked'),
                "time": data['timestamp']
            }
            live_feed.insert(0, event_msg)
            if len(live_feed) > 20: live_feed.pop()
            
            # Recommendation logic using the library
            should_recommend = (topic == 'user-clicks') or (topic == 'user-ratings' and float(data.get('rating', 0)) >= 4.0)
            if should_recommend:
                hits = db.get_recommendations(movie_id, limit=5)
                global recommendations
                recommendations = [f"Library Suggests: {h.payload['title']}" for h in hits]

        except Exception as e:
            print(f"[-] Consumer error: {e}")

# Start background thread
threading.Thread(target=kafka_consumer_thread, daemon=True).start()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/click/<int:movie_id>')
def click_movie(movie_id):
    producer.track_click(user_id=1337, movie_id=movie_id)
    return jsonify({"status": "success"})

@app.route('/api/rate/<int:movie_id>/<float:score>')
def rate_movie(movie_id, score):
    producer.track_rating(user_id=1337, movie_id=movie_id, rating=score)
    return jsonify({"status": "success"})

@app.route('/api/feed')
def get_feed():
    return jsonify({"feed": live_feed, "recommendations": recommendations})

@app.route('/api/search')
def search():
    query = request.args.get('q', '')
    if not query: return jsonify({"results": []})
    
    hits = db.search(query)
    results = [{
        "id": h.payload['movie_ref'],
        "title": h.payload['title'],
        "genres": h.payload['genres'],
        "description": h.payload['description']
    } for h in hits]
    
    return jsonify({"results": results})

if __name__ == '__main__':
    app.run(debug=True, port=5001, use_reloader=False)
