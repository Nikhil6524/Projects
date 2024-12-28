import pandas as pd
from transformers import AutoTokenizer, AutoModel
import torch
import numpy as np

# Set random seeds for reproducibility
torch.manual_seed(42)
np.random.seed(42)

# Specify the version of the tokenizer and model (if known)
tokenizer_version = "bert-base-uncased"
model_version = "bert-base-uncased"

# Load the tokenizer and model from Hugging Face
tokenizer = AutoTokenizer.from_pretrained(tokenizer_version)
model = AutoModel.from_pretrained(model_version)

# Load the Excel file
data = pd.read_excel("C:/Users/aryan/Downloads/training (4).xlsx")

def get_embeddings(text):
    # Ensure the text is a string
    if not isinstance(text, str):
        text = str(text)
    
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    
    with torch.no_grad():
        outputs = model(**inputs)
    
    hidden_states = outputs.last_hidden_state
    aggregated_embeddings = torch.mean(hidden_states, dim=1) 
    
    return aggregated_embeddings.squeeze().numpy()[:384] 

# Apply the function to the 'input' column and handle exceptions
def safe_get_embeddings(text):
    try:
        return get_embeddings(text)
    except Exception as e:
        print(f"Error processing text: {text}\nException: {e}")
        return np.zeros(384)  # Return a zero vector if there's an error

# Generate embeddings for each row in the 'input' column
embeddings_list = data['input'].apply(safe_get_embeddings)

# Create a DataFrame from the embeddings
embedding_columns = [f'embedding_{i}' for i in range(384)]
embeddings_df = pd.DataFrame(embeddings_list.tolist(), columns=embedding_columns)

# Concatenate the original data with the embeddings
data = pd.concat([data, embeddings_df], axis=1)

# Print the first few rows of the new DataFrame
print(data.head())

# Save the new DataFrame to an Excel file
data.to_excel('output_file.xlsx', index=False)
