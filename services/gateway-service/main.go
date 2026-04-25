package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
)

// In-memory store for demo purposes
var (
	rides      = make(map[string]interface{})
	ridesMu    sync.RWMutex
)

func main() {
	http.HandleFunc("/api/gateway/health", healthHandler)
	http.HandleFunc("/api/ride/request", rideRequestHandler)
	http.HandleFunc("/api/ride/status", rideStatusHandler)

	fmt.Println("Gateway Service starting on :8080...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Gateway is Healthy")
}

func rideRequestHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// In a real modular system, this would call the Ride Service via gRPC or HTTP
	rideID := fmt.Sprintf("RIDE-%d", len(rides)+1)
	req["id"] = rideID
	req["status"] = "requested"

	ridesMu.Lock()
	rides[rideID] = req
	ridesMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(req)
}

func rideStatusHandler(w http.ResponseWriter, r *http.Request) {
	rideID := r.URL.Query().Get("id")
	if rideID == "" {
		http.Error(w, "Missing ride id", http.StatusBadRequest)
		return
	}

	ridesMu.RLock()
	ride, ok := rides[rideID]
	ridesMu.RUnlock()

	if !ok {
		http.Error(w, "Ride not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ride)
}
