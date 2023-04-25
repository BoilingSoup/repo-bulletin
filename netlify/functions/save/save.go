package main

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/golang-jwt/jwt"
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

	fmt.Printf("%+v\n", request.Body)

	// check userid
	return &events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers: map[string]string{
			"Content-Type": "application/json",
		},
		Body: fmt.Sprintf(`{"your id": %d, "body": "%s"}`, id, request.Body),
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
