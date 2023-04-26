package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
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

type Repo struct {
	Id     string `json:"id"`
	RepoID int    `json:"repoID"`
}

type Section struct {
	Id    string `json:"id"`
	Name  string `json:"name"`
	Repos []Repo `json:"repos"`
}

type Payload struct {
	Sections []Section `json:"sections"`
}

/*
	{
	  sections: [
	    {
	      id: nanoid(),
	      name: "my title blahblahblah",
	      repos: [
	        {
	          id: nanoid(),
	          repoID: number
	        }
	      ]
	    }
	  ]
	}
*/

type UserData struct {
	ID          int    `json:"id"`
	AccessToken string `json:"access_token"`
}

type BulletinData struct {
	Data Payload `json:"data"`
}

func handler(request events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	id, err := getUser(request)
	if err != nil {
		return jsonErrorResponse(http.StatusUnauthorized, "Unauthenticated")
	}

	payload, ok := request.QueryStringParameters["x"]
	if !ok {
		return jsonErrorResponse(http.StatusBadRequest, "No data provided.")
	}

	payload, err = url.QueryUnescape(payload)
	if err != nil {
		return jsonErrorResponse(http.StatusBadRequest, "Bad payload.")
	}

	var data Payload
	json.Unmarshal([]byte(payload), &data)

	if len(data.Sections) == 0 {
		return jsonErrorResponse(http.StatusBadRequest, "Bad payload: No Sections")
	}

	var sectionIDs = map[string]int{}
	var repoUUIDs = map[string]int{}
	for _, v := range data.Sections {

		if strings.Trim(v.Name, " ") == "" {
			return jsonErrorResponse(http.StatusBadRequest, "Bad payload: Empty Section Name")
		}

		sectionIDs[v.Id]++
		if sectionIDs[v.Id] != 1 {
			return jsonErrorResponse(http.StatusBadRequest, "Bad payload: Duplicate Section IDs")
		}

		if len(v.Repos) < 1 {
			return jsonErrorResponse(http.StatusBadRequest, "Bad payload: Section without Repos")
		}

		var repoIDs = map[int]int{}
		for _, repo := range v.Repos {

			repoUUIDs[repo.Id]++
			repoIDs[repo.RepoID]++

			if repo.RepoID == 0 {
				return jsonErrorResponse(http.StatusBadRequest, "Bad payload: All Repos must have a repoID")
			}
			if repoUUIDs[repo.Id] != 1 {
				return jsonErrorResponse(http.StatusBadRequest, "Bad payload: Duplicate Repo UUIDs")
			}
			if repoIDs[repo.RepoID] != 1 {
				return jsonErrorResponse(http.StatusBadRequest, "Bad payload: A section can not have duplicate Repo IDs")
			}
		}
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
		userData struct {
			Login string `json:"login"`
		}
	)
	err = json.NewDecoder(resp.Body).Decode(&userData)
	if err != nil {
		return jsonErrorResponse(http.StatusInternalServerError, "Failed to decode user data.")
	}

	url := "https://api.github.com/users/" + userData.Login + "/repos"
	req, err = http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return jsonErrorResponse(http.StatusInternalServerError, "Failed to construct a request.")
	}
	req.Header.Set("Authorization", "Bearer "+dst.AccessToken)
	req.Header.Set("Accept", "application/vnd.github+json")

	client = &http.Client{}
	resp, err = client.Do(req)
	if err != nil {
		return jsonErrorResponse(http.StatusInternalServerError, "Failed to request user data.")
	}
	defer resp.Body.Close()

	var (
		userRepos []struct {
			ID int `json:"id"`
		}
	)
	err = json.NewDecoder(resp.Body).Decode(&userRepos)
	if err != nil {
		return jsonErrorResponse(http.StatusInternalServerError, "Failed to decode user data.")
	}

	validRepoIDs := make(map[int]bool, len(userRepos))
	for _, v := range userRepos {
		validRepoIDs[v.ID] = true
	}

	for _, v := range data.Sections {
		for _, r := range v.Repos {
			if _, ok := validRepoIDs[r.RepoID]; !ok {
				return jsonErrorResponse(http.StatusUnprocessableEntity, "Unauthorized repos in payload.")
			}
		}
	}

	row = conn.QueryRow(context.Background(), `SELECT data FROM bulletins WHERE user_id = $1;`, dst.ID)
	bd := BulletinData{}
	err = row.Scan(&bd.Data)
	if err != pgx.ErrNoRows && err != nil {
		return jsonErrorResponse(http.StatusInternalServerError, "Error reading data from DB.")
	}
	if err == pgx.ErrNoRows {
		_, err = conn.Exec(context.Background(), `INSERT INTO bulletins (user_id, data) VALUES ($1, $2);`, dst.ID, data)
		if err != nil {
			return jsonErrorResponse(http.StatusInternalServerError, "Error creating bulletin in DB.")
		}
	}
	if err == nil {
		_, err = conn.Exec(context.Background(), `UPDATE bulletins SET data = $1 WHERE user_id = $2`, data, dst.ID)
	}

	return &events.APIGatewayProxyResponse{
		StatusCode: 204,
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
