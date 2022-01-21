# Advisor API

## Authorization Bearer Token

_Magic Links_
The bearer token is actually a Stytch session token. When the Front End (FE) authenticates a user email, it will send an authentication token in a "Magic Link" via an email to this token. The "Magic Link" is actually a redirection to the FE with this authentication token. The FE will then use this token to confirm authentication with Stytch, upon successful authentication Stytch will return a session token (_Bearer Token_). [See this link how a token is identifer and a session identifier is produced](https://stytch.com/docs/api/authenticate-magic-link).

![Authentication Architecture](https://stytch.imgix.net/web/_next/static/image/src/img/dashboard/light-mode-api-flow.80200ea99265b20c7bcb14c477357ec6.png?ixlib=js-3.3.0&auto=format&quality=75&width=1920)

_Bearer Token usage in API_

Every request received by the API must also be accompanied with the Stytch session token carried in the [Authorization header as a Bearer Token](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication). This session token is then [authenticated with Stytch](https://stytch.com/docs/api/session-auth) before it proceeds with the API task, [see the auth service ](/services/auth.js)

## Endpoints

[/users GET](users_get.md)

[/users POST](users_post.md)
