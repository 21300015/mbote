package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
)

type User struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
	Role  string `json:"role"` // "rider" or "driver"
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}

	http.HandleFunc("/api/auth/login", handleLogin)
	http.HandleFunc("/api/auth/register", handleRegister)

	fmt.Printf("Auth Service starting on port %s...\n", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	// Simple mock login
	user := User{
		ID:    "user_001",
		Email: "test@mbote.cd",
		Name:  "Congo Rider",
		Role:  "rider",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func handleRegister(w http.ResponseWriter, r *http.Request) {
	// Simple mock register
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("User created"))
}
