import re
import string

# from https://www.kaggle.com/code/mfaaris/hybrid-and-tensorflow-recommender-system
def separate(text):
    clean_text = []
    for t in text.split(','):
        cleaned = re.sub('\(.*\)', '', t) # Remove text inside parentheses
        cleaned = cleaned.translate(str.maketrans('','', string.digits))
        cleaned = cleaned.replace(' ', '')
        cleaned = cleaned.translate(str.maketrans('','', string.punctuation)).lower()
        cleaned = cleaned.replace('[', '').replace(']', '')  # Remove '[' and ']'
        clean_text.append(cleaned)
    return ' '.join(clean_text)

def remove_punc(text):
    cleaned = text.translate(str.maketrans('','', string.punctuation)).lower()
    clean_text = cleaned.translate(str.maketrans('','', string.digits))
    return clean_text

def data_preprocesser(df_people, df_jobs):
    df_people['skills_processed'] = df_people['skills'].apply(separate)
    df_people['magic_words'] = df_people[['skills_processed']].apply(lambda x: ' '.join(x), axis=1)
    df_people.set_index(['name'], inplace=True)
    df_people = df_people[['magic_words']]

    df_jobs['name_processed'] = df_jobs['name'].apply(remove_punc)
    df_jobs['skills_processed'] = df_jobs['skills'].apply(separate)
    df_jobs['magic_words'] = df_jobs[['name_processed', 'skills_processed']].apply(lambda x: ' '.join(x), axis=1)
    df_jobs['ID'] = df_jobs['name']+';;;'+df_jobs['companyName']
    df_jobs.set_index(['ID'], inplace=True)
    df_jobs = df_jobs[['magic_words']]

    return df_people, df_jobs