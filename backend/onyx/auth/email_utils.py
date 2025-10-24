import base64
import smtplib
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formatdate
from email.utils import make_msgid

import sendgrid  # type: ignore
from sendgrid.helpers.mail import Content  # type: ignore
from sendgrid.helpers.mail import Email
from sendgrid.helpers.mail import Mail
from sendgrid.helpers.mail import To

from onyx.configs.app_configs import EMAIL_CONFIGURED
from onyx.configs.app_configs import EMAIL_FROM
from onyx.configs.app_configs import SENDGRID_API_KEY
from onyx.configs.app_configs import SMTP_PASS
from onyx.configs.app_configs import SMTP_PORT
from onyx.configs.app_configs import SMTP_SERVER
from onyx.configs.app_configs import SMTP_USER
from onyx.configs.app_configs import WEB_DOMAIN
from onyx.configs.constants import AuthType
from onyx.configs.constants import ONYX_DEFAULT_APPLICATION_NAME
from onyx.db.models import User
from onyx.utils.logger import setup_logger
from onyx.utils.url import add_url_params
from onyx.utils.variable_functionality import fetch_versioned_implementation
from shared_configs.configs import MULTI_TENANT

logger = setup_logger()

# Helper to enforce branding in emails

def _normalize_app_name(name: str | None) -> str:
    if not name:
        return "ContentBuilder"
    return name.replace("Onyx", "ContentBuilder")

HTML_EMAIL_TEMPLATE = """\
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width" />
  <title>{title}</title>
  <style>
    body, table, td, a {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      text-size-adjust: 100%;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      -webkit-text-size-adjust: none;
    }}
    body {{
      background-color: #f7f7f7;
      color: #333;
    }}
    .body-content {{
      color: #333;
    }}
    .email-container {{
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #eaeaea;
    }}
    .header {{
      background-color: #000000;
      padding: 20px;
      text-align: center;
      color: #ffffff;
      font-weight: 700;
    }}
    .body-content {{
      padding: 20px 30px;
    }}
    .title {{
      font-size: 20px;
      font-weight: bold;
      margin: 0 0 10px;
    }}
    .message {{
      font-size: 16px;
      line-height: 1.5;
      margin: 0 0 20px;
    }}
    .cta-button {{
      display: inline-block;
      padding: 14px 24px;
      background-color: #0055FF;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      font-size: 16px;
      margin-top: 10px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      text-align: center;
    }}
    .footer {{
      font-size: 13px;
      color: #6A7280;
      text-align: center;
      padding: 20px;
    }}
    .footer a {{
      color: #6b7280;
      text-decoration: underline;
    }}
  </style>
</head>
<body>
  <table role="presentation" class="email-container" cellpadding="0" cellspacing="0">
    <tr>
      <td class="header">
        {application_name}
      </td>
    </tr>
    <tr>
      <td class="body-content">
        <h1 class="title">{heading}</h1>
        <div class="message">
          {message}
        </div>
        {cta_block}
      </td>
    </tr>
    <tr>
      <td class="footer">
        © {year} {application_name}. All rights reserved.
        {slack_fragment}
      </td>
    </tr>
  </table>
</body>
</html>
"""


def build_html_email(
    application_name: str | None,
    heading: str,
    message: str,
    cta_text: str | None = None,
    cta_link: str | None = None,
) -> str:
    slack_fragment = ""

    if cta_text and cta_link:
        cta_block = f'<a class="cta-button" href="{cta_link}">{cta_text}</a>'
    else:
        cta_block = ""
    return HTML_EMAIL_TEMPLATE.format(
        application_name=application_name,
        title=heading,
        heading=heading,
        message=message,
        cta_block=cta_block,
        slack_fragment=slack_fragment,
        year=datetime.now().year,
    )


def send_email(
    user_email: str,
    subject: str,
    html_body: str,
    text_body: str,
    mail_from: str = EMAIL_FROM,
    inline_png: tuple[str, bytes] | None = None,
) -> None:
    if not EMAIL_CONFIGURED:
        raise ValueError("Email is not configured.")

    if SENDGRID_API_KEY:
        send_email_with_sendgrid(
            user_email, subject, html_body, text_body, mail_from, None
        )
        return

    send_email_with_smtplib(
        user_email, subject, html_body, text_body, mail_from, None
    )


def send_email_with_sendgrid(
    user_email: str,
    subject: str,
    html_body: str,
    text_body: str,
    mail_from: str = EMAIL_FROM,
    inline_png: tuple[str, bytes] | None = None,
) -> None:
    from_email = Email(mail_from) if mail_from else Email("noreply@contentbuilder.app")
    to_email = To(user_email)

    mail = Mail(
        from_email=from_email,
        to_emails=to_email,
        subject=subject,
        plain_text_content=Content("text/plain", text_body),
    )

    # Add HTML content
    mail.add_content(Content("text/html", html_body))

    # Do not attach inline images

    # Get a JSON-ready representation of the Mail object
    mail_json = mail.get()

    sg = sendgrid.SendGridAPIClient(api_key=SENDGRID_API_KEY)
    response = sg.client.mail.send.post(request_body=mail_json)  # can raise
    if response.status_code != 202:
        logger.warning(f"Unexpected status code {response.status_code}")


def send_email_with_smtplib(
    user_email: str,
    subject: str,
    html_body: str,
    text_body: str,
    mail_from: str = EMAIL_FROM,
    inline_png: tuple[str, bytes] | None = None,
) -> None:

    # Create a multipart/alternative message - this indicates these are alternative versions of the same content
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["To"] = user_email
    if mail_from:
        msg["From"] = mail_from
    msg["Date"] = formatdate(localtime=True)
    msg["Message-ID"] = make_msgid(domain="contentbuilder.app")

    # Add text part first (lowest priority)
    text_part = MIMEText(text_body, "plain")
    msg.attach(text_part)

    # No images, just add HTML directly (higher priority than text)
    html_part = MIMEText(html_body, "html")
    msg.attach(html_part)

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as s:
        s.starttls()
        s.login(SMTP_USER, SMTP_PASS)
        s.send_message(msg)


def send_subscription_cancellation_email(user_email: str) -> None:
    """This is templated but isn't meaningful for whitelabeling."""

    # Example usage of the reusable HTML
    try:
        load_runtime_settings_fn = fetch_versioned_implementation(
            "onyx.server.enterprise_settings.store", "load_runtime_settings"
        )
        settings = load_runtime_settings_fn()
        application_name = _normalize_app_name(settings.application_name)
    except ModuleNotFoundError:
        application_name = _normalize_app_name(ONYX_DEFAULT_APPLICATION_NAME)

    subject = f"Your {application_name} Subscription Has Been Canceled"
    heading = "Subscription Canceled"
    message = (
        "<p>We're sorry to see you go.</p>"
        "<p>Your subscription has been canceled and will end on your next billing date.</p>"
        "<p>If you change your mind, you can always come back!</p>"
    )
    cta_text = "Renew Subscription"
    cta_link = f"{WEB_DOMAIN}/pricing"
    html_content = build_html_email(
        application_name,
        heading,
        message,
        cta_text,
        cta_link,
    )
    text_content = (
        "We're sorry to see you go.\n"
        "Your subscription has been canceled and will end on your next billing date.\n"
        f"If you change your mind, visit {WEB_DOMAIN}/pricing"
    )
    send_email(
        user_email,
        subject,
        html_content,
        text_content,
    )


def build_user_email_invite(
    from_email: str, to_email: str, application_name: str, auth_type: AuthType
) -> tuple[str, str]:
    heading = "You've Been Invited!"

    # the exact action taken by the user, and thus the message, depends on the auth type
    message = f"<p>You have been invited by {from_email} to join an organization on {application_name}.</p>"
    if auth_type == AuthType.CLOUD:
        message += (
            "<p>To join the organization, please click the button below to set a password "
            "or login with Google and complete your registration.</p>"
        )
    elif auth_type == AuthType.BASIC:
        message += (
            "<p>To join the organization, please click the button below to set a password "
            "and complete your registration.</p>"
        )
    elif auth_type == AuthType.GOOGLE_OAUTH:
        message += (
            "<p>To join the organization, please click the button below to login with Google "
            "and complete your registration.</p>"
        )
    elif auth_type == AuthType.OIDC or auth_type == AuthType.SAML:
        message += (
            "<p>To join the organization, please click the button below to"
            " complete your registration.</p>"
        )
    else:
        raise ValueError(f"Invalid auth type: {auth_type}")

    cta_text = "Join Organization"
    cta_link = f"{WEB_DOMAIN}/auth/signup?email={to_email}"

    html_content = build_html_email(
        application_name,
        heading,
        message,
        cta_text,
        cta_link,
    )

    # text content is the fallback for clients that don't support HTML
    # not as critical, so not having special cases for each auth type
    text_content = (
        f"You have been invited by {from_email} to join an organization on {application_name}.\n"
        "To join the organization, please visit the following link:\n"
        f"{WEB_DOMAIN}/auth/signup?email={to_email}\n"
    )
    if auth_type == AuthType.CLOUD:
        text_content += "You'll be asked to set a password or login with Google to complete your registration."

    return text_content, html_content


def send_user_email_invite(
    user_email: str, current_user: User, auth_type: AuthType
) -> None:
    try:
        load_runtime_settings_fn = fetch_versioned_implementation(
            "onyx.server.enterprise_settings.store", "load_runtime_settings"
        )
        settings = load_runtime_settings_fn()
        application_name = _normalize_app_name(settings.application_name)
    except ModuleNotFoundError:
        application_name = _normalize_app_name(ONYX_DEFAULT_APPLICATION_NAME)

    subject = f"Invitation to Join {application_name} Organization"

    text_content, html_content = build_user_email_invite(
        current_user.email, user_email, application_name, auth_type
    )

    send_email(
        user_email,
        subject,
        html_content,
        text_content,
    )


def send_forgot_password_email(
    user_email: str,
    token: str,
    tenant_id: str,
    mail_from: str = EMAIL_FROM,
) -> None:
    # Builds a forgot password email with or without fancy HTML
    try:
        load_runtime_settings_fn = fetch_versioned_implementation(
            "onyx.server.enterprise_settings.store", "load_runtime_settings"
        )
        settings = load_runtime_settings_fn()
        application_name = _normalize_app_name(settings.application_name)
    except ModuleNotFoundError:
        application_name = _normalize_app_name(ONYX_DEFAULT_APPLICATION_NAME)

    subject = f"Reset Your {application_name} Password"
    heading = "Reset Your Password"
    tenant_param = f"&tenant={tenant_id}" if tenant_id and MULTI_TENANT else ""
    message = "<p>Please click the button below to reset your password. This link will expire in 24 hours.</p>"
    cta_text = "Reset Password"
    cta_link = f"{WEB_DOMAIN}/auth/reset-password?token={token}{tenant_param}"
    html_content = build_html_email(
        application_name,
        heading,
        message,
        cta_text,
        cta_link,
    )
    text_content = (
        "Please click the following link to reset your password. This link will expire in 24 hours.\n"
        f"{WEB_DOMAIN}/auth/reset-password?token={token}{tenant_param}"
    )
    send_email(
        user_email,
        subject,
        html_content,
        text_content,
        mail_from,
    )


def send_user_verification_email(
    user_email: str,
    token: str,
    new_organization: bool = False,
    mail_from: str = EMAIL_FROM,
) -> None:
    # Builds a verification email
    try:
        load_runtime_settings_fn = fetch_versioned_implementation(
            "onyx.server.enterprise_settings.store", "load_runtime_settings"
        )
        settings = load_runtime_settings_fn()
        application_name = _normalize_app_name(settings.application_name)
    except ModuleNotFoundError:
        application_name = _normalize_app_name(ONYX_DEFAULT_APPLICATION_NAME)

    subject = f"{application_name} Email Verification"
    link = f"{WEB_DOMAIN}/auth/verify-email?token={token}"
    if new_organization:
        link = add_url_params(link, {"first_user": "true"})
    message = (
        f"<p>Click the following link to verify your email address:</p><p>{link}</p>"
    )
    html_content = build_html_email(
        application_name,
        "Verify Your Email",
        message,
    )
    text_content = f"Click the following link to verify your email address: {link}"
    send_email(
        user_email,
        subject,
        html_content,
        text_content,
        mail_from,
    )
