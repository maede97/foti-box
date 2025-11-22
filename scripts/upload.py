import requests
import sys
API_URL = "http://localhost:3000/api/upload"

def upload_image(path_to_file: str, api_key: str):
    with open(path_to_file, "rb") as f:
        files = {
            "file": (path_to_file, f)
        }

        try:
            response = requests.post(API_URL, files=files, headers={
                "x-api-key": api_key
            })
            response.raise_for_status()
            data = response.json()

            print("Upload successful!")
            print("UUID:", data.get("uuid"))
        except requests.exceptions.RequestException as e:
            print("Error:", e)


if __name__ == "__main__":
    upload_image(sys.argv[1], sys.argv[2])
