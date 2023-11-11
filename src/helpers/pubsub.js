const pubsub = {
  subscribers: {},
  subscribe(event, callback) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }
    this.subscribers[event].push(callback);
  },

  publish(event, data) {
    if (this.subscribers[event]) {
      this.subscribers[event].forEach((callback) => {
        callback(data);
      });
    }
  },
};

export default pubsub;
