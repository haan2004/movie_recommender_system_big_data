import time
import random
from producer import InteractionProducer

def run_simulation():
    """
    Simulates random user behavior (clicks and ratings).
    """
    producer = InteractionProducer()
    
    # Mock some user and movie IDs
    user_ids = [2001, 2002, 2003, 2004, 2005]
    movie_ids = [1, 2, 318, 593, 2571, 110, 260] # Popular movie IDs
    
    print("🚀 Starting User Interaction Simulation...")
    print("Press Ctrl+C to stop.\n")

    try:
        while True:
            # 70% chance of a click, 30% chance of a rating
            action_type = random.choice(['click', 'click', 'click', 'rating'])
            user = random.choice(user_ids)
            movie = random.choice(movie_ids)
            
            if action_type == 'click':
                print(f"DEBUG: Simulating Click -> User {user}, Movie {movie}")
                producer.track_click(user, movie)
            else:
                score = random.choice([3.0, 3.5, 4.0, 4.5, 5.0])
                print(f"DEBUG: Simulating Rating -> User {user}, Movie {movie}, Score {score}")
                producer.track_rating(user, movie, score)
            
            # Wait a bit between actions
            time.sleep(random.uniform(0.5, 2.0))
            
    except KeyboardInterrupt:
        print("\nStopping simulation...")
        producer.flush()

if __name__ == "__main__":
    run_simulation()
