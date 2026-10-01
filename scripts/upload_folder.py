import argparse
import os
import requests
from pathlib import Path

API_URL = "https://foti-box.com/api/upload"


def upload_file(path_to_file: Path, api_key: str) -> (bool, str):
    """Upload a single file. Returns (success, message)."""
    try:
        with path_to_file.open("rb") as f:
            files = {"file": (str(path_to_file.name), f)}
            response = requests.post(API_URL, files=files, headers={"x-api-key": api_key})
            response.raise_for_status()
            data = response.json()
            return True, data.get("uuid", "(no uuid returned)")
    except requests.exceptions.RequestException as e:
        # Try to include response text if available
        msg = str(e)
        try:
            msg += ": " + (response.text if response is not None else "")
        except Exception:
            pass
        return False, msg


def iter_files(folder: Path, recursive: bool):
    if recursive:
        for p in folder.rglob("*"):
            if p.is_file():
                yield p
    else:
        for p in folder.iterdir():
            if p.is_file():
                yield p


def main():
    parser = argparse.ArgumentParser(description="Upload all files in a folder to foti-box")
    parser.add_argument("folder", type=str, help="Path to the folder containing files to upload")
    parser.add_argument("api_key", type=str, help="API key for authentication")
    parser.add_argument("-r", "--recursive", action="store_true", help="Recurse into subfolders")
    args = parser.parse_args()

    folder = Path(args.folder)
    if not folder.exists() or not folder.is_dir():
        print(f"Error: '{folder}' is not a directory or does not exist")
        return

    total = 0
    successes = 0
    failures = 0

    for file_path in iter_files(folder, args.recursive):
        total += 1
        print(f"Uploading: {file_path}")
        ok, msg = upload_file(file_path, args.api_key)
        if ok:
            successes += 1
            print(f"  Success - UUID: {msg}")
        else:
            failures += 1
            print(f"  Failed - {msg}")

    print("\nUpload summary:")
    print(f"  Total: {total}")
    print(f"  Successes: {successes}")
    print(f"  Failures: {failures}")


if __name__ == "__main__":
    main()
