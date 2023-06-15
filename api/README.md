# EduConnect API

## Usage
To run this API, ensure that you have installed the required modules

```sh
npm i
```

You need to also specify the database connection on the file `src/config/database.config.js`. Set the environment to `dev` for development purposes by editing the `ENV` variable on the `.env` file. Then, you can run the API with the following command.

```sh
npm run start
```

You can then access it on port 3000.

```sh
curl http://localhost:3000/api/v1/users/login
```

## Deployment
For deployment purposes, you can build and run the Docker image with the following commands.
```sh
docker build . -t educonnect-api
docker run -p 8080:8080 educonnect-api
```

For deployment with Google Cloud Run, use the following commands.
```sh
gcloud builds submit --tag gcr.io/$GOOGLE_CLOUD_PROJECT/educonnect-api
gcloud run deploy educonnect-api --image gcr.io/$GOOGLE_CLOUD_PROJECT/educonnect-api --platform managed --region asia-southeast2 --max-instances=1
```
