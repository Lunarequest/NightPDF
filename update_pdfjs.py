# /usr/bin/env python3
import requests
import os
from shutil import rmtree
from zipfile import ZipFile


def get_version() -> str | None:
    with requests.get(
        "https://api.github.com/repos/mozilla/pdf.js/releases/latest"
    ) as req:
        if req.status_code == 200:
            json = req.json()
            version = json.get("tag_name")
            if version:
                with open(".pdfjs_version", "r") as file:
                    current_version = file.read()
                    if current_version.strip() == version:
                        print("current version is the latest version")
                    else:
                        return version


def get_zip(version: str):
    request = requests.get(
        f"https://github.com/mozilla/pdf.js/releases/download/{version}/pdfjs-{version.replace('v','')}-dist.zip"
    )
    with open(
        os.path.join("app/libs/", f"pdfjs-{version.replace('v','')}-dist.zip"), "wb"
    ) as fd:
        fd.write(request.content)


def unzip_zip(version: str):
    # cleanup pdfjs dir
    rmtree("app/libs/pdfjs")
    with ZipFile(
        os.path.join("app/libs/", f"pdfjs-{version.replace('v','')}-dist.zip"), "r"
    ) as zipfile:
        zipfile.extractall("app/libs/pdfjs")


def cleanup(version: str):
    os.remove(os.path.join("app/libs/", f"pdfjs-{version.replace('v','')}-dist.zip"))


if __name__ == "__main__":
    version = get_version()
    if version:
        get_zip(version)
        unzip_zip(version)
        cleanup(version)
        with open(".pdfjs_version", "w") as file:
            file.write(version)
        file.close()
