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
	"github.com/golang-jwt/jwt"
	"github.com/jackc/pgx/v5"
)

func main() {
	lambda.Start(handler)
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
	// check authentication status
	id, err := getUser(request)
	if err != nil {
		return jsonErrorResponse(http.StatusUnauthorized, "Unauthenticated")
	}

	// delete user from DB
	config, err := pgx.ParseConfig(os.Getenv("COCKROACHDB_URL"))
	if err != nil {
		return jsonErrorResponse(http.StatusInternalServerError, "Failed to create DB config.")
	}

	conn, err := pgx.ConnectConfig(context.Background(), config)
	if err != nil {
		return jsonErrorResponse(http.StatusInternalServerError, "Failed to connect to DB.")
	}
	defer conn.Close(context.Background())

	_, err = conn.Exec(context.Background(), `DELETE FROM users WHERE id = $1;`, id)
	if err != nil {
		return jsonErrorResponse(http.StatusInternalServerError, "Error while deleting.")
	}

	return &events.APIGatewayProxyResponse{
		StatusCode: 204,
		Headers: map[string]string{
			"set-cookie": fmt.Sprintf(`jwt=;Path=/;HttpOnly;Secure;SameSite=strict;expires=Thu, 01 Jan 1970 00:00:00 GMT;`),
		},
	}, nil
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
		return 0, errors.New("Unexpected ID type.")
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
