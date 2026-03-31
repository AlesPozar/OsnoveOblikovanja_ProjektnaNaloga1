# POMEMBNO, GLEJ TODO del ZA KAJ JE SE TREBA NRDIT <3, bolj spodaj
.

.

.

.

.

.

.

.

.

.

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


# POMEMBNO
skripte za zbirke ki so že izdelane in za katere so že narejeni .txt dokumenti se načeloma NE POGANJA ŠE ENKRAT, ker tako samo porabiš preveč časa. npr. 30min + na en run.

Kot osnovn template skript si lahko pogledas, SingleDominantColor.py v python/.

Predn runas generalno, runnej na manjšem previewjem.

Narejene .txt zbirke naj uporabljajo sledeči format: name|rarity|weapon|hue|saturation|value

# TODO

- Izdelaj zbirke za

    ena

    -   average_color_whole
    -   weighted_average_color_whole

    dva

    zbirka robnih pikslov površin za vsak gun/knife type kjer se v in game pogledu dokaj zakrivajo, npr holderji, tm kjer character drži gun, al pa npr "bat/kopito" nekaterih kukr AK-47

    tri, glede na zgornje zbirke se excludajo

    -   single_dominant_color_no_blocked
    -   average_color_no_blocked
    -   weighted_average_color_no_blocked


# DONE
-   izdelano

    ena

    -   single_dominant_color_whole
