package main

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
)

type UserData struct {
	ID int `json:"id"`
}

func handler(request events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	id, err := getUser(request)
	if err != nil {
		return &events.APIGatewayProxyResponse{
			StatusCode: 200,
			Headers: map[string]string{
				"Content-Type": "application/json",
			},
			Body: fmt.Sprintf(`{"status": "Authentication failed: %v"}`, err),
		}, nil
	}

	config, err := pgx.ParseConfig(os.Getenv("COCKROACHDB_URL"))
	if err != nil {
		return &events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Headers: map[string]string{
				"Content-Type": "application/json",
			},
			Body: `{"status": "Failed to create DB config."}`,
		}, nil
	}

	conn, err := pgx.ConnectConfig(context.Background(), config)
	if err != nil {
		return &events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Headers: map[string]string{
				"Content-Type": "application/json",
			},
			Body: `{"status": "Failed to connect to DB."}`,
		}, nil
	}
	defer conn.Close(context.Background())

	row := conn.QueryRow(context.Background(), `SELECT id FROM users WHERE id = $1;`, id)
	dst := UserData{}
	err = row.Scan(&dst.ID)
	if err != pgx.ErrNoRows && err != nil {
		return &events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Headers: map[string]string{
				"Content-Type": "application/json",
			},
			Body: fmt.Sprintf(`{"status": "Error reading user from DB. %v"}`, err),
		}, nil
	}
	if err == pgx.ErrNoRows {
		return &events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Headers: map[string]string{
				"Content-Type": "application/json",
			},
			Body: `{"status": "User does not exist in DB."}`,
		}, nil
	}

	return &events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers: map[string]string{
			"Content-Type": "application/json",
		},
		Body: fmt.Sprintf(`{"id": "%+v"}`, dst),
	}, nil
}

func main() {
	lambda.Start(handler)
}

func getUser(request events.APIGatewayProxyRequest) (int, error) {
	tokenString, err := getJWTFromCookie(request)
	if err != nil {
		return 0, err
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil {
		return 0, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return 0, errors.New("Could not get jwt.MapClaims")
	}

	idString, ok := claims["id"].(string)
	if !ok {
		return 0, errors.New("Unexpected ID value.")
	}

	id, err := strconv.Atoi(idString)
	if err != nil {
		return 0, err
	}
	return id, nil
}

const jwtCookieKey = "jwt="

func getJWTFromCookie(request events.APIGatewayProxyRequest) (string, error) {
	cookies := strings.Split(request.Headers["cookie"], "; ")
	for _, v := range cookies {
		if !strings.Contains(v, jwtCookieKey) {
			continue
		}
		return strings.Replace(v, jwtCookieKey, "", 1), nil

	}

	return "", errors.New("Failed to extract JWT from cookie.")
}
