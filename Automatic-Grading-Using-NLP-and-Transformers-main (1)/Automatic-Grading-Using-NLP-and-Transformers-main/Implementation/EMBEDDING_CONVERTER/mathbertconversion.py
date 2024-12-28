import pandas as pd
from transformers import BertTokenizer, BertModel
from sentence_transformers import SentenceTransformer

# Read training data
training_data = pd.read_excel(r"D:\srinidhi\amrita\out of context\out of context\Classification_testing.xlsx")

tokenizer = BertTokenizer.from_pretrained('tbs17/MathBERT', output_hidden_states=True)
model = BertModel.from_pretrained("tbs17/MathBERT")

sentence_model = SentenceTransformer("paraphrase-MiniLM-L6-v2")

# Preprocess 'Equation' column
training_data['Equation'] = training_data['Equation'].str.replace('\n', ' ')
training_data['Equation'] = training_data['Equation'].fillna('')

# Tokenize and get embeddings for equations
training_data['embeddings'] = training_data['Equation'].apply(lambda x: sentence_model.encode(x) if x != '' else None)
training_data = training_data.dropna(subset=['embeddings'])

# Create a DataFrame from the embeddings
math1 = pd.DataFrame(training_data['embeddings'].tolist(), index=training_data.index).add_prefix('embed_')

# Save the results to an Excel file
training_output_file = "testing_mathbert.xlsx"
math1.to_excel(training_output_file, index=False)
print(math1)
