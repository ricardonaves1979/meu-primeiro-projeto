import os
import smtplib
import json
import re
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime
import anthropic

ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]
BANCO_MCP_API_KEY = os.environ["PLUGGY_API_KEY"]
BANCO_MCP_URL = os.environ.get("BANCO_MCP_URL", "https://app.mcp.ai/sse/w-9xngjdyi")
GMAIL_USER = os.environ["GMAIL_USER"]
GMAIL_APP_PASSWORD = os.environ["GMAIL_APP_PASSWORD"]
DESTINATARIOS = ["ricardo@gruposn.com.br", "renata.lisboa@gruposn.com.br"]


def buscar_dados_bancarios():
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    response = client.beta.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=4000,
        betas=["mcp-client-2025-04-04"],
        mcp_servers=[
            {
                "type": "url",
                "url": BANCO_MCP_URL,
                "name": "banco_mcp",
                "authorization_token": BANCO_MCP_API_KEY,
            }
        ],
        messages=[
            {
                "role": "user",
                "content": (
                    "Liste todas as conexões bancárias e para cada conta retorne: "
                    "nome do banco, tipo de conta, número, saldo atual e as últimas "
                    "transações dos últimos 3 dias. "
                    "Responda APENAS com JSON válido neste formato, sem texto extra:\n"
                    '{"contas": [{"banco": "...", "tipo": "...", "numero": "...", '
                    '"saldo": 0.00, "transacoes": [{"data": "YYYY-MM-DD", '
                    '"descricao": "...", "valor": 0.00}]}]}'
                ),
            }
        ],
    )

    for block in response.content:
        if hasattr(block, "text"):
            text = block.text
            match = re.search(r"\{.*\}", text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group())
                except json.JSONDecodeError:
                    pass

    return {"contas": [], "erro": "Não foi possível obter dados bancários"}


def formatar_valor(v):
    try:
        return f"R$ {float(v):,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    except (ValueError, TypeError):
        return "R$ 0,00"


def montar_html(dados):
    hoje = datetime.now().strftime("%d/%m/%Y")
    contas = dados.get("contas", [])
    erro = dados.get("erro")

    if erro:
        corpo = f'<tr><td style="padding:16px;color:#c0392b">{erro}</td></tr>'
    elif not contas:
        corpo = '<tr><td style="padding:16px;color:#888">Nenhuma conta encontrada.</td></tr>'
    else:
        linhas = []
        for conta in contas:
            banco = conta.get("banco", "Banco")
            tipo = conta.get("tipo", "")
            numero = conta.get("numero", "")
            saldo = conta.get("saldo", 0)
            txs = conta.get("transacoes", [])

            linhas.append(f"""
            <tr style="background:#f9f9f9">
              <td colspan="3" style="padding:12px 8px;font-weight:bold;font-size:15px;
                  border-top:2px solid #1a56db;color:#1a56db">
                {banco} — {tipo} {numero}
              </td>
            </tr>
            <tr>
              <td colspan="3" style="padding:4px 8px 12px;font-size:13px;color:#555">
                Saldo atual: <strong style="color:#111">{formatar_valor(saldo)}</strong>
              </td>
            </tr>
            """)

            if txs:
                linhas.append("""
                <tr style="background:#eef2ff">
                  <th style="padding:6px 8px;text-align:left;font-size:12px">Data</th>
                  <th style="padding:6px 8px;text-align:left;font-size:12px">Descrição</th>
                  <th style="padding:6px 8px;text-align:right;font-size:12px">Valor</th>
                </tr>
                """)
                for tx in txs:
                    data_raw = str(tx.get("data", ""))
                    data_fmt = (
                        f"{data_raw[8:]}/{data_raw[5:7]}/{data_raw[:4]}"
                        if len(data_raw) == 10
                        else data_raw
                    )
                    desc = str(tx.get("descricao", "—"))[:60]
                    valor = tx.get("valor", 0)
                    cor = "#c0392b" if float(valor) < 0 else "#27ae60"
                    linhas.append(f"""
                    <tr style="border-bottom:1px solid #eee">
                      <td style="padding:5px 8px;font-size:12px">{data_fmt}</td>
                      <td style="padding:5px 8px;font-size:12px">{desc}</td>
                      <td style="padding:5px 8px;font-size:12px;text-align:right;
                          color:{cor}">{formatar_valor(valor)}</td>
                    </tr>
                    """)
            else:
                linhas.append("""
                <tr><td colspan="3" style="padding:6px 8px;font-size:12px;
                    color:#888;font-style:italic">
                  Nenhuma movimentação nos últimos 3 dias
                </td></tr>
                """)

        corpo = "".join(linhas)

    return f"""
    <html><body style="font-family:Arial,sans-serif;color:#222;max-width:700px;margin:auto">
      <div style="background:#1a56db;padding:18px 24px;border-radius:6px 6px 0 0">
        <h2 style="color:#fff;margin:0;font-size:18px">Extrato Bancário — {hoje}</h2>
        <p style="color:#c7d8ff;margin:4px 0 0;font-size:13px">
          Grupo SN · Gerado automaticamente às 7h
        </p>
      </div>
      <table width="100%" cellpadding="0" cellspacing="0"
             style="border:1px solid #ddd;border-top:none">
        {corpo}
      </table>
      <p style="font-size:11px;color:#aaa;padding:12px 0">
        Este e-mail é gerado automaticamente. Não responda.
      </p>
    </body></html>
    """


def enviar_email(html):
    hoje = datetime.now().strftime("%d/%m/%Y")
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Extrato Bancário Grupo SN — {hoje}"
    msg["From"] = GMAIL_USER
    msg["To"] = ", ".join(DESTINATARIOS)
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        smtp.sendmail(GMAIL_USER, DESTINATARIOS, msg.as_string())


def main():
    print("Buscando dados bancários via mcp.ai...")
    dados = buscar_dados_bancarios()

    n_contas = len(dados.get("contas", []))
    print(f"  {n_contas} conta(s) encontrada(s)")

    html = montar_html(dados)
    enviar_email(html)
    print(f"E-mail enviado para: {', '.join(DESTINATARIOS)}")


if __name__ == "__main__":
    main()
