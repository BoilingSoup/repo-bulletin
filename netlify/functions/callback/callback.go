package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
)

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

type UserData struct {
	ID          int    `json:"id"`
	Login       string `json:"login"`
	accessToken string // no export; assign manually

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
	// validState := validateState(request)
	// if !validState {
	// 	return jsonErrorResponse(http.StatusUnauthorized, "Invalid state.")
	// }

	code := request.QueryStringParameters["code"]
	token, err := githubOauthConfig.Exchange(oauth2.NoContext, code)
	if err != nil {
		return jsonErrorResponse(http.StatusBadRequest, "Could not get token.")
	}

	req, err := http.NewRequest(http.MethodGet, "https://api.github.com/user", nil)
	if err != nil {
		return jsonErrorResponse(http.StatusInternalServerError, "Failed to construct a request.")
	}
	req.Header.Set("Authorization", "Bearer "+token.AccessToken)
	req.Header.Set("Accept", "application/vnd.github+json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return jsonErrorResponse(http.StatusInternalServerError, "Failed to request user data.")
	}
	defer resp.Body.Close()

	// io.Copy(os.Stdout, resp.Body)
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
	dst := UserData{}
	err = row.Scan(&dst.ID)
	switch {
	case err != pgx.ErrNoRows && err != nil:
		return jsonErrorResponse(http.StatusInternalServerError, "Error reading user from DB.")

	case err == pgx.ErrNoRows:
		_, err = conn.Exec(context.Background(), `INSERT INTO users (id, access_token) VALUES ($1, $2);`, data.ID, token.AccessToken)
		if err != nil {
			return jsonErrorResponse(http.StatusInternalServerError, "Error creating user in DB.")
		}

	case err == nil:
		_, err = conn.Exec(context.Background(), `UPDATE users SET access_token = $1 WHERE id = $2;`, token.AccessToken, data.ID)
		if err != nil {
			return jsonErrorResponse(http.StatusInternalServerError, "Error updating user in DB.")
		}
	}

	jwt, err := generateJWT(data.ID)
	if err != nil {
		return jsonErrorResponse(http.StatusInternalServerError, "Error creating JWT token.")
	}

	return &events.APIGatewayProxyResponse{
		StatusCode: http.StatusTemporaryRedirect,
		Headers: map[string]string{
			"Location":   "https://repobullet.in/" + data.Login,
			"set-cookie": fmt.Sprintf(`jwt=%s;Path=/;HttpOnly;Secure;SameSite=strict;max-age=86400`, jwt),
		},
		Body: `{"status": "success"}`,
	}, nil
}

func validateState(request events.APIGatewayProxyRequest) bool {
	storedState, err := getStateFromCookie(request)
	if err != nil {
		return false
	}

	paramState := request.QueryStringParameters["state"]
	if storedState != paramState {
		return false
	}

	return true
}

const stateCookieKey = "state="

func getStateFromCookie(request events.APIGatewayProxyRequest) (string, error) {
	cookies := strings.Split(request.Headers["cookie"], "; ")
	for _, v := range cookies {
		if !strings.Contains(v, stateCookieKey) {
			continue
		}

		return strings.Replace(v, stateCookieKey, "", 1), nil

	}

	return "", errors.New("Failed to retrieve state from cookie.")
}

var secret = []byte(os.Getenv("JWT_SECRET"))

func generateJWT(id int) (string, error) {
	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)
	claims["id"] = fmt.Sprint(id)

	tokenString, err := token.SignedString(secret)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}
