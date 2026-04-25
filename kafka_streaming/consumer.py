import json
from confluent_kafka import Consumer, KafkaError

class InteractionConsumer:
    """
    Consumes user interaction streams (clicks and ratings) from Kafka.
    """
    def __init__(self, bootstrap_servers='localhost:9092', group_id='recommendation-engine-v1'):
        self.config = {
            'bootstrap.servers': bootstrap_servers,
            'group.id': group_id,
            'auto.offset.reset': 'earliest'
        }
        self.consumer = Consumer(self.config)
        self.topics = ['user-clicks', 'user-ratings']

    def start_listening(self):
        """
        Subscribes to topics and starts the consumption loop.
        """
        self.consumer.subscribe(self.topics)
        print(f"[*] Started listening to topics: {self.topics}")
        
        try:
            while True:
                msg = self.consumer.poll(1.0)
                if msg is None:
                    continue
                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF:
                        continue
                    else:
                        print(f"[-] Consumer error: {msg.error()}")
                        break

                # Process valid message
                self._process_interaction(msg)

        except KeyboardInterrupt:
            print("[*] Consumer stopped.")
        finally:
            self.consumer.close()

    def _process_interaction(self, msg):
        """
        Routes the message to the appropriate processing logic.
        """
        try:
            topic = msg.topic()
            data = json.loads(msg.value().decode('utf-8'))
            
            if topic == 'user-clicks':
                print(f"[CLICK] User {data['user_id']} clicked Movie {data['movie_id']}")
                # TODO: Trigger real-time content-based recommendation logic here
                
            elif topic == 'user-ratings':
                print(f"[RATING] User {data['user_id']} rated Movie {data['movie_id']} with {data['rating']} stars")
                # TODO: Update user preference profile or trigger collaborative filtering update
                
        except Exception as e:
            print(f"[-] Error parsing message: {e}")

if __name__ == "__main__":
    c = InteractionConsumer()
    c.start_listening()
