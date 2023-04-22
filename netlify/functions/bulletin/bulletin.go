package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/jackc/pgx/v5"
)

func main() {
	lambda.Start(handler)
}

type UserData struct {
	ID int `json:"id"`
}

type BulletinData struct {
	Data map[string]any
}

func jsonErrorResponse(code int, message string) (*events.APIGatewayProxyResponse, error) {
	return &events.APIGatewayProxyResponse{
		StatusCode: code,
		Headers: map[string]string{
			"Content-Type": "application/json",
		},
		Body: fmt.Sprintf(`{"status": "%s"}`, message),
	}, nil
}

func handler(request events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	user, ok := request.QueryStringParameters["user"]
	if !ok {
		return jsonErrorResponse(http.StatusBadRequest, "No user provided.")
	}

	req, err := http.NewRequest(http.MethodGet, "https://api.github.com/users/"+user, nil)
	if err != nil {
		return jsonErrorResponse(http.StatusInternalServerError, "Failed to construct a request.")
	}
	req.Header.Set("Authorization", "Bearer "+os.Getenv("GITHUB_PAT"))
	req.Header.Set("Accept", "application/vnd.github+json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return jsonErrorResponse(http.StatusInternalServerError, "Failed to request user data.")
	}
	defer resp.Body.Close()

	var data UserData
	err = json.NewDecoder(resp.Body).Decode(&data)
	if err != nil {
		return jsonErrorResponse(http.StatusInternalServerError, "Failed to decode user data.")
	}

	config, err := pgx.ParseConfig(os.Getenv("COCKROACHDB_URL"))
	if err != nil {
		return jsonErrorResponse(http.StatusInternalServerError, "Failed to create DB config.")
	}

	conn, err := pgx.ConnectConfig(context.Background(), config)
	if err != nil {
		return jsonErrorResponse(http.StatusInternalServerError, "Failed to connect to DB.")
	}
	defer conn.Close(context.Background())

	row := conn.QueryRow(context.Background(), `SELECT id FROM users WHERE id = $1;`, data.ID)
	ud := UserData{}
	err = row.Scan(&ud.ID)
	if err != pgx.ErrNoRows && err != nil {
		return jsonErrorResponse(http.StatusInternalServerError, "Error reading user from DB.")
	}
	if err == pgx.ErrNoRows {
		return jsonErrorResponse(http.StatusNotFound, "User does not have an account.")
	}

	row = conn.QueryRow(context.Background(), `SELECT data FROM bulletins WHERE user_id = $1;`, data.ID)
	bd := BulletinData{}
	err = row.Scan(&bd.Data)
	if err != pgx.ErrNoRows && err != nil {
		return jsonErrorResponse(http.StatusInternalServerError, "Error reading user bulletins from DB.")
	}

	if err == pgx.ErrNoRows {
		return &events.APIGatewayProxyResponse{
			StatusCode: 200,
			Headers: map[string]string{
				"Content-Type": "application/json",
			},
			Body: `null`,
		}, nil
	}

	return &events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers: map[string]string{
			"Content-Type": "application/json",
		},
		Body: fmt.Sprintf(`{"data": "%v"}`, bd.Data),
	}, nil
}
