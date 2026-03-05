# Cosmic Birthday (NASA APOD)

Site simples (frontend moderno) + backend em Python/Flask que consulta a **API APOD** da NASA.
O usuário informa a **data de nascimento** e o site retorna a imagem (ou vídeo), título e descrição do dia.

## Requisitos

- Python 3.10+ (recomendado)
- Uma chave da NASA em `backend/.env`:

```
NASA_API_KEY=SUACHAVE
```

## Como rodar (Windows / PowerShell)

### 1. Ativar o ambiente virtual (backend)

No PowerShell:

```powershell
cd C:\Users\25012072\Desktop\NASA\backend
python -m venv venv           # (apenas na primeira vez)
.\venv\Scripts\Activate.ps1   # ativa o ambiente virtual
```

Com o ambiente virtual ativo, instale as dependências (a partir da raiz do projeto ou usando caminho relativo):

```powershell
cd C:\Users\25012072\Desktop\NASA
pip install -r requirements.txt
```

### 2. Iniciar o backend (API Flask)

Ainda com o ambiente virtual ativo:

```powershell
cd C:\Users\25012072\Desktop\NASA\backend
python app.py
```

O backend ficará ouvindo em `http://localhost:8000`.

### 3. Iniciar o frontend

O frontend é servido pelo próprio Flask (não há servidor separado).

- Backend rodando → abra o navegador em:  
  `http://localhost:8000`

Ali você verá a página **Cosmic Birthday** com o formulário para escolher a data de nascimento.

## Endpoints

- `GET /` página web
- `GET /api/apod?date=YYYY-MM-DD` retorna JSON do APOD

## Observações

- A API APOD possui dados a partir de **1995-06-16**.
- Datas no futuro são rejeitadas.

