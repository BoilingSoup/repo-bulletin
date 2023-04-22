package main

import (
	"context"
	"encoding/json"
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
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
)

type UserData struct {
	ID          int    `json:"id"`
	AccessToken string `json:"access_token"`
}

var githubOauthConfig *oauth2.Config

func init() {
	githubOauthConfig = &oauth2.Config{
		RedirectURL:  os.Getenv("GITHUB_CALLBACK"),
		ClientID:     os.Getenv("GITHUB_CLIENT_ID"),
		ClientSecret: os.Getenv("GITHUB_CLIENT_SECRET"),
		Endpoint:     github.Endpoint,
	}
}

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
	id, err := getUser(request)
	if err != nil {
		return jsonErrorResponse(http.StatusUnauthorized, "Unauthenticated")
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

	row := conn.QueryRow(context.Background(), `SELECT id, access_token FROM users WHERE id = $1;`, id)
	dst := UserData{}
	err = row.Scan(&dst.ID, &dst.AccessToken)
	if err != pgx.ErrNoRows && err != nil {
		return jsonErrorResponse(http.StatusInternalServerError, "Error reading user from DB.")
	}
	if err == pgx.ErrNoRows {
		return jsonErrorResponse(http.StatusInternalServerError, "User does not exist in DB.")
	}

	req, err := http.NewRequest(http.MethodGet, "https://api.github.com/user", nil)
	if err != nil {
		return jsonErrorResponse(http.StatusInternalServerError, "Failed to construct a request.")
	}
	req.Header.Set("Authorization", "Bearer "+dst.AccessToken)
	req.Header.Set("Accept", "application/vnd.github+json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return jsonErrorResponse(http.StatusInternalServerError, "Failed to request user data.")
	}
	defer resp.Body.Close()

	var (
		data struct {
			Login string `json:"login"`
		}
	)
	err = json.NewDecoder(resp.Body).Decode(&data)
	if err != nil {
		return jsonErrorResponse(http.StatusInternalServerError, "Failed to decode user data.")
	}

	return &events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers: map[string]string{
			"Content-Type": "application/json",
		},
		Body: fmt.Sprintf(`{"id": "%d", "name": "%s"}`, dst.ID, data.Login),
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
