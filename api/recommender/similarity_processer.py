import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer

def cosine_similarity_person_jobs(person_name, df_person, df_job_row, vectorizer):
    data = pd.concat([df_person, df_job_row], axis=0).reset_index(drop=True)
    vectors = vectorizer.fit_transform(data['magic_words'])
    cos_sim = cosine_similarity(vectors)
    index_person = data[data['ID'] == person_name].index
    similarity = cos_sim[index_person].T
    return similarity[1]

def predict_jobs_similarity(person_name, df_people, df_jobs, top_n=10):
    vectorizer = TfidfVectorizer(stop_words='english')
    df_jobs = df_jobs.reset_index()
    df_person_row = pd.DataFrame([[person_name, df_people.loc[person_name]['magic_words']]], columns=df_jobs.columns, index=[0])
    df_jobs['similarity'] = ''
    for i in df_jobs.index:
      df_job_row = df_jobs[df_jobs.columns[:2]].loc[[i]]
      cosine_similarity = cosine_similarity_person_jobs(person_name, df_person_row, df_job_row, vectorizer)
      df_jobs['similarity'].loc[[i]] = cosine_similarity

    final_df_sorted = df_jobs.sort_values(by='similarity', ascending=False).head(top_n)
    final_df_sorted.set_index(['ID'], inplace=True)
    return final_df_sorted[['similarity']][0:]