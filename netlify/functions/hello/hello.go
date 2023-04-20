package main

import (
	"fmt"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(request events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	// fmt.Printf("%+v\n", request.Headers["cookie"])
	return &events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers: map[string]string{
			"Content-Type": "application/json",
		},
		Body: `{"test": "hello world"}`,
	}, nil
}

func main() {
	fmt.Println(os.Getenv("REPO_BULLETIN_TEST"))

	lambda.Start(handler)
}
