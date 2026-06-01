# CS2 Projekt, Osnove Oblikovanja

Avtorja: Aleš Požar in Domen Kamplet

## Struktura projekta

- `python/` vsebuje kodo za analiziranje slik in dosto do "online" dataseta.

- `frontend/` vsebuje kodo spletne strani.

- v `./` so prisotni x_x_x.txt dokumenti, ki vsebujejo podatke o analiziranih skinih, glede na metodo v imenu datoteke.

- `skins/` vsebuje maske posameznih vrst orožja.

- `sprites/` vsebuje nekaj primerov slik iz dataseta.

## Kako začeti na novem računalniku (Windows PowerShell) - Analiza slik | NI POMEMBNO ZA ZAGON ZASLONSKEGA VMESNIKA |

1. Kloniraj repozitorij in se premakni v mapo:

```powershell
git clone <your-repo-url>
cd OsnoveOblikovanja_ProjektnaNaloga
```

2. Nastavi virtualno okolje (venv):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Če je ukaz blokiran:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

3. Naloži odvisnosti:

```powershell
python -m pip install --upgrade pip
python -m pip install -r python/requirements.txt
```

4. Poženi skripte:

```powershell
python python/testSkins.py
```

## Kako začeti na novem računalniku (Windows PowerShell) - Zaslonski vmesnik/frontend

1. Ko je repozitorij kloniraj se premakni v mapo:

```powershell
cd frontend/b_FDcf4ODOt91
```

2. Namesti odvisnosti:

```powershell
npm install
```

3. Poženi razvojni strežnik:

```powershell
npm run dev
```



## Dodatno

- Če se ukaz začne z `(.venv)`, je venv aktiven.
