import json
import sys
import os

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

def main():
    if len(sys.argv) < 2:
        print("Provide the transaction UUID.")
        return
    try:
        transaction_uuid = sys.argv[1]
        # Only to be run via the Node app. If to be run as a standalone Python script, replace recommender/data to data
        user_file_path = f"recommender/data/user-{transaction_uuid}.json"
        jobs_list_file_path = f"recommender/data/jobs-{transaction_uuid}.json"
        
        user_file = open(user_file_path, "r")
        user = json.loads(user_file.read())
        user_file.close()
        
        jobs_list_file = open(jobs_list_file_path, "r")
        jobs_list = json.loads(jobs_list_file.read())
        jobs_list_file.close()
        
        print("+++".join(predict_job(user["name"], jobs_list, [user])))
        
        if os.path.exists(user_file_path):
            os.remove(user_file_path)
        if os.path.exists(jobs_list_file_path):
            os.remove(jobs_list_file_path)
        
    except Exception as e:
        print(f"An error has occurred: {str(e)}")
        
if __name__ == "__main__":
    exit(main())
