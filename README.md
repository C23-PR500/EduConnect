# EduConnect
EduConnect is a job aggregator application that is specifically designed for those working or aspiring to work in the education sector. The application provides job recommendations that match the skills and abilities of each jobseeker with a machine learning model. It also supports job browsing in general and a social networking feature where users can follow each other.

## Specifications
There are three main subdirectories of this repository.
* api
This is the directory for the REST API service that we use as the backend of our mobile application. Our ML model trained on the collected dataset is also present as a Python module in the `recommender/` directory. 
* scraper
This is the directory for the scraper scripts that we created and used for the dataset collection process, and the scraping results. 
* mobile
This is the directory for the source code of the mobile app.
