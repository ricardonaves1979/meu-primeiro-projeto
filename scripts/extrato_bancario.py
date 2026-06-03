import os
import smtplib
import requests
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timedelta

PLUGGY_API_KEY = os.environ["PLUGGY_API_KEY"]
GMAIL_USER = os.environ["GMAIL_USER"]
GMAIL_APP_PASSWORD = os.environ["GMAIL_APP_PASSWORD"]
DESTINATARIOS = ["ricardo@gruposn.com.br", "renata.lisboa@gruposn.com.br"]

BASE_URL = "https://api.pluggy.ai"
HEADERS = {"X-API-KEY": PLUGGY_API_KEY, "Content-Type": "application/json"}


def get_auth_token():
    resp = requests.post(
        f"{BASE_URL}/auth",
        json={"clientId": PLUGGY_API_KEY, "clientSecret": ""},
        timeout=15,
    )
    if resp.ok:
        return resp.json().get("apiKey", PLUGGY_API_KEY)
    return PLUGGY_API_KEY


def get_items(token):
    resp = requests.get(
        f"{BASE_URL}/items",
        headers={"X-API-KEY": token},
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json().get("results", [])


def get_accounts(item_id, token):
    resp = requests.get(
        f"{BASE_URL}/accounts",
        headers={"X-API-KEY": token},
        params={"itemId": item_id},
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json().get("results", [])


def get_transactions(account_id, token, days=3):
    desde = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    ate = datetime.now().strftime("%Y-%m-%d")
    resp = requests.get(
        f"{BASE_URL}/transactions",
        headers={"X-API-KEY": token},
        params={"accountId": account_id, "from": desde, "to": ate, "pageSize": 50},
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json().get("results", [])


def formatar_valor(v):
    return f"R$ {v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def montar_html(itens_data):
    hoje = datetime.now().strftime("%d/%m/%Y")
    linhas = []
    for item in itens_data:
        nome_banco = item["connector"].get("name", "Banco")
        for conta in item["accounts"]:
            tipo = conta.get("type", "")
            numero = conta.get("number", "")
            saldo = conta.get("balance", 0)
            linhas.append(f"""
            <tr style="background:#f9f9f9">
              <td colspan="3" style="padding:12px 8px;font-weight:bold;font-size:15px;border-top:2px solid #1a56db;color:#1a56db">
                {nome_banco} — {tipo} {numero}
              </td>
            </tr>
            <tr>
              <td colspan="3" style="padding:4px 8px 12px;font-size:13px;color:#555">
                Saldo atual: <strong style="color:#111">{formatar_valor(saldo)}</strong>
              </td>
            </tr>
            """)
            txs = item["transactions"].get(conta["id"], [])
            if txs:
                linhas.append("""
                <tr style="background:#eef2ff">
                  <th style="padding:6px 8px;text-align:left;font-size:12px">Data</th>
                  <th style="padding:6px 8px;text-align:left;font-size:12px">Descrição</th>
                  <th style="padding:6px 8px;text-align:right;font-size:12px">Valor</th>
                </tr>
                """)
                for tx in txs:
                    data_tx = tx.get("date", "")[:10]
                    data_fmt = f"{data_tx[8:]}/{data_tx[5:7]}/{data_tx[:4]}" if len(data_tx) == 10 else data_tx
                    desc = tx.get("description", tx.get("category", "—"))[:60]
                    valor = tx.get("amount", 0)
                    cor = "#c0392b" if valor < 0 else "#27ae60"
                    linhas.append(f"""
                    <tr style="border-bottom:1px solid #eee">
                      <td style="padding:5px 8px;font-size:12px">{data_fmt}</td>
                      <td style="padding:5px 8px;font-size:12px">{desc}</td>
                      <td style="padding:5px 8px;font-size:12px;text-align:right;color:{cor}">{formatar_valor(valor)}</td>
                    </tr>
                    """)
            else:
                linhas.append("""
                <tr><td colspan="3" style="padding:6px 8px;font-size:12px;color:#888;font-style:italic">
                  Nenhuma movimentação nos últimos 3 dias
                </td></tr>
                """)

    corpo_tabela = "".join(linhas)

    return f"""
    <html><body style="font-family:Arial,sans-serif;color:#222;max-width:700px;margin:auto">
      <div style="background:#1a56db;padding:18px 24px;border-radius:6px 6px 0 0">
        <h2 style="color:#fff;margin:0;font-size:18px">Extrato Bancário — {hoje}</h2>
        <p style="color:#c7d8ff;margin:4px 0 0;font-size:13px">Grupo SN · Gerado automaticamente às 7h</p>
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #ddd;border-top:none">
        {corpo_tabela}
      </table>
      <p style="font-size:11px;color:#aaa;padding:12px 0">
        Este e-mail é gerado automaticamente. Não responda.
      </p>
    </body></html>
    """


def enviar_email(html, hoje):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Extrato Bancário Grupo SN — {hoje}"
    msg["From"] = GMAIL_USER
    msg["To"] = ", ".join(DESTINATARIOS)
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        smtp.sendmail(GMAIL_USER, DESTINATARIOS, msg.as_string())


def main():
    print("Autenticando no Pluggy...")
    token = get_auth_token()

    print("Buscando contas bancárias...")
    items = get_items(token)

    if not items:
        print("Nenhuma conta encontrada.")
        return

    itens_data = []
    for item in items:
        item_id = item["id"]
        accounts = get_accounts(item_id, token)
        transactions = {}
        for acc in accounts:
            transactions[acc["id"]] = get_transactions(acc["id"], token)
        itens_data.append({
            "connector": item.get("connector", {}),
            "accounts": accounts,
            "transactions": transactions,
        })
        print(f"  {item.get('connector', {}).get('name', item_id)}: {len(accounts)} conta(s)")

    html = montar_html(itens_data)
    hoje = datetime.now().strftime("%d/%m/%Y")
    enviar_email(html, hoje)
    print(f"E-mail enviado para: {', '.join(DESTINATARIOS)}")


if __name__ == "__main__":
    main()
