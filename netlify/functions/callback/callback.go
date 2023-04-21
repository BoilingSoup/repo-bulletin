package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
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
	ID int `json:"id"`
}

func handler(request events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	validState := validateState(request)
	if !validState {
		return &events.APIGatewayProxyResponse{
			StatusCode: http.StatusForbidden,
			Headers: map[string]string{
				"Content-Type": "application/json",
			},
			Body: `{"status": "Invalid state."}`,
		}, nil
	}

	code := request.QueryStringParameters["code"]
	token, err := githubOauthConfig.Exchange(oauth2.NoContext, code)
	if err != nil {
		return &events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Headers: map[string]string{
				"Content-Type": "application/json",
			},
			Body: `{"status": "Could not get token."}`,
		}, nil
	}

	req, err := http.NewRequest(http.MethodGet, "https://api.github.com/user", nil)
	if err != nil {
		return &events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Headers: map[string]string{
				"Content-Type": "application/json",
			},
			Body: `{"status": "Failed to construct a request."}`,
		}, nil
	}
	req.Header.Set("Authorization", "Bearer "+token.AccessToken)
	req.Header.Set("Accept", "application/vnd.github+json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return &events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Headers: map[string]string{
				"Content-Type": "application/json",
			},
			Body: `{"status": "Failed to request user data."}`,
		}, nil
	}
	defer resp.Body.Close()

	var data UserData
	err = json.NewDecoder(resp.Body).Decode(&data)
	if err != nil {
		return &events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Headers: map[string]string{
				"Content-Type": "application/json",
			},
			Body: `{"status": "Failed to decode user data."}`,
		}, nil
	}
	// fmt.Printf("%+v\n", data)

	// config, err := pgx.ParseConfig(os.Getenv("DATABASE_URL"))
	// if err != nil {

	// }

	return &events.APIGatewayProxyResponse{
		StatusCode: http.StatusTemporaryRedirect,
		Headers: map[string]string{
			"Location":     "http://localhost:3000/BoilingSoup",
			"Content-Type": "application/json",
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

func redirectWithError() (*events.APIGatewayProxyResponse, error) {
	return &events.APIGatewayProxyResponse{
		StatusCode: http.StatusTemporaryRedirect,
		Headers: map[string]string{
			"Location": "http://localhost:3000/BoilingSoup",
		},
	}, nil
}
