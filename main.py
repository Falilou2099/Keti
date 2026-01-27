from mindee import ClientV2, InferenceParameters, PathInput
from fastapi import FastAPI

input_path = "ticket1.png"
api_key = "md_vHpPefNVwCpfLdRDMV4F0MBaNMQrO5C9NsojQG8MemI"
model_id = "43e3cb6a-aade-4793-bb0b-f448836ac276"

# Init a new client
mindee_client = ClientV2(api_key)

# Set inference parameters
params = InferenceParameters(
    # ID of the model, required.
    model_id=model_id,

    # Options: set to `True` or `False` to override defaults

    # Enhance extraction accuracy with Retrieval-Augmented Generation.
    rag=None,
    # Extract the full text content from the document as strings.
    raw_text=None,
    # Calculate bounding box polygons for all fields.
    polygon=None,
    # Boost the precision and accuracy of all extractions.
    # Calculate confidence scores for all fields.
    confidence=None,
)

# Load a file from disk
input_source = PathInput(input_path)

# Send for processing using polling
response = mindee_client.enqueue_and_get_inference(
    input_source, params
)

# Print a brief summary of the parsed data
print(response.inference)

# Access the result fields
fields: dict = response.inference.result.fields

# Create a FastAPI app to expose the same result on localhost
app = FastAPI()


@app.get("/result")
def get_result():
    """
    Return the same result that is printed in the terminal,
    using the already computed `response.inference`.
    """
    return {"result": str(response.inference)}