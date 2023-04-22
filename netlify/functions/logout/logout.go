package main

import (
	"fmt"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(request events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	if request.HTTPMethod != http.MethodPost {
		return &events.APIGatewayProxyResponse{
			StatusCode: http.StatusMethodNotAllowed,
			Headers: map[string]string{
				"Content-Type": "application/json",
			},
			Body: `{"status": "Method not allowed."}`,
		}, nil
	}

	return &events.APIGatewayProxyResponse{
		StatusCode: 204,
		Headers: map[string]string{
			"set-cookie": fmt.Sprintf(`jwt=;Path=/;HttpOnly;Secure;SameSite=strict;expires=Thu, 01 Jan 1970 00:00:00 GMT;`),
		},
		Body: `{"status": "success"}`,
	}, nil
}

func main() {
	lambda.Start(handler)
}
