'''
user: string (name)

jobs_list: dictionary[]
[
{
            "name": "John Doe2",
            "city": "Semarang",
            "area": "Central Java",
            "country": "Indonesia",
            "skills": ["Teaching", "Mentoring"]
},
{

}, ...
]

users_list: dictionary[]
[
{
            "name": "Teacher",
            "companyName": "KenzieTech International Corporation",
            "level": "Associate",
            "city": "Semarang",
            "area": "Central Java",
            "country": "Indonesia"
            "skills": ["Teaching", "Mentoring"]
} 
,
{

},
...
]
'''
import pandas as pd
from data_preprocesser import data_preprocesser
from similarity_processer import predict_jobs_similarity

# return ["Job 1;;;Company Name", "Job 2;;;Company Name"]
def predict_job(user, jobs_list, users_list, n = 10):
    if len(jobs_list) < n:
        n = len(jobs_list)
        
    jobs_df = pd.DataFrame(jobs_list)
    users_df = pd.DataFrame(users_list)
    users_df, jobs_df = data_preprocesser(users_df, jobs_df)
    similar_jobs_df = predict_jobs_similarity(user, users_df, jobs_df, n)
    similar_jobs_id_list = similar_jobs_df.index.tolist()
    return similar_jobs_id_list

users_list = [{
    "name": "John Doe2",
    "city": "Semarang",
    "area": "Central Java",
    "country": "Indonesia",
    "skills": ["Teaching","Mentoring"]
}]

jobs_list = [{
    "name": "Teacher",
    "companyName": "KenzieTech International Corporation",
    "level": "Associate",
    "city": "Semarang",
    "area": "Central Java",
    "country": "Indonesia",
    "skills": ["Teaching","Mentoring"]
}]

print(predict_job("John Doe2", jobs_list, users_list, 5))
