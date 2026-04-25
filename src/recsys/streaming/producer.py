import json
from datetime import datetime
from confluent_kafka import Producer

class InteractionProducer:
    def __init__(self, bootstrap_servers='localhost:9092'):
        self.config = {
            'bootstrap.servers': bootstrap_servers,
            'client.id': 'recsys-web-ui'
        }
        self.producer = Producer(self.config)
        self.topics = {
            'click': 'user-clicks',
            'rating': 'user-ratings'
        }

    def _delivery_report(self, err, msg):
        if err is not None:
            print(f"[-] Message delivery failed: {err}")
        else:
            print(f"[+] Message delivered to {msg.topic()} at offset {msg.offset()}")

    def track_click(self, user_id, movie_id):
        payload = {
            'user_id': user_id,
            'movie_id': movie_id,
            'event_type': 'click',
            'timestamp': datetime.utcnow().isoformat()
        }
        self._send_to_kafka(self.topics['click'], payload)

    def track_rating(self, user_id, movie_id, rating):
        payload = {
            'user_id': user_id,
            'movie_id': movie_id,
            'rating': float(rating),
            'event_type': 'rating',
            'timestamp': datetime.utcnow().isoformat()
        }
        self._send_to_kafka(self.topics['rating'], payload)

    def _send_to_kafka(self, topic, payload):
        try:
            self.producer.produce(
                topic, 
                key=str(payload['user_id']), 
                value=json.dumps(payload).encode('utf-8'),
                callback=self._delivery_report
            )
            self.producer.poll(0)
        except Exception as e:
            print(f"[-] Error producing to Kafka: {e}")

    def flush(self):
        self.producer.flush()
