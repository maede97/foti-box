import argparse
import requests
from pathlib import Path

API_URL = "https://foti-box.com/api/upload"

def upload_image(path_to_file: str, api_key: str):
    with open(path_to_file, "rb") as f:
        files = {"file": (Path(path_to_file).name, f)}

        try:
            response = requests.post(API_URL, files=files, headers={"x-api-key": api_key})
            response.raise_for_status()
            data = response.json()

            print("Upload successful!")
            print("UUID:", data.get("uuid"))
        except requests.exceptions.RequestException as e:
            msg = str(e)
            try:
                msg += ": " + (response.text if response is not None else "")
            except Exception:
                pass
            print("Error:", msg)


def main():
    parser = argparse.ArgumentParser(description="Upload a single file to foti-box")
    parser.add_argument("file", help="Path to the file to upload")
    parser.add_argument("api_key", help="API key for authentication")
    args = parser.parse_args()
    upload_image(args.file, args.api_key)


if __name__ == "__main__":
    main()
