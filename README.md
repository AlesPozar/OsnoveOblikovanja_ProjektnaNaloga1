Te setup navodila je napisu copilot upam da so prov <3





# Setup On Another PC

This project is meant to be pushed without the .venv folder.

## 1) Clone the repository

Run:

git clone <your-repo-url>
cd testDataset

## 2) Create and activate virtual environment

Windows PowerShell:

python -m venv .venv
.\.venv\Scripts\Activate.ps1

If script execution is blocked, run this once in PowerShell:

Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

Then activate again:

.\.venv\Scripts\Activate.ps1

## 3) Install dependencies

python -m pip install --upgrade pip
python -m pip install -r requirements.txt

## 4) Run the script

python testSkins.py

## Notes

- If your prompt starts with (.venv), you are using the virtual environment.
- The script saves the first skin image as skin_1.png (or matching image id).
- The .venv folder is ignored by git on purpose and should not be committed.





# OPIS
.gitignore
testSkins.py
requirements.txt

SE NE SPREMINJAJO,
testSkins.py je samo testni script <3
kasnejšo logiko se pipše v nek nov skript, taj tuki kot demo dostopa
