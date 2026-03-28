# Counter-Strike Skin Dataset Test

## Project structure

- `README.md` and `.gitignore` stay in root.
- `python/` contains Python code and dependencies.
- `frontend/` is reserved for future frontend work.

## Setup on another PC (Windows PowerShell)

1. Clone repo:

```powershell
git clone <your-repo-url>
cd testDataset
```

2. Create and activate virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

If script execution is blocked:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

3. Install dependencies:

```powershell
python -m pip install --upgrade pip
python -m pip install -r python/requirements.txt
```

4. Run script:

```powershell
python python/testSkins.py
```

## Notes

- If your prompt starts with `(.venv)`, venv is active.
- `.venv` should not be committed.
- The script saves image output in `python/`.
