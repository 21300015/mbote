package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

type Ride struct {
	ID          string    `json:"id"`
	RiderID     string    `json:"rider_id"`
	DriverID    string    `json:"driver_id,omitempty"`
	Status      string    `json:"status"`
	Pickup      Location  `json:"pickup"`
	Destination Location  `json:"destination"`
	Price       float64   `json:"price"`
	CreatedAt   time.Time `json:"created_at"`
}

type Location struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

func main() {
	http.HandleFunc("/internal/rides/match", matchHandler)
	
	fmt.Println("Ride Service (Modular) starting on :8081...")
	if err := http.ListenAndServe(":8081", nil); err != nil {
		log.Fatal(err)
	}
}

func matchHandler(w http.ResponseWriter, r *http.Request) {
	// Logic to match a rider with a driver
	// In a real system, this would look up available drivers in Redis/Postgres
	fmt.Fprintf(w, "Matching logic triggered")
}
